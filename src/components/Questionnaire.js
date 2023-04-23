import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './Questionnaire.css';

const questions = [
  {
    question: 'Which of the following critical situations have occurred during the past flight?',
    options: ['Low battery', 'Extreme wind', 'Rotor off', 'No-fly warning', "I don’t know"],
  },
  {
    question: 'Which drones have experienced critical situations during the past flight?',
    options: ['Drone 1', 'Drone 2', 'Drone 3', 'Drone 4', 'Drone 5', 'Drone 6', "I don’t know"],
  },
  {
    question: 'How many different critical situations have happened?',
    options: ['1', '2', '3', "I don’t know"],
  },
];

const Questionnaire = forwardRef(({ onSubmit, droneDataFiles, droneData, highlight }, ref) => {

  const [selectedQuestion, setSelectedQuestion] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(new Set());
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [answersGenerated, setAnswersGenerated] = useState(false);

  const parseDroneAndCriticalType = (filePath, index) => {
    const criticalMatch = filePath.match(/\/critical_situations\/t(\d)\/(\d)/);
  
    return {
      drone: index + 1,
      criticalType: criticalMatch ? parseInt(criticalMatch[2]) : null,
      timeInterval: criticalMatch ? parseInt(criticalMatch[1]) : null,
    };
  };
  
  useEffect(() => {
      if (droneDataFiles && droneData && !answersGenerated) {
        // Check if all droneData entries have been fetched
        const allDataFetched = Object.values(droneData).every(
          (entry) => entry.status === "fulfilled"
        );

        if (!allDataFetched) {
          return;
        }

        const criticalSituations = new Set();
        const dronesWithCriticalSituations = new Set();

        let specificQuestion = '';
        let specificOptions = [];
        let specificAnswer;
  
        droneDataFiles.forEach((file, index) => {

          const { drone, criticalType, timeInterval } = parseDroneAndCriticalType(file, index);
            if (criticalType) {
              criticalSituations.add(criticalType);
              dronesWithCriticalSituations.add(drone);

              let droneDataSeries = droneData[index+1].value['timestamps'];
              let droneDataLength = droneDataSeries.length;

              if (criticalType === 1) { 
                let criticalBattery = droneDataSeries[droneDataLength/4*(timeInterval+1)-1]['battery'].toFixed(0)
                // console.log('Critical Battery',criticalBattery)
                specificQuestion = `When the low battery critical situation occurred, what was the estimated battery value for drone ${drone}?`;
                if (criticalBattery <=5){
                  specificOptions = [ `${parseInt(criticalBattery  + 2)}%`,`${parseInt(criticalBattery  + 4)}%`, `${criticalBattery}%`]; 
                }
                else{
                  specificOptions = [ `${criticalBattery}%`,`${parseInt(criticalBattery - 4)}%`, `${parseInt(criticalBattery - 2)}%`]; 
                }
                specificAnswer = `${criticalBattery}%`
              }
              else if (criticalType === 2) { 
                let criticalWind = droneDataSeries[droneDataLength/4*(timeInterval+1)-1]['wind'].toFixed(0)
                // console.log('criticalWind',criticalWind)
                specificQuestion = `When the extreme wind occurred on ${drone}, what was the exact wind speed?`;
                specificOptions = [ `${parseInt(criticalWind)  + 5}m/s`,`${parseInt(criticalWind)+ 10}m/s`, `${criticalWind}m/s`]; 
                specificAnswer = `${criticalWind}`;
              }
              else if (criticalType === 3){
                let criticalDrone = drone
                specificQuestion = ` Which drone had the rotor off critical situation?`;
                specificOptions = ['Drone 1', 'Drone 2', 'Drone 3', 'Drone 4', 'Drone 5', 'Drone 6', "I don’t know"]; 
                specificAnswer = `Drone ${criticalDrone}`;
              }
              else if(criticalType === 4){
                specificQuestion = `Which critical situation happened to the drone ${drone}?`;
                specificOptions = ['Low battery', 'Extreme wind', 'Rotor off', 'No-fly warning', "I don’t know"];
                specificAnswer =  'No-fly warning';             
              }
            }
        });

        const newQuestions = [...questions];

        if (specificQuestion !== '') {
          const uniqueCriticalSituations = Array.from(criticalSituations).map((type) => {
            switch (type) {
              case 1:
                return 'Low battery';
              case 2:
                return 'Extreme wind';
              case 3:
                return 'Rotor off';
              case 4:
                return 'No-fly warning';
              default:
                return '';
            }
          });

          newQuestions.push({
            question: specificQuestion,
            options: specificOptions,
            answer: specificAnswer,
          });

          setCorrectAnswers([
            uniqueCriticalSituations,
            Array.from(dronesWithCriticalSituations).map((drone) => `Drone ${drone}`),
            [criticalSituations.size],
            specificAnswer,
          ]);
        }
        // const numberOfDronesWithCriticalSituations = dronesWithCriticalSituations.size;
  
        // const [selectedQuestion, setSelectedQuestion] = useState(finalQuestions[Math.floor(Math.random() * finalQuestions.length)]);
        const finalQuestions = newQuestions;
        const randomQuestion = finalQuestions[Math.floor(Math.random() * finalQuestions.length)];
        setSelectedQuestion(randomQuestion); 
        setAnswersGenerated(true);
      }
  }, [droneDataFiles]);
  


  const handleOptionChange = (option, checked) => {
    const newSelectedOptions = new Set(selectedOptions);
    if (checked) {
      newSelectedOptions.add(option);
    } else {
      newSelectedOptions.delete(option);
    }
    setSelectedOptions(newSelectedOptions);
  };

  const handleSubmit = () => {
    const currentResult = {
      submittedAnswers: Array.from(selectedOptions),
      correctAnswers: correctAnswers,
      droneFileData: droneDataFiles.map((file, index) => {
        return {
          ...parseDroneAndCriticalType(file, index),
        };
      }),
      highlights: highlight, // Add highlights data here
    };
  
    // setResults([...results, currentResult]);
    // Call the onSubmit function passed as a prop
    onSubmit(currentResult);
    setSelectedOptions(new Set());
  };
  
  useImperativeHandle(ref, () => ({
    handleSubmit: handleSubmit,
  }));

  return (
    <div className="questionnaire">
      {selectedQuestion.question ? (
        <>
          <h2>{selectedQuestion.question}</h2>
          <form>
            {selectedQuestion.options.map((option, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  id={`option-${index}`}
                  name="option"
                  value={option}
                  checked={selectedOptions.has(option)}
                  onChange={(e) => handleOptionChange(option, e.target.checked)}
                />
                <label htmlFor={`option-${index}`}>{option}</label>
              </div>
            ))}
          </form>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
});

export default Questionnaire;