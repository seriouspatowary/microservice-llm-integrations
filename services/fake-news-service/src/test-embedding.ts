import { generateEmbedding } from "./rag/embedding.service.js";

async function main() {
  const text = "Government announces a new education policy.";

  console.log("Generating embedding...");

  const embedding = await generateEmbedding(text);

  console.log("Dimensions:", embedding.length);
  console.log("First 5 values:", embedding.slice(0, 5));
}

main().catch(console.error);