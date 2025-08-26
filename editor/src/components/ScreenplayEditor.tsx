import { useState, useRef, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { Fountain } from 'fountain-js';

interface ScreenplayEditorProps {
  value: string;
  onChange: (value: string) => void;
  fountain: Fountain;
}

type ElementType = 'scene_heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition';

interface Suggestion {
  text: string;
  type: string;
  description: string;
}

export function ScreenplayEditor({ value, onChange, fountain }: ScreenplayEditorProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [currentElementType, setCurrentElementType] = useState<ElementType>('action');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // KIT Scenarist element cycle order
  const elementCycle: ElementType[] = ['scene_heading', 'action', 'character', 'dialogue', 'parenthetical'];

  // Extract existing characters and locations from parsed script
  const getKnownElements = useCallback(() => {
    try {
      const parsed = fountain.parse(value, true);
      const characters = new Set<string>();
      const locations = new Set<string>();

      parsed.tokens.forEach(token => {
        if (token.type === 'character' && token.text) {
          characters.add(token.text.trim());
        }
        if (token.type === 'scene_heading' && token.text) {
          const locationMatch = token.text.match(/(?:INT\.|EXT\.|EST\.)\s*(.+?)(?:\s*-\s*.+)?$/i);
          if (locationMatch && locationMatch[1]) {
            locations.add(locationMatch[1].trim());
          }
        }
      });

      return { characters: Array.from(characters), locations: Array.from(locations) };
    } catch {
      return { characters: [], locations: [] };
    }
  }, [value, fountain]);

  // Detect current line context
  const getCurrentLineInfo = (text: string, cursorPos: number) => {
    const lines = text.split('\n');
    let currentLineText = '';
    let lineStart = 0;
    let lineIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineEnd = lineStart + lines[i].length;
      if (cursorPos <= lineEnd + (i < lines.length - 1 ? 1 : 0)) { // +1 for newline character except last line
        currentLineText = lines[i];
        lineIndex = i;
        break;
      }
      lineStart = lineEnd + 1; // +1 for newline character
    }

    return {
      lineText: currentLineText,
      isEmpty: currentLineText.trim() === '',
      lineStart,
      lineIndex
    };
  };

  // Auto-detect element type based on content
  const detectElementType = (lineText: string): ElementType => {
    const trimmed = lineText.trim();
    
    if (!trimmed) return 'action';
    
    // Scene heading
    if (/^(INT\.|EXT\.|EST\.)/.test(trimmed)) {
      return 'scene_heading';
    }
    
    // Character (all caps, no lowercase)
    if (/^[A-Z][A-Z\s]*$/.test(trimmed) && !trimmed.endsWith('.')) {
      return 'character';
    }
    
    // Parenthetical
    if (/^\(.*\)$/.test(trimmed)) {
      return 'parenthetical';
    }
    
    // Transition
    if (/^(FADE|CUT|DISSOLVE|SMASH CUT).*:$/.test(trimmed) || /.*TO:$/.test(trimmed)) {
      return 'transition';
    }
    
    return 'action';
  };

  // Format line based on element type
  const formatLine = (text: string, type: ElementType): string => {
    const trimmed = text.trim();
    
    switch (type) {
      case 'scene_heading':
        if (!trimmed) return 'INT. ';
        if (!/^(INT\.|EXT\.|EST\.)/.test(trimmed)) {
          return `INT. ${trimmed}`;
        }
        return trimmed.toUpperCase();
        
      case 'character':
        return trimmed.toUpperCase();
        
      case 'parenthetical':
        if (!trimmed) return '(';
        if (!trimmed.startsWith('(')) {
          return `(${trimmed}${trimmed.endsWith(')') ? '' : ')'}`;
        }
        if (!trimmed.endsWith(')') && trimmed !== '(') {
          return `${trimmed})`;
        }
        return trimmed;
        
      case 'transition':
        return trimmed.toUpperCase();
        
      case 'dialogue':
      case 'action':
      default:
        return trimmed;
    }
  };

  // Generate suggestions based on context
  const generateSuggestions = (type: ElementType, currentText: string): Suggestion[] => {
    const { characters, locations } = getKnownElements();
    const suggestions: Suggestion[] = [];
    const lowerText = currentText.toLowerCase();

    switch (type) {
      case 'scene_heading':
        // Show INT/EXT/EST suggestions for empty lines or partial matches
        if (lowerText.length <= 3) {
          if (lowerText === '' || 'int.'.startsWith(lowerText)) {
            suggestions.push({ text: 'INT. ', type: 'scene_heading', description: 'Interior scene' });
          }
          if (lowerText === '' || 'ext.'.startsWith(lowerText)) {
            suggestions.push({ text: 'EXT. ', type: 'scene_heading', description: 'Exterior scene' });
          }
          if (lowerText === '' || 'est.'.startsWith(lowerText)) {
            suggestions.push({ text: 'EST. ', type: 'scene_heading', description: 'Establishing shot' });
          }
        }
        
        // Location and time suggestions for scene headings
        if (currentText.match(/^(int\.|ext\.|est\.)\s+/i)) {
          const hasLocation = currentText.match(/^(int\.|ext\.|est\.)\s+\w+/i);
          const hasDash = currentText.includes(' - ');
          
          // If we have INT./EXT./EST. + location but no dash, suggest adding dash + time
          if (hasLocation && !hasDash) {
            const times = ['DAY', 'NIGHT', 'DAWN', 'DUSK', 'MORNING', 'AFTERNOON', 'EVENING', 'CONTINUOUS'];
            times.forEach(time => {
              suggestions.push({
                text: currentText.trim() + ' - ' + time,
                type: 'time',
                description: `Time: ${time}`
              });
            });
          }
          
          // If we have a dash, suggest time completions
          if (hasDash) {
            const afterDash = currentText.split(' - ')[1] || '';
            const times = ['DAY', 'NIGHT', 'DAWN', 'DUSK', 'MORNING', 'AFTERNOON', 'EVENING', 'CONTINUOUS'];
            times.forEach(time => {
              if (afterDash === '' || time.toLowerCase().startsWith(afterDash.toLowerCase())) {
                suggestions.push({
                  text: currentText.replace(/ - .*$/, ` - ${time}`),
                  type: 'time',
                  description: `Time: ${time}`
                });
              }
            });
          }
          
          // Location suggestions (only if no specific location typed yet)
          if (!hasLocation || currentText.match(/^(int\.|ext\.|est\.)\s+\w{1,2}$/i)) {
            locations.forEach(location => {
              const afterPrefix = currentText.replace(/^(int\.|ext\.|est\.)\s*/i, '');
              if (location.toLowerCase().includes(afterPrefix.toLowerCase()) || afterPrefix.length < 3) {
                suggestions.push({
                  text: currentText.replace(/^(int\.|ext\.|est\.)\s*/i, (match) => match + location + ' - '),
                  type: 'location',
                  description: `Location: ${location}`
                });
              }
            });
          }
        }
        break;

      case 'character':
        characters.forEach(character => {
          if (character.toLowerCase().includes(lowerText) || lowerText.length < 2) {
            suggestions.push({
              text: character,
              type: 'character',
              description: `Character: ${character}`
            });
          }
        });
        break;

      case 'parenthetical': {
        const commonParentheticals = [
          'beat',
          'pause',
          'smiling',
          'crying',
          'whispering',
          'shouting',
          'to himself',
          'to herself',
          'sarcastically',
          'angrily',
          'sadly',
          'confused',
          'laughing',
          'phone',
          'continuing',
          'interrupting',
          'off screen',
          'voice over',
          'beat; then',
          'sotto',
          're: previous'
        ];
        
        // Remove parentheses for matching
        const searchText = lowerText.replace(/[()]/g, '');
        
        commonParentheticals.forEach(paren => {
          if (searchText === '' || paren.toLowerCase().includes(searchText)) {
            suggestions.push({
              text: `(${paren})`,
              type: 'parenthetical',
              description: `Parenthetical: ${paren}`
            });
          }
        });
        break;
      }

      case 'transition': {
        const transitions = ['FADE IN:', 'FADE OUT.', 'CUT TO:', 'DISSOLVE TO:', 'SMASH CUT TO:'];
        transitions.forEach(transition => {
          if (transition.toLowerCase().includes(lowerText)) {
            suggestions.push({
              text: transition,
              type: 'transition',
              description: `Transition: ${transition}`
            });
          }
        });
        break;
      }
    }

    return suggestions.slice(0, 5);
  };

  // Handle Tab key - cycle through element types
  const handleTabKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const { lineText, lineIndex } = getCurrentLineInfo(value, cursorPos);
    
    // Get current element type and cycle to next
    const currentType = detectElementType(lineText);
    const currentIndex = elementCycle.indexOf(currentType);
    const nextIndex = (currentIndex + 1) % elementCycle.length;
    const nextType = elementCycle[nextIndex];
    
    // Format the current line for the new type
    const formatted = formatLine(lineText, nextType);
    
    // Replace current line using line index for more accurate replacement
    const lines = value.split('\n');
    lines[lineIndex] = formatted;
    const newValue = lines.join('\n');
    
    onChange(newValue);
    setCurrentElementType(nextType);
    
    // Position cursor at end of formatted text
    setTimeout(() => {
      // Recalculate position after replacement
      let newLineStart = 0;
      for (let i = 0; i < lineIndex; i++) {
        newLineStart += lines[i].length + 1; // +1 for newline
      }
      const newCursorPos = newLineStart + formatted.length;
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      textarea.focus();
      
      // If we cycled to scene_heading and line is empty/formatted is empty, show suggestions
      if (nextType === 'scene_heading' && formatted.trim() === '') {
        const suggestions = generateSuggestions('scene_heading', '');
        setSuggestions(suggestions);
        setShowSuggestions(true);
        setSelectedSuggestion(0);
      }
    }, 0);
  };

  // Handle Enter key - auto-transition for characters and parentheticals
  const handleEnterKey = () => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const { lineText } = getCurrentLineInfo(value, cursorPos);
    const elementType = detectElementType(lineText);
    
    // If we just typed a character name, next line could be dialogue or parenthetical
    if (elementType === 'character' && lineText.trim().length > 0) {
      // Let the normal enter happen first
      setTimeout(() => {
        setCurrentElementType('dialogue'); // Default to dialogue, TAB can switch to parenthetical
      }, 0);
    }
    
    // If we just typed a parenthetical, next line should be dialogue
    if (elementType === 'parenthetical' && lineText.trim().length > 0) {
      setTimeout(() => {
        setCurrentElementType('dialogue');
      }, 0);
    }
  };

  // Handle Ctrl+Enter - new scene
  const handleCtrlEnter = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      
      if (!textareaRef.current) return;
      
      const textarea = textareaRef.current;
      const cursorPos = textarea.selectionStart;
      
      // Insert new scene
      const newScene = '\n\nINT. ';
      const newValue = value.substring(0, cursorPos) + newScene + value.substring(cursorPos);
      
      onChange(newValue);
      setCurrentElementType('scene_heading');
      
      // Position cursor after "INT. "
      setTimeout(() => {
        const newCursorPos = cursorPos + newScene.length;
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        textarea.focus();
      }, 0);
    }
  };

  const handleTextChange = (newValue: string) => {
    onChange(newValue);
    
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const { lineText } = getCurrentLineInfo(newValue, cursorPos);
    
    // Calculate popup position
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    const currentLineIndex = lines.length - 1;
    const lineHeight = 20;
    const top = currentLineIndex * lineHeight + 25;
    const left = 20;
    
    setPopupPosition({ top, left });
    
    // Update current element type and suggestions
    const elementType = detectElementType(lineText);
    setCurrentElementType(elementType);
    
    const newSuggestions = generateSuggestions(elementType, lineText.trim());
    setSuggestions(newSuggestions);
    // Show suggestions if we have any OR if we're on an empty scene heading line  
    setShowSuggestions(newSuggestions.length > 0 || (elementType === 'scene_heading' && lineText.trim() === ''));
    setSelectedSuggestion(0);
  };

  const applySuggestion = (suggestion: Suggestion) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const { lineStart } = getCurrentLineInfo(value, cursorPos);
    
    // Replace current line with suggestion
    const lines = value.split('\n');
    const currentLineIndex = Math.max(0, value.substring(0, lineStart).split('\n').length - 1);
    lines[currentLineIndex] = suggestion.text;
    
    const newValue = lines.join('\n');
    onChange(newValue);
    setShowSuggestions(false);
    
    // Set cursor position after the suggestion
    setTimeout(() => {
      const newCursorPos = lineStart + suggestion.text.length;
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle suggestions navigation
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestion(prev => (prev + 1) % suggestions.length);
          return;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestion(prev => prev === 0 ? suggestions.length - 1 : prev - 1);
          return;
        case 'Tab':
        case 'Enter':
          e.preventDefault();
          applySuggestion(suggestions[selectedSuggestion]);
          return;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          return;
      }
    }

    // Handle special keys
    switch (e.key) {
      case 'Tab':
        handleTabKey(e);
        break;
      case 'Enter':
        if (e.ctrlKey) {
          handleCtrlEnter(e);
        } else {
          handleEnterKey();
        }
        break;
    }
  };

  return (
    <div className="screenplay-editor">
      <div className={`element-indicator type-${currentElementType}`}>
        Current: <strong>{currentElementType.toUpperCase().replace('_', ' ')}</strong>
        <span className="shortcuts-hint">
          TAB: Cycle format | CTRL+ENTER: New scene
        </span>
      </div>
      
      <textarea
        ref={textareaRef}
        className="script-input screenplay-input"
        value={value}
        onChange={e => handleTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Start typing your screenplay...

Press TAB to cycle: Scene Heading → Action → Character → Dialogue → Parenthetical
Press CTRL+ENTER for new scene

Workflow:
1. After character names, ENTER → Dialogue (or TAB → Parenthetical)  
2. After parentheticals, ENTER → Dialogue
3. 'INT. HOUSE' → shows time suggestions (- DAY, - NIGHT, etc.)

Example:
JANE
(smiling)
Hello there!"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="suggestions-popup"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`suggestion-item ${index === selectedSuggestion ? 'selected' : ''}`}
              onClick={() => applySuggestion(suggestion)}
            >
              <span className="suggestion-text">{suggestion.text}</span>
              <span className="suggestion-description">{suggestion.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}