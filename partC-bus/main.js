/*
    Joel Al Gohri Sayed
    W0514987
    PROG2700 - Assignment 3, Part C: Transit Tracker (Halifax Transit bus data)
*/

// IIFE
(() => {

    // create map in leaflet and tie it to the div called 'theMap'
    // centered on Halifax
    let map = L.map('theMap').setView([44.65, -63.6], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Halifax Transit API url and how often to refresh (in milliseconds)
    const API_URL = 'https://halifax-transit-data.onrender.com/vehicles';
    const REFRESH_TIME = 15000;

    // custom bus icon (bus.png points north, so rotation = bearing)
    const busIcon = L.icon({
        iconUrl: 'bus.png',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -10]
    });

    // this layer holds all the bus markers, so I can clear it on each refresh
    let busLayer = L.layerGroup().addTo(map);

    // keep only buses on routes 1 to 10
    // route ids are strings like '1' or '10A', so parseInt grabs the number part
    // (123 gives 123 and gets dropped, 10A gives 10 and is kept)
    const filterRoutes = (entities) => {
        return entities.filter(e => {
            const v = e.vehicle;
            if (!v || !v.trip || !v.position) {
                return false;
            }
            const routeNum = parseInt(v.trip.routeId, 10);
            return routeNum >= 1 && routeNum <= 10;
        });
    };

    // turn one bus entity into a GeoJSON Feature
    // GeoJSON wants [longitude, latitude]
    const toFeature = (e) => {
        const v = e.vehicle;
        return {
            type: 'Feature',
            properties: {
                busId: v.vehicle.label,
                route: v.trip.routeId,
                bearing: v.position.bearing === undefined ? 0 : v.position.bearing,
                speed: v.position.speed,
                occupancy: v.occupancyStatus,
                timestamp: v.timestamp
            },
            geometry: {
                type: 'Point',
                coordinates: [v.position.longitude, v.position.latitude]
            }
        };
    };

    // turn the filtered buses into a GeoJSON FeatureCollection
    const toGeoJSON = (entities) => {
        return {
            type: 'FeatureCollection',
            features: entities.map(toFeature)
        };
    };

    // build the popup html for one bus
    const makePopup = (p) => {
        return `<b>Route:</b> ${p.route}<br>
                <b>Bus #:</b> ${p.busId}<br>
                <b>Speed:</b> ${p.speed === undefined ? 'N/A' : Math.round(p.speed * 3.6) + ' km/h'}<br>
                <b>Bearing:</b> ${Math.round(p.bearing)}&deg;<br>
                <b>Occupancy:</b> ${p.occupancy || 'N/A'}`;
    };

    // draw the GeoJSON on the map with rotated bus icons and popups
    const drawBuses = (geojson) => {
        busLayer.clearLayers();

        const layer = L.geoJSON(geojson, {
            pointToLayer: (feature, latlng) => {
                return L.marker(latlng, {
                    icon: busIcon,
                    rotationAngle: feature.properties.bearing
                });
            },
            onEachFeature: (feature, marker) => {
                marker.bindPopup(makePopup(feature.properties));
            }
        });

        busLayer.addLayer(layer);
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
                const routes1to10 = filterRoutes(data.entity || []);
                drawBuses(toGeoJSON(routes1to10));
            })
            .catch(err => {
                console.log('Could not get bus data:', err);
            })
            .finally(() => {
                setTimeout(updateMap, REFRESH_TIME);
            });
    };

    // start it up
    updateMap();

})()
