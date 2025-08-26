import { useState, useRef, useCallback, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Fountain } from 'fountain-js';

interface ContentEditableScreenplayEditorProps {
  value: string;
  onChange: (value: string) => void;
  fountain: Fountain;
}

type ElementType = 'scene_heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition';

interface ScreenplayLine {
  id: string;
  text: string;
  elementType: ElementType;
}

interface Suggestion {
  text: string;
  type: string;
  description: string;
}

export function ContentEditableScreenplayEditor({ value, onChange, fountain }: ContentEditableScreenplayEditorProps) {
  const [lines, setLines] = useState<ScreenplayLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [popupPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef<HTMLDivElement>(null);

  // Element cycle order for TAB key
  const elementCycle: ElementType[] = ['scene_heading', 'action', 'character', 'dialogue', 'parenthetical'];

  // Convert plain text to line objects
  const parseTextToLines = useCallback((text: string): ScreenplayLine[] => {
    const textLines = text.split('\n');
    return textLines.map((lineText, index) => ({
      id: `line-${index}`,
      text: lineText,
      elementType: detectElementType(lineText)
    }));
  }, []);

  // Convert lines back to plain text
  const linesToText = useCallback((screenplayLines: ScreenplayLine[]): string => {
    return screenplayLines.map(line => line.text).join('\n');
  }, []);

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

  // Initialize lines from value prop
  useEffect(() => {
    const parsedLines = parseTextToLines(value);
    setLines(parsedLines);
  }, [value, parseTextToLines]);

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

  // Generate suggestions based on context
  const generateSuggestions = (type: ElementType, currentText: string): Suggestion[] => {
    const { characters } = getKnownElements();
    const suggestions: Suggestion[] = [];
    const lowerText = currentText.toLowerCase();

    switch (type) {
      case 'scene_heading': {
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
        }
        break;
      }

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
          'voice over'
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

  // Get current cursor position info
  const getCurrentLineFromCursor = (): { lineIndex: number; lineElement: HTMLElement | null } => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !editorRef.current) {
      return { lineIndex: 0, lineElement: null };
    }

    let node = selection.anchorNode;
    let lineElement: HTMLElement | null = null;

    // Find the paragraph element containing the cursor
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).classList.contains('screenplay-line')) {
        lineElement = node as HTMLElement;
        break;
      }
      node = node.parentNode;
    }

    if (!lineElement) {
      return { lineIndex: 0, lineElement: null };
    }

    // Find the index of this line
    const allLines = editorRef.current.querySelectorAll('.screenplay-line');
    const lineIndex = Array.from(allLines).indexOf(lineElement);

    return { lineIndex: lineIndex >= 0 ? lineIndex : 0, lineElement };
  };

  // Handle TAB key - cycle element type for current line
  const handleTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const { lineIndex, lineElement } = getCurrentLineFromCursor();
    if (!lineElement || lineIndex >= lines.length) return;

    const currentLine = lines[lineIndex];
    const currentType = currentLine.elementType;
    const currentIndex = elementCycle.indexOf(currentType);
    const nextIndex = (currentIndex + 1) % elementCycle.length;
    const nextType = elementCycle[nextIndex];

    // Format the line text for the new type
    const formattedText = formatLine(currentLine.text, nextType);

    // Update the line
    const newLines = [...lines];
    newLines[lineIndex] = {
      ...currentLine,
      text: formattedText,
      elementType: nextType
    };

    setLines(newLines);
    onChange(linesToText(newLines));

    // Update the line element's class and content
    lineElement.className = `screenplay-line element-${nextType}`;
    lineElement.textContent = formattedText;

    // Position cursor at end of text
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(lineElement);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Handle ENTER key - create new line
  const handleEnterKey = (e: KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const { lineIndex } = getCurrentLineFromCursor();
    if (lineIndex >= lines.length) return;

    const currentLine = lines[lineIndex];
    let newElementType: ElementType = 'action';

    // Determine next element type based on current line
    if (currentLine.elementType === 'character' && currentLine.text.trim().length > 0) {
      newElementType = 'dialogue';
    } else if (currentLine.elementType === 'parenthetical' && currentLine.text.trim().length > 0) {
      newElementType = 'dialogue';
    }

    // Create new line
    const newLine: ScreenplayLine = {
      id: `line-${Date.now()}`,
      text: '',
      elementType: newElementType
    };

    // Insert new line after current
    const newLines = [...lines];
    newLines.splice(lineIndex + 1, 0, newLine);
    
    setLines(newLines);
    onChange(linesToText(newLines));
    setCurrentLineIndex(lineIndex + 1);
  };

  // Handle CTRL+ENTER - new scene
  const handleCtrlEnter = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      
      const { lineIndex } = getCurrentLineFromCursor();
      
      // Create new scene line
      const newLine: ScreenplayLine = {
        id: `line-${Date.now()}`,
        text: 'INT. ',
        elementType: 'scene_heading'
      };

      // Insert new scene after current line with blank line before
      const newLines = [...lines];
      newLines.splice(lineIndex + 1, 0, 
        { id: `line-${Date.now()}-blank`, text: '', elementType: 'action' },
        newLine
      );
      
      setLines(newLines);
      onChange(linesToText(newLines));
      setCurrentLineIndex(lineIndex + 2);
    }
  };

  // Handle content changes
  const handleContentChange = () => {
    if (!editorRef.current) return;

    const lineElements = editorRef.current.querySelectorAll('.screenplay-line');
    const newLines = Array.from(lineElements).map((element, index) => {
      const text = element.textContent || '';
      const currentLine = lines[index];
      
      return {
        id: currentLine?.id || `line-${index}`,
        text,
        elementType: currentLine?.elementType || detectElementType(text)
      };
    });

    setLines(newLines);
    onChange(linesToText(newLines));

    // Update current line index
    const { lineIndex } = getCurrentLineFromCursor();
    setCurrentLineIndex(lineIndex);

    // Generate suggestions for current line
    if (lineIndex < newLines.length) {
      const currentLine = newLines[lineIndex];
      const newSuggestions = generateSuggestions(currentLine.elementType, currentLine.text);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0 || (currentLine.elementType === 'scene_heading' && currentLine.text.trim() === ''));
      setSelectedSuggestion(0);
    }
  };

  // Handle key down
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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
          if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
            e.preventDefault();
            applySuggestion(suggestions[selectedSuggestion]);
            return;
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          return;
      }
    }

    // Handle special keys
    switch (e.key) {
      case 'Tab':
        if (!showSuggestions) {
          handleTabKey(e);
        }
        break;
      case 'Enter':
        if (e.ctrlKey) {
          handleCtrlEnter(e);
        } else if (!showSuggestions) {
          handleEnterKey(e);
        }
        break;
    }
  };

  // Apply suggestion
  const applySuggestion = (suggestion: Suggestion) => {
    const { lineIndex, lineElement } = getCurrentLineFromCursor();
    if (!lineElement || lineIndex >= lines.length) return;

    // Update line data
    const newLines = [...lines];
    newLines[lineIndex] = {
      ...newLines[lineIndex],
      text: suggestion.text
    };

    setLines(newLines);
    onChange(linesToText(newLines));
    setShowSuggestions(false);

    // Update DOM element
    lineElement.textContent = suggestion.text;

    // Position cursor at end
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(lineElement);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  return (
    <div className="screenplay-editor">
      <div className={`element-indicator type-${lines[currentLineIndex]?.elementType || 'action'}`}>
        Current: <strong>{(lines[currentLineIndex]?.elementType || 'action').toUpperCase().replace('_', ' ')}</strong>
        <span className="shortcuts-hint">
          TAB: Cycle format | CTRL+ENTER: New scene
        </span>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        className="screenplay-input contenteditable-editor"
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning={true}
      >
        {lines.length === 0 ? (
          <div className="screenplay-line element-action" data-element-type="action">
            {'\u00A0'}
          </div>
        ) : (
          lines.map((line) => (
            <div
              key={line.id}
              className={`screenplay-line element-${line.elementType}`}
              data-element-type={line.elementType}
            >
              {line.text || '\u00A0'}
            </div>
          ))
        )}
      </div>
      
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