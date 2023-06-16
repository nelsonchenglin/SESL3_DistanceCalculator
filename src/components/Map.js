import React, { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import markerIconPng from "leaflet/dist/images/marker-icon.png";

const markerIcon = L.icon({
  iconUrl: markerIconPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const Map = () => {
  const [startLocation, setStartLocation] = useState("40.7128, -74.0060");
  const [endLocation, setEndLocation] = useState("34.0522, -118.2437");
  const [distance, setDistance] = useState("");
  const [map, setMap] = useState(null);
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);

  useEffect(() => {
    // Initialize Leaflet map when component mounts
    const leafletMap = L.map("map").setView([0, 0], 1);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      minZoom: 3,
      maxZoom: 17,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMap);

    setMap(leafletMap);
  }, []);

  const calculateDistance = () => {
    // Remove previous markers
    if (startMarker) {
      map.removeLayer(startMarker);
    }
    if (endMarker) {
      map.removeLayer(endMarker);
    }

    // Geocode the start location
    axios
      .get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: startLocation,
          format: "json",
          limit: 1,
        },
        headers: {
          "accept-language": "en-US,en;q=0.9",
        },
      })
      .then(function (response) {
        var startLat = parseFloat(response.data[0].lat);
        var startLon = parseFloat(response.data[0].lon);
        var startPoint = L.latLng(startLat, startLon);

        // Geocode the end location
        axios
          .get("https://nominatim.openstreetmap.org/search", {
            params: {
              q: endLocation,
              format: "json",
              limit: 1,
            },
            headers: {
              "accept-language": "en-US,en;q=0.9",
            },
          })
          .then(function (response) {
            var endLat = parseFloat(response.data[0].lat);
            var endLon = parseFloat(response.data[0].lon);
            var endPoint = L.latLng(endLat, endLon);

            // Add markers to the map
            const newStartMarker = L.marker(startPoint, {
              icon: markerIcon,
            }).addTo(map);
            const newEndMarker = L.marker(endPoint, {
              icon: markerIcon,
            }).addTo(map);
            setStartMarker(newStartMarker);
            setEndMarker(newEndMarker);

            // Calculate the distance
            var calculatedDistance = startPoint.distanceTo(endPoint) / 1000; // Convert to kilometers

            // Display the distance
            setDistance(calculatedDistance.toFixed(2) + " km");
          })
          .catch(function (error) {
            console.log(error);
          });
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <div>
      <div id="map" style={{ height: "70vh", width: "70vw" }}></div>
      <div>
        <label htmlFor="start">Start Location (Latitude, Longitude):</label>
        <input
          type="text"
          id="start"
          placeholder="Enter start location coordinates"
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="end">End Location (Latitude, Longitude):</label>
        <input
          type="text"
          id="end"
          placeholder="Enter end location coordinates"
          value={endLocation}
          onChange={(e) => setEndLocation(e.target.value)}
        />
      </div>
      <div>
        <button onClick={calculateDistance}>Calculate Distance</button>
        <p id="result">Distance: {distance}</p>
      </div>
    </div>
  );
};

export default Map;
