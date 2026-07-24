import { PDFParse } from 'pdf-parse';

export async function extractTextFromBuffer(
  body: Buffer,
  mimeType: string,
): Promise<string> {
  if (mimeType === 'text/plain') {
    const text = body.toString('utf8').trim();
    if (!text) {
      throw new Error('TXT file is empty');
    }
    return text;
  }

  if (mimeType === 'application/pdf') {
    const parser = new PDFParse({ data: body });
    try {
      const result = await parser.getText();
      const text = (result.text ?? '').trim();
      if (!text) {
        throw new Error('PDF contained no extractable text');
      }
      return text;
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  }

  throw new Error(`Unsupported mime type for extraction: ${mimeType}`);
}
