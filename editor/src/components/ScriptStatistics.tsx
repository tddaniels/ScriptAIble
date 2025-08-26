import { useMemo } from 'react';
import type { Token } from 'fountain-js';
import { statisticsCalculator } from '../services/statistics';

interface ScriptStatisticsProps {
  tokens: Token[];
}

export function ScriptStatistics({ tokens }: ScriptStatisticsProps) {
  const stats = useMemo(() => {
    return statisticsCalculator.calculateStatistics(tokens);
  }, [tokens]);

  return (
    <div className="statistics-dashboard">
      <h2>Script Statistics</h2>
      
      {/* Overview Cards */}
      <div className="stats-overview">
        <div className="stat-card">
          <h3>{stats.pageCount}</h3>
          <p>Pages</p>
        </div>
        <div className="stat-card">
          <h3>{stats.wordCount.toLocaleString()}</h3>
          <p>Words</p>
        </div>
        <div className="stat-card">
          <h3>{stats.sceneCount}</h3>
          <p>Scenes</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalCharacters}</h3>
          <p>Characters</p>
        </div>
        <div className="stat-card">
          <h3>{stats.estimatedRuntimeMinutes} min</h3>
          <p>Est. Runtime</p>
        </div>
      </div>

      <div className="stats-grid">
        {/* Content Distribution */}
        <div className="stats-section">
          <h3>Content Distribution</h3>
          <div className="distribution-chart">
            <div className="bar-chart">
              <div className="bar dialogue" style={{ width: `${stats.dialoguePercentage}%` }}>
                <span>Dialogue {stats.dialoguePercentage.toFixed(1)}%</span>
              </div>
              <div className="bar action" style={{ width: `${stats.actionPercentage}%` }}>
                <span>Action {stats.actionPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="stats-details">
            <p>Dialogue Pages: {stats.dialoguePages}</p>
            <p>Action Pages: {stats.actionPages}</p>
          </div>
        </div>

        {/* Scene Breakdown */}
        <div className="stats-section">
          <h3>Scene Breakdown</h3>
          <div className="scene-stats">
            <div className="scene-row">
              <span>Interior Scenes:</span>
              <span>{stats.intScenes}</span>
            </div>
            <div className="scene-row">
              <span>Exterior Scenes:</span>
              <span>{stats.extScenes}</span>
            </div>
            <div className="scene-row">
              <span>Day Scenes:</span>
              <span>{stats.dayScenes}</span>
            </div>
            <div className="scene-row">
              <span>Night Scenes:</span>
              <span>{stats.nightScenes}</span>
            </div>
          </div>
        </div>

        {/* Character Statistics */}
        <div className="stats-section character-stats">
          <h3>Top Characters by Lines</h3>
          <div className="character-list">
            {Object.values(stats.characterStats)
              .sort((a, b) => b.wordCount - a.wordCount)
              .slice(0, 10)
              .map((char) => (
                <div key={char.name} className="character-row">
                  <div className="character-info">
                    <strong>{char.name}</strong>
                    <div className="character-details">
                      {char.speechCount} speeches • {char.wordCount} words
                      <br />
                      Avg: {char.averageWordsPerSpeech} words/speech • {char.percentageOfDialogue}% of dialogue
                    </div>
                  </div>
                  <div className="character-appearances">
                    Pages {char.firstAppearance}-{char.lastAppearance}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Dialogue Analysis */}
        <div className="stats-section">
          <h3>Dialogue Analysis</h3>
          <div className="dialogue-stats">
            <div className="stat-row">
              <span>Average Dialogue Length:</span>
              <span>{stats.averageDialogueLength} words</span>
            </div>
            <div className="stat-row">
              <span>Longest Dialogue:</span>
              <span>{stats.longestDialogue.wordCount} words</span>
            </div>
            {stats.longestDialogue.character && (
              <div className="longest-dialogue">
                <strong>{stats.longestDialogue.character}:</strong>
                <p>"{stats.longestDialogue.text.substring(0, 100)}..."</p>
              </div>
            )}
          </div>
        </div>

        {/* Document Properties */}
        <div className="stats-section">
          <h3>Document Properties</h3>
          <div className="document-stats">
            <div className="stat-row">
              <span>Total Characters:</span>
              <span>{stats.characterCount.toLocaleString()}</span>
            </div>
            <div className="stat-row">
              <span>Characters (no spaces):</span>
              <span>{stats.characterCountNoSpaces.toLocaleString()}</span>
            </div>
            <div className="stat-row">
              <span>Estimated Reading Time:</span>
              <span>{Math.ceil(stats.wordCount / 200)} minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScriptStatistics;