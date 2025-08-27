import { useRef, useState, useEffect } from 'react';
import { Fountain } from 'fountain-js';
// import { ScreenplayEditor } from './components/ScreenplayEditor';
import { SlateScreenplayEditor } from './components/SlateScreenplayEditor';
import { SceneBoard } from './components/SceneBoard';
import { TestSuite } from './components/TestSuite';
import { SlateTestSuite } from './components/SlateTestSuite';
import ScriptStatistics from './components/ScriptStatistics';
import { useScriptStore } from './stores/scriptStore';
import { useAutoSave } from './hooks/useAutoSave';
import { useVersionControl } from './hooks/useVersionControl';
import { exportScreenplayToPDF } from './services/pdfExporter';
import { FinalDraftConverter } from './services/fdxConverter';
import { getQuickStats } from './services/statistics';
import { APP_CONFIG } from './config/appConfig';
import './App.css';
import './components/ScreenplayEditor.css';
import './components/ScreenplayFormatting.css';
import './components/SceneBoard.css';
import './components/TestSuite.css';
import './components/SlateTestSuite.css';
import './components/ScriptStatistics.css';

export default function App() {
  const [parsed, setParsed] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'script' | 'scenes' | 'preview' | 'test' | 'slate-test' | 'stats'>('script');
  
  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', APP_CONFIG.theme.primary);
    root.style.setProperty('--theme-secondary', APP_CONFIG.theme.secondary);
    root.style.setProperty('--theme-background', APP_CONFIG.theme.background);
    root.style.setProperty('--theme-text', APP_CONFIG.theme.text);
    root.style.setProperty('--theme-accent', APP_CONFIG.theme.accent);
    
    // Update document title
    document.title = APP_CONFIG.name;
  }, []);
  const [quickStats, setQuickStats] = useState<any>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const fdxInput = useRef<HTMLInputElement>(null);
  const fountain = useRef(new Fountain()).current;
  
  // Zustand store
  const {
    getCurrentScript,
    updateScript,
    createScript,
    getAllScripts,
    currentScriptId,
    loadScript: loadStoredScript
  } = useScriptStore();
  
  const currentScript = getCurrentScript();
  const script = currentScript?.content || '';
  const scriptTitle = currentScript?.title || 'Untitled Script';
  
  // Version control
  const versionControl = useVersionControl(currentScriptId);
  
  // Auto-save
  useAutoSave(script, currentScriptId);

  const loadScript = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = (ev.target?.result as string) ?? '';
      const newScriptId = createScript(file.name.replace(/\.[^/.]+$/, ''));
      updateScript(newScriptId, text);
      versionControl.save(text, 'import', `Imported from ${file.name}`);
      setParsed(fountain.parse(text));
    };
    reader.readAsText(file);
  };
  
  const loadFDXScript = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const converter = new FinalDraftConverter();
      const result = await converter.importFDX(file);
      if (result.success) {
        const title = result.title || file.name.replace(/\.[^/.]+$/, '');
        const newScriptId = createScript(title);
        updateScript(newScriptId, result.fountainContent);
        versionControl.save(result.fountainContent, 'import', `Imported FDX from ${file.name}`);
        setParsed(fountain.parse(result.fountainContent));
      } else {
        alert(`Failed to import FDX: ${result.error}`);
      }
    } catch (error) {
      alert(`Error importing FDX: ${error}`);
    }
  };

  const saveScript = () => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scriptTitle}.fountain`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const exportPDF = () => {
    if (!parsed || !parsed.tokens) return;
    const exporter = exportScreenplayToPDF(
      parsed.tokens,
      scriptTitle,
      APP_CONFIG.export.defaultAuthor
    );
    exporter.save(`${scriptTitle}.pdf`);
  };
  
  const exportFDX = () => {
    FinalDraftConverter.downloadFDX(script, `${scriptTitle}.fdx`, {
      title: scriptTitle,
      author: APP_CONFIG.export.defaultAuthor
    });
  };
  
  const createNewScript = () => {
    createScript();
    versionControl.save('', 'create', 'Created new script');
  };
  
  const handleUndo = () => {
    const previousContent = versionControl.undo();
    if (previousContent !== null && currentScriptId) {
      updateScript(currentScriptId, previousContent);
      setParsed(fountain.parse(previousContent));
    }
  };
  
  const handleRedo = () => {
    const nextContent = versionControl.redo();
    if (nextContent !== null && currentScriptId) {
      updateScript(currentScriptId, nextContent);
      setParsed(fountain.parse(nextContent));
    }
  };

  const handleChange = (text: string) => {
    if (currentScriptId) {
      updateScript(currentScriptId, text);
      versionControl.save(text, 'edit');
      try {
        const parsed = fountain.parse(text);
        setParsed(parsed);
        // Update quick stats
        if (parsed.tokens) {
          setQuickStats(getQuickStats(parsed.tokens));
        }
      } catch {
        setParsed(null);
      }
    }
  };
  
  // Initialize with a default script if none exists
  useEffect(() => {
    const scripts = getAllScripts();
    if (scripts.length === 0) {
      createNewScript();
    } else if (!currentScriptId) {
      loadStoredScript(scripts[0].id);
    }
  }, []);
  
  // Update parsed content when script changes
  useEffect(() => {
    if (script) {
      try {
        const parsed = fountain.parse(script);
        setParsed(parsed);
        if (parsed.tokens) {
          setQuickStats(getQuickStats(parsed.tokens));
        }
      } catch {
        setParsed(null);
      }
    } else {
      setParsed(null);
      setQuickStats(null);
    }
  }, [script]);

  const handleSceneClick = (sceneId: string) => {
    // TODO: Navigate to scene in editor
    console.log('Navigate to scene:', sceneId);
  };

  return (
    <div className="editor-container">
      <div className="toolbar">
        <div className="toolbar-left">
          <button onClick={createNewScript}>New</button>
          <button onClick={() => fileInput.current?.click()}>Load</button>
          {APP_CONFIG.features.fdxImport && (
            <button onClick={() => fdxInput.current?.click()}>Import FDX</button>
          )}
          <button onClick={saveScript}>Save</button>
          {APP_CONFIG.features.pdfExport && (
            <button onClick={exportPDF} disabled={!parsed}>Export PDF</button>
          )}
          {APP_CONFIG.features.fdxImport && (
            <button onClick={exportFDX} disabled={!script}>Export FDX</button>
          )}
          {APP_CONFIG.features.versionControl && (
            <>
              <button onClick={handleUndo} disabled={!versionControl.canUndo()}>↶ Undo</button>
              <button onClick={handleRedo} disabled={!versionControl.canRedo()}>↷ Redo</button>
            </>
          )}
          {quickStats && (
            <span className="quick-stats">
              {quickStats.pages}p • {quickStats.words}w • {quickStats.scenes}s • {quickStats.runtime}
            </span>
          )}
          <input
            type="file"
            accept=".fountain,.txt"
            ref={fileInput}
            onChange={loadScript}
            style={{ display: 'none' }}
          />
          <input
            type="file"
            accept=".fdx"
            ref={fdxInput}
            onChange={loadFDXScript}
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
          {APP_CONFIG.features.sceneBoard && (
            <button 
              className={`tab-button ${activeTab === 'scenes' ? 'active' : ''}`}
              onClick={() => setActiveTab('scenes')}
            >
              Scenes
            </button>
          )}
          <button 
            className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
          {APP_CONFIG.features.testSuite && (
            <>
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
            </>
          )}
          {APP_CONFIG.features.statistics && (
            <button 
              className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Statistics
            </button>
          )}
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
        
        {activeTab === 'stats' && (
          <div className="stats-pane">
            {parsed?.tokens ? (
              <ScriptStatistics tokens={parsed.tokens} />
            ) : (
              <p>No script loaded for statistics</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
