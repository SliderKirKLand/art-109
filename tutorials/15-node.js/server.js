const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const port = process.env.PORT || 3000;
const publicDir = __dirname;
const strokes = [];
const participants = new Map();
const colors = ['#f06f61', '#6c75cf', '#4d9c91', '#d28d4e', '#b77ac4'];

const mimeTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

const server = http.createServer((request, response) => {
  const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const filePath = path.join(publicDir, path.normalize(requested));
  if (!filePath.startsWith(publicDir)) return response.writeHead(403).end('Forbidden');
  fs.readFile(filePath, (error, file) => {
    if (error) return response.writeHead(404).end('Not found');
    response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
    response.end(file);
  });
});

const websocketServer = new WebSocket.Server({ server });

websocketServer.on('connection', socket => {
  socket.on('message', raw => {
    let message;
    try { message = JSON.parse(raw); } catch { return; }
    if (message.type === 'join') {
      participants.set(socket, { id: message.id, name: message.name, color: colors[participants.size % colors.length] });
      send(socket, { type: 'init', strokes, participants: Object.fromEntries([...participants.values()].map(person => [person.id, person])) });
      broadcastPresence();
    }
    if (message.type === 'rename') {
      const participant = participants.get(socket);
      if (participant && typeof message.name === 'string') { participant.name = message.name.trim().slice(0, 18) || 'Guest'; broadcastPresence(); }
    }
    if (message.type === 'stroke' && message.stroke) {
      strokes.push(message.stroke);
      broadcast({ type: 'stroke', stroke: message.stroke }, socket);
    }
    if (message.type === 'clear') {
      strokes.length = 0;
      broadcast({ type: 'clear' });
    }
  });
  socket.on('close', () => { participants.delete(socket); broadcastPresence(); });
});

function send(socket, message) { socket.send(JSON.stringify(message)); }
function broadcast(message, except) { websocketServer.clients.forEach(client => { if (client !== except && client.readyState === WebSocket.OPEN) send(client, message); }); }
function broadcastPresence() { broadcast({ type: 'presence', participants: Object.fromEntries([...participants.values()].map(person => [person.id, person])) }); }

server.listen(port, '0.0.0.0', () => console.log(`Common Ground is running on port ${port}`));
