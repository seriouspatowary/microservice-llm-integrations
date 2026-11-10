
import { pool } from "../config/db.js";

export interface CreateDocumentInput {
    id: string;
    title: string;
    fileName: string;
    storagePath: string;
    mimeType: string;
    fileSize: number;
    uploadedBy: string;
}

export async function createDocument(input: CreateDocumentInput) {
    const result = await pool.query(
        `
        INSERT INTO public.documents (
            id, title, file_name, storage_path,
            mime_type, file_size, uploaded_by, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
        RETURNING *
        `,
        [
            input.id,
            input.title,
            input.fileName,
            input.storagePath,
            input.mimeType,
            input.fileSize,
            input.uploadedBy,
        ]
    );

    return result.rows[0];
}

export async function listDocuments() {
    const result = await pool.query(
        `
        SELECT
            d.id, d.title, d.file_name, d.mime_type,
            d.file_size, d.status, d.uploaded_by,
            d.created_at,
            COUNT(c.id)::int AS chunk_count
        FROM public.documents d
        LEFT JOIN public.document_chunks c
            ON c.document_id = d.id
        GROUP BY d.id
        ORDER BY d.created_at DESC
        `
    );

    return result.rows;
}

export async function findDocument(id: string) {
    const result = await pool.query(
        "SELECT * FROM public.documents WHERE id = $1",
        [id]
    );

    return result.rows[0] ?? null;
}

export async function deleteDocumentRecord(id: string) {
    await pool.query(
        "DELETE FROM public.documents WHERE id = $1",
        [id]
    );
}
