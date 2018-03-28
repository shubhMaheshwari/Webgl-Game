// JS Code for Tunnel Game 

// Initialize the buffers we'll need. For this demo, we just

const canvas = document.querySelector('#glcanvas');
var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

var num_bricks = 25;

const new_cube = Cube(gl,[0.0,0.0,-10.0],[1.0,4.0,1.0],[0,0,0],1);
const tunnel = Tunnel(gl,num_bricks);
var camera_roation = 0.0;
var camera_radius = 1;
var eye = [0.0,-camera_radius,5.0];
var target = [0.0,-camera_radius,0.0];
var pause_status = true;

// Run the game 
main();
//
// Start here
//
function main() {
  // If we don't have a GL context, give up now
  if(!canvas)
  {
    alert("No canvas found")
  }

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  // Bind the keyboard and mouse keys
  key_bindings();

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.

  var fps = 10  ;
  var now;
  var then = Date.now();
  var interval = 1000/fps;

  // Draw the scene repeatedly
  function render() {
    requestAnimationFrame(render);

    now = Date.now();
    deltaTime = now - then;

    if(deltaTime > interval){
      drawScene(gl, programInfo);
      
      // If game is not paused tick elements
      if (!pause_status) tick_elements();
    
      then = now - (deltaTime%interval);
    }

  }

  requestAnimationFrame(render);
}

// Function to call for chaning any element per time step
function tick_elements() {
  // Camera Movements
  // Eye Updates
  eye[0] = camera_radius*Math.sin(camera_roation)
  eye[1] = -camera_radius*Math.cos(camera_roation)
  eye[2] -= 0.5;


  // Target updates
  target[0] = eye[0];
  target[1] = eye[1];
  target[2] = eye[2] -5;

  // new_cube.location[2] -= 0.5
  tunnel.tick(eye);
}

//
// Draw the scene.
//
function drawScene(gl, programInfo) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  
  projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,fieldOfView,aspect,zNear,zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene. And initialize to a distance
  var modelViewMatrix = mat4.create();
  mat4.lookAt(modelViewMatrix,eye,target,[0,1,0]);
  // setTimeout(alert("4 seconds"),4000);

  // mat4.invert(modelViewMatrix,modelViewMatrix);
  gl = new_cube.draw(gl,programInfo,projectionMatrix,modelViewMatrix);
  // Draw Each element
  gl = tunnel.draw(gl,programInfo,projectionMatrix,modelViewMatrix);  


}

function key_bindings(){
  
  Mousetrap.bind('up', function() {rot_block -= 0.01});
  Mousetrap.bind('w', function() {rot_block -= 0.01});

  Mousetrap.bind('s', function() {rot_block += 0.01});
  Mousetrap.bind('down', function() {rot_block += 0.01});

  Mousetrap.bind('a', function() {camera_roation -= Math.PI/4});
  Mousetrap.bind('left', function() {camera_roation -= Math.PI/4});

  Mousetrap.bind('d', function() {camera_roation += Math.PI/4});
  Mousetrap.bind('right', function() {camera_roation += Math.PI/4});

  Mousetrap.bind('p', function() {pause_status = !pause_status; console.log(pause_status)});


};

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}