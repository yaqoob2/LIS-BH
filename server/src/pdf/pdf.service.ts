import { Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

export type ExtractedPdfPage = {
  pageNumber: number;
  text: string;
};

@Injectable()
export class PdfService {
  async extractText(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  async extractPages(buffer: Buffer): Promise<ExtractedPdfPage[]> {
    const parser = new PDFParse({ data: buffer });

    try {
      const info = await parser.getInfo();
      const pages: ExtractedPdfPage[] = [];

      for (let page = 1; page <= info.total; page++) {
        const result = await parser.getText({
          partial: [page],
        });

        pages.push({
          pageNumber: page,
          text: result.text.trim(),
        });
      }

      return pages;
    } finally {
      await parser.destroy();
    }
  }
}
