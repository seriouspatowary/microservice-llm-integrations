import { generateEmbedding } from "./rag/embedding.service.js";

async function test() {
    const embedding = await generateEmbedding(
        "Employees are entitled to 12 casual leaves annually."
    );

    console.log("Embedding dimension:", embedding.length);
    console.log("First 5 values:", embedding.slice(0, 5));
}

test().catch(console.error);