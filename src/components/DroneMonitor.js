import React, { useState, useEffect, useMemo } from 'react';
import DroneBlock from './DroneBlock';
import './DroneMonitor.css';

const DroneMonitor = ({ identifier, scene, highlight, droneDataFiles }) => {

  const [droneData, setDroneData] = useState({});
  const droneBlocks = new Array(6).fill(null);

  // const normalSceneFiles = [];
  // for (let i = 1; i <= 3; i++) {
  //   const data = `${process.env.PUBLIC_URL}/data/normal_scenes/${i}/data.json`;
  //   normalSceneFiles.push({ data });
  // }

  const criticalSituationFolders = ['t1', 't2', 't3'];
  // const criticalSituationFiles = criticalSituationFolders.map(folder => {
  //   const fileIndex = Math.floor(Math.random() * 5) + 1;
  //   return {
  //     data: `${process.env.PUBLIC_URL}/data/critical_situations/${folder}/${fileIndex}/data.json`
  //   };
  // });

  // const droneFiles = [...normalSceneFiles, ...criticalSituationFiles];
  // droneFiles.sort(() => Math.random() - 0.5);

  // const droneDataFiles = droneFiles.map((file) => file.data);

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
      console.log("Drone data loaded: ", dataObj);

    };

    fetchData();
  }, [droneDataFiles]);

  const droneNumberDataMap = useMemo(() => droneDataFiles.reduce((map, dataFile, index) => {
    const droneNumber = index + 1;
    const folderName = dataFile.match(/\/(\w+)\/\d+\/data.json$/)[1];
    const folderIndex = criticalSituationFolders.indexOf(folderName);
    map[droneNumber] = {
      dataFile,
      folderName: folderIndex === -1 ? 'normal_scenes' : `t${folderIndex + 1}`
    };
    return map;
  }, {}), [droneDataFiles]);
  
  // console.log('droneNumberDataMap:', droneNumberDataMap);

  return (
    <div className="drone-monitor-container">
      {/* <div className="file-list">
        <h3>Loaded Drone Data:</h3>
        <ul>
          {droneDataFiles.map((dataFile, index) => (
            <li key={index}>{`${index + 1}. ${dataFile}/data.json`}</li>
          ))}
        </ul>
      </div> */}
      <div className="container">
        {Object.keys(droneData).length === 0 ? (
          <p>Loading...</p>
        ) : (
          droneBlocks.map((_, index) => (
            <DroneBlock
              droneData={droneData[String(index + 1)].value}
              droneNumber={index + 1}
              highlightStatus={highlight}
            />
          ))
        )}
      </div>
    </div>
  );
  
};

export default DroneMonitor;