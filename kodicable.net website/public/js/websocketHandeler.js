let streams = [
    "wpey",
    "cfsp",
    "wtsc",
    "wcsg"
]

let stream = streams[Math.floor(Math.random() * streams.length)];
console.log(stream)

let socket = new WebSocket(`ws://localhost:5000/${stream}`)

socket.addEventListener('open', (event) => {
    console.log('Viewer connected to WebSocket server');
  });
  
  socket.addEventListener('message', (event) => {
    const message = event.data;
    console.log(`Received message: ${message}`);
  });
  
  socket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed');
  });
  
  socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
  });