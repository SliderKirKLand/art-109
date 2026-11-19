let socket;
let canvasElement;
let strokes = [];
let activeStroke = null;
let tool = 'pencil';
let primaryColor = '#000000';
let brushSize = 3;
let clientId = `guest-${Math.random().toString(36).slice(2, 7)}`;
let participants = {};

function setup() {
  const canvas = createCanvas(900, 540);
  canvasElement = canvas.elt;
  canvas.parent('canvas-container');
  pixelDensity(1);
  background('#ffffff');
  resizeCanvasToArea();
  bindPointerEvents();
  bindControls();
  document.getElementById('player-name').value = `Guest ${Math.floor(Math.random() * 90 + 10)}`;
  document.getElementById('player-name').addEventListener('change', () => send({ type: 'rename', name: getPlayerName() }));
  connectSocket();
}

function draw() {
  background('#ffffff');
  for (const strokeData of strokes) renderStroke(strokeData);
  if (activeStroke) renderStroke(activeStroke);
}

function windowResized() { resizeCanvasToArea(); }
function resizeCanvasToArea() { const area = document.querySelector('.canvas-scroll'); if (!area || !canvasElement) return; resizeCanvas(Math.max(700, area.clientWidth - 4), Math.max(400, area.clientHeight - 4)); }

function bindPointerEvents() {
  canvasElement.addEventListener('pointerdown', event => { event.preventDefault(); canvasElement.setPointerCapture(event.pointerId); const point = pointerPoint(event); if (!point) return; activeStroke = { id: `${clientId}-${Date.now()}`, owner: clientId, color: tool === 'eraser' ? '#ffffff' : primaryColor, size: tool === 'eraser' ? brushSize * 4 : brushSize, tool, points: [point] }; });
  canvasElement.addEventListener('pointermove', event => { if (!activeStroke) return; const point = pointerPoint(event); if (!point) return; if (tool === 'line' || tool === 'rectangle' || tool === 'ellipse') activeStroke.points = [activeStroke.points[0], point]; else activeStroke.points.push(point); });
  canvasElement.addEventListener('pointerup', finishStroke);
  canvasElement.addEventListener('pointercancel', finishStroke);
}

function pointerPoint(event) { const bounds = canvasElement.getBoundingClientRect(); return { x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)), y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)) }; }
function finishStroke(event) { if (!activeStroke) return; if (event && canvasElement.hasPointerCapture(event.pointerId)) canvasElement.releasePointerCapture(event.pointerId); strokes.push(activeStroke); send({ type: 'stroke', stroke: activeStroke }); activeStroke = null; updateStrokeCount(); }

function renderStroke(strokeData) {
  if (!strokeData.points || !strokeData.points.length) return;
  const first = strokeData.points[0]; const last = strokeData.points[strokeData.points.length - 1];
  push(); stroke(strokeData.color); strokeWeight(strokeData.size); strokeCap(ROUND); strokeJoin(ROUND); noFill();
  if (strokeData.tool === 'line') line(first.x * width, first.y * height, last.x * width, last.y * height);
  else if (strokeData.tool === 'rectangle') rect(first.x * width, first.y * height, (last.x - first.x) * width, (last.y - first.y) * height);
  else if (strokeData.tool === 'ellipse') ellipse((first.x + last.x) * width / 2, (first.y + last.y) * height / 2, Math.abs(last.x - first.x) * width, Math.abs(last.y - first.y) * height);
  else { beginShape(); for (const pointData of strokeData.points) vertex(pointData.x * width, pointData.y * height); endShape(); if (strokeData.points.length === 1) point(first.x * width, first.y * height); }
  pop();
}

function connectSocket() {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  socket = new WebSocket(`${protocol}://${location.host || 'localhost:3000'}`);
  socket.addEventListener('open', () => { setConnection('Connected'); send({ type: 'join', id: clientId, name: getPlayerName() }); });
  socket.addEventListener('message', event => { const message = JSON.parse(event.data); if (message.type === 'init') { strokes = message.strokes || []; participants = message.participants || {}; updateStrokeCount(); updatePlayers(); } if (message.type === 'presence') { participants = message.participants || {}; updatePlayers(); } if (message.type === 'stroke' && message.stroke.owner !== clientId) { strokes.push(message.stroke); updateStrokeCount(); } if (message.type === 'clear') { strokes = []; updateStrokeCount(); } });
  socket.addEventListener('close', () => setConnection('Disconnected'));
  socket.addEventListener('error', () => setConnection('Disconnected'));
}

function send(message) { if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message)); }

function bindControls() {
  document.querySelectorAll('.paint-tool').forEach(button => button.addEventListener('click', () => { tool = button.dataset.tool; document.querySelectorAll('.paint-tool').forEach(item => item.classList.toggle('selected', item === button)); document.getElementById('status-text').textContent = `${tool[0].toUpperCase() + tool.slice(1)} tool selected. Click and drag on the canvas.`; if (tool === 'clear') { strokes = []; activeStroke = null; send({ type: 'clear' }); updateStrokeCount(); tool = 'pencil'; document.querySelector('[data-tool="pencil"]').click(); } }));
  document.querySelectorAll('.color').forEach(button => button.addEventListener('click', () => { primaryColor = button.dataset.color; document.querySelectorAll('.color').forEach(item => item.classList.toggle('selected', item === button)); document.getElementById('primary-color').style.background = primaryColor; }));
  document.getElementById('size-slider').addEventListener('input', event => { brushSize = Number(event.target.value); document.getElementById('size-value').textContent = brushSize; });
}

function setConnection(label) { document.getElementById('connection-status').textContent = label; }
function updateStrokeCount() { document.getElementById('stroke-count').textContent = `${strokes.length} stroke${strokes.length === 1 ? '' : 's'}`; }
function getPlayerName() { const name = document.getElementById('player-name').value.trim(); return name || 'Guest'; }
function updatePlayers() { const list = document.getElementById('player-list'); const players = Object.values(participants); list.innerHTML = players.length ? players.map(player => `<div class="player" title="${player.name}">${player.name}${player.id === clientId ? ' (you)' : ''}</div>`).join('') : '<div class="player-empty">Waiting for players...</div>'; }
