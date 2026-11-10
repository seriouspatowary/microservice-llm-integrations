declare module "pdf-parse/lib/pdf-parse.js" {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    version: string;
    text: string;
  }

  function pdfParse(buffer: Buffer): Promise<PDFData>;

  export = pdfParse;
}