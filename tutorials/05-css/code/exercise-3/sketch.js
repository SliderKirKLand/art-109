var pos1, pos2, pos3, pos4;
var velocity1, velocity2, velocity3, velocity4;
var trail1 = []; // Trail for the first ghost
var trail2 = []; // Trail for the second ghost
var maxTrailLength = 50; // Max length of the trail

function setup() {
  createCanvas(600, 600);
  fill(255);
  
  pos1 = createVector(200, 200);
  velocity1 = createVector(1, 0);
  
  pos2 = createVector(550, 300);
  velocity2 = createVector(-1, 0);

  pos3 = createVector(100, 300);
  velocity3 = createVector(-0.5, 0);

  pos4 = createVector(250, 100);
  velocity4 = createVector(-1, 0);
}

function draw() {
  background(0);

  // First ghost's behavior (normal size, no rotation)
  moveGhost(pos1, velocity1, trail1);
  drawTrail(trail1, 255,10,random(0, 255));
  drawGhost(pos1, 'red', 1, 0); // Normal size, no rotation

  // Second ghost's behavior (rotating, normal size)
  moveGhost(pos2, velocity2, trail2);
  drawTrail(trail2, 10,50,random(0, 255));
  drawGhost(pos2, 'pink', 1, frameCount * 0.05); // Normal size, rotating

  // Green ghost (big and slow, no rotation)
  moveGhost(pos3, velocity3, trail2); 
  drawTrail(trail1, 20,50,random(0, 255));
  drawGhost(pos3, 'green', 2, 0); // Larger, no rotation

  // Yellow ghost (big and rotating)
  moveGhost(pos4, velocity4, trail1); 
  drawTrail(trail1, 100,27,random(0, 255));
  drawGhost(pos4, 'yellow', 2, frameCount * 0.1); // Larger, rotating

  // Handle collision for ghost1
  checkCollision(pos1, velocity1);

  // Handle collision for ghost2
  checkCollision(pos2, velocity2);

  // Handle collision for ghost3
  checkCollision(pos3, velocity3);

  // Handle collision for ghost4
  checkCollision(pos4, velocity4);
}

function moveGhost(pos, velocity, trail) {
  var direction = createVector(mouseX, mouseY);
  direction.sub(pos);  // Vector from pos to mouse
  direction.normalize(); // Direction with a length of 1
  direction.mult(0.1); // Scale down the vector for speed
  velocity.add(direction); // Adjust velocity based on direction
  pos.add(velocity); // Update position

  // Store current position in the trail array
  trail.push(createVector(pos.x, pos.y));

  // If the trail gets too long, remove the oldest point
  if (trail.length > maxTrailLength) {
    trail.shift();
  }
}

function drawTrail(trail, r, g, b) {
  // Draw the trail
  noFill();
  beginShape();
  for (let i = 0; i < trail.length; i++) {
    let t = map(i, 0, trail.length, 0, 255); // Fade effect
    stroke(r,g,b, t); // Change alpha value to fade over time
    vertex(trail[i].x, trail[i].y); // Draw line connecting the trail points
  }
  endShape();
}

function drawGhost(pos, color, scaleSize, rotationAngle) {
  push();
  fill(255);
  noStroke(); 
  translate(pos.x, pos.y);
  rotate(rotationAngle); // Apply rotation
  scale(scaleSize); // Apply scaling
  ghost(0, 0, color); // Draw the ghost at the origin
  pop();
}

// Ghost's body and features
function ghost(x, y, color) {
  body(x, y, color);
  whiteEye(x, y, 'white');
  blueEye(x, y, 'blue');
  leg(x, y, 0);
}

function body(x, y, c) {
  fill(c);
  rect(x - 24.5, y - 4.5, 49, 30); // bottom half of ghost
  ellipse(x, y, 49, 49); // top half of ghost
}

function whiteEye(x, y, c) {
  fill(c); // eye whites
  ellipse(x - 10, y - 5, 15, 15);
  ellipse(x + 10, y - 5, 15, 15);
}

function blueEye(x, y, c) {
  fill(c); // blue part of eyes
  ellipse(x + 10, y - 5, 10, 10);
  ellipse(x - 10, y - 5, 10, 10);
}

function leg(x, y, c) {
  // bottom triangles (ghost "legs")
  fill(c);
  triangleMove(x - 25, y + 25.5);
  triangleMove(x - 5, y + 25.5);
}

function triangleMove(x, y) {
  triangle(x, y, x + 15, y - 10, x + 30, y);
}

// Check for boundary collisions
function checkCollision(pos, velocity) {
  // Boundary collision for y
  if (pos.y < 0 || pos.y > height) {
    velocity.y = -velocity.y;
    pos.add(velocity);
  }
  // Boundary collision for x
  if (pos.x < 0 || pos.x > width) {
    velocity.x = -velocity.x;
    pos.add(velocity);
  }
}
