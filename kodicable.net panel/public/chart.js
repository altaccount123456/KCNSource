import {
  apiUrl,
}
from './index-protected.js'


let statsChart;
const callsign = window.location.pathname.split('/')[1];
let xyValues = []

let chartVis = false;


export function initFetch() {
  console.log("Fetching data")
  fetch(`${apiUrl}/api/streams`, {
      method: "GET",
      headers: {
          "Content-Type": "application/json"
      },
  })
  .then(response => response.json())
  .then(data => {
      data.streams[callsign.toUpperCase()].viewer_stats.forEach((element, index) => {
          xyValues.push({x: element.time, y: element.viewers})
      });
      initChart()
  })
}

function fetchDataUpdate() {
  fetch(`${apiUrl}/api/streams`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json"
    },
  })
  .then(response => response.json())
  .then((data) => {
    const newXYValues = []
    data.streams[callsign.toUpperCase()].viewer_stats.forEach((element, index) => {
      newXYValues.push({x: element.time, y: element.viewers})
    });
    updateChart(statsChart, newXYValues)
  })
}

function updateChart(chart, newData) {
  chart.data.datasets[0].data = newData
  chart.update()
}

function initChart() {
  const epoch = Date.now()
  console.log(epoch)
      if (chartVis) {
        statsChart.destroy()
        chartVis = false;
      }
     statsChart = new Chart("streamStats", {
        type: "scatter",
        data: {
          datasets: [{
            pointRadius: 6,
            showLine: true,
            pointBackgroundColor: "rgb(255,255,255)",
            borderColor: 'rgb(255 ,255 , 255)',
            data: xyValues
          }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        parser: 'h:mm a',
                    },
                },
                y: {
                  min: 0,
                  ticks: {
                    stepSize: 1,
                  },
                },
            },
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                display: false
              }
            },
          }
    })
    chartVis = true;

    fetchDataUpdate()
    const updateInterval = setInterval(fetchDataUpdate, 5000)
}