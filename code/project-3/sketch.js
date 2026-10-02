let bgc;
let battery;
let toggle = true;
let isJamToggle = true;
let useRealTime = true;
let timeSpeed = 5000; 

let baseMPH;
let fluctuationAmplitude = 10; // Max fluctuation range for MPH
let fluctuationSpeed = 0.1; // Speed of the fluctuation



function preload () {
  battery = loadImage("image/battery.png")
}

function setup() {
  createCanvas(950, 350);
  angleMode(DEGREES);
  bgc = color(0);

}
function draw() {
  
  // Toggle between real-time and accelerated time
  let h, m, s, mil;

  if (useRealTime) {
    // Use real system time
    h = hour(); // Current hour (0–23)
    m = minute(); // Current minute (0–59)
    s = second(); // Current second (0–59)
    mil = millis() % 1000 / 1000; // Fraction of a second
  } else {
    // Use accelerated time with multiplier
    let realMillis = millis() * timeSpeed; // Adjust time with multiplier
    h = floor((realMillis / 3600000) % 24); // Calculate hours (0–23)
    m = floor((realMillis / 60000) % 60); // Calculate minutes (0–59)
    s = floor((realMillis / 1000) % 60); // Calculate seconds (0–59)
    mil = (realMillis % 1000) / 1000; // Fraction of a second
  }
  
  // Map values to blocks
  let hourBlock = map(h, 0, 23, 0, width - 705);
  let minuteBlock = map(m, 0, 59, 0, width - 650);
  let secondBlock = map(s, 0, 59, 0, width - 860);
  let miliBlock = map(mil, 0, 1, 0, width - 860);
  let phaseBlock = map(h % 6 + m / 60, 0, 6, 0, 70);// Daily phase progress
  
  
  // Detect Morning, Afternoon, Evening, and Night
  let isMorning = h >= 6 && h < 12; //6 AM - 12 PM
  let isAfternoon = h >= 12 && h < 18;//12PM-6PM
  let isEvening = h >= 18 && h < 24;//6PM-12AM
  let isNight = h >= 0 && h < 6;//12AM-6AM

  // Detect Traffic Jam Times
  let isJamMorning = h >= 8 && h < 10; // 8–10 AM
  let isJamEvening = h >= 15 && h < 18; // 3–6 PM
  let isJam = isJamMorning || isJamEvening; // Combine both time ranges


  // Background Transition Logic
  let morningColor = color(30, 30, 30, 220); 
  let afternoonColor = color(60, 60, 60, 220); 
  let nightColor = color(0); 
  

  if (h >= 0 && h < 6) {
    // Morning: Blend from black to morningColor
    bgc = lerpColor(nightColor, morningColor, map(h + m / 60, 0, 6, 0, 1));
  } else if (h >= 6 && h < 12) {
    // Afternoon: Blend from morningColor to afternoonColor
    bgc = lerpColor(morningColor, afternoonColor, map(h + m / 60 - 6, 0, 6, 0, 1));
  } else {
    // Evening/Night: Reset to black
    bgc = nightColor;
  }


  background(bgc);

  
  drawBatteryMeter(phaseBlock, isEvening, isNight);
  drawCHGBar(miliBlock, isEvening, isNight);
  drawMinuteBar(minuteBlock, isEvening, isNight);
  drawHourBar(hourBlock, isEvening, isNight);
  drawPWRBar(secondBlock, isEvening, isNight);
  drawLabelsAndIcons(isEvening, isNight, m, isMorning, isAfternoon);
  
  // Blinking indicator
  if (toggle) {
    fill(151, 62, 55);
    ellipse(55, 110, 15, 15);
  }
  // Traffic Jam text
  if (isJam && isJamToggle) {
    fill(151, 62, 55);
    text("TRAFFIC JAM", width / 1.25, height - 35);
  }

  if (frameCount % 30 === 0) {
    toggle = !toggle;
  }

  if (frameCount % 60 === 0) {
    isJamToggle = !isJamToggle;
  }


  applyScanlines();
  applyDistortion();
  

  
  function drawBatteryMeter(phaseBlock, isEvening, isNight) {
    push();
    translate(-17,-85);
    fill(167, 211, 197, 255); // Actual bar color
    noStroke();
    if (isEvening || isNight) applyGlow(color(167, 212, 197, 200)); // Glow effect
    rect(70, height - -2 - phaseBlock, 70, phaseBlock); // Filled bar
  
    // Add black horizontal stripes
    let stripeSpacing = 10; // Spacing between stripes
    for (let y = 290; y < 265 + 90; y += stripeSpacing) { // Fixed position within the battery meter
      fill(0); // Black color for stripes
      rect(70, y, 70, 2); // Stripe height is 2px
    }
  
    let phases = ["Midnight", "Morning", "Afternoon", "Evening"];
    let currentPhase = floor(h / 6); // 0: Morning, 1: Afternoon, etc.
    fill(148, 188, 176, 255);
    textSize(20);
    text(phases[currentPhase], 105, 245); // Label the current phase
    pop();
  
    // Battery image
    
    image(battery, 53, 180, 70, 90);
  }
  
  function drawCHGBar(miliBlock, isEvening, isNight) {
    push();
    translate(-17,-85);
    if (isEvening || isNight) applyGlow(color(167, 212, 197, 200)); // Glow effect
    drawRectFill(180 + (width - 860 - miliBlock), 330, miliBlock, 20, -0.2, -0.2, color(167, 211, 197, 255));
    drawRect(178.5, 330, 90, 20, -0.2, -0.2, color(101, 125, 117, 255), 4); // Outline
    pop();
  }
  
  function drawMinuteBar(minuteBlock, isEvening, isNight) {
    push();
    translate(-17,-85);
    if (isEvening || isNight) applyGlow(color(167, 212, 197, 200)); // Glow effect
    if (minuteBlock > 0) {
      drawRectFill1(272, 300, minuteBlock, 50, 0, 10, color(94, 167, 109, 255));
    }
    drawRect(271, 300, 300, 50, 0, -0.2, color(101, 125, 117, 255), 4); // Outline
    pop();
  }
  
  function drawHourBar(hourBlock, isEvening, isNight) {
    push();
    translate(-17,-85);
    if (isEvening || isNight) applyGlow(color(167, 212, 197, 200)); // Glow effect
    drawRect(572, 300, 245, 50, -0.2, 0, color(101, 125, 117, 255), 4); // Gray outline
    if (hourBlock > 0) {
      drawRectFill1(572, 300, hourBlock, 50, 10, 0, color(167, 212, 197, 255));
    }
    pop();
  }
  
  function drawPWRBar(secondBlock, isEvening, isNight) {
    push();
    translate(-17,-85);
    if (isEvening || isNight) applyGlow(color(167, 212, 197, 200)); // Glow effect
    drawRect(825, 300, 90, 20, -0.2, -0.2, color(101, 125, 117, 255), 4); // Outline
    drawRectFill(827, 300, secondBlock, 20, -0.2, -0.2, color(151, 62, 55)); // Filled bar
    pop();
  }
  
  function drawLabelsAndIcons(isEvening, isNight, m, isMorning, isAfternoon) {
    push();
    translate(-17,-85);
    if (isEvening || isNight) applyGlow(color(167, 212, 197, 200)); // Glow effect
  
    fill(164, 65, 61, 255);
    textSize(30);
    text("PWR", 870, 345);
  
    fill(167, 212, 198, 255);
    textSize(30);
    text("CHG", 225, 310);
  
    // ECO middle label
    fill(121, 184, 147, 255);
    drawRoundedShape(520, 250, 85, 37.5, 15);
    textSize(30);
    fill('black');
    text("ECO", 568, 270);
  
    // Top left text
    fill(148, 188, 176, 255);
    text("HYBRID SYSTEM INDICATOR", 290, 195);
  
    // Odometer
    fill(148, 188, 176, 255);
    text("ODO 1895" + m, 150, 405);
    textSize(20);
    text("MI", 250, 409);
    
    let fluctuation = sin(frameCount * fluctuationSpeed) * fluctuationAmplitude;

    // Calculate fluctuated MPH
    let fluctuatedMPH = baseMPH + fluctuation;
    fluctuatedMPH = round(fluctuatedMPH); 

    // MPH text
    textSize(50);
    text(`${fluctuatedMPH} MPH`, width / 2, height - -50);
    if (isMorning) {
      baseMPH = 15;
    } else if (isAfternoon) {
      baseMPH = 5;
    } else if (isEvening) {
      baseMPH = 65;
    } else if (isNight) {
      baseMPH = 85;
    }
  

    pop();
  }

  

  // Display current time numerically
  fill(148,188,176,255);
  textSize(50);
  textAlign(CENTER, CENTER);
  text(
    nf(h, 2) + ":" + nf(m, 2) + ":" + nf(s, 2),
    width / 1.15,
    height / 1.9
  );
}

  // Toggle time mode with key press
  function keyPressed() {
    if (key === 'T' || key === 't') {
    useRealTime = !useRealTime; // Toggle between real-time and accelerated time
    console.log(`SpeedTime`)
    }
  }

// Add scanlines
function applyScanlines() {
  noFill();
  stroke(0, 50); // Transparent black lines
  strokeWeight(2); // Adjust line thickness
  for (let y = 0; y < height; y += 5) {
    line(0, y, width, y);
  }
}

// Add screen distortion (subtle horizontal shifting)
function applyDistortion() {
  let offset = 2; // Distortion intensity
  loadPixels();
  let d = pixelDensity();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (x % offset === 0) {
        let index = 4 * ((y * width + x) * d);
        pixels[index] = constrain(pixels[index] + random(-10, 10), 0, 255);
        pixels[index + 1] = constrain(pixels[index + 1] + random(-10, 10), 0, 255);
        pixels[index + 2] = constrain(pixels[index + 2] + random(-10, 10), 0, 255);
      }
    }
  }
  updatePixels();
}

function applyGlow(glowColor) {
  drawingContext.shadowBlur = 20; // Intensity of the glow
  drawingContext.shadowColor = glowColor; // Glow color
}

function drawRoundedShape (x, y, w, h, offset){
  beginShape();

  //bottom left corner
  vertex(x, y + h);

  //top left corner
  bezierVertex(x,y + h/4, x + w / 4, y, x + w /3, y);

  //top right corner
  vertex (x + w + offset, y);
 

  //bottom right corner
  bezierVertex(x + w + w /8, y + h / 2, x + w, y + h, x + w *0.75, y + h);

  //bottom left (closing)
  vertex(x + w /3, y +h);
  vertex(x, y + h);

  endShape(CLOSE);
}

function drawRectFill(x, y, w, h, transform, transform2, fillColor) {
  push();
  fill(fillColor); // Set fill color for the filling shape
  noStroke(); // Disable stroke
  beginShape();
  vertex(x, y + h);         // Bottom-left
  vertex(x + w, y + h);     // Bottom-right
  vertex(x + w - h * transform, y); // Top-right 
  vertex(x - h * transform2, y);   // Top-left 
  endShape(CLOSE);
  pop();
}

function drawRect(x, y, w, h, transform, transform2, strokeColor, strokeWeightValue = 1) {
  push();
  noFill(); // Disable fill
  stroke(strokeColor); // Set stroke color for the outline
  strokeWeight(strokeWeightValue); // Set stroke weight
  beginShape();
  vertex(x, y + h);         // Bottom-left
  vertex(x + w, y + h);     // Bottom-right
  vertex(x + w - h * transform, y); // Top-right 
  vertex(x - h * transform2, y);   // Top-left 
  endShape(CLOSE);
  pop();
}

function drawRectFill1(x, y, w, h, transform, transform2, fillColor) {
  push();
  fill(fillColor); // Set fill color for the filling shape
  noStroke(); // Disable stroke
  beginShape();
  vertex(x, y + h);         // Bottom-left
  vertex(x + w, y + h);     // Bottom-right
  vertex(x + w + transform, y);     // Top-right 
  vertex(x + transform2, y);        // Top-left 
  endShape(CLOSE);
  pop();
}