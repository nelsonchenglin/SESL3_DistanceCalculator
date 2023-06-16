import React, { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { OpenStreetMapProvider } from "leaflet-geosearch";
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
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Initialize Leaflet map when component mounts
    const leafletMap = L.map("map").setView([0, 0], 1);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMap);

    setMap(leafletMap);
  }, []);

  useEffect(() => {
    if (map) {
      // Initialize geocoder
      const provider = new OpenStreetMapProvider();

      // Function to geocode and add marker to the map
      const geocodeAndAddMarker = (location) => {
        provider
          .search({ query: location, language: "en" }) // Set language to English
          .then((results) => {
            if (results && results.length > 0) {
              const { lat, lon, display_name } = results[0];
              const marker = L.marker([lat, lon]).addTo(map);
              marker.bindPopup(display_name).openPopup();
            }
          })
          .catch((error) => {
            console.log("Error geocoding location:", error);
          });
      };

      // Geocode and add markers for the countries
      geocodeAndAddMarker("United States");
      geocodeAndAddMarker("Canada");
      geocodeAndAddMarker("United Kingdom");
    }
  }, [map]);

  const calculateDistance = () => {
    // Remove previous markers
    if (marker1) {
      map.removeLayer(marker1);
    }
    if (marker2) {
      map.removeLayer(marker2);
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
            const newMarker2 = L.marker(location2, {
              icon: markerIcon,
            }).addTo(map);
            setMarker1(newMarker1);
            setMarker2(newMarker2);

            // Calculate the distance
            var calculatedDistance = location1.distanceTo(location2) / 1000; // Convert to kilometers

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

  const handleSearch = (location) => {
    // Geocode the location and perform any necessary actions
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
      {setSearch.length > 0 && <p>Coordinates: {search}</p>}
      <div id="map" style={{ height: "70vh", width: "70vw" }}></div>
      <div>
        <label htmlFor="location1">Location 1 (Latitude, Longitude): </label>
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
        <label htmlFor="location2">Location 2 (Latitude, Longitude): </label>
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
        <p id="result">Distance: {distance}</p>
      </div>
    </div>
  );
};

export default Map;
