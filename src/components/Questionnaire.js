import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './Questionnaire.css';

const only_non_critical_questions = [
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
      {
        drone: 'Drone 5',
        options: ['<70%', '70-80%', '80-90%', '>90%', "I don’t know"],
      },
      {
        drone: 'Drone 6',
        options: ['<70%', '70-80%', '80-90%', '>90%', "I don’t know"],
      }
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
      {
        drone: 'Drone 5',
        options: ['<5m/s', '5-10m/s', '10-20m/s', '>20m/s', "I don’t know"],
      },
      {
        drone: 'Drone 6',
        options: ['<5m/s', '5-10m/s', '10-20m/s', '>20m/s', "I don’t know"],
      }
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
      {
        drone: 'Drone 5',
        options: ['<1000m', '1000-2000m', '2000-5000m', '>5000m', "I don’t know"],
      },
      {
        drone: 'Drone 6',
        options: ['<1000m', '1000-2000m', '2000-5000m', '>5000m', "I don’t know"],
      }
    ],
  },
];

const buildFirstQuestions = (allDronesCurrentData) => {

  let first_questions = [];
  let drone = 0;
  let specificQuestion, specificOptions, specificAnswer;

  allDronesCurrentData.forEach((droneDataSeries, index) => {
    let criticalType = droneDataSeries.critical_situation;

    if (criticalType === 1) { 
      drone = index + 1;
      specificAnswer = 'Low battery'
    }
    else if (criticalType === 2){
      drone = index + 1;
      specificAnswer = 'Extreme wind'
    }
    else if (criticalType === 3){
      drone = index + 1;
      specificAnswer = 'Rotor off'
    }
    else if (criticalType === 4){
      drone = index + 1;
      specificAnswer = 'No-fly warning'
    }
  })

  if (drone == 0){
    specificAnswer = 'None of the above'
  }

  specificQuestion = `Which of the following critical situations is occurring?`;
  specificOptions = ['Low battery', 'Extreme wind', 'Rotor off', 'No-fly warning', "None of them","I don’t know"];
  first_questions.push({
    question: specificQuestion,
    options: specificOptions,
    answer: specificAnswer,
  });

  specificQuestion = `Which drone is experiencing critical situations?`;
  specificOptions =  ['Drone 1', 'Drone 2', 'Drone 3', 'Drone 4', 'Drone 5', 'Drone 6',"None of them","I don’t know"];
  specificAnswer = drone 

  first_questions.push({
    question: specificQuestion,
    options: specificOptions,
    answer: specificAnswer,
  });

  return first_questions;
};

const buildCriticalQuestions = (allDronesCurrentData) => {

  let critical_questions = [];

  allDronesCurrentData.forEach((droneDataSeries, index) => {
    const drone = index + 1;
    const criticalType = droneDataSeries.critical_situation;
    let specificQuestion, specificOptions, specificAnswer;

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
        critical_questions.push({
          question: specificQuestion,
          options: specificOptions,
          answer: specificAnswer,
        });
    }
    else if (criticalType === 2) { 
        let criticalWind = droneDataSeries['wind'].toFixed(0)
        // console.log('criticalWind',criticalWind)
        specificQuestion = `When the extreme wind occurred on drone ${drone}, what was the exact wind speed?`;
        specificOptions = [ `${parseInt(criticalWind)  + 5}m/s`,`${parseInt(criticalWind)+ 10}m/s`, `${criticalWind}m/s`, "I don’t know"]; 
        specificAnswer = `${criticalWind}`;
        critical_questions.push({
          question: specificQuestion,
          options: specificOptions,
          answer: specificAnswer,
        });
    }
    else if (criticalType === 3){
        let criticalDrone = drone
        specificQuestion = ` Which drone had the rotor off critical situation?`;
        specificOptions = ['Drone 1', 'Drone 2', 'Drone 3', 'Drone 4', 'Drone 5', 'Drone 6',"I don’t know"]; 
        specificAnswer = `Drone ${criticalDrone}`;
        critical_questions.push({
          question: specificQuestion,
          options: specificOptions,
          answer: specificAnswer,
        });
    }
    else if(criticalType === 4){
        specificQuestion = `Which critical situation happened to the drone ${drone}?`;
        specificOptions = ['Low battery', 'Extreme wind', 'Rotor off', 'No-fly warning', "I don’t know"];
        specificAnswer =  'No-fly warning';
        critical_questions.push({
          question: specificQuestion,
          options: specificOptions,
          answer: specificAnswer,    
        });         
    }
  });

  return critical_questions;
};

const buildNonCriticalQuestions = (only_non_critical_questions, allDronesCurrentData) => {
  return only_non_critical_questions.map(question => {
    let specificAnswer;

    if (question.number === 1) {
      specificAnswer = question.subquestions.map((subquestion, index) => {
        const droneBattery = allDronesCurrentData[index]['battery']*100;
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
          ...subquestion, // copy other properties
          specificAnswer: subquestion.options[optionIndex], // add specific answer
        };
      });
    } else if (question.number === 2) {
      specificAnswer = question.subquestions.map((subquestion, index) => {
        const droneSpeed = allDronesCurrentData[index]['horizontal_speed'];
        let optionIndex;

        if (droneSpeed < 5) {
          optionIndex = 0;
        } else if (droneSpeed >= 5 && droneSpeed < 10) {
          optionIndex = 1;
        } else if (droneSpeed >= 10 && droneSpeed < 20) {
          optionIndex = 2;
        } else {
          optionIndex = 3;
        }

        return {
          ...subquestion, // copy other properties
          specificAnswer: subquestion.options[optionIndex], // add specific answer
        };
      });
    } else if (question.number === 3) {
      specificAnswer = question.subquestions.map((subquestion, index) => {
        const droneDistance = allDronesCurrentData[index]['distance'];
        let optionIndex;

        if (droneDistance < 1000) {
          optionIndex = 0;
        } else if (droneDistance >= 1000 && droneDistance < 2000) {
          optionIndex = 1;
        } else if (droneDistance >= 2000 && droneDistance < 5000) {
          optionIndex = 2;
        } else {
          optionIndex = 3;
        }

        return {
          ...subquestion, // copy other properties
          specificAnswer: subquestion.options[optionIndex], // add specific answer
        };
      });
    }

    return {
      ...question, // copy other properties
      subquestions: specificAnswer // replace with new subquestions that include specific answers
    };
  });
}

const Questionnaire = forwardRef(({ onSubmit, allDronesCurrentData }, ref) => {

  const [selectedQuestion, setSelectedQuestion] = useState([]);

  // Initialize selectedOptions state
  const [selectedOptions, setSelectedOptions] = useState({});

  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [answersGenerated, setAnswersGenerated] = useState(false);

  const [first_questions, setFirstQuestions] = useState([]);
  const [critical_questions, setCriticalQuestions] = useState([]);
  const [non_critical_questions, setNonCriticalQuestions] = useState([]);
  const [questionsToRender, setQuestionsToRender] = useState([]);

  const allNonCritical = allDronesCurrentData.every((droneDataSeries) => droneDataSeries.critical_situation === 0);

  useEffect(() => {

    const firstQuestions = buildFirstQuestions(allDronesCurrentData);
    setFirstQuestions(firstQuestions);
    
    const critQuestions = buildCriticalQuestions(allDronesCurrentData);
    setCriticalQuestions(critQuestions);
  
    const nonCritQuestions = buildNonCriticalQuestions(only_non_critical_questions,allDronesCurrentData);
    setNonCriticalQuestions(nonCritQuestions);
  
    const questions = [firstQuestions[0]];
    if (allNonCritical) {
      questions.push(...nonCritQuestions.slice(0, 2)); 
    } else {
      // questions.push(...critQuestions.slice(0, 1)); 
      questions.push(...nonCritQuestions.slice(0, 2)); 
    }
    setQuestionsToRender(questions);
    console.log('questionsToRender',questionsToRender);
  }, [allDronesCurrentData]);


  // console.log('critical_questions',critical_questions);
  // console.log('non_critical_questions',non_critical_questions);

  // Handle option changes like this
  const handleOptionChange = (questionIndex, optionIndex, subQuestionIndex) => {
    setSelectedOptions(prevOptions => {
      const newOptions = { ...prevOptions };

      if (typeof subQuestionIndex === 'number') {
        newOptions[questionIndex] = newOptions[questionIndex] || [];
        newOptions[questionIndex][subQuestionIndex] = optionIndex;
      } else {
        newOptions[questionIndex] = optionIndex;
      }

      return newOptions;
    });
  };

  const handleSubmit = () => {
    if (Object.keys(selectedOptions).length > 0) {
      const userAnswers = [];
      const correctAnswers = [];
      
      console.log('questionsToRender', questionsToRender); // New line
      console.log('selectedOptions', selectedOptions); // New line
      for (let i = 0; i < questionsToRender.length; i++) {
        const question = questionsToRender[i];
        const selectedOption = selectedOptions[i];
        console.log('question', question); // New line
        console.log('selectedOption', selectedOption); // New line
        if (Array.isArray(selectedOption)) {
          const userSubAnswers = [];
          const correctSubAnswers = [];
          for (let j = 0; j < question.subquestions.length; j++) {
            const subQuestion = question.subquestions[j];
            const selectedSubOption = selectedOption[j];
            console.log('selectedSubOption', selectedSubOption); 
            console.log('subQuestion', subQuestion); 
            console.log('subQuestion.options', subQuestion.options); 
            if (selectedSubOption !== undefined) {
              userSubAnswers.push(subQuestion.options[selectedSubOption]);
            } else {

              userSubAnswers.push("Not answered");
            }
          console.log(question.specificAnswer)

          }
          userAnswers.push(userSubAnswers);
          correctAnswers.push(correctSubAnswers);
        } else {
          console.log('question.options', question.options); // New line
          if (selectedOption !== undefined) {
            userAnswers.push(question.options[selectedOption]);
          } else {
            userAnswers.push("Not answered");
          }
          correctAnswers.push(question.answer);
        }
      }
      // console.log('correctAnswers',correctAnswers)
      setCorrectAnswers(correctAnswers)
      onSubmit([userAnswers, correctAnswers]);
    }
  };
  

  useEffect(() => {
    if (!answersGenerated) {
      setCorrectAnswers([...first_questions, ...critical_questions, ...non_critical_questions].map((q) => q.answer));
      setAnswersGenerated(true);
    }
  }, [answersGenerated, first_questions, critical_questions, non_critical_questions]);

  useEffect(() => {
    ref.current = { handleSubmit };
  }, [handleSubmit]);

  const renderQuestion = (question, index) => {
    return (
      <div key={index} className="question">
        <h4>{question.question}</h4>
        <ul>
          {question.options && question.options.map((option, optionIndex) => (
            <li key={optionIndex}>
              <input
                type="radio"
                name={`question_${index}`}
                value={option}
                checked={selectedOptions[index] === optionIndex}
                onChange={() => handleOptionChange(index, optionIndex)}
              />
              <label>{option}</label>
            </li>
          ))}
        </ul>
        {question.subquestions &&
          question.subquestions.map((subQuestion, subQuestionIndex) => (
            <div key={subQuestionIndex} className="sub-question">
              <h5>{subQuestion.drone}</h5>
              <ul>
                {subQuestion.options && subQuestion.options.map((option, optionIndex) => (
                  <li key={optionIndex}>
                    <input
                      type="radio"
                      name={`question_${index}_subquestion_${subQuestionIndex}`}
                      value={option}
                      checked={selectedOptions[index] && selectedOptions[index][subQuestionIndex] === optionIndex}
                      onChange={() => handleOptionChange(index, optionIndex, subQuestionIndex)}
                    />
                    <label>{option}</label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="questionnaire">
      <h3>Questionnaire</h3>
      {questionsToRender.length!==0?questionsToRender.map(renderQuestion):"Loading"}
    </div>
  );
});

export default Questionnaire;