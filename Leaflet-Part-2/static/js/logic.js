document.addEventListener('DOMContentLoaded', function () {
    // Get the Earthquake Dataset
    var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
    var platesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

    // Import and Visualize the Data
    Promise.all([
        fetch(url).then(response => response.json()),
        fetch(platesUrl).then(response => response.json())
    ]).then(function (results) {
        var earthquakeData = results[0];
        var platesData = results[1];

        // Find bounds for setting map view
        var bounds = [];
        earthquakeData.features.forEach(feature => {
            var coords = feature.geometry.coordinates;
            bounds.push([coords[1], coords[0]]);
        });

        // Create a map centered around the earthquake data
        var map = L.map('map').fitBounds(bounds);

        // Create the tile layer for Satellite Map
        var satelliteMap = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        });

        // Add the Satellite Map tile layer to the map
        satelliteMap.addTo(map);

        // Function to determine marker size based on earthquake magnitude
        function markerSize(magnitude) {
            return magnitude * 5;
        }

        // Function to determine marker color based on earthquake depth
        function markerColor(depth) {
            if (depth < 10) {
                return 'lightgreen';
            } else if (depth < 30) {
                return 'green';
            } else if (depth < 50) {
                return 'yellow';
            } else if (depth < 70) {
                return 'orange';
            } else if (depth < 90) {
                return 'red';
            } else {
                return 'darkred';
            }
        }

        // Add earthquake data to the map
        earthquakeData.features.forEach(feature => {
            var coords = feature.geometry.coordinates;
            var magnitude = feature.properties.mag;
            var depth = coords[2];
            L.circleMarker([coords[1], coords[0]], {
                radius: markerSize(magnitude),
                color: markerColor(depth),
                fillColor: markerColor(depth),
                fillOpacity: 0.7
            }).bindPopup(`Magnitude: ${magnitude}, Depth: ${depth} km`).addTo(map);
        });

        // Add tectonic plates to the map
        L.geoJSON(platesData, {
            style: function (feature) {
                return {
                    color: 'orange',
                    weight: 2,
                    opacity: 0.7
                };
            }
        }).addTo(map);

        // Add legend
        var legend = L.control({position: 'bottomright'});
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML += '<b>Legend</b><br>';
            div.innerHTML += '<div><i style="background: lightgreen; width: 20px; height: 20px; display: inline-block;"></i> Depth &lt; 10 km - Shallow</div>';
            div.innerHTML += '<div><i style="background: green; width: 20px; height: 20px; display: inline-block;"></i> Depth 10-30 km - Intermediate</div>';
            div.innerHTML += '<div><i style="background: yellow; width: 20px; height: 20px; display: inline-block;"></i> Depth 30-50 km - Moderate</div>';
            div.innerHTML += '<div><i style="background: orange; width: 20px; height: 20px; display: inline-block;"></i> Depth 50-70 km - Strong</div>';
            div.innerHTML += '<div><i style="background: red; width: 20px; height: 20px; display: inline-block;"></i> Depth 70-90 km - Major</div>';
            div.innerHTML += '<div><i style="background: darkred; width: 20px; height: 20px; display: inline-block;"></i> Depth &gt; 90 km - Great</div>';
            return div;
        };
        legend.addTo(map);
    }).catch(error => console.error('Error:', error));
});
