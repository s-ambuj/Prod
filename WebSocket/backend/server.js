const webSocket = require('ws');
const wss = new webSocket.Server({ port: 8080 });

let clients = [];

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.push(ws);
    ws.on('message', (message) => {
    console.log("Received message:" + message.toString());
    clients.forEach((client) => {
        if (client.readyState === webSocket.OPEN) {
            client.send(message.toString());
        }
    });
    });
    ws.on('close', () => {
    console.log('Client disconnected');
    clients = clients.filter((client) => client !== ws);
    });
});

console.log("WebSocket is running on ws://localhost:8080")