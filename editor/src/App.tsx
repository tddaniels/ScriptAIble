import { useRef, useState } from 'react';
import { Fountain } from 'fountain-js';
import './App.css';

export default function App() {
  const [script, setScript] = useState('');
  const [parsed, setParsed] = useState<any>(null);
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

  return (
    <div className="editor-container">
      <div className="toolbar">
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
      <div className="panes">
        <textarea
          className="script-input"
          value={script}
          onChange={e => handleChange(e.target.value)}
          placeholder="Write your script in Fountain format..."
        />
        <pre className="script-output">
{parsed ? JSON.stringify(parsed, null, 2) : 'Parsed output will appear here'}
        </pre>
      </div>
    </div>
  );
}
