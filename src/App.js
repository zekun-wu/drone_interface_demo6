import React, { useState, useRef, useEffect, memo} from 'react';
import Questionnaire from './components/Questionnaire';
import DroneMonitor from './components/DroneMonitor';
import End from './components/End';
import './App.css';

function App() {
  const [identifier, setIdentifier] = useState(0);
  const scenehighlightArray = [
    { scene: 1, highlight: 0 },
    'questionnaire',
    { scene: 1, highlight: 1 },
    'questionnaire',
    { scene: 1, highlight: 2 },
    'questionnaire',
    { scene: 2, highlight: 0 },
    'questionnaire',
    { scene: 2, highlight: 1 },
    'questionnaire',
    { scene: 2, highlight: 2 },
    'questionnaire',
    { scene: 3, highlight: 0 },
    'questionnaire',
    { scene: 3, highlight: 1 },
    'questionnaire',
    { scene: 3, highlight: 2 },
    'questionnaire',
    { scene: 4, highlight: 0 },
    'questionnaire',
    { scene: 4, highlight: 1 },
    'questionnaire',
    { scene: 4, highlight: 2 },
    'questionnaire',
    { scene: 5, highlight: 0 },
    'questionnaire',
    { scene: 5, highlight: 1 },
    'questionnaire',
    { scene: 5, highlight: 2 },
    'questionnaire',
    { scene: 6, highlight: 0 },
    'questionnaire',
    { scene: 6, highlight: 1 },
    'questionnaire',
    { scene: 6, highlight: 2 },
    'questionnaire',
    { scene: 7, highlight: 0 },
    'questionnaire',
    { scene: 7, highlight: 1 },
    'questionnaire',
    { scene: 7, highlight: 2 },
    'questionnaire',
    { scene: 8, highlight: 0 },
    'questionnaire',
    { scene: 8, highlight: 1 },
    'questionnaire',
    { scene: 8, highlight: 2 },
    'questionnaire',
    { scene: 9, highlight: 0 },
    'questionnaire',
    { scene: 9, highlight: 1 },
    'questionnaire',
    { scene: 9, highlight: 2 },
    'questionnaire',
    { scene: 10, highlight: 0 },
    'questionnaire',
    { scene: 10, highlight: 1 },
    'questionnaire',
    { scene: 10, highlight: 2 },
    'questionnaire',
    'end'
    // Add more scene and highlight combinations as needed
  ];

  const { scene, highlight } = scenehighlightArray[identifier];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sceneCounter, setSceneCounter] = useState(1);
  const [results, setResults] = useState([]);

  const [droneDataPlayed, setDroneDataPlayed] = useState(false);
  const [taskStarted, setTaskStarted] = useState(false);

  const handleNextScene = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % scenehighlightArray.length);
    if (scenehighlightArray[currentIndex + 1] !== 'questionnaire') {
      setSceneCounter((prevSceneCounter) => prevSceneCounter + 1);
    }
    setTaskStarted(false);
  };

  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   questionnaireRef.current.handleSubmit();
  //   handleNextScene();
  // };
  // const handleSubmit = () => {
  //   if (questionnaireRef.current) {
  //     questionnaireRef.current.handleSubmit();
  //   }
  //   handleNextScene();
  // };

  const handleQuestionnaireSubmit = (currentResult) => {
    setResults((prevResults) => {
      const updatedResults = [...prevResults, currentResult];
      console.log("Updated Results:", updatedResults);
      return updatedResults;
    });
    handleNextScene();
  };

  const handleDroneDataPlayed = () => {
    setDroneDataPlayed(true);
    console.log('played')
    handleNextScene()
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
    const fileIndex = Math.floor(Math.random() * 4) + 1;
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
  const [droneData, setDroneData] = useState({});
  const questionnaireRef = useRef();

  useEffect(() => {
    if (prevScene !== currentSceneHighlight.scene) {
      setDroneDataFiles(generateDroneDataFiles());
      setPrevScene(currentSceneHighlight.scene);
    }
  }, [currentIndex, currentSceneHighlight.scene, prevScene]);

  useEffect(() => {
    const fetchData = async () => {
      const dataPromises = droneDataFiles.map((dataFile) =>
        fetch(dataFile).then((response) => response.json()));

      const dataResults = await Promise.allSettled(dataPromises);
      const dataObj = dataResults.reduce((obj, data, index) => {
        obj[index + 1] = data;
        return obj;
      }, {});

      setDroneData(dataObj);
    };

    fetchData();
  }, [droneDataFiles]);

  return (
    <div className="App">
      <div className="app_container">
        {(scenehighlightArray[currentIndex] === 'questionnaire' ) ? (
          <Questionnaire
          ref={questionnaireRef}
          onSubmit={handleQuestionnaireSubmit}
          droneDataFiles={droneDataFiles}
          droneData={droneData}
          highlight={currentSceneHighlight.highlight}
          />
        ) : scenehighlightArray[currentIndex] === 'end' ? (
          <End results={results} />
        ) : (
          <MemoizedDroneMonitor
            identifier={key}
            scene={currentSceneHighlight.scene}
            highlight={currentSceneHighlight.highlight}
            droneDataFiles={droneDataFiles}
            droneData={droneData}
            onDataPlayed={handleDroneDataPlayed}
            taskStarted={taskStarted}
          />
        )}
        <div className="content-wrapper">
          <h2>Current Scene: {sceneCounter}</h2>
          {scenehighlightArray[currentIndex] !== 'end' && (
            <div className="button-container">
              {/* <button onClick={handlePrevScene}>Previous Scene</button> */}
              {scenehighlightArray[currentIndex] === 'questionnaire' ? (
                <button type="submit" onClick={() => questionnaireRef.current.handleSubmit()}>
                    Submit and Proceed
                </button>
              ) : (
                !taskStarted? (
                  <button onClick={() => setTaskStarted(true)}>Start</button>
                ):
                <button onClick={handleNextScene}>Next</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;