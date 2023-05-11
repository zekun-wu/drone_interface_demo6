import React, { useState, useRef, useEffect, memo } from "react";
import Questionnaire from "./components/Questionnaire";
import DroneMonitor from "./components/DroneMonitor";
import Calibration from "./components/Calibration";
import End from "./components/End";
import "./App.css";

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sceneCounter, setSceneCounter] = useState(1);
  const [results, setResults] = useState([]);

  const [taskStarted, setTaskStarted] = useState(false);
  const [calibration, setCalibration] = useState(false);
  const [allTaskEnded, setallTaskEnded] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [endQuestionnaire, setEndQuestionnaire] = useState(false);
  const questionnaireRef = useRef();

  const [droneData, setDroneData] = useState({});
  const [allDronesCurrentData, setAllDronesCurrentData] = useState([]);

  const [spacebarTimestamps, setSpacebarTimestamps] = useState([]);


  const loadAllDronesData = async () => {
    const droneData = [];
    const allDronesCurrentData=[]
    for (let drone = 1; drone <= 4; drone++) {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/${sceneCounter}/${drone}/data.json`);
        if (!response.ok) {
          console.error(`Error fetching data for scene ${sceneCounter} and drone ${drone}:`, response.status, response.statusText);
          continue;
        }
        const data = await response.json();
        droneData[drone - 1] = data;

        allDronesCurrentData[drone-1] = data.timestamps[currentIndex];
      } catch (error) {
        console.error(`Error fetching data for scene ${sceneCounter} and drone ${drone}:`, error);
      }
    }
    setDroneData(droneData)
    setAllDronesCurrentData(allDronesCurrentData);
  };

  useEffect(() => {
    loadAllDronesData();
  }, []);

  // Define playData to keep track of currentIndex and corresponding allDronesCurrentData
  const playData = () => {
    if (showQuestionnaire) {
      // Do nothing; keep currentIndex the same
      return;
    }
  
    if (!taskStarted) {
      setCurrentIndex(0); // Set currentIndex to 0
      return;
    }
  
    // If taskStarted is true and showQuestionnaire is false, update currentIndex
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        if (droneData[0] && newIndex >= droneData[0].timestamps.length) {
          clearInterval(timer);
          return prevIndex;
        }
        const updatedDronesData = allDronesCurrentData.map((data, index) => {
          return droneData[index].timestamps[newIndex];
        });
        setAllDronesCurrentData(updatedDronesData);

        if (updatedDronesData[0]['question'] === 1) {
          setShowQuestionnaire(true);
          clearInterval(timer);
          return prevIndex + 1;
        }

        if(allDronesCurrentData[0]['end']===1){
          if (endQuestionnaire) {
            if (sceneCounter === 1) {
              setallTaskEnded(true);
            } else {
              setTaskStarted(false);
              setCalibration(true);
            }
            clearInterval(timer);
            setEndQuestionnaire(false);
          }
          return prevIndex;
        }
        return newIndex;
      });
    }, 1000 / 24);
    return timer;
  };

  // Add playData to useEffect
  useEffect(() => {
    loadAllDronesData();
  }, [sceneCounter]);

  useEffect(() => {
    const timerId = playData();
  
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [taskStarted, showQuestionnaire, currentIndex, endQuestionnaire]);

  const handleCalibration = () => {
    // Update sceneCounter and reset calibration state
    setSceneCounter(sceneCounter + 1);
    setCalibration(false);
  };

  const handleQuestionnaireSubmit = (currentResult) => {
    setResults((prevResults) => {
      const updatedResults = [...prevResults, currentResult];
      return updatedResults;
    });
    setShowQuestionnaire(false);
  
    if (allDronesCurrentData[0]['end'] === 1) {
      if (sceneCounter === 1) {
        setallTaskEnded(true);
      } else {
        setEndQuestionnaire(true);
        setTaskStarted(false);
        setCalibration(true);
      }
    }
  };

  return (
    <div className="App">
      <div className="app_container">
        {calibration ? (
          <Calibration />
        ) : showQuestionnaire ? (
          <Questionnaire
            ref={questionnaireRef}
            onSubmit={handleQuestionnaireSubmit}
            allDronesCurrentData={allDronesCurrentData}
          />
        ) : allTaskEnded ? (
          <End results={results}  spacebarTimestamps={spacebarTimestamps}/>
        ) : (
          <DroneMonitor
            key={sceneCounter}
            taskStarted={taskStarted}
            sceneCounter={sceneCounter}
            currentIndex={currentIndex}
            currentData={allDronesCurrentData}
            droneData={droneData}
            setSpacebarTimestamps={setSpacebarTimestamps}
          />
        )}
        <div className="content-wrapper">
          <h2>Current Task: {sceneCounter}</h2>
          <div className="button-container">
            {showQuestionnaire ? (
              <button
                type="submit"
                onClick={() => questionnaireRef.current.handleSubmit()}
              >
                Submit and Proceed
              </button>
            ) : calibration ? (
              <button onClick={handleCalibration}>Next</button>
            ) : (
              !taskStarted && (
                <button onClick={() => setTaskStarted(true)}>Start</button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
