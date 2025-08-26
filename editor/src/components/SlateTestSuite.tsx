import { useState } from 'react';
import { SlateScreenplayEditor } from './SlateScreenplayEditor';
import { Fountain } from 'fountain-js';

interface Test {
  name: string;
  description: string;
  steps: string[];
  expected: string;
  status: 'pending' | 'pass' | 'fail';
}

export function SlateTestSuite() {
  const [fountain] = useState(() => new Fountain());
  const [testScript, setTestScript] = useState('');
  const [currentTest, setCurrentTest] = useState<number | null>(null);
  
  const tests: Test[] = [
    {
      name: 'Basic Typing',
      description: 'Test that basic text input works without cursor issues',
      steps: [
        'Click in the editor',
        'Type: "Hello world"',
        'Verify text appears correctly from left to right',
        'Verify cursor stays at end of text'
      ],
      expected: 'Text should appear normally, cursor should not jump',
      status: 'pending'
    },
    {
      name: 'Scene Heading Format',
      description: 'Test scene heading detection and formatting',
      steps: [
        'Type: "int house"',
        'Press TAB',
        'Verify it formats to "INT. HOUSE" and shows as scene_heading type'
      ],
      expected: 'Line should be bold, uppercase, flush left',
      status: 'pending'
    },
    {
      name: 'Character Format',
      description: 'Test character name formatting and indentation',
      steps: [
        'Press Enter to create new line',
        'Type: "john"',
        'Press TAB until it becomes character type',
        'Verify formatting and indentation'
      ],
      expected: 'Line should be uppercase, indented 3.7" (2.2" from margin)',
      status: 'pending'
    },
    {
      name: 'TAB Cycling',
      description: 'Test TAB key cycling through element types',
      steps: [
        'On any line, press TAB repeatedly',
        'Verify it cycles: Scene Heading → Action → Character → Dialogue → Parenthetical → Scene Heading'
      ],
      expected: 'Element type should cycle correctly, formatting should update',
      status: 'pending'
    },
    {
      name: 'Context-Aware Enter',
      description: 'Test that Enter key creates appropriate next line type',
      steps: [
        'Create a character line: "JANE"',
        'Press Enter',
        'Verify next line is set to dialogue type'
      ],
      expected: 'After character, next line should default to dialogue',
      status: 'pending'
    },
    {
      name: 'Auto-Completion Suggestions',
      description: 'Test that suggestions appear and work correctly',
      steps: [
        'On empty scene heading line, verify INT./EXT./EST. suggestions appear',
        'Type "I" and verify "INT." is suggested',
        'Use arrow keys to navigate suggestions',
        'Press Tab or Enter to apply suggestion'
      ],
      expected: 'Suggestions should appear, be navigable, and apply correctly',
      status: 'pending'
    },
    {
      name: 'Line Independence',
      description: 'Test that formatting one line does not affect others',
      steps: [
        'Create scene heading: "INT. HOUSE - DAY"',
        'Create action line: "John enters"',
        'Create character line: "JOHN"',
        'Press TAB on character line to change format',
        'Verify scene heading and action lines remain unchanged'
      ],
      expected: 'Only the current line should change format',
      status: 'pending'
    },
    {
      name: 'CTRL+Enter New Scene',
      description: 'Test CTRL+Enter shortcut for creating new scenes',
      steps: [
        'Position cursor anywhere in text',
        'Press CTRL+Enter',
        'Verify new scene heading is created'
      ],
      expected: 'New scene heading with "INT. " should be created',
      status: 'pending'
    },
    {
      name: 'Fountain Conversion',
      description: 'Test conversion between Slate editor and Fountain format',
      steps: [
        'Create mixed content (scene, action, character, dialogue)',
        'Verify it appears correctly in JSON output panel',
        'Load a Fountain file and verify it formats correctly'
      ],
      expected: 'Content should convert accurately between formats',
      status: 'pending'
    },
    {
      name: 'Performance with Large Document',
      description: 'Test editor performance with a large screenplay',
      steps: [
        'Click "Load Sample Script" button below',
        'Verify editor remains responsive',
        'Try typing and TAB cycling with large content',
        'Verify suggestions still work properly'
      ],
      expected: 'Editor should remain fast and responsive with large documents',
      status: 'pending'
    }
  ];

  const runTest = (testIndex: number) => {
    setCurrentTest(testIndex);
    // Clear the editor for fresh test
    setTestScript('');
  };

  const markTestResult = (testIndex: number, status: 'pass' | 'fail') => {
    // In a real implementation, this would update test status
    console.log(`Test ${testIndex}: ${status}`);
  };

  const loadSampleScript = () => {
    const sampleScript = `INT. COFFEE SHOP - DAY

The morning rush hour crowd fills every seat. Steam rises from coffee cups as customers type furiously on laptops.

JANE (28), dressed in business casual, scans the room looking for a seat. She spots one near the window.

JANE
(to barista)
Is that seat taken?

BARISTA
All yours.

Jane settles in, opens her laptop. The screen glows as she begins typing. Her phone BUZZES.

JANE
(answering)
Hello?

VOICE (V.O.)
The package has been delivered.

Jane's face goes pale. She looks around nervously.

JANE
(whispering)
I thought we agreed—

VOICE (V.O.)
Plans change.

The line goes dead. Jane stares at her phone, then quickly packs up her laptop.

EXT. COFFEE SHOP - CONTINUOUS

Jane bursts through the door, looking over her shoulder. A BLACK SUV idles across the street.

JANE
(to herself)
Not good.

She starts walking quickly down the sidewalk. The SUV's engine RUMBLES to life.

JANE (CONT'D)
(into phone)
Pick up, pick up...

FADE TO BLACK.

INT. WAREHOUSE - NIGHT

A dimly lit space filled with crates and shadows. Jane enters cautiously.

JANE
Hello?

A FIGURE emerges from the shadows.

MYSTERIOUS MAN
You're late.

JANE
Traffic.

MYSTERIOUS MAN
(smiling coldly)
That's unfortunate.

He signals to someone off-screen. Two THUGS step into view.

JANE
(backing away)
This wasn't the deal.

MYSTERIOUS MAN
Deals change.

THUG #1 moves toward Jane. She looks for an escape route.

JANE
(desperate)
Wait! I have information you need.

MYSTERIOUS MAN
(interested)
Go on.

JANE
The real package... it's not what you think.

FADE OUT.`;
    
    setTestScript(sampleScript);
  };

  return (
    <div className="slate-test-suite">
      <h2>Slate Screenplay Editor Test Suite</h2>
      
      <div className="test-layout">
        <div className="test-list">
          <h3>Test Cases</h3>
          {tests.map((test, index) => (
            <div 
              key={index} 
              className={`test-case ${currentTest === index ? 'active' : ''}`}
              onClick={() => runTest(index)}
            >
              <h4>{test.name}</h4>
              <p>{test.description}</p>
              <div className="test-steps">
                <strong>Steps:</strong>
                <ol>
                  {test.steps.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ol>
              </div>
              <div className="test-expected">
                <strong>Expected:</strong> {test.expected}
              </div>
              <div className="test-actions">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    markTestResult(index, 'pass');
                  }}
                  className="pass-btn"
                >
                  ✓ Pass
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    markTestResult(index, 'fail');
                  }}
                  className="fail-btn"
                >
                  ✗ Fail
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="test-editor">
          <h3>Test Editor</h3>
          {currentTest !== null && (
            <div className="current-test-info">
              <h4>Testing: {tests[currentTest].name}</h4>
              <p>{tests[currentTest].description}</p>
            </div>
          )}
          
          <div className="editor-container">
            <SlateScreenplayEditor 
              value={testScript}
              onChange={setTestScript}
              fountain={fountain}
            />
          </div>

          <div className="test-actions-section">
            <button onClick={loadSampleScript} className="load-sample-btn">
              Load Sample Script
            </button>
            <button onClick={() => setTestScript('')} className="clear-btn">
              Clear Editor
            </button>
          </div>

          <div className="test-output">
            <h4>Current Content:</h4>
            <pre>{testScript || '(empty)'}</pre>
          </div>
        </div>
      </div>

      <div className="test-instructions">
        <h3>How to Test:</h3>
        <ol>
          <li>Click on a test case from the list above</li>
          <li>Follow the steps described in the test case</li>
          <li>Verify the behavior matches the expected result</li>
          <li>Mark the test as Pass ✓ or Fail ✗</li>
          <li>Move to the next test case</li>
        </ol>
        
        <h3>Key Features to Verify:</h3>
        <ul>
          <li><strong>No backwards typing</strong> - text should appear left-to-right</li>
          <li><strong>Proper cursor positioning</strong> - cursor should stay where expected</li>
          <li><strong>Line-by-line formatting</strong> - each line should format independently</li>
          <li><strong>TAB cycling</strong> - should cycle through all element types</li>
          <li><strong>Auto-suggestions</strong> - should appear and be selectable</li>
          <li><strong>Industry-standard formatting</strong> - margins and indentation should be correct</li>
        </ul>
      </div>
    </div>
  );
}