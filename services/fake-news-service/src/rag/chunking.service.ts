
const DEFAULT_CHUNK_SIZE = 800;
const DEFAULT_OVERLAP = 120;

export function chunkText(
    text: string,
    chunkSize: number = DEFAULT_CHUNK_SIZE,
    overlap: number = DEFAULT_OVERLAP
): string[] {

    if (!text.trim()) {
        return [];
    }

    if (chunkSize <= 0 || overlap < 0 || overlap >= chunkSize) {
        throw new Error("Invalid chunk size or overlap");
    }

    // Normalize extracted text
    const cleanedText = text
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    const chunks: string[] = [];

    let start = 0;

    while (start < cleanedText.length) {

        let end = Math.min(
            start + chunkSize,
            cleanedText.length
        );

        // Try to avoid cutting words in the middle
        if (end < cleanedText.length) {
            const lastSpace = cleanedText.lastIndexOf(" ", end);

            if (lastSpace > start) {
                end = lastSpace;
            }
        }

        const chunk = cleanedText.slice(start, end).trim();

        if (chunk) {
            chunks.push(chunk);
        }

        if (end >= cleanedText.length) {
            break;
        }

       const nextStart = end - overlap;

        if (nextStart <= start) {
            start = end;
        } else {
            // Find a word boundary near the overlap position
            const nextBoundary = cleanedText
                .slice(nextStart, end)
                .search(/\s/);

            start = nextBoundary !== -1
                ? nextStart + nextBoundary + 1
                : nextStart;
        }


        }

    return chunks;
}
