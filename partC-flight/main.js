/*
    Joel Al Gohri Sayed
    W0514987
    PROG2700 - Assignment 3, Part C: Transit Tracker (Flight data)
*/

// IIFE
(() => {

    // create map in leaflet and tie it to the div called 'theMap'
    let map = L.map('theMap').setView([55, -95], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // OpenSky API url and how often to refresh (in milliseconds)
    const API_URL = 'https://opensky-network.org/api/states/all';
    const REFRESH_TIME = 15000;

    // custom plane icon (plane2.png points north, so rotation = true track)
    const planeIcon = L.icon({
        iconUrl: 'plane2.png',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -12]
    });

    // this layer holds all the plane markers, so I can clear it on each refresh
    let planeLayer = L.layerGroup().addTo(map);

    // keep only the planes from Canada (country is at index 2 of each state)
    // also drop planes that have no position
    const filterCanada = (states) => {
        return states.filter(s => s[2] === 'Canada' && s[5] !== null && s[6] !== null);
    };

    // turn one OpenSky state array into a GeoJSON Feature
    // GeoJSON wants [longitude, latitude]
    const toFeature = (s) => {
        return {
            type: 'Feature',
            properties: {
                icao24: s[0],
                callsign: s[1].trim() || 'Unknown',
                country: s[2],
                altitude: s[7],
                onGround: s[8],
                velocity: s[9],
                heading: s[10] === null ? 0 : s[10]
            },
            geometry: {
                type: 'Point',
                coordinates: [s[5], s[6]]
            }
        };
    };

    // turn the filtered states into a GeoJSON FeatureCollection
    const toGeoJSON = (states) => {
        return {
            type: 'FeatureCollection',
            features: states.map(toFeature)
        };
    };

    // build the popup html for one plane
    const makePopup = (p) => {
        return `<b>Callsign:</b> ${p.callsign}<br>
                <b>ICAO24:</b> ${p.icao24}<br>
                <b>Country:</b> ${p.country}<br>
                <b>Altitude:</b> ${p.altitude === null ? 'N/A' : Math.round(p.altitude) + ' m'}<br>
                <b>Speed:</b> ${p.velocity === null ? 'N/A' : Math.round(p.velocity * 3.6) + ' km/h'}<br>
                <b>Heading:</b> ${Math.round(p.heading)}&deg;<br>
                <b>On ground:</b> ${p.onGround ? 'Yes' : 'No'}`;
    };

    // draw the GeoJSON on the map with rotated plane icons and popups
    const drawPlanes = (geojson) => {
        planeLayer.clearLayers();

        const layer = L.geoJSON(geojson, {
            pointToLayer: (feature, latlng) => {
                return L.marker(latlng, {
                    icon: planeIcon,
                    rotationAngle: feature.properties.heading
                });
            },
            onEachFeature: (feature, marker) => {
                marker.bindPopup(makePopup(feature.properties));
            }
        });

        planeLayer.addLayer(layer);
    };

    // fetch -> filter -> convert -> draw
    // the next fetch is only scheduled after this one has finished (or failed)
    const updateMap = () => {
        fetch(API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Bad response: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                const canadian = filterCanada(data.states || []);
                drawPlanes(toGeoJSON(canadian));
            })
            .catch(err => {
                console.log('Could not get flight data:', err);
            })
            .finally(() => {
                setTimeout(updateMap, REFRESH_TIME);
            });
    };

    // start it up
    updateMap();

})()
