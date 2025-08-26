import { useState } from 'react';
import { Fountain } from 'fountain-js';

interface Scene {
  id: string;
  heading: string;
  location: string;
  timeOfDay: string;
  description: string;
  characters: string[];
  pageNumber?: number;
  duration?: string;
}

interface SceneBoardProps {
  script: string;
  fountain: Fountain;
  onSceneClick: (sceneId: string) => void;
}

export function SceneBoard({ script, fountain, onSceneClick }: SceneBoardProps) {
  const [selectedScene, setSelectedScene] = useState<string | null>(null);

  // Extract scenes from the parsed script
  const extractScenes = (): Scene[] => {
    if (!script.trim()) return [];

    try {
      const parsed = fountain.parse(script, true);
      const scenes: Scene[] = [];
      let currentScene: Partial<Scene> | null = null;
      let sceneCounter = 0;

      parsed.tokens.forEach((token) => {
        if (token.type === 'scene_heading' && token.text) {
          // Save previous scene
          if (currentScene) {
            scenes.push(currentScene as Scene);
          }

          // Start new scene
          sceneCounter++;
          const heading = token.text.trim();
          const { location, timeOfDay } = parseSceneHeading(heading);

          currentScene = {
            id: `scene-${sceneCounter}`,
            heading,
            location,
            timeOfDay,
            description: '',
            characters: [],
            pageNumber: Math.ceil(sceneCounter / 3) // Rough page estimation
          };
        } else if (currentScene) {
          // Add content to current scene
          if (token.type === 'action' && token.text) {
            if ((currentScene.description || '').length < 100) { // Keep description short
              currentScene.description = (currentScene.description || '') + (currentScene.description ? ' ' : '') + token.text.trim();
            }
          } else if (token.type === 'character' && token.text) {
            const character = token.text.trim();
            if (!currentScene.characters) {
              currentScene.characters = [];
            }
            if (!currentScene.characters.includes(character)) {
              currentScene.characters.push(character);
            }
          }
        }
      });

      // Don't forget the last scene
      if (currentScene) {
        scenes.push(currentScene as Scene);
      }

      return scenes;
    } catch (error) {
      console.error('Error parsing scenes:', error);
      return [];
    }
  };

  // Parse scene heading to extract location and time
  const parseSceneHeading = (heading: string): { location: string; timeOfDay: string } => {
    // Match INT./EXT. LOCATION - TIME pattern
    const match = heading.match(/^(INT\.|EXT\.|EST\.)\s*(.+?)\s*-\s*(.+)$/i);
    if (match) {
      return {
        location: match[2].trim(),
        timeOfDay: match[3].trim()
      };
    }

    // Fallback: just use the heading as location
    const locationMatch = heading.match(/^(INT\.|EXT\.|EST\.)\s*(.+)$/i);
    return {
      location: locationMatch ? locationMatch[2].trim() : heading,
      timeOfDay: 'UNKNOWN'
    };
  };

  const scenes = extractScenes();

  const handleSceneClick = (scene: Scene) => {
    setSelectedScene(scene.id);
    onSceneClick(scene.id);
  };

  const getSceneCardColor = (scene: Scene): string => {
    if (scene.timeOfDay.toLowerCase().includes('night')) return '#2c3e50';
    if (scene.timeOfDay.toLowerCase().includes('day')) return '#3498db';
    if (scene.timeOfDay.toLowerCase().includes('dawn') || scene.timeOfDay.toLowerCase().includes('dusk')) return '#e67e22';
    return '#95a5a6';
  };

  return (
    <div className="scene-board">
      <div className="scene-board-header">
        <h3>Scene Board</h3>
        <span className="scene-count">{scenes.length} scenes</span>
      </div>
      
      <div className="scene-cards-container">
        {scenes.length === 0 ? (
          <div className="no-scenes">
            <p>No scenes found. Start writing your script to see scene cards appear here.</p>
            <p>Example:</p>
            <code>
              INT. COFFEE SHOP - DAY<br/>
              <br/>
              JANE enters, looking around nervously.
            </code>
          </div>
        ) : (
          <div className="scene-cards-grid">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className={`scene-card ${selectedScene === scene.id ? 'selected' : ''}`}
                onClick={() => handleSceneClick(scene)}
                style={{ borderLeftColor: getSceneCardColor(scene) }}
              >
                <div className="scene-card-header">
                  <span className="scene-number">Scene {scene.id.replace('scene-', '')}</span>
                  <span className="scene-time">{scene.timeOfDay}</span>
                </div>
                
                <div className="scene-location">
                  {scene.location}
                </div>
                
                {scene.description && (
                  <div className="scene-description">
                    {scene.description.length > 80 
                      ? scene.description.substring(0, 80) + '...' 
                      : scene.description
                    }
                  </div>
                )}
                
                {scene.characters.length > 0 && (
                  <div className="scene-characters">
                    <strong>Characters:</strong>
                    <div className="character-tags">
                      {scene.characters.map((character, idx) => (
                        <span key={idx} className="character-tag">
                          {character}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {scene.pageNumber && (
                  <div className="scene-meta">
                    Page ~{scene.pageNumber}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}