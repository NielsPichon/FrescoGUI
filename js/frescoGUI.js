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
  pen_pos_down: 17,
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

let darkTheme = false;
const black = '263440';
let canvasColor = black;

let canvasBuffers; // buffer we are going to draw to, to avoid freezing the page
let textCanvasBuffer; // buffer to draw text to

let currentShapes = []; // shapes to draw
let currentFormat = formats.a3; // current paper format
let currentMargins = [30, 30, 30, 30]; // margin on each side of the canvas
let currentAspectRatio = 1; // drawing aspect ratio
let currentJSONData = null; // json data
let currentSplineResolution = 10; // resolution of the splines
let optimize = false; // whether the drawing should be optimized before drawing
let currentLastLayer = 0;
let selectedLayers = [0];

// extra title
let currentText = '';
let titleSize = 4;
let titleBottomMargin = 30;
let textShapes = [];

if (window.shapes) {
  currentJSONData = JSON.parse(window.shapes); // load data from window
}
else {
  currentJSONData = JSON.parse(defaultShape);
}

function toggleOptimize() {
  optimize = document.getElementById('optimizeCheckbox').checked;
}

function setup() {
  let [w, h] = [490, currentFormat[1] / currentFormat[0] * 490];
  let canvas = createCanvas(w, h);
  loadFonts();

  // Move the canvas so it’s inside our <div id="sketch-holder">.
  canvas.parent('sketch-holder');

  // create the canvas buffer
  canvasBuffers = [createGraphics(w, h)];
  textCanvasBuffer = createGraphics(w, h)

  // load the drawing in the default path if it exists
  updateDrawing(true, false);

  // add the layers to the ui now as they need to first have the drawing data parsed to exist
  addLayers()

  // prevent drawing continuously
  noLoop();

  // disable key presses to avoid triggering random event while typing text
  disableKeyPresses();

  // finally update the canvas buffer
  drawToBuffer(true);
}

function draw() {
  background(colorFromHex(canvasColor));
  for (let i = 0; i < canvasBuffers.length; i++) {
    if (selectedLayers.includes(i)) {
      image(canvasBuffers[i], 0, 0);
    }
  }
  image(textCanvasBuffer, 0, 0);
}

async function drawToBuffer(shouldRedraw=true) {
  canvasBuffers.forEach(b => b.clear());
  currentShapes.forEach(s => {
    while (s.layer > canvasBuffers.length - 1) {
      newBuff = createGraphics(width, height);
      newBuff.clear();
      canvasBuffers.push(newBuff);
    }
    s.drawToBuffer(canvasBuffers[s.layer]);
  });
  if (shouldRedraw) {
    redraw();
  }
}

/**
 * Set the canvas/ paper color for preview
 * @param {String} color # hex code of the color 
 */
function setCanvasColor(color) {
  canvasColor = colorFromHex(color);
}

/**
 * Changes the color of a layer
 * @param {number} layerIdx index of the layer to set the color of
 * @param {String} color hex code of the desired color 
 */
function setLayerColor(layerIdx, color, shouldRedraw=true) {
  layerColors[layerIdx % layerColors.length] = color;
  if (shouldRedraw) {
    updateDrawing();
  }
}

/**
 * Update the paper format and refresh the preview canvas
 * @param {Array<number>} format format in mm x mm
 */
function updateFormat(format) {
  resizeCanvas(490, format[1] / format[0] * 490, true);
  currentFormat = format;
  updateDrawing();
}

/**
 * Update the resolution with which the splines will be drawn.
 * @param {number} resolution Number of subdivisions along a spline
 */
function updateResolution(resolution) {
  console.log('new res', resolution)
  currentSplineResolution = resolution;
  updateShapes(currentShapes, currentFormat, currentMargins, currentAspectRatio);
  drawToBuffer();
}

/**
 * Fit the shapes to the paper size
 * @param {Array<Fresco.Shape>} shapes 
 * @param {Array<number>} format 
 * @param {number} margin 
 * @param {number} aspectRatio 
 */
function updateShapes(shapes, format, margins, aspectRatio) {
  let nuFormat = [490, 490 * currentFormat[1] / currentFormat[0]];
  let nuMargin = margins[0] * height / format[1];
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

    shape.poligonize();
  });

  // set shapes color
  shapes.forEach(s => {
    let nuColor = layerColors[s.layer % layerColors.length];
    if (nuColor == null) {
      nuColor = 'fff';
    }
    s.setColor(colorFromHex(nuColor))
  });

  // filter out shapes that are not on a selected layer
  // and store as current shapes
  // currentShapes = [];
  // shapes.forEach(s => {
  //   currentShapes.push(s);
  // })
  currentShapes = [...shapes];
}

async function drawText() {
  textCanvasBuffer.clear();

  if (currentText != '') {
    textShapes = Fresco.Futural.drawText(
      currentText,
      titleSize,
      createVector(0, -height / 2 + 490 / currentFormat[0] * titleBottomMargin),
      false
    );
    textShapes.forEach(s => s.drawToBuffer(textCanvasBuffer));
  }
}

/**
 * Update the shapes based on the current json data and draws them
 */
async function updateDrawing(initLayers=false, shouldRedraw=true) {
  
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

    if (initLayers) {
      // compute the number of layers
      currentLastLayer = 0;
      shapes.forEach(s => {
        if (s.layer > currentLastLayer) {
          currentLastLayer = s.layer;
        }
      });

      // init all layers as selected
      selectedLayers = [...Array(currentLastLayer + 1).keys()];
    }

    // extract aspect ratio
    currentAspectRatio = currentJSONData['shapes'][0]['canvas_width'] / currentJSONData['shapes'][0]['canvas_height'];
    
    // fit the shapes to canvas/paper
    updateShapes(shapes, currentFormat, currentMargins, currentAspectRatio);
  }
  else {
    currentShapes = [];
  }

  // redraw
  if (shouldRedraw) {
    drawToBuffer()

    // add text if relevant
    drawText();
  }
}

/**
 * Update the text on the drawing. A value of null will update without changing the text, and '' will remove the text entirely
 * @param {String} text 
 */
function updateText(text) {
  if (text != null) {
    currentText = text;
  }
  drawText();
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
      updateDrawing(true);
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



/**
 * Make sure the user knows what they are doing upon closing the page. 
 * @returns 
 */
window.onbeforeunload = function() {
  if (axidrawStatus.state = 'playing') {
    sendPauseResumeRequest();
  }
  return "Do you really want to leave the page? All unsaved settings will be lost and the axidraw will be stopped.";
}

/**
 * Make sure we stop the axidraw before closing the page
 */
window.addEventListener('unload', () => {
  sendResetRequest(true);
  console.log('Stopping axidraw.')
});

/**
 * Function for loading settings
 */
function loadSettings(input) {
  let file = input.files[0];

  let reader = new FileReader();
  reader.readAsText(file);

  reader.onload = function() {
    let result = JSON.parse(reader.result);

    // process settings file
    currentJSONData = result.drawing;
    axidraw_options = result.settings.axidraw_options;
    currentSplineResolution = result.settings.spline_res;
    currentMargins[0] = result.settings.margin;
    currentMargins = [currentMargins[0], currentMargins[0], currentMargins[0], currentMargins[0]];
    optimize = result.settings.optimize;
    currentFormat = [result.settings.format.x, result.settings.format.y];
    currentText = result.settings.text;
    titleSize = result.settings.textSize;
    titleBottomMargin = result.settings.textPos;

    let oldLayerCount = currentLastLayer;

    // update drawing
    updateDrawing(true, false);
    selectedLayers = result.settings.layers;

    // update UI
    setAxidrawModelDropdown();
    setParametersDefault();
    setDefaultFormat();
    setDefaultMargins();
    setTextDefaults();
    document.getElementById('optimizeCheckbox').checked = optimize;
    resetLayers(oldLayerCount);
  };
}
