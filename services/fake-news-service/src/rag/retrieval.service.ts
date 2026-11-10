
import { pool } from "../config/db.js";
import { generateEmbedding } from "./embedding.service.js";

export interface RetrievedChunk {
    documentId: string;
    title: string;
    chunkIndex: number;
    content: string;
    similarity: number;
}

export async function retrieveRelevantChunks(
    question: string,
    limit = 5
): Promise<RetrievedChunk[]> {
    const embedding = await generateEmbedding(question);
    const vector = `[${embedding.join(",")}]`;

    const result = await pool.query(
        `
        SELECT
            d.id AS "documentId",
            d.title,
            c.chunk_index AS "chunkIndex",
            c.content,
            1 - (c.embedding <=> $1::vector) AS similarity
        FROM public.document_chunks c
        JOIN public.documents d
            ON d.id = c.document_id
        WHERE d.status = 'completed'
          AND c.embedding IS NOT NULL
        ORDER BY c.embedding <=> $1::vector
        LIMIT $2
        `,
        [vector, Math.min(Math.max(limit, 1), 10)]
    );

    return result.rows;
}
