// helper for the various default formats
const formats = {
  a3: [297, 420],
  a4: [210, 297],
  a5: [148, 210],
};

axidraw_options = {
  speed_pendown: 25,
  speed_penup: 75,
  accel: 75,
  pen_pos_down: 40,
  pen_pos_up: 60,
  pen_rate_lower: 50,
  pen_rate_raise: 75,
  pen_delay_down: 0,
  pen_delay_up: 0,
  const_speed: false,
  model: 2,
  port: null,
  port_config: 0,
}

let currentShapes = []; // shapes to draw
let currentFormat = formats.a4; // current paper format
let currentMargin = 0; // margin on each side of the canvas
let currentAspectRatio = 1; // drawing aspect ratio
let currentJSONData = null; // json data
if (window.shapes) {
  currentJSONData = JSON.parse(window.shapes); // load data from window
}
let currentSplineResolution = 10; // resolution of the splines
let optimize = false; // whether the drawing should be optimized before drawing

function setup() {
  let canvas = createCanvas(currentFormat[0] / currentFormat[1] * window.innerHeight, window.innerHeight);
  // Move the canvas so it’s inside our <div id="sketch-holder">.
  canvas.parent('sketch-holder');

  // load the drawing in the default path if it exists
  updateDrawing();

  // prevent drawing continuously
  noLoop();
}


function draw() {
  background(0);
  currentShapes.forEach(s => s.draw());
}

/**
 * Update the paper format and refresh the preview canvas
 * @param {Array<number>} format format in mm x mm
 */
function updateFormat(format) {
  resizeCanvas(format[0], format[1], true);
  updateShapes(currentShapes, format, currentMargin, currentAspectRatio);
  redraw();
}

/**
 * Updates the margin to the specified value and redraws the preview canvas
 * @param {number} margin margin in mm
 */
function updateMargin(margin) {
  currentMargin = margin;
  updateShapes(currentShapes, currentFormat, currentMargin, currentAspectRatio);
  redraw();
}

/**
 * Fit the shapes to the paper size
 * @param {Array<Fresco.Shape>} shapes 
 * @param {Array<number>} format 
 * @param {number} margin 
 * @param {number} aspectRatio 
 */
function updateShapes(shapes, format, margin, aspectRatio) {
  let nuFormat = [format[0] / format[1] * window.innerHeight, window.innerHeight];
  let nuMargin = margin * window.innerHeight / format[1];
  // scale_xx is the scale in x if a point with 1 in absciss is mapped to the
  // edge of the paper minus the margin   
  const scale_xx = nuFormat[0] - 2 * nuMargin;
  // scale_xy is the scale in x if a point with 1 in ordinate is mapped to the
  // edge of the paper minus the margin
  const scale_xy = (nuFormat[1] - 2 * nuMargin) * aspectRatio;
  // we keep the smallest of the 2 scales
  const scale_X = min(scale_xx, scale_xy);
  const scale_Y = scale_X / aspectRatio;

  // scale all points
  shapes.forEach(shape => {
    shape.vertices.forEach(point => {
      point.x = (point.x - 0.5) * scale_X;
      point.y = -(point.y + 0.5) * scale_Y;
    });
  });

  currentShapes = shapes;
}

/**
 * Update the shapes based on the current json data and draws them
 */
function updateDrawing() {
  
  if (currentJSONData) {
    if ("shapes" in currentJSONData) {
    }
    else {
      currentJSONData = {shapes: [currentJSONData]};
    }

    // convert the drawing to shapes
    let shapes = [];

    currentJSONData['shapes'].forEach(shape => {
      shapes.push(shapeFromJSON(shape, false));
    })
    
    // extract aspect ratio
    currentAspectRatio = currentJSONData['shapes'][0]['canvas_width'] / currentJSONData['shapes'][0]['canvas_height'];
    
    // fit the shapes to canvas/paper
    updateShapes(shapes, currentFormat, currentMargin, currentAspectRatio);
  }
  else {
    currentShapes = [];
  }

  // redraw
  redraw();
}

/**
 * Load a drawing from a JSON file ad update drawing once done
 * @param {string} filepath path to file
 */
function loadDrawing(filepath) {
  console.log('Loading', currentJSONData);
  loadJSON(filepath, function(response) {
      // Parsing JSON string into object
      console.log('response', response);
      currentJSONData = response;
      updateDrawing();
  });
}

/**
 * Load a JSON file from localhost
 * @param {string} filepath path to file
 * @param {*} callback callback function to perform once loading is done
 */
function loadJSON(filepath, callback) {   
  var http = new XMLHttpRequest();
  http.overrideMimeType("application/json");
  http.open('GET', filepath, true); // Replace 'appDataServices' with the path to your file
  http.onreadystatechange = function () {
    if (http.readyState == 4 && http.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(http.responseText);
    }
  };
  http.send(null);  
}