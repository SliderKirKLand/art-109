
//declare variables
var bgcolor = 'white';
var bin;

var save;
var test;

var canvasHistory = [];  // Stores the history of the canvas
var redoStack = [];  // Stores the undone actions
  

function preload(){
  //image setup
  test = loadImage("assets/astro_angry.gif");
  closeW = loadImage('assets/closeW.png');
  minimize = loadImage('assets/minus.png');
  square = loadImage('assets/square.png');
  //font
  f = loadFont('assets/W95.ttf');
}
function setup() {

  //define canvas properties
  createCanvas(700, 800);
  background(bgcolor);
  setupCanvas();
  saveState();
  textFont(f);
}

function setupCanvas() {
  noStroke();

  //CREATE ELEMENTS:
  
  

  //create a colorpicker
  colorPicker = createColorPicker('#000000');
  colorPicker.position(160, 365);
  colorPicker.style('width', '50px');
  colorPicker.style('height', '22px');
  colorPicker.style('background-image', 'url()');

  //create a colorpicker end
  colorPickerEnd = createColorPicker('#000000');
  colorPickerEnd.position(105, 365);
  colorPickerEnd.style('width', '50px');
  colorPickerEnd.style('height', '22px');
  colorPickerEnd.style('background-image', 'url()');


  //create a dropdown menu
  sel = createSelect();
  sel.position(249, 365);
  sel.option("Normal Brush");
  sel.option("Spiral Brush");
  sel.option("Star Brush");
  sel.option("Spray Paint Brush");
  sel.option('Gradient Brush');
  sel.option("Draw Square");
  sel.option("Draw Triangle");
  sel.option("Draw Circle");
  sel.option("Eraser");
  sel.style('background-image', 'url()');
  sel.style('font-family', 'W95');
  sel.style('font-size', '16px');

  //create a slider
  slider = createSlider(1, 100, 20, 1);
  slider.position(470, 365);
  slider.style('width', '180px');

  //trash all button
  button = createButton('');
  button.position(105, 410);
  button.style('width', '30px');
  button.style('height', '30px');
  button.style('background-image', 'url(assets/bin.png)');
  button.style('background-size', 'cover');
  button.style('background-color', '#fff2eb');
  button.style('border', 'none');
  button.mousePressed(clearBG);

  //save image button
  button = createButton("");
  button.position(145, 410);
  button.style('width', '30px');
  button.style('height', '30px');
  button.style('background-image', 'url(assets/save.png)');
  button.style('background-size', 'cover');
  button.style('background-color', '#fff2eb');
  button.style('border', 'none');
  button.mousePressed(SaveImage);

  // Rectangle tool button
  rectangleButton = createButton('');
  rectangleButton.position(145, 610);
  rectangleButton.style('width', '30px');
  rectangleButton.style('height', '30px');
  rectangleButton.style('background-image', 'url(assets/square.png)');
  rectangleButton.style('background-size', 'cover');
  rectangleButton.style('background-color', '#fff2eb');
  rectangleButton.style('border', 'none');
  rectangleButton.mousePressed(() => sel.selected("Draw Square"));

  // Triangle tool button
  triangleButton = createButton('');
  triangleButton.position(105, 610);
  triangleButton.style('width', '30px');
  triangleButton.style('height', '30px');
  triangleButton.style('background-image', 'url(assets/triangle.png)');
  triangleButton.style('background-size', 'cover');
  triangleButton.style('background-color', '#fff2eb');
  triangleButton.style('border', 'none');
  triangleButton.mousePressed(() => sel.selected("Draw Triangle"));


  // Star tool button
  StarButton = createButton('');
  StarButton.position(105, 560);
  StarButton.style('width', '30px');
  StarButton.style('height', '30px');
  StarButton.style('background-image', 'url(assets/star.png)');
  StarButton.style('background-size', 'cover');
  StarButton.style('background-color', '#fff2eb');
  StarButton.style('border', 'none');
  StarButton.mousePressed(() => sel.selected("Star Brush"));

  // Circle tool button
  CircleButton = createButton('');
  CircleButton.position(145, 560);
  CircleButton.style('width', '30px');
  CircleButton.style('height', '30px');
  CircleButton.style('background-image', 'url(assets/circle.png)');
  CircleButton.style('background-size', 'cover');
  CircleButton.style('background-color', '#fff2eb');
  CircleButton.style('border', 'none');
  CircleButton.mousePressed(() => sel.selected("Draw Circle"));

  // Eraser tool button
  eraserButton = createButton('');
  eraserButton.position(105, 460);
  eraserButton.style('width', '30px');
  eraserButton.style('height', '30px');
  eraserButton.style('background-image', 'url(assets/eraser.png)');
  eraserButton.style('background-size', 'cover');
  eraserButton.style('background-color', '#fff2eb');
  eraserButton.style('border', 'none');
  eraserButton.mousePressed(() => sel.selected("Eraser"));

  // Gradient tool button
  GradientButton = createButton('');
  GradientButton.position(145, 460);
  GradientButton.style('width', '30px');
  GradientButton.style('height', '30px');
  GradientButton.style('background-image', 'url(assets/gradient.png)');
  GradientButton.style('background-size', 'cover');
  GradientButton.style('background-color', '#fff2eb');
  GradientButton.style('border', 'none');
  GradientButton.mousePressed(() => sel.selected("Gradient Brush"));

  // brush tool button
  BrushButton = createButton('');
  BrushButton.position(105, 510);
  BrushButton.style('width', '30px');
  BrushButton.style('height', '30px');
  BrushButton.style('background-image', 'url(assets/paintbrush.png)');
  BrushButton.style('background-size', 'cover');
  BrushButton.style('background-color', '#fff2eb');
  BrushButton.style('border', 'none');
  BrushButton.mousePressed(() => sel.selected("Normal Brush"));
  
  // Spiral tool button
  SpiralButton = createButton('');
  SpiralButton.position(145, 510);
  SpiralButton.style('width', '30px');
  SpiralButton.style('height', '30px');
  SpiralButton.style('background-image', 'url(assets/spring.png)');
  SpiralButton.style('background-size', 'cover');
  SpiralButton.style('background-color', '#fff2eb');
  SpiralButton.style('border', 'none');
  SpiralButton.mousePressed(() => sel.selected("Spiral Brush"));
  
}


function draw() {

  //Take advantage of the fact that elements in p5js are always on top, so you can always draw the menu bars to prevent the user from drawing in the menu bar
  noStroke();

  //black lines
  fill('#000000');
  rect(80,-50,3,height);
  
  
  //draw a menu bar
  fill('#fff2eb');
  rect(0, 0, width, 100);


  //left side bar
  fill('#fff2eb');
  rect(-20,100,100,height);

  fill('#f9e7db');
  rect(-20,350,100,height);

  //draw a bottom bar
  fill('#fff2eb');
  rect(0, 750, width, 100);
  
  //black lines
  fill('#000000');
  rect(0, 0, width, 35);
  rect(0, 100, width, 3);
  rect(0, 750, width, 3);
  rect(-620, 350, width, 3);

  //draw a top menu bar
  fill('#f3833f');
  rect(0, 0, width, 32);

  fill('#ffffff');
  rect(670,2,20,20);

  fill('#ffffff');
  rect(640,2,20,20);

  fill('#ffffff');
  rect(610,2,20,20);


  //draw images
  image(test, 600, 25, 80, 80);
  image(closeW, 672, 4 , 15 , 15);
  image(square, 642, 4.5 , 15 , 15);
  image(minimize, 614, 10 , 15 , 15);
  

  //create text
  fill('black');
  textSize(16);
  text("Brush Thickness", 375, 55);

  fill('black');
  textSize(16);
  text("Brush Type/Eraser", 150, 55);

  fill('black');
  textSize(16);
  text("Color picker", 5, 55);

  fill('black');
  textSize(16);
  text("File", 5, 20)

  fill('black');
  textSize(16);
  text("Edit", 55, 20)
  
  fill('black');
  textSize(16);
  text("View", 105, 20)

  fill('black');
  textSize(16);
  text("Image", 165, 20)

  fill('black');
  textSize(16);
  text("Option", 225, 20)

  

  //Check if mouse is pressed and draw the lines and stuff
  if (mouseIsPressed && mouseY > 100 && mouseX > 50 && mouseY < 750) {
    if (sel.value() == "Normal Brush") {
      //normal paint brush

      //draw a line with the correct color
      stroke(colorPicker.color());
      strokeWeight(slider.value());
      line(pmouseX, pmouseY, mouseX, mouseY);
      saveState();
    }
    if (sel.value() == "Eraser") {
      //eraser

      //draw a line in background color
      stroke(bgcolor);
      strokeWeight(slider.value());
      line(pmouseX, pmouseY, mouseX, mouseY);
      saveState();
    }
    if (sel.value() == "Draw Square") {
      //draw rectangle with brush thickness at mousex and y
      fill(colorPicker.color());
      rect(mouseX, mouseY, slider.value(), slider.value());
      saveState();
    }
    if (sel.value() == "Draw Circle") {
      //draw rectangle with brush thickness at mousex and y
      fill(colorPicker.color());
      ellipse(mouseX, mouseY, slider.value(), slider.value());
      saveState();
    }
    if (sel.value() == "Draw Triangle") {
      //draw triangle with brush thickness at mousex and y
      fill(colorPicker.color());
      triangle(mouseX, mouseY, mouseX + slider.value(), mouseY + slider.value(), mouseX - slider.value(), mouseY + slider.value());
      saveState();
    }
    //Spiral brush, change dashLenght to make it more spiral
    if (sel.value() == "Spiral Brush") {
      stroke(colorPicker.color());
      strokeWeight(slider.value());
      let dashLength = 500;
      for (let i = 0; i < dist(pmouseX, pmouseY, mouseX, mouseY); i += dashLength * 2) {
        let x1 = lerp(pmouseX, mouseX, i / dist(pmouseX, pmouseY, mouseX, mouseY));
        let y1 = lerp(pmouseY, mouseY, i / dist(pmouseX, pmouseY, mouseX, mouseY));
        let x2 = lerp(pmouseX, mouseX, (i + dashLength) / dist(pmouseX, pmouseY, mouseX, mouseY));
        let y2 = lerp(pmouseY, mouseY, (i + dashLength) / dist(pmouseX, pmouseY, mouseX, mouseY));
        line(x1, y1, x2, y2);
        saveState();
      }
    }
    // Spray Paint Brush
    if (sel.value() == "Spray Paint Brush") {
      for (let i = 0; i < 50; i++) {
        let angle = random(TWO_PI);
        let radius = random(slider.value());
        let x = mouseX + cos(angle) * radius;
        let y = mouseY + sin(angle) * radius;
        noStroke();
        fill(colorPicker.color());
        ellipse(x, y, 2, 2);
      }
      saveState();
    }
    // Star Brush
    if (sel.value() == "Star Brush") {
      fill(colorPicker.color());
      noStroke();
      drawStar(mouseX, mouseY, slider.value(), slider.value() * 2, 5);  // Draw a star
      saveState();
    }
    if (sel.value() == "Gradient Brush") {
      gradientBrush(pmouseX, pmouseY, mouseX, mouseY);
      saveState();
    }
  }
}

function gradientBrush(x1, y1, x2, y2) {
  let steps = int(dist(x1, y1, x2, y2) / 5);  // Adjust the number of steps based on distance
  let startColor = colorPicker.color();  // Get start color from the color picker
  let endColor = colorPickerEnd.color();  // Get end color from the color picker
  
  // Draw gradient brush by interpolating color along the line
  for (let i = 0; i < steps; i++) {
    let interColor = lerpColor(startColor, endColor, i / steps);  // Interpolate the color
    let x = lerp(x1, x2, i / steps);  // Interpolate the x position
    let y = lerp(y1, y2, i / steps);  // Interpolate the y position
    stroke(interColor);
    strokeWeight(slider.value());  // Set stroke weight based on slider value
    point(x, y);  // Draw a point at the interpolated position
  }
}

function clearBG() {
  //clear the background by filling everything with white
  fill(bgcolor);
  noStroke();
  rect(0, 100, width, height - 100);
}

// Function to set the current tool to 'eraser' when the eraser button is clicked
function setEraser() {
  stroke(bgcolor);
  strokeWeight(slider.value());
  line(pmouseX, pmouseY, mouseX, mouseY);
  saveState();
}

function SaveImage() {
  // Define the coordinates and dimensions of the white drawing area
  let x = 95; // Starting x-coordinate for the white screen (to the right of the sidebar)
  let y = 100; // Starting y-coordinate for the white screen (below the top menu)
  let w = width - 100; // Width of the white screen (remaining width after sidebar)
  let h = height - 150; // Height of the white screen (remaining height after menus)

  // Capture only the white screen area and save as an image
  var to_save = get(x, y, w, h);
  to_save.save("canvas.png");
}

function saveState() {
  // Save the current state of the canvas
  canvasHistory.push(get());
  redoStack = [];  // Clear redo stack when new action is performed
}

function undo() {
  if (canvasHistory.length > 1) {
    redoStack.push(canvasHistory.pop());  // Move the last state to redo stack
    let previousState = canvasHistory[canvasHistory.length - 1];  // Get the previous state
    clearBG();  // Clear the current canvas
    image(previousState, 0, 0);  // Display the previous state
  }
}

function redo() {
  if (redoStack.length > 0) {
    let redoState = redoStack.pop();  // Get the last undone state
    canvasHistory.push(redoState);  // Add it back to history
    clearBG();  // Clear the current canvas
    image(redoState, 0, 0);  // Display the redo state
  }
}

function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

//check for key press
function keyPressed() {

  //check for the correct key
  if (key == 'n' || key == 'N') {
    //change brush type to normal brush
    sel.selected("Normal Brush");
  } else if (key == 's' || key == 'S') {
    //change bbrush type to splatter brush
    sel.selected("Spray Paint Brush");
  } else if (key == 'e' || key == 'E') {
    //change brush type to eraser
    sel.selected("Eraser");
  } else if (key == '+') {
    //increase brush thickness
    slider.value(slider.value() + 1);
  } else if (key == '-') {
    //reduce brush thickness
    slider.value(slider.value() - 1);
  } else if (key == 'r' || key == 'R') {
    //clear the background by calling clearBG() function
    clearBG();
  } else if (key == 'c' || key == 'C') {
    //generate a random hex code, and set that as the colorpicker color
    var randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    colorPicker = createColorPicker(randomColor);
    colorPicker.position(160, 365);
    colorPicker.style('width', '50px');
    colorPicker.style('height', '22px');
    colorPicker.style('background-image', 'url()');
  } else if (key == 'i' || key == 'I') {
    //save the canvas as an image by calling saveImage()
    SaveImage()
  } else if (key == 'q'|| key == 'Q'){
    //switch brush type to rectangle
    sel.selected("Draw Square");
  }else if (key == 't'|| key == 'T'){
    //switch brush type totriangle
    sel.selected("Draw Triangle");
  }else if (key === 'z' || key === 'Z'){
    // Undo when 'Z' key is pressed
    undo(); 
  }else if (key === 'y' || key === 'Y') {
    // Redo when 'Y' key is pressed
    redo();
  }else if (key === 'a' || key === 'A') {
    sel.selected("Star Brush");
  }
}
