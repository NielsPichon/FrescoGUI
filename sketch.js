// this is where the temporary json buffer will be stored
// upon calling the axidraw GUI from a sketch
const defaultPath = "./tmp.json";

// helper for the various default formats
const formats = {
  a3: [297, 420],
  a4: [210, 297],
  a5: [148, 210],
};

let currentShapes = []; // shapes to draw
let currentFormat = formats.a3; // current paper format
let currentMargin = 0; // margin on each side of the canvas
let currentAspectRatio = 1; // drawing aspect ratio
let currentFilePath = defaultPath; // path to the serialized drawing

function setup() {
  let canvas = createCanvas(594, 840);
  // Move the canvas so it’s inside our <div id="sketch-holder">.
  canvas.parent('sketch-holder');

  // load the drawing in the default path if it exists
  loadDrawing(defaultPath);

  // prevent drawing continuously
  noLoop();
}


function draw() {
  background(0);
  currentShapes.forEach(s => s.draw());
}

function updateFormat(format) {
  resizeCanvas(format[0], format[1], true);
  updateShapes(currentShapes, format, currentMargin, currentAspectRatio);
  redraw();
}

function updateMargin(margin) {
  currentMargin = margin;
  updateShapes(currentShapes, currentFormat, currentMargin, currentAspectRatio);
  redraw();
}

function updateShapes(shapes, format, margin, aspectRatio) {
  // scale_xx is the scale in x if a point with 1 in absciss is mapped to the
  // edge of the paper minus the margin   
  const scale_xx = format[0] - 2 * margin
  // scale_xy is the scale in x if a point with 1 in ordinate is mapped to the
  // edge of the paper minus the margin
  const scale_xy = (format[1] - 2 * margin) * aspectRatio
  // we keep the smallest of the 2 scales
  const scale_X = min(scale_xx, scale_xy)
  const scale_Y = scale_X / aspectRatio

  // scale all points
  shapes.forEach(shape => {
    shape.vertices.forEach(point => {
      point.x = format[0] / 2 + (point.x - 0.5) * scale_X
      point.y = format[1] / 2 + (point.y - 0.5) * scale_Y
    })
  })

  currentShapes = shapes;
}

function loadDrawing(filepath){
  currentFilePath = filepath;

  // load drawing from json
  let shapesJSON = []

  if ("shapes" in shapesJSON) {
    shapesJSON = shapesJSON["shapes"];
  }
  else {
    shapesJSON = [shapesJSON];
  }

  // convert the drawing to shapes
  let shapes = [];
  shapesJSON.forEach(shape => {
    shapes.push(shapeFromJSON(shape));
  })
  
  // extract aspect ratio
  currentAspectRatio = shapesJSON[0]['canvas_width'] / shapesJSON[0]['canvas_height'];

  // fit the shapes to canvas/paper
  updateShapes(shapes, currentFormat, currentMargin, currentAspectRatio);

  // redraw
  redraw();
}