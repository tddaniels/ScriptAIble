// import Typo from 'typo-js';

export interface SpellCheckResult {
  isCorrect: boolean;
  suggestions: string[];
  word: string;
}

export interface SpellCheckError {
  word: string;
  start: number;
  end: number;
  suggestions: string[];
}

export class SpellChecker {
  private dictionary: any | null = null;
  private loaded: boolean = false;
  private loadingPromise: Promise<void> | null = null;

  constructor() {
    this.loadDictionary();
  }

  private async loadDictionary(): Promise<void> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise(async (resolve) => {
      try {
        // Try to load dictionaries from public folder
        const affPath = '/dictionaries/en_US.aff';
        const dicPath = '/dictionaries/en_US.dic';

        const [affResponse, dicResponse] = await Promise.all([
          fetch(affPath).catch(() => null),
          fetch(dicPath).catch(() => null)
        ]);

        if (affResponse?.ok && dicResponse?.ok) {
          // const [affData, dicData] = await Promise.all([
          //   affResponse.text(),
          //   dicResponse.text()
          // ]);

          // this.dictionary = new Typo('en_US', affData, dicData);
          this.loaded = true;
          resolve();
        } else {
          // Fallback: create a basic spell checker with common words
          this.createFallbackDictionary();
          this.loaded = true;
          resolve();
        }
      } catch (error) {
        console.warn('Failed to load spell check dictionary, using fallback:', error);
        this.createFallbackDictionary();
        this.loaded = true;
        resolve();
      }
    });

    return this.loadingPromise;
  }

  private createFallbackDictionary(): void {
    // Create a basic spell checker with common words
    const commonWords = [
      // Common screenplay words
      'INT', 'EXT', 'DAY', 'NIGHT', 'FADE', 'CUT', 'TO', 'DISSOLVE',
      'CONTINUOUS', 'LATER', 'MORNING', 'EVENING', 'DAWN', 'DUSK',
      // Common words
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
      'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
      'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they',
      'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would',
      'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about',
      'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can',
      'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people',
      'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see',
      'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its',
      'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
      'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want',
      'because', 'any', 'these', 'give', 'day', 'most', 'us'
    ];

    // Create a simple dictionary checker
    this.dictionary = {
      check: (word: string) => {
        return commonWords.includes(word.toLowerCase()) || 
               /^[A-Z]+$/.test(word) || // All caps (character names)
               /^\d+$/.test(word) ||    // Numbers
               word.length <= 2;       // Short words/abbreviations
      },
      suggest: (word: string) => {
        // Simple suggestion algorithm
        const suggestions: string[] = [];
        const lowerWord = word.toLowerCase();
        
        // Find similar words
        commonWords.forEach(dictWord => {
          if (this.levenshteinDistance(lowerWord, dictWord) <= 2) {
            suggestions.push(dictWord);
          }
        });

        return suggestions.slice(0, 5); // Return top 5 suggestions
      }
    } as any;
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }

  public async checkWord(word: string): Promise<SpellCheckResult> {
    await this.loadDictionary();
    
    if (!this.dictionary || !word.trim()) {
      return {
        isCorrect: true,
        suggestions: [],
        word
      };
    }

    // Skip certain types of words
    if (this.shouldSkipWord(word)) {
      return {
        isCorrect: true,
        suggestions: [],
        word
      };
    }

    const isCorrect = this.dictionary.check(word);
    const suggestions = isCorrect ? [] : this.dictionary.suggest(word) || [];

    return {
      isCorrect,
      suggestions: suggestions.slice(0, 5), // Limit to 5 suggestions
      word
    };
  }

  private shouldSkipWord(word: string): boolean {
    // Skip words that are likely proper nouns or screenplay elements
    return (
      /^[A-Z]+$/.test(word) ||              // All caps (character names)
      /^\d+$/.test(word) ||                 // Numbers
      /^[A-Z][a-z]*[A-Z]/.test(word) ||     // CamelCase
      word.includes('\'') ||                // Contractions
      word.includes('-') ||                 // Hyphenated words
      word.length <= 2 ||                   // Very short words
      /^[A-Z]{2,}\./.test(word) ||          // Abbreviations like "U.S."
      word.startsWith('www.') ||            // URLs
      word.includes('@')                    // Email addresses
    );
  }

  public async checkText(text: string): Promise<SpellCheckError[]> {
    await this.loadDictionary();
    
    const errors: SpellCheckError[] = [];
    const words = this.extractWords(text);

    for (const wordInfo of words) {
      const result = await this.checkWord(wordInfo.word);
      if (!result.isCorrect) {
        errors.push({
          word: wordInfo.word,
          start: wordInfo.start,
          end: wordInfo.end,
          suggestions: result.suggestions
        });
      }
    }

    return errors;
  }

  private extractWords(text: string): Array<{ word: string; start: number; end: number }> {
    const words: Array<{ word: string; start: number; end: number }> = [];
    const regex = /\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      words.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }

    return words;
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  public async waitForLoad(): Promise<void> {
    if (this.loadingPromise) {
      await this.loadingPromise;
    }
  }
}

// Singleton instance
export const spellChecker = new SpellChecker();