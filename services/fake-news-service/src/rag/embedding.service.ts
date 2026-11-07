import { pipeline } from "@huggingface/transformers";

const MODEL_ID = "onnx-community/all-MiniLM-L6-v2-ONNX";

let extractor: any = null;
let loadingPromise: Promise<any> | null = null;

async function getExtractor() {
    if (extractor) return extractor;

    if (!loadingPromise) {
        loadingPromise = pipeline("feature-extraction", MODEL_ID, {
            dtype: "q4",
            progress_callback: (progress) => {
                if (progress.status === "progress_total") {
                    console.log(
                        `Embedding model: ${progress.progress.toFixed(1)}%`
                    );
                }
            },
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

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!text.trim()) {
        throw new Error("Text cannot be empty");
    }

    const model = await getExtractor();

    const output = await model(text, {
        pooling: "mean",
        normalize: true,
    });

    return Array.from(output.data);
}