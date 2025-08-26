import { jsPDF } from 'jspdf';
import type { Token } from 'fountain-js';

export interface PDFExportOptions {
  title?: string;
  author?: string;
  fontSize?: number;
  lineHeight?: number;
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export class ScreenplayPDFExporter {
  private doc: jsPDF;
  private currentY: number = 0;
  private pageHeight: number;
  private pageWidth: number;
  private options: Required<PDFExportOptions>;

  constructor(options: PDFExportOptions = {}) {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter', // 8.5" x 11"
    });

    this.pageHeight = this.doc.internal.pageSize.height; // 792 pt
    this.pageWidth = this.doc.internal.pageSize.width;   // 612 pt

    this.options = {
      title: options.title || 'Untitled Screenplay',
      author: options.author || '',
      fontSize: options.fontSize || 12,
      lineHeight: options.lineHeight || 16,
      margins: {
        top: options.margins?.top || 72,      // 1 inch
        bottom: options.margins?.bottom || 72, // 1 inch
        left: options.margins?.left || 108,    // 1.5 inches
        right: options.margins?.right || 72,   // 1 inch
        ...options.margins,
      },
    };

    this.currentY = this.options.margins.top;
    this.setupDocument();
  }

  private setupDocument(): void {
    // Set font to Courier (screenplay standard)
    this.doc.setFont('courier');
    this.doc.setFontSize(this.options.fontSize);
    
    // Set document metadata
    this.doc.setProperties({
      title: this.options.title,
      author: this.options.author,
      creator: 'ScriptAIble',
    });
  }

  private checkPageBreak(neededSpace: number = this.options.lineHeight): void {
    if (this.currentY + neededSpace > this.pageHeight - this.options.margins.bottom) {
      this.doc.addPage();
      this.currentY = this.options.margins.top;
    }
  }

  private addText(text: string, x: number, options: { bold?: boolean; center?: boolean } = {}): void {
    this.checkPageBreak();

    if (options.bold) {
      this.doc.setFont('courier', 'bold');
    } else {
      this.doc.setFont('courier', 'normal');
    }

    if (options.center) {
      const textWidth = this.doc.getTextWidth(text);
      x = (this.pageWidth - textWidth) / 2;
    }

    this.doc.text(text, x, this.currentY);
    this.currentY += this.options.lineHeight;

    // Reset font weight
    this.doc.setFont('courier', 'normal');
  }

  private addWrappedText(text: string, x: number, maxWidth: number, options: { bold?: boolean } = {}): void {
    if (options.bold) {
      this.doc.setFont('courier', 'bold');
    } else {
      this.doc.setFont('courier', 'normal');
    }

    const lines = this.doc.splitTextToSize(text, maxWidth);
    
    for (const line of lines) {
      this.checkPageBreak();
      this.doc.text(line, x, this.currentY);
      this.currentY += this.options.lineHeight;
    }

    // Reset font weight
    this.doc.setFont('courier', 'normal');
  }

  private getElementPosition(elementType: string): { x: number; maxWidth: number } {
    const leftMargin = this.options.margins.left;
    const rightMargin = this.options.margins.right;
    const pageWidth = this.pageWidth;

    switch (elementType) {
      case 'scene_heading':
        return { x: leftMargin, maxWidth: pageWidth - leftMargin - rightMargin };
      
      case 'character':
        return { x: leftMargin + 216, maxWidth: 144 }; // 3.7" from left, 2" wide
      
      case 'dialogue':
        return { x: leftMargin + 144, maxWidth: 252 }; // 2.5" from left, 3.5" wide
      
      case 'parenthetical':
        return { x: leftMargin + 180, maxWidth: 180 }; // 3.1" from left, 2.5" wide
      
      case 'transition':
        return { x: pageWidth - rightMargin - 180, maxWidth: 180 }; // Right-aligned
      
      case 'action':
      default:
        return { x: leftMargin, maxWidth: pageWidth - leftMargin - rightMargin };
    }
  }

  public exportTokens(tokens: Token[]): void {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      if (!token.text?.trim()) {
        // Add blank line for empty tokens
        this.currentY += this.options.lineHeight;
        continue;
      }

      const position = this.getElementPosition(token.type);
      
      switch (token.type) {
        case 'scene_heading':
          this.currentY += this.options.lineHeight; // Extra space before scene heading
          this.addWrappedText(token.text.toUpperCase(), position.x, position.maxWidth, { bold: true });
          this.currentY += this.options.lineHeight * 0.5; // Extra space after
          break;

        case 'character':
          this.currentY += this.options.lineHeight * 0.5; // Space before character
          this.addText(token.text.toUpperCase(), position.x, { bold: false });
          break;

        case 'dialogue':
          this.addWrappedText(token.text, position.x, position.maxWidth);
          break;

        case 'parenthetical':
          const parentheticalText = token.text.startsWith('(') ? token.text : `(${token.text})`;
          this.addWrappedText(parentheticalText, position.x, position.maxWidth);
          break;

        case 'transition':
          this.currentY += this.options.lineHeight * 0.5; // Space before transition
          this.addText(token.text.toUpperCase(), position.x, { bold: false });
          this.currentY += this.options.lineHeight; // Space after transition
          break;

        case 'action':
        default:
          if (i > 0 && tokens[i - 1]?.type === 'dialogue') {
            this.currentY += this.options.lineHeight * 0.5; // Space after dialogue
          }
          this.addWrappedText(token.text, position.x, position.maxWidth);
          break;
      }
    }
  }

  public addTitlePage(title: string, author: string, contact?: string): void {
    const centerX = this.pageWidth / 2;
    const quarterPage = this.pageHeight / 4;

    // Title (centered, about 1/3 down the page)
    this.currentY = quarterPage;
    this.doc.setFontSize(this.options.fontSize + 2);
    this.addText(title.toUpperCase(), centerX, { bold: true, center: true });
    
    this.doc.setFontSize(this.options.fontSize);

    // Author (centered, below title)
    this.currentY += this.options.lineHeight * 2;
    this.addText('by', centerX, { center: true });
    this.currentY += this.options.lineHeight;
    this.addText(author, centerX, { center: true });

    // Contact info (bottom right)
    if (contact) {
      this.currentY = this.pageHeight - this.options.margins.bottom - (this.options.lineHeight * 4);
      const contactLines = contact.split('\n');
      for (const line of contactLines) {
        this.addText(line, this.pageWidth - this.options.margins.right - this.doc.getTextWidth(line), {});
      }
    }

    // Add new page for script
    this.doc.addPage();
    this.currentY = this.options.margins.top;
  }

  public save(filename: string = 'screenplay.pdf'): void {
    this.doc.save(filename);
  }

  public getBlob(): Blob {
    return this.doc.output('blob');
  }

  public getDataURL(): string {
    return this.doc.output('dataurlstring');
  }
}

// Utility function to export screenplay from tokens
export const exportScreenplayToPDF = (
  tokens: Token[],
  title: string = 'Untitled Screenplay',
  author: string = '',
  options: PDFExportOptions = {}
): ScreenplayPDFExporter => {
  const exporter = new ScreenplayPDFExporter(options);
  
  // Add title page if title or author is provided
  if (title || author) {
    exporter.addTitlePage(title, author);
  }
  
  exporter.exportTokens(tokens);
  return exporter;
};