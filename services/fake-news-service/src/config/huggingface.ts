import { env } from "@huggingface/transformers";

env.cacheDir = process.env.MODEL_CACHE_DIR || "./model-cache";

env.allowRemoteModels = true;
env.allowLocalModels = true;

env.useFSCache = true;