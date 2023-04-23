import React, { useState, useRef,useEffect, useMemo, useCallback } from 'react';
import DroneBlock from './DroneBlock';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import './DroneMonitor.css';
import droneIconImg from './icons/zone/fly.png';

const DroneMonitor = ({ identifier, scene, highlight, droneDataFiles, droneData, onDataPlayed,taskStarted }) => {

  console.log('identifier',identifier)
  console.log('scene',scene)
  console.log('highlight',highlight)

  // const [droneData, setDroneData] = useState({});
  const droneBlocks = new Array(6).fill(null);

  // const [currentTimestampIndex, setCurrentTimestampIndex] = useState(0);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [dataPlayed, setDataPlayed] = useState(false); 
  const [initialPositions, setInitialPositions] = useState({});

  const mapRef = useRef(null); // Add this ref
  const markersRef = useRef([]);

  // const apiKey = "AIzaSyCaE9MD9d437ca-ZFm3ISTgRZKcYzAUnkk";

  // const normalSceneFiles = [];
  // for (let i = 1; i <= 3; i++) {
  //   const data = `${process.env.PUBLIC_URL}/data/normal_scenes/${i}/data.json`;
  //   normalSceneFiles.push({ data });
  // }

  const criticalSituationFolders = ['t1', 't2', 't3'];

  useEffect(() => {
    const initializeMap = async () => {
      if (mapRef.current) return;
  
      const mapContainer = document.getElementById("map");
      if (!mapContainer) return;
  
      // Create LatLng objects for the corners
      var southWest = L.latLng(49.198, 6.936);
      var northEast = L.latLng(49.280, 7.068);
      var bounds = L.latLngBounds(southWest, northEast);
  
      const map = L.map(mapContainer, {
        maxBounds: bounds,
        center: [51.505, -0.09],
        zoom: 12,
        dragging: false, // Disable map dragging
        scrollWheelZoom: false, // Disable scroll wheel zoom
      });
  
      map.setView([49.239, 7.002], 12);
  
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
  
    // Add the initial drone positions to the map
    const newInitialPositions = {};
    for (let index = 0; index < 6; index++) {
      const timestamps = droneData[String(index + 1)]?.value?.timestamps;
      if (!timestamps || timestamps.length === 0) continue;

      const drone = timestamps[0];
      if (!drone.latitude || !drone.longitude) continue;

      const marker = L.marker([drone.latitude, drone.longitude], {
        icon: createDroneIcon(index + 1),
      });

      marker.addTo(map);
      markersRef.current.push(marker);

      newInitialPositions[index + 1] = [drone.latitude, drone.longitude];
    }
    setInitialPositions(newInitialPositions);

      mapRef.current = map;
  
      return () => {
        map.remove(); // Use Leaflet's map.remove() method for cleanup
      };
    };
  
    initializeMap();
  }, [droneData]); // Add droneData dependency hereMap();

  const createDroneIcon = (droneNumber) => {
    const droneIconDiv = L.DomUtil.create('div', 'drone-icon-container');
    droneIconDiv.innerHTML = `
      <img src="${droneIconImg}" alt="Drone Icon" class="drone-icon" />
      <span class="drone-icon-number">${droneNumber}</span>
    `;
  
    return L.divIcon({
      html: droneIconDiv.innerHTML,
      iconSize: [30, 30], // Increase the icon size to 30x30
      iconAnchor: [15, 15], // Update the icon anchor to be centered
      className: 'drone-custom-icon',
    });
  };

  useEffect(() => {
    console.log('Update')
    console.log('DroneData',droneData)
    console.log('currentTimestamp',currentTimestamp)

    const updateMarkers = () => {
      if (!mapRef.current || Object.keys(droneData).length < 4) return;
  
      // Remove existing markers
      markersRef.current.forEach((marker) => {
        mapRef.current.removeLayer(marker);
      });
  
      // Create new markers for each drone
      markersRef.current = [];
      for (let index = 0; index < 6; index++) {
        const timestamps = droneData[String(index + 1)]?.value?.timestamps;
        if (!timestamps || timestamps.length === 0) continue;
  
        const drone = timestamps[currentTimestamp];
        if (!drone.latitude || !drone.longitude) continue;

        const marker = L.marker([drone.latitude, drone.longitude], {
          icon: createDroneIcon(index + 1),
        });
  
        marker.addTo(mapRef.current);
  
        // Add a popup to the marker with the drone's latitude and longitude
        // marker.bindPopup(
        //   `<b>Drone ${index + 1}</b><br>Latitude: ${drone.latitude.toFixed(
        //     4
        //   )}<br>Longitude: ${drone.longitude.toFixed(4)}`
        // );
  
        markersRef.current.push(marker);
      }
    };
    
    // console.log(mapRef.current)
    // console.log('taskStarted',taskStarted)
    // console.log(currentTimestamp)
    if (mapRef.current && (taskStarted || Object.keys(initialPositions).length > 0)) {
      updateMarkers();
      if (currentTimestamp == droneData[1].value.timestamps.length-1 ){
        onDataPlayed();
      }
    }
  }, [droneData, currentTimestamp,taskStarted]);

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

  return (
    <div className="drone-monitor-container">
      <div className="container">
        {Object.keys(droneData).length === 0 ? (
          <p>Loading...</p>
        ) : (
          droneBlocks.slice(0, 6).map((_, index) => (
            <DroneBlock
              droneData={droneData[String(index + 1)].value}
              droneNumber={index + 1}
              highlightStatus={highlight}
              onTimestampChange ={setCurrentTimestamp}
              isFrozen={!taskStarted}
            />
          ))
        )}
      </div>
      <div className="map-container">
        <div id="map" style={{ width: '100%', height: '100%' }}></div>
      </div>
    </div>
  );
};
  
export default DroneMonitor;




