import { ExpressPeerServer } from 'peer';
import express from 'express';
import http from 'http';

// Create an Express app
const app = express();
const server = http.createServer(app);

// Configure PeerJS server
const peerServer = ExpressPeerServer(server, {
  path: '/peerjs', // Path for PeerJS signaling
});

// Use the PeerJS server
app.use('/peerjs', peerServer);

// Set the port, ensuring it's a number
const PORT = parseInt(process.env.PORT || '9000', 10);

// Start the server and listen on all interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`PeerJS server running at http://192.168.0.105:${PORT}/peerjs`);
});
