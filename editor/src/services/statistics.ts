import type { Token } from 'fountain-js';

export interface ScriptStatistics {
  // Basic counts
  pageCount: number;
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  
  // Element statistics
  sceneCount: number;
  dialoguePercentage: number;
  actionPercentage: number;
  
  // Character statistics
  characterStats: Record<string, CharacterStats>;
  totalCharacters: number;
  
  // Timing estimates
  estimatedRuntimeMinutes: number;
  
  // Scene breakdown
  intScenes: number;
  extScenes: number;
  dayScenes: number;
  nightScenes: number;
  
  // Dialogue analysis
  averageDialogueLength: number;
  longestDialogue: DialogueEntry;
  
  // Page distribution
  dialoguePages: number;
  actionPages: number;
}

export interface CharacterStats {
  name: string;
  lineCount: number;
  wordCount: number;
  speechCount: number; // Number of times character speaks
  averageWordsPerSpeech: number;
  firstAppearance: number; // Page number
  lastAppearance: number;
  percentageOfDialogue: number;
}

export interface DialogueEntry {
  character: string;
  text: string;
  wordCount: number;
  lineNumber: number;
}

export class StatisticsCalculator {
  private tokens: Token[] = [];
  
  calculateStatistics(tokens: Token[]): ScriptStatistics {
    this.tokens = tokens;
    
    const basicStats = this.calculateBasicStats();
    const elementStats = this.calculateElementStats();
    const characterStats = this.calculateCharacterStats();
    const sceneStats = this.calculateSceneStats();
    const dialogueStats = this.calculateDialogueStats();
    
    return {
      ...basicStats,
      ...elementStats,
      ...characterStats,
      ...sceneStats,
      ...dialogueStats,
    };
  }
  
  private calculateBasicStats() {
    const allText = this.tokens
      .filter(token => token.text)
      .map(token => token.text!)
      .join(' ');
    
    const wordCount = allText.trim() ? allText.trim().split(/\s+/).length : 0;
    const characterCount = allText.length;
    const characterCountNoSpaces = allText.replace(/\s/g, '').length;
    
    // Screenplay page calculation: ~250 words per page
    // But also consider formatting - dialogue takes more space
    const dialogueWords = this.countDialogueWords();
    const actionWords = wordCount - dialogueWords;
    
    // Dialogue takes more vertical space (character names, spacing)
    // Rough estimate: dialogue words count as 1.3x for page calculation
    const adjustedWordCount = actionWords + (dialogueWords * 1.3);
    const pageCount = Math.max(1, Math.ceil(adjustedWordCount / 200));
    
    // Runtime estimate: 1 page ≈ 1 minute, but varies by dialogue density
    const dialoguePercentage = wordCount > 0 ? (dialogueWords / wordCount) * 100 : 0;
    const runtimeMultiplier = dialoguePercentage > 60 ? 0.9 : 1.0; // Dialogue-heavy scripts run faster
    const estimatedRuntimeMinutes = Math.round(pageCount * runtimeMultiplier);
    
    return {
      pageCount,
      wordCount,
      characterCount,
      characterCountNoSpaces,
      estimatedRuntimeMinutes,
    };
  }
  
  private calculateElementStats() {
    const dialogueTokens = this.tokens.filter(token => token.type === 'dialogue');
    const actionTokens = this.tokens.filter(token => 
      token.type === 'action' || token.type === 'general'
    );
    const totalContentTokens = dialogueTokens.length + actionTokens.length;
    
    const dialoguePercentage = totalContentTokens > 0 
      ? (dialogueTokens.length / totalContentTokens) * 100 
      : 0;
    
    const actionPercentage = 100 - dialoguePercentage;
    
    const sceneCount = this.tokens.filter(token => 
      token.type === 'scene_heading'
    ).length;
    
    return {
      sceneCount,
      dialoguePercentage: Math.round(dialoguePercentage * 10) / 10,
      actionPercentage: Math.round(actionPercentage * 10) / 10,
    };
  }
  
  private calculateCharacterStats() {
    const characterStats: Record<string, CharacterStats> = {};
    const dialogueWords = this.countDialogueWords();
    let currentPageEstimate = 1;
    let wordsOnPage = 0;
    
    // Track current character for dialogue attribution
    let currentCharacter = '';
    
    this.tokens.forEach((token) => {
      // Update page estimate
      if (token.text) {
        const tokenWords = token.text.trim().split(/\s+/).length;
        wordsOnPage += tokenWords;
        
        // Rough page estimation based on word count
        if (wordsOnPage > 200) {
          currentPageEstimate++;
          wordsOnPage = tokenWords;
        }
      }
      
      if (token.type === 'character' && token.text) {
        const characterName = token.text.trim().toUpperCase();
        currentCharacter = characterName;
        
        if (!characterStats[characterName]) {
          characterStats[characterName] = {
            name: characterName,
            lineCount: 0,
            wordCount: 0,
            speechCount: 0,
            averageWordsPerSpeech: 0,
            firstAppearance: currentPageEstimate,
            lastAppearance: currentPageEstimate,
            percentageOfDialogue: 0,
          };
        }
        
        characterStats[characterName].lastAppearance = currentPageEstimate;
        characterStats[characterName].speechCount++;
      }
      
      if (token.type === 'dialogue' && token.text && currentCharacter) {
        const words = token.text.trim().split(/\s+/).length;
        const lines = token.text.split('\n').length;
        
        if (characterStats[currentCharacter]) {
          characterStats[currentCharacter].wordCount += words;
          characterStats[currentCharacter].lineCount += lines;
        }
      }
    });
    
    // Calculate derived stats
    Object.values(characterStats).forEach(stats => {
      stats.averageWordsPerSpeech = stats.speechCount > 0 
        ? Math.round((stats.wordCount / stats.speechCount) * 10) / 10
        : 0;
      
      stats.percentageOfDialogue = dialogueWords > 0 
        ? Math.round((stats.wordCount / dialogueWords) * 1000) / 10
        : 0;
    });
    
    return {
      characterStats,
      totalCharacters: Object.keys(characterStats).length,
    };
  }
  
  private calculateSceneStats() {
    const sceneTokens = this.tokens.filter(token => token.type === 'scene_heading');
    
    let intScenes = 0;
    let extScenes = 0;
    let dayScenes = 0;
    let nightScenes = 0;
    
    sceneTokens.forEach(token => {
      if (!token.text) return;
      
      const sceneText = token.text.toUpperCase();
      
      // Count INT/EXT
      if (sceneText.startsWith('INT.')) {
        intScenes++;
      } else if (sceneText.startsWith('EXT.')) {
        extScenes++;
      }
      
      // Count DAY/NIGHT
      if (sceneText.includes(' DAY') || sceneText.includes(' MORNING') || sceneText.includes(' DAWN')) {
        dayScenes++;
      } else if (sceneText.includes(' NIGHT') || sceneText.includes(' EVENING') || sceneText.includes(' DUSK')) {
        nightScenes++;
      }
    });
    
    return {
      intScenes,
      extScenes,
      dayScenes,
      nightScenes,
    };
  }
  
  private calculateDialogueStats() {
    const dialogues: DialogueEntry[] = [];
    let currentCharacter = '';
    let lineNumber = 0;
    
    this.tokens.forEach(token => {
      lineNumber++;
      
      if (token.type === 'character' && token.text) {
        currentCharacter = token.text.trim().toUpperCase();
      }
      
      if (token.type === 'dialogue' && token.text && currentCharacter) {
        const wordCount = token.text.trim().split(/\s+/).length;
        dialogues.push({
          character: currentCharacter,
          text: token.text,
          wordCount,
          lineNumber,
        });
      }
    });
    
    const averageDialogueLength = dialogues.length > 0
      ? Math.round((dialogues.reduce((sum, d) => sum + d.wordCount, 0) / dialogues.length) * 10) / 10
      : 0;
    
    const longestDialogue = dialogues.reduce((longest, current) => 
      current.wordCount > longest.wordCount ? current : longest
    , { character: '', text: '', wordCount: 0, lineNumber: 0 });
    
    // Estimate pages for dialogue vs action
    const totalDialogueWords = dialogues.reduce((sum, d) => sum + d.wordCount, 0);
    const totalWords = this.countAllWords();
    const actionWords = totalWords - totalDialogueWords;
    
    // Dialogue takes more space due to formatting
    const dialoguePages = Math.ceil((totalDialogueWords * 1.3) / 200);
    const actionPages = Math.ceil(actionWords / 250);
    
    return {
      averageDialogueLength,
      longestDialogue,
      dialoguePages,
      actionPages,
    };
  }
  
  private countDialogueWords(): number {
    return this.tokens
      .filter(token => token.type === 'dialogue' && token.text)
      .reduce((count, token) => {
        return count + (token.text?.trim().split(/\s+/).length || 0);
      }, 0);
  }
  
  private countAllWords(): number {
    return this.tokens
      .filter(token => token.text)
      .reduce((count, token) => {
        return count + (token.text?.trim().split(/\s+/).length || 0);
      }, 0);
  }
}

// Utility function to get quick stats
export const getQuickStats = (tokens: Token[]) => {
  const calculator = new StatisticsCalculator();
  const stats = calculator.calculateStatistics(tokens);
  
  return {
    pages: stats.pageCount,
    words: stats.wordCount,
    scenes: stats.sceneCount,
    characters: stats.totalCharacters,
    runtime: `${stats.estimatedRuntimeMinutes} min`,
  };
};

// Singleton instance
export const statisticsCalculator = new StatisticsCalculator();