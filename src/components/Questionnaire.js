import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './Questionnaire.css';

const critical_questions = [
  {
    question: 'Which of the following critical situations is occurring?',
    options: ['Low battery', 'Extreme wind', 'Rotor off', 'No-fly warning', "I don’t know"],
  },
  {
    question: 'Which drone is experiencing critical situations?',
    options: ['Drone 1', 'Drone 2', 'Drone 3', 'Drone 4', "I don’t know"],
  }
];

const non_critical_questions = [
  {
    question: 'What are the battery levels of the drones now?',
    number:1,
    subquestions: [
      {
        drone: 'Drone 1',
        options: ['<70%', '70-80%', '80-90%', '>90%', "I don’t know"],
      },
      {
        drone: 'Drone 2',
        options: ['<70%', '70-80%', '80-90%', '>90%', "I don’t know"],
      },
      {
        drone: 'Drone 3',
        options: ['<70%', '70-80%', '80-90%', '>90%', "I don’t know"],
      },
      {
        drone: 'Drone 4',
        options: ['<70%', '70-80%', '80-90%', '>90%', "I don’t know"],
      },
    ],
  },
  {
    question: 'What are the horizontal speed of the drones now?',
    number:2,
    subquestions: [
      {
        drone: 'Drone 1',
        options: ['<5m/s', '5-10m/s', '10-20m/s', '>20m/s', "I don’t know"],
      },
      {
        drone: 'Drone 2',
        options: ['<5m/s', '5-10m/s', '10-20m/s', '>20m/s', "I don’t know"],
      },
      {
        drone: 'Drone 3',
        options: ['<5m/s', '5-10m/s', '10-20m/s', '>20m/s', "I don’t know"],
      },
      {
        drone: 'Drone 4',
        options: ['<5m/s', '5-10m/s', '10-20m/s', '>20m/s', "I don’t know"],
      },
    ],
  },
  {
    question: 'What is the distance to the destination for each drone now?',
    number:3,
    subquestions: [
      {
        drone: 'Drone 1',
        options: ['<1000m', '1000-2000m', '2000-5000m', '>5000m', "I don’t know"],
      },
      {
        drone: 'Drone 2',
        options: ['<1000m', '1000-2000m', '2000-5000m', '>5000m', "I don’t know"],
      },
      {
        drone: 'Drone 3',
        options: ['<1000m', '1000-2000m', '2000-5000m', '>5000m', "I don’t know"],
      },
      {
        drone: 'Drone 4',
        options: ['<1000m', '1000-2000m', '2000-5000m', '>5000m', "I don’t know"],
      },
    ],
  },
];

const Questionnaire = forwardRef(({ onSubmit, allDronesCurrentData }, ref) => {

  const [selectedQuestion, setSelectedQuestion] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(Array.from({ length: allDronesCurrentData.length }, () => undefined));
  const [correctAnswers, setCorrectAnswers] = useState([]);

  const [answersGenerated, setAnswersGenerated] = useState(false);

  useEffect(() => {
      if (allDronesCurrentData && !answersGenerated) {
        const criticalSituations = new Set();
        const dronesWithCriticalSituations = new Set();

        let specificQuestion = '';
        let specificOptions = [];
        let specificAnswer;

        let generatedQuestion;
        let generatedCorrectAnswers;

        let selectedNonCriticalQuestion;

        const allNonCritical = allDronesCurrentData.every(
          (droneDataSeries) => droneDataSeries.critical_situation === 0
        );

        let allGeneratedCorrectAnswers = [];
        if (allNonCritical) {
          selectedNonCriticalQuestion=
          non_critical_questions[
            Math.floor(Math.random() * non_critical_questions.length)
          ];
          if (selectedNonCriticalQuestion.number === 1) {
            specificAnswer =selectedNonCriticalQuestion.subquestions.map((subquestion, index) => {
              const droneBattery = allDronesCurrentData[index]['battery'];
              let optionIndex;
              if (droneBattery < 70) {
                optionIndex = 0;
              } else if (droneBattery >= 70 && droneBattery < 80) {
                optionIndex = 1;
              } else if (droneBattery >= 80 && droneBattery < 90) {
                optionIndex = 2;
              } else {
                optionIndex = 3;
              }
              return {
                drone: subquestion.drone,
                answer: subquestion.options[optionIndex],
              };
            });
          }
          else if(selectedNonCriticalQuestion.number === 2) {
            specificAnswer = selectedNonCriticalQuestion.subquestions.map((subquestion, index) => {
              const droneSpeed = allDronesCurrentData[index]['horizontal_speed'];
              let optionIndex;
              if (droneSpeed  < 5) {
                optionIndex = 0;
              } else if (droneSpeed>= 5 && droneSpeed < 10) {
                optionIndex = 1;
              } else if (droneSpeed>= 10 && droneSpeed < 20) {
                optionIndex = 2;
              } else {
                optionIndex = 3;
              }
              return {
                drone: subquestion.drone,
                answer: subquestion.options[optionIndex],
              };
            });
          }          
          else if(selectedNonCriticalQuestion.number === 3) {
            specificAnswer = selectedNonCriticalQuestion.subquestions.map((subquestion, index) => {
              const droneDistance = allDronesCurrentData[index]['distance'];
              let optionIndex;
              if (droneDistance  < 1000) {
                optionIndex = 0;
              } else if (droneDistance >= 1000 && droneDistance < 2000) {
                optionIndex = 1;
              } else if (droneDistance >= 2000 && droneDistance < 5000) {
                optionIndex = 2;
              } else {
                optionIndex = 3;
              }
              return {
                drone: subquestion.drone,
                answer: subquestion.options[optionIndex],
              };
            });
          }
          generatedQuestion = {
            ...selectedNonCriticalQuestion,
            specificAnswer: specificAnswer,
          };
          allGeneratedCorrectAnswers.push(...generatedQuestion.specificAnswer);
        } else {
          allDronesCurrentData.forEach((droneDataSeries, index) => {
            const drone = index+1;
            const criticalType = droneDataSeries.critical_situation;
            if (criticalType) {
                criticalSituations.add(criticalType);
                dronesWithCriticalSituations.add(drone);
      
                if (criticalType === 1) { 
                    let criticalBattery = droneDataSeries['battery'].toFixed(0)
                    // console.log('Critical Battery',criticalBattery)
                    specificQuestion = `When the low battery critical situation occurring, what was the estimated battery value for drone ${drone}?`;
                    if (criticalBattery <=5){
                      specificOptions = [ `${parseInt(criticalBattery  + 2)}%`,`${parseInt(criticalBattery  + 4)}%`, `${criticalBattery}%`, "I don’t know"]; 
                    }
                    else{
                      specificOptions = [ `${criticalBattery}%`,`${parseInt(criticalBattery - 4)}%`, `${parseInt(criticalBattery - 2)}%`, "I don’t know"]; 
                    }
                    specificAnswer = `${criticalBattery}%`
                }
                else if (criticalType === 2) { 
                    let criticalWind = droneDataSeries['wind'].toFixed(0)
                    // console.log('criticalWind',criticalWind)
                    specificQuestion = `When the extreme wind occurred on drone ${drone}, what was the exact wind speed?`;
                    specificOptions = [ `${parseInt(criticalWind)  + 5}m/s`,`${parseInt(criticalWind)+ 10}m/s`, `${criticalWind}m/s`, "I don’t know"]; 
                    specificAnswer = `${criticalWind}`;
                }
                else if (criticalType === 3){
                    let criticalDrone = drone
                    specificQuestion = ` Which drone had the rotor off critical situation?`;
                    specificOptions = ['Drone 1', 'Drone 2', 'Drone 3', 'Drone 4', "I don’t know"]; 
                    specificAnswer = `Drone ${criticalDrone}`;
                }
                else if(criticalType === 4){
                    specificQuestion = `Which critical situation happened to the drone ${drone}?`;
                    specificOptions = ['Low battery', 'Extreme wind', 'Rotor off', 'No-fly warning', "I don’t know"];
                    specificAnswer =  'No-fly warning';             
                }
            }
          });

          const newQuestions = [...critical_questions];
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
  
          if (specificQuestion !== '') {
            newQuestions.push({
              question: specificQuestion,
              options: specificOptions,
              answer: specificAnswer,
            });

            allGeneratedCorrectAnswers.push(specificAnswer);
          }

          const finalQuestions = newQuestions;
          const randomQuestion = finalQuestions[Math.floor(Math.random() * finalQuestions.length)];

          generatedQuestion = randomQuestion;
        }
    
        setSelectedQuestion(generatedQuestion);
        setCorrectAnswers(allGeneratedCorrectAnswers);
        setAnswersGenerated(true);
        
    }
  }, [allDronesCurrentData]);

  // useEffect(() => {
  //   console.log("selectedQuestion", selectedQuestion);
  //   console.log("correctAnswers", correctAnswers);
  //   console.log('selectedQuestion.subquestions',selectedQuestion.subquestions )
  // }, [selectedQuestion, correctAnswers]);

  const handleOptionChange = (option, isChecked, index) => {
    if (isChecked) {
      if (index !== undefined) {
        setSelectedOptions((prevState) => {
          const newSelectedOptions = [...prevState];
          newSelectedOptions[index] = option;
          return newSelectedOptions;
        });
      } else {
        setSelectedOptions((prevState) => {
          const newSelectedOptions = prevState.map(() => undefined);
          newSelectedOptions[0] = option;
          return newSelectedOptions;
        });
      }
    }
  };

  const renderQuestionOptions = (question) => {
    if (question.subquestions) {
      return question.subquestions.map((subquestion, index) => (
        <div key={index}>
          <h3>{subquestion.drone}</h3>
          {subquestion.options.map((option, optionIndex) => (
            <div key={`${index}-${optionIndex}`}>
              <input
                type="radio"
                id={`option-${index}-${optionIndex}`}
                name={`option-${index}`}
                value={option}
                checked={selectedOptions[index] === option}
                onChange={(e) => handleOptionChange(option, e.target.checked, index)}
              />
              <label htmlFor={`option-${index}-${optionIndex}`}>
                {option}
              </label>
            </div>
          ))}
        </div>
      ));
    } else {
      return question.options.map((option, optionIndex) => (
        <div key={optionIndex}>
          <input
            type="radio"
            id={`option-${optionIndex}`}
            name="option"
            value={option}
            checked={selectedOptions[0] === option}
            onChange={(e) => handleOptionChange(option, e.target.checked, undefined)}
          />
          <label htmlFor={`option-${optionIndex}`}>
            {option}
          </label>
        </div>
      ));
    }
  };

  const handleSubmit = () => {
    const currentResult = {
      submittedAnswers: Array.from(selectedOptions),
      correctAnswers: correctAnswers,
      // highlights: highlight, // Add highlights data here
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
            {renderQuestionOptions(selectedQuestion)}
          </form>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );  
});

export default Questionnaire;