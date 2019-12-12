function buildMap(year) {
  d3.json(`/markers/${year}`).then((data) => {
    markerArray = [];

    for (var i = 0; i < data.length; i++) {
      // For each station, create a marker and bind a popup with the station's name
      var complaintmarker = L.marker([data[i].lat, data[i].long])
        .bindPopup("<h3>" + data[i].servicecodedescription + "</h3>");

      // Add the marker to the bikeMarkers array
      markerArray.push(complaintmarker);
    }

    var complaintLayer = L.layerGroup(markerArray);

    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
      maxZoom: 18,
      accessToken: API_KEY
    });

    var baseMaps = {
      "Light Map": lightmap
    };

    var overlayMaps = {
      "Complaint Centroid": complaintLayer
    };

    var map = L.map("map", {
      center: [38.904773, -77.010099],
      zoom: 12.4,
      layers: [lightmap, complaintLayer]
    });

    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

  });
}

function buildCharts(year) {
  d3.json(`/top_complaints/${year}`).then((data) => {

    var ctx = document.getElementById("plot").getContext('2d');
    var plot = new Chart(ctx, {
      type: 'horizontalBar',
      data: {
        labels: data[0],
        datasets: [{
          // label: '# of Complaints',
          data: data[1],
          backgroundColor: [
            'rgba(0, 11, 24, 0.9)',
            'rgba(0, 23, 45, 0.9)',
            'rgba(0, 38, 77, 0.9)',
            'rgba(2, 56, 110, 0.9)',
            'rgba(0, 73, 141, 0.9)',
            'rgba(0, 82, 162, 0.9)',
            'rgba(0, 92, 175, 0.9)',
            'rgba(0, 105, 185, 0.9)',
            'rgba(0, 120, 200, 0.9)',
            'rgba(0, 185, 251, 0.9)',
          ],
          borderColor: [
            'rgba(0, 11, 24, 1)',
            'rgba(0, 23, 45, 1)',
            'rgba(0, 38, 77, 1)',
            'rgba(2, 56, 110, 1)',
            'rgba(0, 73, 141, 1)',
            'rgba(0, 82, 162, 1)',
            'rgba(0, 92, 175, 1)',
            'rgba(0, 105, 185, 1)',
            'rgba(0, 120, 200, 1)',
            'rgba(0, 185, 251, 1)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        title: {
          display: true,
          text: `Top-10 Most Filed Complaints, ${year}`,
          fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          fontStyle: 'bold'
        },
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            ticks: {
              maxRotation: 90,
              minRotation: 0
            }
          }],
          yAxes: [{
            ticks: {
              minRotation: 10,
              beginAtZero: true
            }
          }]
        }
      }
    });
  });
}



function buildPieChart(year) {

  d3.json(`/by_ward/${year}`).then((data) => {

    const wards = data[0];
    const counts = data[1];

    var ctx = document.getElementById('pie').getContext('2d');

    // Global Options:
    Chart.defaults.global.defaultFontColor = 'black';
    Chart.defaults.global.defaultFontSize = 16;

    var data = {
      labels: wards,
      datasets: [
        {
          fill: true,
          backgroundColor: [
            'black',
            'white',
            'red',
            'blue',
            'green',
            'yellow',
            'orange',
            'pink'],
          data: counts,
          // Notice the borderColor 
          borderColor: ['black', 'black', 'black', 'black', 'black', 'black', 'black', 'black'],
          borderWidth: [2, 2]
        }
      ]
    };

    // Notice the rotation from the documentation.

    var options = {
      title: {
        display: true,
        text: `Number of Complaints by Ward, ${year}`,
        position: 'top',
        responsive: false
      },
    };

    // Chart declaration:
    var myPieChart = new Chart(ctx, {
      type: 'pie',
      data: data,
      options: options
    });
  });
};

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/years").then((yearArray) => {
    yearArray.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = yearArray[0];
    buildCharts(firstSample);
    buildPieChart(firstSample);
    buildMap(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildPieChart(newSample);
  d3.select("#map-bx").html("").html('<div id="map"></div>');
  buildMap(newSample);
}

// Initialize the dashboard
init();