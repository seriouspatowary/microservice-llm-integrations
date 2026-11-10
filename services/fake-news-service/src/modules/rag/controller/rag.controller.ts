
import type { Request, Response } from "express";
import { uploadToStorage } from "../../../services/storage.service.js";
import { extractText } from "../../../rag/extraction.service.js";
import { createDocument, deleteDocumentRecord, findDocument, listDocuments } from "../../../services/document.service.js";
import { pool } from "../../../config/db.js";
import { processDocument } from "../../../rag/ingestion.service.js";
import { supabase } from "../../../config/supabase.js";
import { retrieveRelevantChunks } from "../../../rag/retrieval.service.js";
import { generateAnswer } from "../../../rag/llm.service.js";


const BUCKET = "rag-documents";

export async function uploadDocumentController(
    req: Request,
    res: Response
): Promise<void> {
    if (!req.auth) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    if (!req.file) {
        res.status(400).json({ message: "File is required" });
        return;
    }

    let uploaded: Awaited<ReturnType<typeof uploadToStorage>> | null = null;
    let documentCreated = false;

    try {
        // Extract and validate text before uploading
        const text = await extractText(
            req.file.buffer,
            req.file.mimetype
        );

        // Store original file
        uploaded = await uploadToStorage(req.file);

        // Save document metadata
        await createDocument({
            id: uploaded.documentId,
            title:
                typeof req.body.title === "string" &&
                req.body.title.trim()
                    ? req.body.title.trim()
                    : req.file.originalname,
            fileName: uploaded.fileName,
            storagePath: uploaded.storagePath,
            mimeType: uploaded.mimeType,
            fileSize: uploaded.fileSize,
            uploadedBy: req.auth.sub,
        });

        documentCreated = true;

        await pool.query(
            `UPDATE public.documents
             SET status = 'processing', updated_at = NOW()
             WHERE id = $1`,
            [uploaded.documentId]
        );

        const client = await pool.connect();
        let chunkCount = 0;

        try {
            await client.query("BEGIN");

            chunkCount = await processDocument(
                text,
                uploaded.documentId,
                client
            );

            await client.query(
                `UPDATE public.documents
                 SET status = 'completed', updated_at = NOW()
                 WHERE id = $1`,
                [uploaded.documentId]
            );

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }

        res.status(201).json({
            success: true,
            message: "Document processed successfully",
            data: {
                documentId: uploaded.documentId,
                title: req.body.title || uploaded.fileName,
                status: "completed",
                chunkCount,
            },
        });
    } catch (error) {
        console.error("RAG upload failed:", error);

        if (uploaded) {
            if (documentCreated) {
                try {
                    await pool.query(
                        `UPDATE public.documents
                         SET status = 'failed', updated_at = NOW()
                         WHERE id = $1 AND status <> 'completed'`,
                        [uploaded.documentId]
                    );
                } catch (dbError) {
                    console.error("Failed to update document status:", dbError);
                }
            } else {
                const { error: cleanupError } = await supabase.storage
                    .from(BUCKET)
                    .remove([uploaded.storagePath]);

                if (cleanupError) {
                    console.error("Storage cleanup failed:", cleanupError);
                }
            }
        }

        res.status(500).json({
            success: false,
            message: "Document processing failed",
        });
    }
}

export async function listDocumentsController(
    _req: Request,
    res: Response
): Promise<void> {
    try {
        const documents = await listDocuments();

        res.json({ success: true, data: documents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to list documents" });
    }
}

export async function deleteDocumentController(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const id = req.params.id;

        if (typeof id !== "string") {
            res.status(400).json({ message: "Invalid document ID" });
            return;
        }

        const document = await findDocument(id);

        if (!document) {
            res.status(404).json({ message: "Document not found" });
            return;
        }

        if (document.status === "processing") {
            res.status(409).json({
                message: "Cannot delete a document while processing",
            });
            return;
        }

        const { error } = await supabase.storage
            .from(BUCKET)
            .remove([document.storage_path]);

        if (error) {
            throw error;
        }

        await deleteDocumentRecord(id);

        res.json({
            success: true,
            message: "Document deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Document deletion failed" });
    }
}

export async function askController(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { question } = req.body ?? {};

        if (
            typeof question !== "string" ||
            question.trim().length < 3 ||
            question.length > 2000
        ) {
            res.status(400).json({
                message: "Question must contain 3 to 2000 characters",
            });
            return;
        }

        const chunks = await retrieveRelevantChunks(
            question.trim(),
            5
        );

        const answer = await generateAnswer(question.trim(), chunks);

        res.json({
            success: true,
            question,
            answer,
            sources: chunks.map((chunk, index) => ({
                source: index + 1,
                documentId: chunk.documentId,
                title: chunk.title,
                chunkIndex: chunk.chunkIndex,
                similarity: chunk.similarity,
            })),
        });
    } catch (error) {
        console.error("RAG question failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate answer",
        });
    }
}
