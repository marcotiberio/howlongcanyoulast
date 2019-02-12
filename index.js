// let smiling = {};
// let neutral = {};
// let smiled = false;

let start = new Date();

function blink() {
  _blinked = true;

  const now = new Date();
  const timeDiff = (now - start) / 1000; //in s
  // get seconds
  const seconds = Math.round(timeDiff);
  alert(`YOU LASTED ${seconds} SECONDS!`);
  start = new Date();

  if (_timeOut > -1) {
    clearTimeout(_timeOut);
  }

  _timeOut = setTimeout(resetBlink, 150);
}

function resetBlink() {
  _blinked = false;
}

function storeFaceShapeVertices(vertices) {
  for (var i = 0, l = vertices.length; i < l; i++) {
    _oldFaceShapeVertices[i] = vertices[i];
  }
}

var _oldFaceShapeVertices = [];
var _blinked = false;
var _timeOut = -1;

// BRFv4DemoMinimal.js defines: var handleTrackingResults = function(brfv4, faces, imageDataCtx)
// Here we overwrite it. The initialization code for BRFv4 should always be similar,
// that's why we put it into its own file.
handleTrackingResults = function(
  brfv4, // namespace
  faces, // tracked faces
  imageDataCtx // canvas context to draw into
) {
  // var p0 = new brfv4.Point();
  // var p1 = new brfv4.Point();
  // var setPoint = brfv4.BRFv4PointUtils.setPoint;
  // var calcDistance = brfv4.BRFv4PointUtils.calcDistance;

  for (var i = 0; i < faces.length; i++) {
    var face = faces[i];
    if (
      face.state === brfv4.BRFState.FACE_TRACKING_START ||
      face.state === brfv4.BRFState.FACE_TRACKING
    ) {
      // simple blink detection

      // A simple approach with quite a lot false positives. Fast movement can't be
      // handled properly. This code is quite good when it comes to
      // staring contest apps though.

      // It basically compares the old positions of the eye points to the current ones.
      // If rapid movement of the current points was detected it's considered a blink.

      var v = face.vertices;

      if (_oldFaceShapeVertices.length === 0) storeFaceShapeVertices(v);

      var k, l, yLE, yRE;

      // Left eye movement (y)

      for (k = 36, l = 41, yLE = 0; k <= l; k++) {
        yLE += v[k * 2 + 1] - _oldFaceShapeVertices[k * 2 + 1];
      }
      yLE /= 6;

      // Right eye movement (y)

      for (k = 42, l = 47, yRE = 0; k <= l; k++) {
        yRE += v[k * 2 + 1] - _oldFaceShapeVertices[k * 2 + 1];
      }

      yRE /= 6;

      var yN = 0;

      // Compare to overall movement (nose y)

      yN += v[27 * 2 + 1] - _oldFaceShapeVertices[27 * 2 + 1];
      yN += v[28 * 2 + 1] - _oldFaceShapeVertices[28 * 2 + 1];
      yN += v[29 * 2 + 1] - _oldFaceShapeVertices[29 * 2 + 1];
      yN += v[30 * 2 + 1] - _oldFaceShapeVertices[30 * 2 + 1];
      yN /= 4;

      var blinkRatio = Math.abs((yLE + yRE) / yN);

      if (blinkRatio > 12 && (yLE > 0.4 || yRE > 0.4)) {
        console.log(
          'blink ' +
            blinkRatio.toFixed(2) +
            ' ' +
            yLE.toFixed(2) +
            ' ' +
            yRE.toFixed(2) +
            ' ' +
            yN.toFixed(2)
        );

        blink();
      }

      // Let the color of the shape show whether you blinked.

      //var color = 0x00a0ff;
      var color = '#00a0ff';

      if (_blinked) {
        color = '#ffd200';
      }

      // Face Tracking results: 68 facial feature points.

      // draw.drawTriangles(face.vertices, face.triangles, false, 1.0, color, 0.4);
      // draw.drawVertices(face.vertices, 2.0, false, color, 0.4);

      // brfv4Example.dom.updateHeadline(
      //   'BRFv4 - advanced - face tracking - simple blink' +
      //     'detection.\nDetects an eye  blink: ' +
      //     (_blinked ? 'Yes' : 'No')
      // );

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

      storeFaceShapeVertices(v);

      // Smile Detection

      //   setPoint(face.vertices, 48, p0); // mouth corner left
      //   setPoint(face.vertices, 54, p1); // mouth corner right

      //   var mouthWidth = calcDistance(p0, p1);

      //   setPoint(face.vertices, 39, p1); // left eye inner corner
      //   setPoint(face.vertices, 42, p0); // right eye outer corner

      //   var eyeDist = calcDistance(p0, p1);
      //   var smileFactor = mouthWidth / eyeDist;

      //   smileFactor -= 1.4; // 1.40 - neutral, 1.70 smiling

      //   if (smileFactor > 0.25) smileFactor = 0.25;
      //   if (smileFactor < 0.0) smileFactor = 0.0;

      //   smileFactor *= 4.0;

      //   if (smileFactor > 0.5) {
      //     smiling['face' + 1] += 1;
      //     neutral['face' + 1] = 0;
      //     if (smiling['face' + 1] > 2) {
      //       smiled = true;
      //       nyanTip.style.display = 'none';
      //       nyanGif.style.display = 'block';
      //       if (nyanAudio.paused) {
      //         nyanAudio.fastSeek(5.4);
      //         nyanAudio.play();
      //       }
      //     }
      //   } else {
      //     smiling['face' + 1] = 0;
      //     neutral['face' + 1] += 1;
      //     if (neutral['face' + 1] > 5) {
      //       nyanGif.style.display = 'none';
      //       nyanAudio.pause();
      //     }
      //   }
    }
  }
};

// resize the canvas to match the window
function setsize() {
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
  return;
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
window.addEventListener('load', sw_init);

// onResize = function() {
//   // fill whole browser
//   var imageData = document.getElementById('_imageData');
//   var ww = window.innerWidth;
//   var wh = window.innerHeight;
//   var s = wh / imageData.height;\
//   if (imageData.width * s < ww) {
//     s = ww / imageData.width;
//   }
//   var iw = imageData.width * s;
//   var ih = imageData.height * s;
//   var ix = (ww - iw) * 0.5;
//   var iy = (wh - ih) * 0.5;
//   imageData.style.transformOrigin = '0% 0%';
//   imageData.style.transform =
//     'matrix(' + s + ', 0, 0, ' + s + ', ' + ix + ', ' + iy + ')';
// };
