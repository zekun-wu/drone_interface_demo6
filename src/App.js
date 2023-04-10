import React, { useState, useMemo, useEffect, memo} from 'react';
import DroneMonitor from './components/DroneMonitor';
import './App.css';

function App() {
  const [identifier, setIdentifier] = useState(0);
  const scenehighlightArray = [
    { scene: 1, highlight: 0 },
    { scene: 1, highlight: 1 },
    { scene: 1, highlight: 2 },

    { scene: 2, highlight: 0 },
    { scene: 2, highlight: 1 },
    { scene: 2, highlight: 2 },

    { scene: 3, highlight: 0 },
    { scene: 3, highlight: 1 },
    { scene: 3, highlight: 2 },

    { scene: 4, highlight: 0 },
    { scene: 4, highlight: 1 },
    { scene: 4, highlight: 2 },

    { scene: 5, highlight: 0 },
    { scene: 5, highlight: 1 },
    { scene: 5, highlight: 2 },

    { scene: 6, highlight: 0 },
    { scene: 6, highlight: 1 },
    { scene: 6, highlight: 2 },

    { scene: 7, highlight: 0 },
    { scene: 7, highlight: 1 },
    { scene: 7, highlight: 2 },

    { scene: 8, highlight: 0 },
    { scene: 8, highlight: 1 },
    { scene: 8, highlight: 2 },
  
    { scene: 9, highlight: 0 },
    { scene: 9, highlight: 1 },
    { scene: 9, highlight: 2 },

    { scene: 10, highlight: 0 },
    { scene: 10, highlight: 1 },
    { scene: 10, highlight: 2 },
    // Add more scene and highlight combinations as needed
  ];

  const { scene, highlight } = scenehighlightArray[identifier];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNextScene = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % scenehighlightArray.length);
  };

  const handlePrevScene = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0) ? scenehighlightArray.length - 1 : prevIndex - 1);
  };

  const currentSceneHighlight = scenehighlightArray[currentIndex];
  const key = `scene-${currentSceneHighlight.scene}-highlight-${currentSceneHighlight.highlight}`;

  const MemoizedDroneMonitor = memo(DroneMonitor);

  // Add useMemo to memoize the droneDataFiles and prevent multiple rendering
  const criticalSituationFolders = ['t1', 't2', 't3'];
  const generateDroneDataFiles = () => {
    const normalSceneFiles = [];
    for (let i = 1; i <= 3; i++) {
      const data = `${process.env.PUBLIC_URL}/data/normal_scenes/${i}/data.json`;
      normalSceneFiles.push({ data });
    }

    const criticalSituationFiles = criticalSituationFolders.map(folder => {
      const fileIndex = Math.floor(Math.random() * 5) + 1;
      return {
        data: `${process.env.PUBLIC_URL}/data/critical_situations/${folder}/${fileIndex}/data.json`
      };
    });

    const droneFiles = [...normalSceneFiles, ...criticalSituationFiles];
    droneFiles.sort(() => Math.random() - 0.5);

    return droneFiles.map((file) => file.data);
  };

  const [droneDataFiles, setDroneDataFiles] = useState(generateDroneDataFiles());
  const [prevScene, setPrevScene] = useState(currentSceneHighlight.scene);

  useEffect(() => {
    if (prevScene !== currentSceneHighlight.scene) {
      setDroneDataFiles(generateDroneDataFiles());
      setPrevScene(currentSceneHighlight.scene);
    }
  }, [currentIndex, currentSceneHighlight.scene, prevScene]);

  return (
    <div className="App">
      <div className="app_container">
          <MemoizedDroneMonitor identifier={key} scene={currentSceneHighlight.scene} highlight={currentSceneHighlight.highlight} droneDataFiles={droneDataFiles} />
          <div className="content-wrapper">
          <h2>Current Scene: {currentIndex + 1}</h2>
            <div className="button-container">
              <button onClick={handlePrevScene}>Previous Scene</button>
              <button onClick={handleNextScene}>Next Scene</button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;