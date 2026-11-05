const MAX_BUBBLES = 50;

const thoughts = [
  "reply to that email",
  "did I lock the door?",
  "remember the good version",
  "what time is it?",
  "open another tab",
  "I should write this down",
  "where did I put that?",
  "drink some water",
  "start over",
  "too many tabs",
  "make a list",
  "what if they noticed?",
  "check the time again",
  "finish one thing",
  "I forgot something",
  "look away from the screen",
  "save this for later",
  "why did I come here?",
  "remember to breathe",
  "one more thought",
  "I can do this tomorrow",
  "where should this go?",
  "stay focused",
  "play that song again"
];

const actions = [
  "scrolling",
  "replaying",
  "checking",
  "avoiding",
  "planning",
  "comparing",
  "refreshing",
  "waiting",
  "remembering",
  "forgetting"
];

let bubbles = [];
let lastMouseX = 0;
let lastMouseY = 0;
let nextThought = 0;
let pressure = 0;
let smears = [];
let ambientSound;
let popSounds = [];
let audioStarting = false;
let pendingPop = false;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("canvas-wrap");
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  textFont("Arial");
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  nextThought = millis() + random(300, 900);

  for (let i = 0; i < 7; i += 1) {
    addBubble(random(width), random(height), random(0.55, 0.8));
  }
}

function draw() {
  background(17, 17, 15, 230);

  const movement = dist(mouseX, mouseY, lastMouseX, lastMouseY);
  if (movement > 1) addSmear(mouseX, mouseY, movement);
  lastMouseX = mouseX;
  lastMouseY = mouseY;

  pressure = map(bubbles.length, 0, MAX_BUBBLES, 0, 100);

  if (millis() > nextThought) {
    addBubble(random(width), random(height), random(0.38, 1.05));
    nextThought = millis() + random(280, max(420, 1100 - pressure * 6));
  }

  drawSmears();

  for (let i = bubbles.length - 1; i >= 0; i -= 1) {
    const bubble = bubbles[i];
    bubble.update();
    bubble.display();
    if (bubble.dead()) bubbles.splice(i, 1);
  }

  updateStatus();
}

function addBubble(x, y, scale) {
  if (bubbles.length >= MAX_BUBBLES) return;

  const phrase = random() < 0.65 ? random(thoughts) : `${random(actions)}...`;
  bubbles.push(new ThoughtBubble(x, y, phrase, scale));
}

function mousePressed() {
  startAudio();

  for (let i = bubbles.length - 1; i >= 0; i -= 1) {
    if (bubbles[i].contains(mouseX, mouseY)) {
      bubbles[i].pop();
      bubbles.splice(i, 1);
      return;
    }
  }
}

function startAudio() {
  if (audioStarting) return;

  audioStarting = true;
  userStartAudio().then(() => {
    ambientSound = loadSound("assets/ambient.mp3", () => {
      ambientSound.setVolume(Math.pow(10, -5 / 20));
      ambientSound.loop();
    });
    const popFiles = ["pop.mp3", "pop1.mp3", "pop2.mp3"];
    popSounds = popFiles.map((file) => loadSound(`assets/${file}`, checkPopSoundsLoaded));
  });
}

function checkPopSoundsLoaded() {
  if (pendingPop && popSounds.length === 3 && popSounds.every((sound) => sound.isLoaded())) {
    playRandomPop();
    pendingPop = false;
  }
}

function playRandomPop() {
  if (popSounds.length === 0) return;
  random(popSounds).play();
}

function addSmear(x, y, movement) {
  smears.push({
    x,
    y,
    width: random(12, 34) + movement * 0.7,
    height: random(3, 11),
    rotation: atan2(y - lastMouseY, x - lastMouseX),
    life: 110,
    color: random([
      [235, 229, 210],
      [155, 180, 173],
      [204, 175, 117],
      [142, 157, 202]
    ])
  });

  if (smears.length > 120) smears.shift();
}

function drawSmears() {
  noStroke();

  for (let i = smears.length - 1; i >= 0; i -= 1) {
    const smear = smears[i];
    push();
    translate(smear.x, smear.y);
    rotate(smear.rotation);
    fill(smear.color[0], smear.color[1], smear.color[2], smear.life * 0.22);
    ellipse(0, 0, smear.width, smear.height);
    pop();

    smear.life -= 2.4;
    smear.width *= 0.985;
    if (smear.life <= 0) smears.splice(i, 1);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function updateStatus() {
  document.getElementById("thought-count").textContent = `${bubbles.length} thoughts`;
  document.getElementById("pressure-level").textContent = `pressure ${Math.round(pressure)}%`;
}

class ThoughtBubble {
  constructor(x, y, phrase, scale) {
    this.x = x;
    this.y = y;
    this.phrase = phrase;
    this.radius = random(45, 92) * scale + phrase.length * 0.55;
    this.vx = random(-0.28, 0.28);
    this.vy = random(-0.28, 0.28);
    this.angle = random(TWO_PI);
    this.spin = random(-0.003, 0.003);
    this.life = 255;
    this.fade = random(0.08, 0.3);
    this.blobPoints = [];
    const pointCount = floor(random(10, 17));
    for (let i = 0; i < pointCount; i += 1) {
      const angle = (TWO_PI / pointCount) * i;
      const variation = random(0.86, 1.14);
      this.blobPoints.push({ angle, variation });
    }
    this.fillColor = random([
      color(235, 229, 210, 27),
      color(155, 180, 173, 33),
      color(204, 175, 117, 28),
      color(142, 157, 202, 28)
    ]);
  }

  update() {
    const energy = 1 + pressure / 28;
    this.x += this.vx * energy + sin(frameCount * 0.01 + this.angle) * 0.12;
    this.y += this.vy * energy + cos(frameCount * 0.009 + this.angle) * 0.12;
    this.angle += this.spin * energy;
    this.life -= this.fade * (0.45 + pressure / 120);

    if (this.x < -this.radius) this.x = width + this.radius;
    if (this.x > width + this.radius) this.x = -this.radius;
    if (this.y < -this.radius) this.y = height + this.radius;
    if (this.y > height + this.radius) this.y = -this.radius;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    const alpha = constrain(this.life, 0, 255);

    fill(red(this.fillColor), green(this.fillColor), blue(this.fillColor), alpha * 0.22);
    stroke(232, 228, 216, alpha * 0.24);
    strokeWeight(1);
    this.drawBlob();
    ellipse(-this.radius * 0.45, this.radius * 0.55, this.radius * 0.18, this.radius * 0.18);
    ellipse(-this.radius * 0.62, this.radius * 0.73, this.radius * 0.09, this.radius * 0.09);

    noStroke();
    fill(245, 241, 229, alpha * 0.8);
    this.drawCenteredText(alpha);
    pop();
  }

  drawBlob() {
    beginShape();
    const points = this.blobPoints;
    const pointRadius = this.radius;
    const verticalScale = 0.675;

    const drawPoint = (point) => {
      const x = cos(point.angle) * pointRadius * point.variation;
      const y = sin(point.angle) * pointRadius * verticalScale * point.variation;
      curveVertex(x, y);
    };

    drawPoint(points[points.length - 1]);
    drawPoint(points[0]);
    for (const point of points) {
      drawPoint(point);
    }
    drawPoint(points[0]);
    drawPoint(points[1]);
    endShape();
  }

  drawCenteredText(alpha) {
    const fontSize = constrain(this.radius * 0.15, 9, 15);
    const maxWidth = this.radius * 1.42;
    const words = this.phrase.split(" ");
    const lines = [];
    let line = "";

    textSize(fontSize);
    textAlign(CENTER, CENTER);

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (textWidth(testLine) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);

    const lineHeight = fontSize * 1.15;
    const firstLineY = -((lines.length - 1) * lineHeight) / 2;
    fill(245, 241, 229, alpha * 0.86);

    lines.forEach((textLine, index) => {
      text(textLine, 0, firstLineY + index * lineHeight);
    });
  }

  contains(px, py) {
    const localX = px - this.x;
    const localY = py - this.y;
    const cosAngle = cos(-this.angle);
    const sinAngle = sin(-this.angle);
    const rotatedX = localX * cosAngle - localY * sinAngle;
    const rotatedY = localX * sinAngle + localY * cosAngle;
    const horizontal = this.radius;
    const vertical = this.radius * 0.675;
    return (rotatedX * rotatedX) / (horizontal * horizontal) +
      (rotatedY * rotatedY) / (vertical * vertical) <= 1;
  }

  pop() {
    if (popSounds.length > 0 && popSounds.every((sound) => sound.isLoaded())) {
      playRandomPop();
    } else {
      pendingPop = true;
    }
    this.life = 0;
  }

  dead() {
    return this.life <= 0;
  }
}
