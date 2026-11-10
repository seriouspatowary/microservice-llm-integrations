
import { pipeline } from "@huggingface/transformers";

const MODEL_ID = "onnx-community/all-MiniLM-L6-v2-ONNX";
const EMBEDDING_DIMENSION = 384;

type Extractor = Awaited<ReturnType<typeof pipeline<"feature-extraction">>>;

let extractor: Extractor | null = null;
let loadingPromise: Promise<Extractor> | null = null;

async function getExtractor(): Promise<Extractor> {
    if (extractor) return extractor;

    if (!loadingPromise) {
        loadingPromise = pipeline("feature-extraction", MODEL_ID, {
            dtype: "q4",
        });
    }

    try {
        extractor = await loadingPromise;
        return extractor;
    } catch (error) {
        loadingPromise = null;
        throw error;
    }
}

export async function generateEmbedding(
    text: string
): Promise<number[]> {
    const cleanedText = text.trim();

    if (!cleanedText) {
        throw new Error("Text cannot be empty");
    }

    const model = await getExtractor();

    const output = await model(cleanedText, {
        pooling: "mean",
        normalize: true,
    });

    const embedding = Array.from(output.data);

    if (
        embedding.length !== EMBEDDING_DIMENSION ||
        !embedding.every(Number.isFinite)
    ) {
        throw new Error("Invalid embedding generated");
    }

    return embedding;
}
