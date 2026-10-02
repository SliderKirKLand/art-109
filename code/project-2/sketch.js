let objects = [];
let recMode = false;
let playMode = false;
let can;  // create a canvas reference
let modeSwitchTime = 25000; // seconds in milliseconds
let lastSwitchTime = 0;
let currentMode = 0; // 0 for default mode, 1 for first variation, 2 for second variation
let trailBuffer; // This will store the off-screen graphics buffer
let elapsedTime = 0;
let recordButton;
let playButton;
let modeButtons = []; // Array to hold mode buttons

function setup() {
  can = createCanvas(1980, 1080);
  trailBuffer = createGraphics(1980, 1080);
  // Add more objects here
  for (let i = 0; i < 20; i++) {
    objects.push(new CustomObject());
  }
  noStroke();
  frameRate(30);
  noLoop();

  
  // Create a button to toggle recording
  recordButton = createButton('Start Recording');
  recordButton.position(100, 250); // Position the button on the canvas
  recordButton.mousePressed(toggleRecording);

  // Create a button to toggle video
  playButton = createButton('Play Video');
  playButton.position(250, 250); // Position the button on the canvas
  playButton.mousePressed(toggleVideo);

  // Create buttons for each currentMode
  let modeNames = ['Default Mode', 'First Variation', 'Second Variation',];
  for (let i = 0; i < modeNames.length; i++) {
    let btn = createButton(modeNames[i]);
    btn.position(700, 160 + i * 30); // Position each button below the previous one
    btn.mousePressed(() => switchVariant(i)); // Attach function to switch mode
    modeButtons.push(btn); // Add button to the array
  }
}

function draw() {
  // Draw the objects to the off-screen buffer
  trailBuffer.background(40, 100);
  for (let obj of objects) {
    obj.move(trailBuffer); // Pass the buffer to draw on
    obj.updateColor(trailBuffer); // Pass the buffer to update color on
    obj.display(trailBuffer); // Pass the buffer to display on
  }
  

  // Draw a faded version of the buffer to the main canvas
  tint(255, 10); // 50% opacity
  // Make the trailer longer or shorter
 
  image(trailBuffer, 0, 0);
  
  // Clear previous tint
  noTint();

  if (millis() - lastSwitchTime > modeSwitchTime) {
    currentMode = (currentMode + 1) % 3;
    lastSwitchTime = millis();
  }

  // Draw the objects directly on the main canvas for the current frame
  for (let obj of objects) {
    obj.move();
    obj.updateColor();
    obj.display();
  }
  recordit();
}


function toggleVideo() {
  playMode = !playMode; // Toggle the play mode
  if (playMode) {
    playButton.html('Stop Video'); // Update button label
    lastSwitchTime = millis(); //Reset the switch timer when starting
    loop(); // Start looping to play video frames
  } else {
    playButton.html('Play Video'); // Update button label
    noLoop(); // Stop looping when playback is off
  }
}

function toggleRecording() {
  recMode = !recMode; // Toggle the recording mode
  if (recMode) {
    recordButton.html('Stop Recording'); // Update button label
    lastSwitchTime = millis(); //Reset the switch timer when starting
    loop(); // Start looping to record frames
  } else {
    recordButton.html('Start Recording'); // Update button label
    noLoop(); // Stop looping when recording is off
  }
}

function switchVariant(variant) {
  currentMode = variant;
  for (let obj of objects) {
    obj.resetForMode();
  }
  
  // Reset the timer
  lastSwitchTime = millis();
}

function recordit() {  
  if (recMode == true) {
      let ext = nf(frameCount, 4);
      saveCanvas(can, 'frame-' + ext, 'jpg');
      console.log("rec " + ext);
  }
}



class CustomObject {
  constructor() {
    this.centerX = random(width);
    this.centerY = random(height);
    this.radius = random (5,150);// Change the size of the object
    this.rotAngle = -90;
    this.velocityX = random(-5, 10);
    this.velocityY = random(-10, 5);
    this.nodes = random(1,5); // Dodecahedron

    this.size = random(5, 150); // Size of the object, affects falling speed
    this.initialAngle = random(0, TWO_PI); // Random initial angle for horizontal drifting
    this.velocityY = random(1, 3);

    this.nodeStartX = [];
    this.nodeStartY = [];
    this.nodeX = [];
    this.nodeY = [];
    this.angle = [];
    this.frequency = [];
    this.organicConstant = 1.0;
    this.shootOut = false;

    //For mode 1
    this.color1 = color("#84FFC9"); // Start color 
    this.color2 = color("#AAB2FF"); // End color
    //For mode 2
    this.color3 = color("#3E196E");
    this.color4 = color("#D46C76");
    //For mode 3
    this.color5 = color("#A4C6B8");
    this.color6 = color("#5E435D");

    this.color = this.color1; // Current color


    for (let i = 0; i < this.nodes; i++) {
      this.nodeStartX[i] = 0;
      this.nodeStartY[i] = 0;
      this.nodeX[i] = 0;
      this.nodeY[i] = 0;
      this.angle[i] = 0;
      this.frequency[i] = random(0, 1);// Change how frequence the objects will spin
    }
  }
  resetForMode() {
    if (currentMode == 0) {
      this.size = random(5, 15); // Smaller size for snowflakes
      this.velocityY = random(1, 3); // Consistent fall speed for snowflakes
      this.initialAngle = random(0, TWO_PI); // Randomize drifting angle
    } else if (currentMode == 1) {
      this.size = random(20, 50); // Medium size for sine wave
      this.velocityX = random(2, 4);
    } else if (currentMode == 2) {
      this.velocityX = random(-5, 10);
      this.velocityY = random(-10, 5); // Resetting to the default random motion as a fallback
      this.shootOut = false;
    }
  }

  display(buf) {
    let buffer = buf || this;
    // Calculate node starting locations
    for (let i = 0; i < this.nodes; i++) {
      this.nodeStartX[i] = this.centerX + cos(radians(this.rotAngle)) * this.radius;
      this.nodeStartY[i] = this.centerY + sin(radians(this.rotAngle)) * this.radius;
      this.rotAngle += 360.0 / this.nodes;
    }

    // Draw dodecahedron with the current color
    fill(this.color);
    curveTightness(this.organicConstant);
    beginShape();
    for (let i = 0; i < this.nodes; i++) {
      curveVertex(this.nodeX[i], this.nodeY[i]);
    }
    endShape(CLOSE);
  }

  move(buf) {
    let buffer = buf || this; 
    // Move object's center randomly
    this.centerX += this.velocityX;
    this.centerY += this.velocityY;

    // Change curve tightness
    this.organicConstant = 1 - ((abs(this.velocityX) + abs(this.velocityY)) * 0.1);

    // Move nodes
    for (let i = 0; i < this.nodes; i++) {
      this.nodeX[i] = this.nodeStartX[i] + sin(radians(this.angle[i])) * (this.velocityX * 2);
      this.nodeY[i] = this.nodeStartY[i] + sin(radians(this.angle[i])) * (this.velocityY * 2);
      this.angle[i] += this.frequency[i];
    }

    // Wrap around the canvas edges
    this.centerX = (this.centerX + width) % width;
    this.centerY = (this.centerY + height) % height;
    
    if (currentMode == 0) { 
      // Snowflake-like movement: falling down with some drifting
      this.centerY += pow(this.size, 0.5); // Falling speed depends on size
      let w = 0.02; // Angular speed for horizontal drifting
      let angle = w * frameCount + this.initialAngle; // Calculate horizontal drift angle
      this.centerX += sin(angle) * 2; // Drifting horizontally

      // Reset to the top when reaching the bottom
      if (this.centerY > height) {
        this.centerY = 0;
        this.centerX = random(width); // Start again from a random horizontal position
        this.size = random(5,15); // Random size for the snowflake
        this.initialAngle = random(0, TWO_PI); // Random initial angle for horizontal drifting
        this.velocityY = random(1, 3); // New random vertical speed
      }
    } else if (currentMode == 1) {
        // Move in both sine and cosine wave patterns
        this.centerX += this.velocityX;

        // Determine movement type based on the initial position
        if (this.centerY < height / 2) {
            // Sine wave movement for top half of the screen
            this.centerY = height / 4 + sin(this.centerX * 0.05) * 100; // Sin wave at the top half with amplitude of 100
        } else {
            // Cosine wave movement for bottom half of the screen
            this.centerY = (3 * height) / 4 + cos(this.centerX * 0.05) * 100; // Cos wave at the bottom half with amplitude of 100
        }

        // Wrap around when the object moves beyond the canvas
        if (this.centerX > width) {
            this.centerX = 0;
        } else if (this.centerX < 0) {
            this.centerX = width;
        }
    } else if (currentMode == 2) { // New mode: Circle around center and shoot out
      
      if (!this.shootOut) {
      let angleSpeed = 0.05;  // Speed of rotation
      let radius = 200;       // Radius of the circular path

  
      // Calculate the new position on the circular path
      this.centerX = width / 2 + radius * cos(frameCount * angleSpeed + this.velocityX);
      this.centerY = height / 2 + radius * sin(frameCount * angleSpeed + this.velocityY);
  
      // Add condition to shoot out in a random direction
      if (frameCount % 250 === 0) { // Shoot out every 250 frames
          this.velocityX = random(-10, 10);
          this.velocityY = random(-10, 10);
          this.shootOut = true;
      }      
      } else {
        // After shooting out, continue moving in a straight line
        this.centerX += this.velocityX;
        this.centerY += this.velocityY;

        // Check collisions with other objects after shoot out
        for (let other of objects){
          if (other !== this && this.checkCollision(other)){
            this.handleCollision(other);
          }
        }
      }
    }

    if (currentMode == 0) {
      this.centerX = (this.centerX + width) % width;
      this.centerY = (this.centerY + height) % height;
    }

    // Wrap around the canvas edges (common for all modes)
    this.centerX = (this.centerX + width) % width;
    this.centerY = (this.centerY + height) % height;
    
  }
  checkCollision(other) {
    let distance = dist(this.centerX, this.centerY, other.centerX, other.centerY);
    let combinedRadius = this.radius + other.radius;
    return distance < combinedRadius;
  }

  handleCollision(other) {
    // Swap velocities to simulate a bounce
    let tempVelocityX = this.velocityX;
    let tempVelocityY = this.velocityY;
    this.velocityX = other.velocityX;
    this.velocityY = other.velocityY;
    other.velocityX = tempVelocityX;
    other.velocityY = tempVelocityY;

    // Add slight offset to prevent sticking
    this.centerX += this.velocityX;
    this.centerY += this.velocityY;
    other.centerX += other.velocityX;
    other.centerY += other.velocityY;
  }
  updateColor(buf) {
    let buffer = buf || this;
    // Calculate the color gradient based on the object's position
    let percentX = this.centerX / width;
    let percentY = this.centerY / height;
    this.color = lerpColor(this.color1, this.color2, percentX + percentY);
    if (currentMode === 0) {
      // Original color code here
      // ... [rest of the original code]

    } else if (currentMode === 1) {
      // First variation: e.g., color based on X position only
      let percentX = this.centerX / width;
      this.color = lerpColor(this.color3, this.color4, percentX);

    } else if (currentMode === 2) {
      // Second variation: e.g., color based on Y position only
      let percentY = this.centerY / height;
      this.color = lerpColor(this.color5, this.color6, percentY);
    }
  }
}

function switchVariant(variant) {
  currentMode = variant;
  for (let obj of objects) {
      obj.resetForMode();
  }
  
  // Reset the timer:
  resetTimerForVariant(variant);
}