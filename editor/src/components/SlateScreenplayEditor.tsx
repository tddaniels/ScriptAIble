import React, { useState, useCallback, useMemo } from 'react';
import { createEditor, Element as SlateElement, Editor, Transforms } from 'slate';
import type { Descendant } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import { Fountain } from 'fountain-js';
// import { useSpellCheck } from '../hooks/useSpellCheck';

// TypeScript type definitions for Slate
type ScreenplayElementType = 'scene_heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition';

type ScreenplayElement = {
  type: ScreenplayElementType;
  children: CustomText[];
}

type CustomText = {
  text: string;
}

type CustomElement = ScreenplayElement;

declare module 'slate' {
  interface CustomTypes {
    Editor: ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

interface SlateScreenplayEditorProps {
  value: string;
  onChange: (value: string) => void;
  fountain: Fountain;
}

interface Suggestion {
  text: string;
  type: string;
  description: string;
}

// Helper function to convert Fountain text to Slate value
const textToSlateValue = (text: string): Descendant[] => {
  if (!text.trim()) {
    return [
      {
        type: 'action',
        children: [{ text: '' }],
      },
    ];
  }

  const lines = text.split('\n');
  return lines.map((line) => {
    const elementType = detectElementType(line);
    return {
      type: elementType,
      children: [{ text: line }],
    };
  });
};

// Helper function to convert Slate value to Fountain text
const slateValueToText = (value: Descendant[]): string => {
  return value
    .map((node) => {
      if (SlateElement.isElement(node)) {
        return node.children.map(child => child.text).join('');
      }
      return '';
    })
    .join('\n');
};

// Auto-detect element type based on content (same logic as original)
const detectElementType = (lineText: string): ScreenplayElementType => {
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
  
  // Parenthetical - detect if line starts with "(" (even if not closed yet)
  if (/^\(/.test(trimmed)) {
    return 'parenthetical';
  }
  
  // Transition
  if (/^(FADE|CUT|DISSOLVE|SMASH CUT).*:$/.test(trimmed) || /.*TO:$/.test(trimmed)) {
    return 'transition';
  }
  
  return 'action';
};

export function SlateScreenplayEditor({ value, onChange, fountain }: SlateScreenplayEditorProps) {
  // Create editor with React and History plugins
  const editor = useMemo(
    () => withHistory(withReact(createEditor())),
    []
  );

  // Internal Slate value state
  const [slateValue, setSlateValue] = useState<Descendant[]>(() => textToSlateValue(value));

  // Suggestions state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [suggestionsPosition, setSuggestionsPosition] = useState({ top: 0, left: 0 });

  // Spell checking (currently unused but available for future enhancements)
  // const { errors: spellErrors, isReady: spellCheckReady } = useSpellCheck(value, { 
  //   enabled: true,
  //   debounceMs: 2000 
  // });

  // Element cycle order for TAB key
  const elementCycle: ScreenplayElementType[] = ['scene_heading', 'action', 'character', 'dialogue', 'parenthetical'];

  // Extract existing characters and locations from parsed script
  const getKnownElements = useCallback(() => {
    try {
      const parsed = fountain.parse(slateValueToText(slateValue), true);
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
  }, [slateValue, fountain]);

  // Generate suggestions based on context
  const generateSuggestions = useCallback((type: ScreenplayElementType, currentText: string): Suggestion[] => {
    const { characters, locations } = getKnownElements();
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
          'loudly',
          'quietly',
          'softly',
          'to himself',
          'to herself',
          'to the camera',
          'aside',
          'sarcastically',
          'angrily',
          'sadly',
          'happily',
          'nervously',
          'confused',
          'surprised',
          'shocked',
          'laughing',
          'sighing',
          'breathing heavily',
          'under his breath',
          'under her breath',
          'muttering',
          'phone',
          'into phone',
          'on phone',
          'continuing',
          'interrupting',
          'overlapping',
          'off screen',
          'O.S.',
          'voice over',
          'V.O.',
          'singing',
          'humming',
          'reading',
          'thinking aloud'
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
  }, [getKnownElements]);

  // Update internal Slate value when external value changes
  React.useEffect(() => {
    const newSlateValue = textToSlateValue(value);
    // Only update if the content actually changed to avoid infinite loops
    const currentText = slateValueToText(slateValue);
    if (currentText !== value) {
      setSlateValue(newSlateValue);
      // Reset editor content using Transforms
      editor.children = newSlateValue;
      editor.onChange();
    }
  }, [value, editor, slateValue]);

  // Handle changes in Slate editor
  const handleSlateChange = (newValue: Descendant[]) => {
    setSlateValue(newValue);
    // Convert Slate value back to Fountain text and call onChange
    const fountainText = slateValueToText(newValue);
    onChange(fountainText);

    // Update suggestions based on current cursor position
    updateSuggestions();
  };

  // Update suggestions based on current content and cursor position
  const updateSuggestions = useCallback(() => {
    const { selection } = editor;
    if (!selection) {
      setShowSuggestions(false);
      return;
    }

    // Get current element and its text
    const [match] = Editor.nodes(editor, {
      match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
    });

    if (!match) {
      setShowSuggestions(false);
      return;
    }

    const [element] = match;
    const elementType = (element as ScreenplayElement).type;
    const currentText = (element as ScreenplayElement).children.map((child: CustomText) => child.text).join('');
    
    // Generate suggestions
    const newSuggestions = generateSuggestions(elementType, currentText);
    
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0 || (elementType === 'scene_heading' && currentText.trim() === ''));
    setSelectedSuggestion(0);

    // Update popup position
    updateSuggestionsPosition();
  }, [editor, generateSuggestions]);

  // Update suggestions popup position based on cursor
  const updateSuggestionsPosition = useCallback(() => {
    const { selection } = editor;
    if (!selection) return;

    try {
      const domRange = ReactEditor.toDOMRange(editor, selection);
      const rect = domRange.getBoundingClientRect();
      
      setSuggestionsPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX
      });
    } catch {
      // Fallback positioning if toDOMRange fails
      setSuggestionsPosition({ top: 100, left: 20 });
    }
  }, [editor]);

  // Custom element renderer
  const renderElement = useCallback((props: { attributes: any; children: any; element: ScreenplayElement }) => {
    const { attributes, children, element } = props;

    switch (element.type) {
      case 'scene_heading':
        return (
          <div {...attributes} className="screenplay-line element-scene_heading">
            {children}
          </div>
        );
      case 'character':
        return (
          <div {...attributes} className="screenplay-line element-character">
            {children}
          </div>
        );
      case 'dialogue':
        return (
          <div {...attributes} className="screenplay-line element-dialogue">
            {children}
          </div>
        );
      case 'parenthetical':
        return (
          <div {...attributes} className="screenplay-line element-parenthetical">
            {children}
          </div>
        );
      case 'transition':
        return (
          <div {...attributes} className="screenplay-line element-transition">
            {children}
          </div>
        );
      case 'action':
      default:
        return (
          <div {...attributes} className="screenplay-line element-action">
            {children}
          </div>
        );
    }
  }, []);

  // Format line based on element type (same logic as original)
  const formatLine = (text: string, type: ScreenplayElementType): string => {
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

  // Handle TAB key for element type cycling
  const handleTabKey = (event: React.KeyboardEvent) => {
    event.preventDefault();

    const { selection } = editor;
    if (!selection) return;

    // Get current block element
    const [match] = Editor.nodes(editor, {
      match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
    });

    if (!match) return;

    const [element, path] = match;
    const screenplayElement = element as ScreenplayElement;
    const currentType = screenplayElement.type;
    
    // Cycle to next element type
    const currentIndex = elementCycle.indexOf(currentType);
    const nextIndex = (currentIndex + 1) % elementCycle.length;
    const nextType = elementCycle[nextIndex];

    // Get current text content
    const currentText = screenplayElement.children.map((child: CustomText) => child.text).join('');
    const formattedText = formatLine(currentText, nextType);

    // Use Editor.withoutNormalizing for complex operations
    Editor.withoutNormalizing(editor, () => {
      // Update element type first
      Transforms.setNodes(
        editor,
        { type: nextType },
        { at: path }
      );

      // Update text content if formatting changed it
      if (formattedText !== currentText) {
        // Select all text in the current element
        Transforms.select(editor, {
          anchor: Editor.start(editor, path),
          focus: Editor.end(editor, path),
        });
        
        // Replace with formatted text
        Transforms.insertText(editor, formattedText);
      }
    });
  };

  // Handle Enter key for context-aware line creation
  const handleEnterKey = (event: React.KeyboardEvent) => {
    if (event.ctrlKey) {
      // CTRL+Enter: Insert new scene
      event.preventDefault();
      
      Transforms.insertNodes(editor, [
        {
          type: 'action',
          children: [{ text: '' }],
        },
        {
          type: 'scene_heading',
          children: [{ text: 'INT. ' }],
        }
      ]);
      return;
    }

    // Regular Enter: Context-aware new line
    const { selection } = editor;
    if (!selection) return;

    const [match] = Editor.nodes(editor, {
      match: n => SlateElement.isElement(n),
    });

    if (!match) return;

    const [element] = match;
    const currentType = (element as ScreenplayElement).type;
    let nextType: ScreenplayElementType = 'action';

    // Determine next element type based on current line
    if (currentType === 'character') {
      nextType = 'dialogue';
    } else if (currentType === 'parenthetical') {
      nextType = 'dialogue';
    }

    // Let Slate handle the Enter, then set the new element type
    setTimeout(() => {
      Transforms.setNodes(
        editor,
        { type: nextType },
        { match: n => SlateElement.isElement(n) }
      );
    }, 0);
  };

  // Apply selected suggestion
  const applySuggestion = (suggestion: Suggestion) => {
    const { selection } = editor;
    if (!selection) return;

    // Get current element
    const [match] = Editor.nodes(editor, {
      match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
    });

    if (!match) return;

    const [, path] = match;

    // Replace current line text with suggestion
    Editor.withoutNormalizing(editor, () => {
      // Select all text in the current element
      Transforms.select(editor, {
        anchor: Editor.start(editor, path),
        focus: Editor.end(editor, path),
      });
      
      // Replace with suggestion text
      Transforms.insertText(editor, suggestion.text);
    });

    // Hide suggestions
    setShowSuggestions(false);
  };

  // Handle keydown events
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Handle suggestions navigation
    if (showSuggestions && suggestions.length > 0) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedSuggestion(prev => (prev + 1) % suggestions.length);
          return;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedSuggestion(prev => prev === 0 ? suggestions.length - 1 : prev - 1);
          return;
        case 'Enter':
          if (!event.shiftKey) {
            event.preventDefault();
            applySuggestion(suggestions[selectedSuggestion]);
            return;
          }
          break;
        case 'Escape':
          event.preventDefault();
          setShowSuggestions(false);
          return;
      }
    }

    // Handle special keys
    if (event.key === 'Tab') {
      if (!showSuggestions) {
        handleTabKey(event);
      } else {
        // Apply suggestion on TAB
        event.preventDefault();
        applySuggestion(suggestions[selectedSuggestion]);
      }
    } else if (event.key === 'Enter') {
      handleEnterKey(event);
    }
  };

  // Get current element type for indicator
  const [currentElementType, setCurrentElementType] = useState<ScreenplayElementType>('action');

  // Update current element type when selection changes
  const updateCurrentElementType = useCallback(() => {
    const { selection } = editor;
    if (!selection) {
      setCurrentElementType('action');
      return;
    }

    const [match] = Editor.nodes(editor, {
      match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
    });

    if (!match) {
      setCurrentElementType('action');
      return;
    }
    
    const [element] = match;
    const elementType = (element as ScreenplayElement).type;
    setCurrentElementType(elementType);
  }, [editor]);

  // Update element type indicator when editor changes
  React.useEffect(() => {
    updateCurrentElementType();
    // Also update suggestions when cursor moves
    setTimeout(() => updateSuggestions(), 0);
  }, [slateValue, editor.selection, updateCurrentElementType, updateSuggestions]);

  return (
    <div className="screenplay-editor">
      <div className={`element-indicator type-${currentElementType}`}>
        Current: <strong>{currentElementType.toUpperCase().replace('_', ' ')}</strong>
        <span className="shortcuts-hint">
          TAB: Cycle format | CTRL+ENTER: New scene
        </span>
      </div>
      
      <Slate 
        editor={editor} 
        initialValue={slateValue}
        onChange={handleSlateChange}
      >
        <Editable
          renderElement={renderElement}
          onKeyDown={handleKeyDown}
          onSelect={updateCurrentElementType}
          className="screenplay-input slate-editor"
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
      </Slate>
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="suggestions-popup"
          style={{
            position: 'absolute',
            top: `${suggestionsPosition.top}px`,
            left: `${suggestionsPosition.left}px`,
            zIndex: 1000
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