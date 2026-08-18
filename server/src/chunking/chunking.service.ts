import { Injectable } from '@nestjs/common';
import { ExtractedPdfPage } from '../pdf/pdf.service';

export type TextChunk = {
  text: string;
  pageStart: number;
  pageEnd: number;
  sectionNumber: string | null;
  heading: string | null;
};

@Injectable()
export class ChunkingService {
  private readonly maxChunkSize = 3000;
  private readonly overlap = 400;

  chunkPages(pages: ExtractedPdfPage[]): TextChunk[] {
    const chunks: TextChunk[] = [];

    let currentText: string[] = [];
    let currentPageStart = 1;
    let currentPageEnd = 1;
    let currentSectionNumber: string | null = null;
    let currentHeading: string | null = null;

    const saveChunk = () => {
      const text = currentText.join('\n').trim();

      if (!text) return;

      const parts = this.splitLargeText(text);

      for (const part of parts) {
        chunks.push({
          text: part,
          pageStart: currentPageStart,
          pageEnd: currentPageEnd,
          sectionNumber: currentSectionNumber,
          heading: currentHeading,
        });
      }

      currentText = [];
    };

    for (const page of pages) {
      const lines = page.text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      for (const line of lines) {
        const articleMatch = line.match(
          /^(?:Article|Art\.?|المادة)\s*[\(\[]?([0-9٠-٩]+)[\)\]]?/i,
        );

        const headingMatch = line.match(
          /^(Chapter|Section|Part|الفصل|الباب|القسم)\b.*$/i,
        );

        if (articleMatch) {
          saveChunk();

          currentSectionNumber = articleMatch[1];
          currentHeading = line;
          currentPageStart = page.pageNumber;
        } else if (headingMatch) {
          saveChunk();

          currentSectionNumber = null;
          currentHeading = line;
          currentPageStart = page.pageNumber;
        }

        if (currentText.length === 0) {
          currentPageStart = page.pageNumber;
        }

        currentPageEnd = page.pageNumber;
        currentText.push(line);
      }
    }

    saveChunk();

    return chunks;
  }

  private splitLargeText(text: string): string[] {
    if (text.length <= this.maxChunkSize) {
      return [text];
    }

    const parts: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + this.maxChunkSize, text.length);

      const part = text.slice(start, end).trim();

      if (part) {
        parts.push(part);
      }

      if (end === text.length) break;

      start = end - this.overlap;
    }

    return parts;
  }
}
