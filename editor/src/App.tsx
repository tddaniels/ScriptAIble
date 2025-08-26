import { useRef, useState } from 'react';
import { Fountain } from 'fountain-js';
// import { ScreenplayEditor } from './components/ScreenplayEditor';
import { SlateScreenplayEditor } from './components/SlateScreenplayEditor';
import { SceneBoard } from './components/SceneBoard';
import { TestSuite } from './components/TestSuite';
import { SlateTestSuite } from './components/SlateTestSuite';
import './App.css';
import './components/ScreenplayEditor.css';
import './components/ScreenplayFormatting.css';
import './components/SceneBoard.css';
import './components/TestSuite.css';
import './components/SlateTestSuite.css';

export default function App() {
  const [script, setScript] = useState('');
  const [parsed, setParsed] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'script' | 'scenes' | 'preview' | 'test' | 'slate-test'>('script');
  const fileInput = useRef<HTMLInputElement>(null);
  const fountain = useRef(new Fountain()).current;

  const loadScript = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = (ev.target?.result as string) ?? '';
      setScript(text);
      setParsed(fountain.parse(text));
    };
    reader.readAsText(file);
  };

  const saveScript = () => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.fountain';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleChange = (text: string) => {
    setScript(text);
    try {
      setParsed(fountain.parse(text));
    } catch {
      setParsed(null);
    }
  };

  const handleSceneClick = (sceneId: string) => {
    // TODO: Navigate to scene in editor
    console.log('Navigate to scene:', sceneId);
  };

  return (
    <div className="editor-container">
      <div className="toolbar">
        <div className="toolbar-left">
          <button onClick={() => fileInput.current?.click()}>Load</button>
          <button onClick={saveScript}>Save</button>
          <input
            type="file"
            accept=".fountain,.txt"
            ref={fileInput}
            onChange={loadScript}
            style={{ display: 'none' }}
          />
        </div>
        
        <div className="toolbar-tabs">
          <button 
            className={`tab-button ${activeTab === 'script' ? 'active' : ''}`}
            onClick={() => setActiveTab('script')}
          >
            Script
          </button>
          <button 
            className={`tab-button ${activeTab === 'scenes' ? 'active' : ''}`}
            onClick={() => setActiveTab('scenes')}
          >
            Scenes
          </button>
          <button 
            className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
          <button 
            className={`tab-button ${activeTab === 'test' ? 'active' : ''}`}
            onClick={() => setActiveTab('test')}
          >
            Test
          </button>
          <button 
            className={`tab-button ${activeTab === 'slate-test' ? 'active' : ''}`}
            onClick={() => setActiveTab('slate-test')}
          >
            Slate Test
          </button>
        </div>
      </div>
      
      <div className="main-content">
        {activeTab === 'script' && (
          <div className="panes">
            <SlateScreenplayEditor
              value={script}
              onChange={handleChange}
              fountain={fountain}
            />
            <pre className="script-output">
{parsed ? JSON.stringify(parsed, null, 2) : 'Parsed output will appear here'}
            </pre>
          </div>
        )}
        
        {activeTab === 'scenes' && (
          <SceneBoard
            script={script}
            fountain={fountain}
            onSceneClick={handleSceneClick}
          />
        )}
        
        {activeTab === 'preview' && (
          <div className="preview-pane">
            <div 
              className="formatted-script"
              dangerouslySetInnerHTML={{ 
                __html: parsed?.html?.script || '<p>No script to preview</p>' 
              }}
            />
          </div>
        )}
        
        {activeTab === 'test' && (
          <TestSuite />
        )}
        
        {activeTab === 'slate-test' && (
          <SlateTestSuite />
        )}
      </div>
    </div>
  );
}
