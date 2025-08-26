import { useState } from 'react';
import { Fountain } from 'fountain-js';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export function TestSuite() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const fountain = new Fountain();
  
  const sampleScript = `Title: Test Screenplay
Author: Claude Code

FADE IN:

INT. COFFEE SHOP - DAY

Jane enters nervously.

                    JANE
               (smiling)
    Hello, is anyone here?

                    BARISTA
    Welcome! What can I get you?

CUT TO BLACK.`;

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];
    
    // Test 1: Fountain parsing
    try {
      const parsed = fountain.parse(sampleScript, true);
      results.push({
        name: 'Fountain Parsing',
        passed: parsed.tokens.length > 0,
        message: `Parsed ${parsed.tokens.length} tokens successfully`
      });
    } catch (error) {
      results.push({
        name: 'Fountain Parsing',
        passed: false,
        message: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    // Test 2: Scene heading detection
    try {
      const parsed = fountain.parse(sampleScript, true);
      const sceneHeadings = parsed.tokens.filter(token => token.type === 'scene_heading');
      results.push({
        name: 'Scene Heading Detection',
        passed: sceneHeadings.length >= 1,
        message: `Found ${sceneHeadings.length} scene heading(s)`
      });
    } catch (error) {
      results.push({
        name: 'Scene Heading Detection',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    // Test 3: Character detection
    try {
      const parsed = fountain.parse(sampleScript, true);
      const characters = parsed.tokens.filter(token => token.type === 'character');
      const uniqueCharacters = [...new Set(characters.map(c => c.text?.trim()))].filter(Boolean);
      results.push({
        name: 'Character Detection',
        passed: uniqueCharacters.length >= 2,
        message: `Found ${uniqueCharacters.length} unique characters: ${uniqueCharacters.join(', ')}`
      });
    } catch (error) {
      results.push({
        name: 'Character Detection',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    // Test 4: Dialogue detection
    try {
      const parsed = fountain.parse(sampleScript, true);
      const dialogue = parsed.tokens.filter(token => token.type === 'dialogue');
      results.push({
        name: 'Dialogue Detection',
        passed: dialogue.length >= 2,
        message: `Found ${dialogue.length} dialogue block(s)`
      });
    } catch (error) {
      results.push({
        name: 'Dialogue Detection',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    // Test 5: Action detection
    try {
      const parsed = fountain.parse(sampleScript, true);
      const actions = parsed.tokens.filter(token => token.type === 'action');
      results.push({
        name: 'Action Detection',
        passed: actions.length >= 1,
        message: `Found ${actions.length} action line(s)`
      });
    } catch (error) {
      results.push({
        name: 'Action Detection',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    // Test 6: HTML formatting
    try {
      const parsed = fountain.parse(sampleScript);
      const hasHTML = Boolean(parsed.html && parsed.html.script && parsed.html.script.length > 0);
      results.push({
        name: 'HTML Formatting',
        passed: hasHTML,
        message: hasHTML ? 'HTML generated successfully' : 'No HTML output'
      });
    } catch (error) {
      results.push({
        name: 'HTML Formatting',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    // Test 7: Element type detection functions
    const testElementDetection = (text: string, expectedType: string) => {
      // Mock the detection logic from ScreenplayEditor
      const trimmed = text.trim();
      let detectedType = 'action';
      
      if (/^(INT\.|EXT\.|EST\.)/.test(trimmed)) {
        detectedType = 'scene_heading';
      } else if (/^[A-Z][A-Z\s]*$/.test(trimmed) && !trimmed.endsWith('.')) {
        detectedType = 'character';
      } else if (/^\(.*\)$/.test(trimmed)) {
        detectedType = 'parenthetical';
      }
      
      return detectedType === expectedType;
    };
    
    const elementTests = [
      { text: 'INT. HOUSE - DAY', expected: 'scene_heading' },
      { text: 'JANE', expected: 'character' },
      { text: '(smiling)', expected: 'parenthetical' },
      { text: 'She walks to the door.', expected: 'action' }
    ];
    
    const passedElementTests = elementTests.filter(test => testElementDetection(test.text, test.expected));
    
    results.push({
      name: 'Element Type Detection',
      passed: passedElementTests.length === elementTests.length,
      message: `${passedElementTests.length}/${elementTests.length} element detection tests passed`
    });
    
    setTestResults(results);
    setIsRunning(false);
  };
  
  const overallSuccess = testResults.length > 0 && testResults.every(test => test.passed);
  
  return (
    <div className="test-suite">
      <div className="test-header">
        <h3>Screenplay Editor Test Suite</h3>
        <button 
          onClick={runTests}
          disabled={isRunning}
          className="run-tests-button"
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </button>
      </div>
      
      {testResults.length > 0 && (
        <div className="test-results">
          <div className={`overall-result ${overallSuccess ? 'success' : 'failure'}`}>
            Overall: {overallSuccess ? 'PASS' : 'FAIL'} 
            ({testResults.filter(t => t.passed).length}/{testResults.length} tests passed)
          </div>
          
          {testResults.map((test, index) => (
            <div key={index} className={`test-result ${test.passed ? 'pass' : 'fail'}`}>
              <div className="test-name">
                {test.passed ? '✓' : '✗'} {test.name}
              </div>
              <div className="test-message">{test.message}</div>
            </div>
          ))}
        </div>
      )}
      
      <div className="sample-script">
        <h4>Sample Script (for testing):</h4>
        <pre className="script-sample">{sampleScript}</pre>
      </div>
    </div>
  );
}