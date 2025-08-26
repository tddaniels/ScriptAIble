// Final Draft FDX Import/Export Service
// Note: This is a simplified implementation. For production use, consider using
// the screenplay-js library or a more robust FDX parser.

export interface FDXImportResult {
  success: boolean;
  fountainContent: string;
  title?: string;
  author?: string;
  error?: string;
}

export interface FDXExportOptions {
  title?: string;
  author?: string;
  contact?: string;
}

export class FinalDraftConverter {
  
  // Import FDX file to Fountain format
  async importFDX(file: File): Promise<FDXImportResult> {
    try {
      const content = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'text/xml');
      
      // Check for XML parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        return {
          success: false,
          fountainContent: '',
          error: 'Invalid FDX file format'
        };
      }

      // Extract title page information
      const titleElement = xmlDoc.querySelector('TitlePage Key[Name="Title"]');
      const authorElement = xmlDoc.querySelector('TitlePage Key[Name="Author"]');
      
      const title = titleElement?.textContent?.trim() || '';
      const author = authorElement?.textContent?.trim() || '';

      // Extract script content
      const content_elements = xmlDoc.querySelectorAll('Content Paragraph');
      const fountainLines: string[] = [];

      // Add title page if available
      if (title) {
        fountainLines.push(`Title: ${title}`);
      }
      if (author) {
        fountainLines.push(`Author: ${author}`);
      }
      if (title || author) {
        fountainLines.push(''); // Empty line after title page
      }

      // Process each paragraph
      content_elements.forEach((paragraph) => {
        const type = paragraph.getAttribute('Type') || '';
        const text = this.extractTextFromParagraph(paragraph);
        
        if (!text.trim()) {
          fountainLines.push('');
          return;
        }

        switch (type) {
          case 'Scene Heading':
            fountainLines.push(text.toUpperCase());
            break;
          
          case 'Character':
            fountainLines.push(text.toUpperCase());
            break;
          
          case 'Dialogue':
            fountainLines.push(text);
            break;
          
          case 'Parenthetical':
            fountainLines.push(text.startsWith('(') ? text : `(${text})`);
            break;
          
          case 'Action':
          case 'General':
          default:
            fountainLines.push(text);
            break;
        }
      });

      return {
        success: true,
        fountainContent: fountainLines.join('\n'),
        title,
        author
      };

    } catch (error) {
      return {
        success: false,
        fountainContent: '',
        error: `Failed to parse FDX file: ${error}`
      };
    }
  }

  // Export Fountain content to FDX format
  exportFDX(fountainContent: string, options: FDXExportOptions = {}): Blob {
    const { title = 'Untitled', author = '', contact = '' } = options;
    
    // Parse fountain content to extract elements
    const lines = fountainContent.split('\n');
    const elements: Array<{ type: string; content: string }> = [];
    
    let inTitlePage = false;
    let extractedTitle = title;
    let extractedAuthor = author;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines in processing but preserve them in output
      if (!line) {
        elements.push({ type: 'Action', content: '' });
        continue;
      }
      
      // Handle title page
      if (line.toLowerCase().startsWith('title:')) {
        extractedTitle = line.substring(6).trim();
        inTitlePage = true;
        continue;
      }
      
      if (line.toLowerCase().startsWith('author:')) {
        extractedAuthor = line.substring(7).trim();
        inTitlePage = true;
        continue;
      }
      
      if (inTitlePage && line === '') {
        inTitlePage = false;
        continue;
      }
      
      if (inTitlePage) {
        continue; // Skip other title page elements
      }
      
      // Detect element types
      const elementType = this.detectElementType(line);
      elements.push({ type: elementType, content: line });
    }

    // Generate FDX XML
    const fdxContent = this.generateFDXXML(extractedTitle, extractedAuthor, contact, elements);
    
    return new Blob([fdxContent], { 
      type: 'application/xml'
    });
  }

  private extractTextFromParagraph(paragraph: Element): string {
    // Extract text content, handling formatting elements
    let text = '';
    
    const textElements = paragraph.querySelectorAll('Text');
    textElements.forEach((textEl) => {
      text += textEl.textContent || '';
    });
    
    // Fallback to plain text content
    if (!text && paragraph.textContent) {
      text = paragraph.textContent;
    }
    
    return text.trim();
  }

  private detectElementType(line: string): string {
    const trimmed = line.trim();
    
    // Scene heading
    if (/^(INT\.|EXT\.|EST\.)/.test(trimmed)) {
      return 'Scene Heading';
    }
    
    // Character (all caps, no lowercase)
    if (/^[A-Z][A-Z\s]*$/.test(trimmed) && !trimmed.endsWith('.')) {
      return 'Character';
    }
    
    // Parenthetical
    if (/^\(.*\)$/.test(trimmed)) {
      return 'Parenthetical';
    }
    
    // Transition
    if (/^(FADE|CUT|DISSOLVE|SMASH CUT).*:$/.test(trimmed) || /.*TO:$/.test(trimmed)) {
      return 'Transition';
    }
    
    return 'Action';
  }

  private generateFDXXML(title: string, author: string, contact: string, elements: Array<{ type: string; content: string }>): string {
    const escapeXml = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    // FDX header
    let fdx = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Template="No" Version="1">

<Content>
<Paragraph Type="Scene Heading">
<Text>FADE IN:</Text>
</Paragraph>
`;

    // Add script elements
    elements.forEach(element => {
      if (element.content.trim()) {
        fdx += `<Paragraph Type="${element.type}">
<Text>${escapeXml(element.content)}</Text>
</Paragraph>
`;
      } else {
        fdx += `<Paragraph Type="Action">
<Text></Text>
</Paragraph>
`;
      }
    });

    // FDX footer
    fdx += `</Content>

<TitlePage>
<Content>
<Paragraph Type="Title">
<Text>${escapeXml(title)}</Text>
</Paragraph>
<Paragraph Type="Credit">
<Text>by</Text>
</Paragraph>
<Paragraph Type="Author">
<Text>${escapeXml(author)}</Text>
</Paragraph>`;

    if (contact) {
      fdx += `<Paragraph Type="Contact">
<Text>${escapeXml(contact)}</Text>
</Paragraph>`;
    }

    fdx += `</Content>
</TitlePage>

</FinalDraft>`;

    return fdx;
  }

  // Utility method to check if a file is likely an FDX file
  static isValidFDXFile(file: File): boolean {
    return file.name.toLowerCase().endsWith('.fdx') || 
           file.type === 'application/xml' ||
           file.type === 'text/xml';
  }

  // Create a downloadable FDX file
  static downloadFDX(fountainContent: string, filename: string = 'screenplay.fdx', options: FDXExportOptions = {}): void {
    const converter = new FinalDraftConverter();
    const blob = converter.exportFDX(fountainContent, options);
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.fdx') ? filename : `${filename}.fdx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
export const fdxConverter = new FinalDraftConverter();