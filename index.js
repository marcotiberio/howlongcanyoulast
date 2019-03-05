let _start;

// define two constants, one for the eye aspect ratio to indicate
// blink and then a second constant for the number of consecutive
// frames the eye must be below the threshold
const EYE_AR_THRESH = 0.3;
const EYE_AR_CONSEC_FRAMES = 2;

// initialize the frame counters and the total number of blinks etc.
let _counter = 0;
let _total = 0;
let _blinked = false;
let _timeOut = -1;

// facial landmarks indexes
const L_START = 36;
const L_END = 41;
const R_START = 42;
const R_END = 47;

function distance(p0, p1) {
  return Math.sqrt(
    (p1.x - p0.x) * (p1.x - p0.x) + (p1.y - p0.y) * (p1.y - p0.y)
  );
}

// converts a [x1, y1, x2, y2, x3, y3, ...] array to [{x: x1, y: y1}, {x: x2, y: y3}, ...]
function shape(array) {
  let out = [];
  for (let i = 0; i < array.length; i += 2) {
    out.push({
      x: array[i],
      y: array[i + 1],
    });
  }
  return out;
}

function eyeAspectRatio(eye) {
  // compute the euclidean distances between the two sets of
  // vertical eye landmarks (x, y)-coordinates
  const A = distance(eye[1], eye[5]);
  const B = distance(eye[2], eye[4]);

  // compute the euclidean distance between the horizontal
  // eye landmark (x, y)-coordinates
  const C = distance(eye[0], eye[3]);

  // compute the eye aspect ratio
  const EAR = (A + B) / (2.0 * C);

  // return the eye aspect ratio
  return EAR;
}

function blink() {
  _blinked = true;
  _total += 1;

  const now = new Date();
  const timeDiff = (now - _start) / 1000; //in s
  // get seconds
  const seconds = Math.round(timeDiff);
  alert(`YOU LASTED ${seconds} SECONDS!`);
  _start = new Date();

  if (_timeOut > -1) {
    clearTimeout(_timeOut);
  }

  _timeOut = setTimeout(resetBlink, 500);
}

function resetBlink() {
  _blinked = false;
}

let _initialized = false;

// BRFv4DemoMinimal.js defines: var handleTrackingResults = function(brfv4, faces, imageDataCtx)
// Here we overwrite it. The initialization code for BRFv4 should always be similar,
// that's why we put it into its own file.
handleTrackingResults = function(
  brfv4, // namespace
  faces, // tracked faces
  imageDataCtx // canvas context to draw into
) {
  if (faces && !_initialized) {
    _initialized = true;
    _start = new Date();
    sw_init();
    setsize();
  }

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    if (
      face.state === brfv4.BRFState.FACE_TRACKING_START ||
      face.state === brfv4.BRFState.FACE_TRACKING
    ) {
      const v = shape(face.vertices);
      //const v = face.vertices;
      // if (i % 300 === 0) console.log('vertices: ', v);

      // extract the left and right eye coordinates, then use the
      // coordinates to compute the eye aspect ratio for both eyes
      const leftEye = v.slice(L_START, L_END + 1);
      const rightEye = v.slice(R_START, R_END + 1);
      // if (i % 300 === 0) console.log('eyes: ', leftEye, rightEye);
      const leftEAR = eyeAspectRatio(leftEye);
      const rightEAR = eyeAspectRatio(rightEye);
      // if (i % 300 === 0) console.log('EARs: ', leftEAR, rightEAR);

      // average the eye aspect ratio together for both eyes
      const EAR = (leftEAR + rightEAR) / 2.0;
      // if (i % 300 === 0) console.log('EAR: ', EAR);

      // check to see if the eye aspect ratio is below the blink
      // threshold, and if so, increment the blink frame counter
      if (EAR < EYE_AR_THRESH) {
        _counter += 1;
        // otherwise, the eye aspect ratio is not below the blink
        // threshold
      } else {
        // if the eyes were closed for a sufficient number of
        // then increment the total number of blinks
        if (_counter >= EYE_AR_CONSEC_FRAMES) {
          console.log('BLINKED!');
          blink();
        }

        // reset the eye frame counter
        _counter = 0;
      }

      /* ********************************************************************************
       *  FACE EDGES
       *
       *  Don't draw the face edges, but don't delete the code if we want it later
       * ******************************************************************************** */
      continue;

      // Let the color of the shape show whether you blinked.
      let color = '#00a0ff';
      if (_blinked) color = '#ffd200';

      // Face Tracking results: 68 facial feature points.
      // draw.drawTriangles(face.vertices, face.triangles, false, 1.0, color, 0.4);
      // draw.drawVertices(face.vertices, 2.0, false, color, 0.4);
      imageDataCtx.strokeStyle = color;
      for (var k = 0; k < face.vertices.length; k += 2) {
        imageDataCtx.beginPath();
        imageDataCtx.arc(
          face.vertices[k],
          face.vertices[k + 1],
          2,
          0,
          2 * Math.PI
        );
        imageDataCtx.stroke();
      }
    }
  }
};

// resize the canvas to match the window
function setsize() {
  if (!_initialized) return;
  the_canvas.width = the_canvas_container.clientWidth;
  the_canvas_width = the_canvas_container.clientWidth;
  the_canvas.height = the_canvas_container.clientHeight;
  the_canvas_height = the_canvas_container.clientHeight;
}

// grab a 100-pixel tall horizontal strip and move it left or right by 50px
function effect_tearing() {
  var pos_y = parseInt(Math.random() * (the_canvas_height - 100));

  the_canvas_ctx.drawImage(
    the_canvas,
    0,
    pos_y,
    the_canvas_width,
    100,
    parseInt(Math.random() * 2) * 100 - 50, // either 50 or -50
    pos_y,
    the_canvas_width,
    100
  );
}

// add an image to somewhere inside the canvas
function add_image() {
  var rnd_pic = document.getElementById('pic' + parseInt(Math.random() * 18));

  if (rnd_pic) {
    var img = new Image();
    img.onload = function() {
      the_canvas_ctx.drawImage(
        rnd_pic,
        parseInt(Math.random() * (the_canvas_width - rnd_pic.width)),
        parseInt(Math.random() * (the_canvas_height - rnd_pic.height))
      );
    };
    img.src = rnd_pic.src;
  }
}

// rewind and play one of the audio elements
function do_sound() {
  return; // is there a sound file?
  var rnd_snd = document.getElementById('snd' + parseInt(Math.random() * 7));
  rnd_snd.currentTime = 0;
  rnd_snd.play();
}

// main loop (on interval)
function slowloop() {
  if (document.hidden === true) {
    return;
  } // We musn't be rude
  if (Math.random() < 0.1) {
    effect_tearing();
  }
  if (Math.random() < 0.05) {
    screen_shake();
  }
  add_image();

  if (devmode) if (Math.random() < 0.1) vertline();

  // Chrome is mean and usually doesn't let us autoplay sound anymore :(
  // Fun fact, trying to use HTML5 audio causes this function to die when
  // run in IE from an "N" edition of windows, which is why this is last
  do_sound();
}

// bump the screen side-to-side
function screen_shake() {
  the_canvas_container.style.left = (Math.random() < 0.5 ? '-' : '') + '50px';
  setTimeout(function() {
    the_canvas_container.style.left = '0px';
  }, 50);
}

// draw vertical lines of "dead pixels"
function vertline() {
  var base_x = parseInt(Math.random() * (the_canvas_width - 10));

  for (let i = 0; i < 10; i++) {
    the_canvas_ctx.strokeStyle =
      'rgb(' +
      parseInt(Math.random() * 255) +
      ',' +
      parseInt(Math.random() * 255) +
      ',' +
      parseInt(Math.random() * 255) +
      ')';

    let line_x = base_x + i + Math.random() * 50 - 25;

    the_canvas_ctx.beginPath();
    the_canvas_ctx.moveTo(line_x + 0.5, 0.5);
    the_canvas_ctx.lineTo(line_x + 0.5, 0.5 + the_canvas_height);
    the_canvas_ctx.stroke();
  }
}

function sw_init() {
  the_canvas_container = document.getElementById('canvas_container');
  the_canvas = document.getElementById('the_canvas');
  the_canvas_ctx = the_canvas.getContext('2d');
  setsize();
  window.setInterval(slowloop, 100);
}

var the_canvas;
var the_canvas_container;
var the_canvas_ctx;
var the_canvas_height;
var the_canvas_width;

var devmode = false;
if (document.cookie.indexOf('devmode=enable') !== -1) {
  devmode = true;
}

window.addEventListener('resize', setsize);
//window.addEventListener('load', sw_init);
