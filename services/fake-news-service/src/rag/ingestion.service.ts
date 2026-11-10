
import type { PoolClient } from "pg";
import { chunkText } from "./chunking.service.js";
import { generateEmbedding } from "./embedding.service.js";

export async function processDocument(
    text: string,
    documentId: string,
    client: PoolClient
): Promise<number> {
    const chunks = chunkText(text);

    if (chunks.length === 0) {
        throw new Error("Document contains no text chunks");
    }

    for (let i = 0; i < chunks.length; i++) {
        const content = chunks[i]!;
        const embedding = await generateEmbedding(content);

        if (embedding.length !== 384) {
            throw new Error("Invalid embedding dimensions");
        }

        const vector = `[${embedding.join(",")}]`;

        await client.query(
            `
            INSERT INTO public.document_chunks
                (document_id, chunk_index, content, embedding)
            VALUES ($1, $2, $3, $4::vector)
            `,
            [documentId, i, content, vector]
        );
    }

    return chunks.length;
}
