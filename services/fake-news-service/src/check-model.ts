import { pipeline } from "@huggingface/transformers";

async function main() {
  const modelId = "onnx-community/all-MiniLM-L6-v2-ONNX";

  console.log("Loading Q4 embedding model...");

  const extractor = await pipeline(
    "feature-extraction",
    modelId,
    {
      dtype: "q4",
    }
  );

  console.log("Model loaded successfully!");

  const output = await extractor(
    "Government announces a new education policy.",
    {
      pooling: "mean",
      normalize: true,
    }
  );

  const embedding = Array.from(output.data);

  console.log("Embedding dimensions:", embedding.length);
  console.log("First 5 values:", embedding.slice(0, 5));
}

main().catch((error) => {
  console.error("Model test failed:", error);
});