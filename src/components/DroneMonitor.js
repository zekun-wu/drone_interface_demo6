import React, { useState, useRef,useEffect, useMemo, useCallback } from 'react';
import DroneBlock from './DroneBlock';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import './DroneMonitor.css';
import droneIconImg from './icons/zone/fly.png';

const DroneMonitor = ({  key, taskStarted, sceneCounter, currentIndex, currentData, droneData, setSpacebarTimestamps}) => {
  console.log('currentIndex',currentIndex)
  console.log('currentData',currentData)

  const droneBlocks = new Array(4).fill(null);
  const [dataPlayed, setDataPlayed] = useState(false); 
  const [initialPositions, setInitialPositions] = useState({});

  const mapRef = useRef(null); // Add this ref
  const markersRef = useRef([]);

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

  const setInitialDronePositions = () => {

    if (!mapRef.current) return;

    const newInitialPositions = {};
    for (let index = 0; index < 4; index++) {
      const drone= currentData[index];
      if (!drone) continue;
      if (!drone.latitude || !drone.longitude) continue;
  
      const marker = L.marker([drone.latitude, drone.longitude], {
        icon: createDroneIcon(index + 1),
      });
  
      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
  
      newInitialPositions[index + 1] = [drone.latitude, drone.longitude];
    }
    setInitialPositions(newInitialPositions);
  };

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
        zoomControl: false, // Disable zoom control buttons
      });

      map.setView([49.239, 7.002], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapRef.current = map;

      setInitialDronePositions();

      return () => {
          map.remove(); // Use Leaflet's map.remove() method for cleanup
      };
    };

    initializeMap();
  }, []);

  useEffect(() => {
    if (!taskStarted) {
      setInitialDronePositions();
    }
  }, [droneData, sceneCounter, taskStarted]);

  const updateMarkers = (timestampIndex) => {
    if (currentData?.question === 1) return; 
  
    // Remove existing markers
    markersRef.current.forEach((marker) => {
      mapRef.current.removeLayer(marker);
    });
  
    // Create new markers for each drone
    markersRef.current = [];
    for (let index = 0; index < 4; index++) {
      const timestamps = droneData[index].timestamps;
  
      if (!timestamps || timestamps.length === 0) continue;
  
      const drone = timestamps[timestampIndex];
  
      if (!drone || !drone.latitude || !drone.longitude) continue;
  
      const marker = L.marker([drone.latitude, drone.longitude], {
        icon: createDroneIcon(index + 1),

      });
  
      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    }
  };

  useEffect(() => {  
    if (
      mapRef.current &&
      (taskStarted || Object.keys(initialPositions).length > 0)
    ) {
      updateMarkers(currentIndex);
    }
  }, [droneData, currentIndex, taskStarted, sceneCounter]);

  useEffect(() => {
    if (mapRef.current && taskStarted) {
        updateMarkers(currentIndex);
    }
  }, [mapRef, currentIndex, taskStarted]);

  const handleSpacebarPress = (event) => {
    if (event.code === 'Space') {
      setSpacebarTimestamps((prevTimestamps) => [
        ...prevTimestamps, 
        {
          timestamp:currentIndex,
          interval:parseInt(currentIndex/(24*15))+1,
          task:sceneCounter
        }
      ]);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleSpacebarPress);
    return () => {
      window.removeEventListener('keydown', handleSpacebarPress);
    };
  }, []);

  return (
    <div className="drone-monitor-container">
      <div className="container">
        {!droneData[sceneCounter - 1] ? (
          <p>Loading...</p>
        ) : (
          droneBlocks.slice(0, 4).map((_, index) => (
            <DroneBlock
              droneData={droneData[index]}
              droneNumber={index + 1}
              highlightStatus={currentData[index].highlight}
              isFrozen={!taskStarted}
              latestData={currentData[index]}
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




