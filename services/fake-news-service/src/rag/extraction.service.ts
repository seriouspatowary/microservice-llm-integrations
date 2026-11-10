import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

export async function extractText(
    buffer: Buffer,
    mimeType: string
): Promise<string> {
    let text = "";

    switch (mimeType) {
        case "application/pdf": {
            const result = await pdfParse(buffer);
            text = result.text;
            break;
        }

        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
            break;
        }

        case "text/plain":
            text = buffer.toString("utf-8");
            break;

        default:
            throw new Error("Unsupported document type");
    }

    text = text.replace(/\u0000/g, "").trim();

    if (!text) {
        throw new Error(
            "No extractable text found. Scanned PDFs require OCR."
        );
    }

    return text;
}