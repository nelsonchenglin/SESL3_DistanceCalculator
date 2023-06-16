import React, { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import SearchBar from "./SearchBar";

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
  const [marker1, setMarker1] = useState(null);
  const [marker2, setMarker2] = useState(null);
  const [search, setSearch] = useState("90, 0");

  //leaflet map
  useEffect(() => {
    const leafletMap = L.map("map").setView([0, 0], 1);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMap);

    setMap(leafletMap);
  }, []);

  const calculateDistance = () => {
    // Remove previous markers
    if (marker1) {
      map.removeLayer(marker1);
      setMarker1(null);
    }
    if (marker2) {
      map.removeLayer(marker2);
      setMarker2(null);
    }

    // get first location coordinates
    axios
      .get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: startLocation,
          format: "json",
          limit: 1,
        },
      })
      .then(function (response) {
        var lat1 = parseFloat(response.data[0].lat);
        var lng1 = parseFloat(response.data[0].lon);
        var location1 = L.latLng(lat1, lng1);

        // get second location coordinates
        axios
          .get("https://nominatim.openstreetmap.org/search", {
            params: {
              q: endLocation,
              format: "json",
              limit: 1,
            },
          })
          .then(function (response) {
            var lat2 = parseFloat(response.data[0].lat);
            var lng2 = parseFloat(response.data[0].lon);
            var location2 = L.latLng(lat2, lng2);

            // Add markers to the map
            const newMarker1 = L.marker(location1, {
              icon: markerIcon,
            }).addTo(map);
            newMarker1
              .bindTooltip("Point A", { permanent: true })
              .openTooltip();
            const newMarker2 = L.marker(location2, {
              icon: markerIcon,
            }).addTo(map);
            newMarker2
              .bindTooltip("Point B", { permanent: true })
              .openTooltip();
            setMarker1(newMarker1);
            setMarker2(newMarker2);

            // calculate and show distance
            var calculatedDistance = location1.distanceTo(location2) / 1000; // Convert to kilometers
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

  const handleSearch = (location) => {
    axios
      .get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: location,
          format: "json",
          limit: 1,
        },
      })
      .then(function (response) {
        if (response.data.length > 0) {
          const { lat, lon } = response.data[0];
          const coordinates = `${lat}, ${lon}`;
          setSearch(coordinates);
        } else {
          setSearch("Location not found");
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      calculateDistance();
    }
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <p>Coordinates: {search}</p>
      <div id="map" style={{ height: "70vh", width: "70vw" }}></div>
      <div>
        <p>
          Use latitude values between -90 to 90. Use longitude values between
          -180 to 180. Values outside these ranges may cause inaccuracies.
        </p>
        <label htmlFor="location1">Point A (Latitude, Longitude): </label>
        <input
          type="text"
          id="location1"
          placeholder="Enter location coordinates"
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div>
        <label htmlFor="location2">Point B (Latitude, Longitude): </label>
        <input
          type="text"
          id="location2"
          placeholder="Enter location coordinates"
          value={endLocation}
          onChange={(e) => setEndLocation(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div>
        <button onClick={calculateDistance}>Calculate Distance</button>
        <p id="result" style={{ fontWeight: "bold" }}>
          Distance: {distance}
        </p>
      </div>
    </div>
  );
};

export default Map;
