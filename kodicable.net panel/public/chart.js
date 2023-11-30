const callsign = window.location.pathname.split('/')[1];
const xyValues = []


fetch("http://localhost:4000/api/streams", {
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

function initChart() {
    const statsChart = new Chart("streamStats", {
        type: "scatter",
        data: {
          datasets: [{
            pointRadius: 4,
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
                        parser: 'h:mm: a',
                    }
                },
                y: {
                  min: 0,
                },
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
          }
    })
}