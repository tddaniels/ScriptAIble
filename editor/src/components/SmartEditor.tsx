import { useState, useRef, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { Fountain } from 'fountain-js';

interface SmartEditorProps {
  value: string;
  onChange: (value: string) => void;
  fountain: Fountain;
}

interface Suggestion {
  text: string;
  type: string;
  description: string;
}

export function SmartEditor({ value, onChange, fountain }: SmartEditorProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
          // Extract location from scene heading
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

  // Detect what type of element user is starting to type
  const detectContext = (text: string, cursorPos: number): string => {
    const lines = text.split('\n');
    let currentLine = '';
    let lineStart = 0;

    // Find which line cursor is on
    for (let i = 0; i < lines.length; i++) {
      const lineEnd = lineStart + lines[i].length;
      if (cursorPos <= lineEnd) {
        currentLine = lines[i];
        break;
      }
      lineStart = lineEnd + 1;
    }

    const trimmedLine = currentLine.trim();

    // Only suggest scene heading if actually typing relevant characters
    if (/^(i|in|int|e|ex|ext|es|est)/i.test(trimmedLine) && trimmedLine.length > 0) {
      return 'scene_heading';
    }

    // Scene heading detection - more flexible
    if (/^(int|ext|est)/i.test(trimmedLine)) {
      return 'scene_heading';
    }

    // Character detection (all caps, no lowercase, not ending with period)
    if (/^[A-Z\s]+$/.test(trimmedLine) && trimmedLine.length > 0 && !trimmedLine.endsWith('.')) {
      return 'character';
    }

    // Transition detection (ends with TO: or specific transitions)
    if (/to:?\s*$/i.test(trimmedLine) || /^(fade|cut|dissolve|smash)/i.test(trimmedLine)) {
      return 'transition';
    }

    return 'action';
  };

  // Generate suggestions based on context
  const generateSuggestions = (context: string, currentText: string): Suggestion[] => {
    const { characters, locations } = getKnownElements();
    const suggestions: Suggestion[] = [];
    const lowerText = currentText.toLowerCase();

    switch (context) {
      case 'scene_heading':
        // Always show scene heading suggestions if typing at start of line
        if (lowerText.startsWith('i') || lowerText.startsWith('e') || lowerText === '' || lowerText.length <= 3) {
          if ('int.'.startsWith(lowerText)) {
            suggestions.push({ text: 'INT. ', type: 'scene_heading', description: 'Interior scene' });
          }
          if ('ext.'.startsWith(lowerText)) {
            suggestions.push({ text: 'EXT. ', type: 'scene_heading', description: 'Exterior scene' });
          }
          if ('est.'.startsWith(lowerText)) {
            suggestions.push({ text: 'EST. ', type: 'scene_heading', description: 'Establishing shot' });
          }
        }
        
        // Location suggestions if we already have INT./EXT./EST.
        if (currentText.match(/^(int\.|ext\.|est\.)\s*/i)) {
          // Suggest known locations
          locations.forEach(location => {
            if (location.toLowerCase().includes(currentText.toLowerCase()) || currentText.length < 3) {
              suggestions.push({
                text: currentText.replace(/^(int\.|ext\.|est\.)\s*/i, `$1 ${location} - `),
                type: 'location',
                description: `Location: ${location}`
              });
            }
          });
          
          // Common time indicators
          if (currentText.includes(' - ') || currentText.endsWith(' ')) {
            suggestions.push(
              { text: currentText + 'DAY', type: 'time', description: 'Day time' },
              { text: currentText + 'NIGHT', type: 'time', description: 'Night time' },
              { text: currentText + 'DAWN', type: 'time', description: 'Dawn time' },
              { text: currentText + 'DUSK', type: 'time', description: 'Dusk time' },
              { text: currentText + 'CONTINUOUS', type: 'time', description: 'Continuous action' }
            );
          }
        }
        break;

      case 'character':
        // Character suggestions
        characters.forEach(character => {
          if (character.toLowerCase().includes(currentText.toLowerCase()) || currentText.length < 2) {
            suggestions.push({
              text: character,
              type: 'character',
              description: `Character: ${character}`
            });
          }
        });
        break;

      case 'transition':
        // Transition suggestions
        const transitions = [
          'FADE IN:',
          'FADE OUT.',
          'CUT TO:',
          'DISSOLVE TO:',
          'SMASH CUT TO:',
          'JUMP CUT TO:',
          'MATCH CUT TO:'
        ];
        transitions.forEach(transition => {
          if (transition.toLowerCase().includes(currentText.toLowerCase())) {
            suggestions.push({
              text: transition,
              type: 'transition',
              description: `Transition: ${transition}`
            });
          }
        });
        break;
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };

  const handleTextChange = (newValue: string) => {
    onChange(newValue);
    
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    
    // Calculate cursor position for popup
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    const currentLineIndex = lines.length - 1;
    const currentLineText = lines[currentLineIndex] || '';
    
    // Simple positioning - improve this later
    const lineHeight = 20;
    const top = currentLineIndex * lineHeight + 25;
    const left = 20;
    
    setPopupPosition({ top, left });

    const context = detectContext(newValue, cursorPos);
    const newSuggestions = generateSuggestions(context, currentLineText.trim());
    
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setSelectedSuggestion(0);
  };

  const applySuggestion = (suggestion: Suggestion) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value;
    
    // Find the current line start
    let lineStart = start;
    while (lineStart > 0 && text[lineStart - 1] !== '\n') {
      lineStart--;
    }
    
    // Replace current line with suggestion
    const newText = text.substring(0, lineStart) + suggestion.text + text.substring(end);
    onChange(newText);
    
    setShowSuggestions(false);
    
    // Set cursor position after the suggestion
    setTimeout(() => {
      const newCursorPos = lineStart + suggestion.text.length;
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => prev === 0 ? suggestions.length - 1 : prev - 1);
        break;
      case 'Tab':
      case 'Enter':
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestion]);
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div className="smart-editor">
      <textarea
        ref={textareaRef}
        className="script-input"
        value={value}
        onChange={e => handleTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Start typing your script in Fountain format...

INT. COFFEE SHOP - DAY
JANE
Hello world!"
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