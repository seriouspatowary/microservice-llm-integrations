import { randomUUID } from "node:crypto";
import { supabase } from "../config/supabase.js";

export async function uploadToStorage(file: Express.Multer.File) {
    const documentId = randomUUID();

    const extension = file.originalname.split(".").pop()?.toLowerCase();
    const storagePath = `documents/${documentId}/original.${extension}`;

    const { data, error } = await supabase.storage
        .from("rag-documents")
        .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    if (error) {
        throw new Error(error.message);
    }

    return {
        documentId,
        storagePath: data.path,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
    };
}