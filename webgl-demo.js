// JS Code for Tunnel Game 

// Initialize the buffers we'll need. For this demo, we just
const canvas = document.querySelector('#glcanvas');


var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

var zspeed = 0.125;
var yspeed = 0.0;
var is_jumping = false;
var num_bricks = 100;
// const new_cube = Cube(gl,[0.0,0.0,-10.0],[1.0,4.0,1.0],[0,0,0],1);
const tunnel = Tunnel(gl,num_bricks);
const obstacles = build_obstacle(gl,25);
var camera_roation = 0.0;
var camera_radius = 1.0;
var eye = [0.0,-camera_radius,2.0];
var target = [0.0,-camera_radius,-3.0];
// This is with respect to the eye
var lightSourceLocation = [0.0,0.0,-100.0];
var pause_status = true;
var dM = 0.0;
var loading_image = true;
var inOctagon = false;


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

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl);
  initTexture();

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
      vertexNormal: gl.getAttribLocation(shaderProgram,'aVertexNormal'),
      vertexTexture: gl.getAttribLocation(shaderProgram,'aVertexTexture'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram,'uNMatrix')
    },

    light:{
      ambientColor : gl.getUniformLocation(shaderProgram,'uAmbientColor'),
      ambientColorObject : gl.getUniformLocation(shaderProgram,'uAmbientColorObject'),
      specularColor : gl.getUniformLocation(shaderProgram,'uPointLightingSpecularColor'),
      diffuseColor: gl.getUniformLocation(shaderProgram,'uPointLightingDiffuseColor'),
      lightLocation: gl.getUniformLocation(shaderProgram,'uPointLightingLocation'),
      eyeLocation: gl.getUniformLocation(shaderProgram,'eyeLocation'),
    },

    texture:{
      image:gl.getUniformLocation(shaderProgram,'sampler'),
      isTexture:gl.getUniformLocation(shaderProgram,'isTextured'),
    }

  };

  // Bind the keyboard and mouse keys
  key_bindings();

  // Manage UI
  manage_init();

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.

  var fps = 20  ;
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
      
       // Manage UI
       manage_ui();
 

      // If game is not paused tick elements
      if (!pause_status) tick_elements();
    
      then = now - (deltaTime%interval);
    }

  }

  requestAnimationFrame(render);
}

// Function to call for chaning any element per time step
function tick_elements() {

  


  // Camera Updates
  // Eye Updates
  eye[0] = camera_radius*Math.sin(camera_roation)
  eye[1] = -camera_radius*Math.cos(camera_roation)
  eye[2] -= zspeed;


  // Target updates
  target[0] = eye[0];
  target[1] = eye[1];
  target[2] = eye[2] -5;


  if(inOctagon){
        if(camera_radius < 0){
            is_jumping = false;
            yspeed = 0.06;
          }

        if (camera_radius > 1)  
          {
            camera_radius = 1;
            is_jumping = false;
            yspeed = 0;
          }

        if(is_jumping){
          yspeed += 0.006;
        }
          
        camera_radius += yspeed;
    }
    
  else{

    if(camera_radius < 2.5){
            camera_radius = 2.5;
            is_jumping = false;
            yspeed = 0.06;
          }

        if (camera_radius > 6)  
          {
            camera_radius = 6;
            is_jumping = false;
            yspeed = 0;
          }

        if(is_jumping){
          yspeed -= 0.02;
        }
        else
          yspeed = 0.0;
          
        camera_radius += yspeed;
    console.log(yspeed,camera_radius,is_jumping)
    }


  // All collision detection
  if(obstacles.detect_collision()) 
    {pause_status = true;
      eye[2] -= 1;
     lives -=1;
     } 

  tunnel.tick(eye);
  obstacles.tick();

}

//
// Draw the scene.
//
function drawScene(gl, programInfo) {



  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LESS);            // Near things obscure far things
  gl.blendFunc(gl.ONE , gl.SRC_COLOR);
  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Lighting 
  // Ambient Source
  gl.useProgram(programInfo.program);

  gl.uniform3f(programInfo.light.ambientColor,2.0 ,2.0 ,2.0 );
  // gl.uniform3f(programInfo.light.ambientColor,0.2,0.2,0.2);
  // Light Source Location
  gl.uniform3f(programInfo.light.lightLocation,lightSourceLocation[0], lightSourceLocation[1], lightSourceLocation[2]);
  // Diffuse Lighting
  if (!isNaN(dM))
    dM = 0.2*dM  + (1 - 0.2)*Math.max(0.0,dataDiff/5);
  else
    dM = Math.max(0.0,dataDiff/5);


  gl.uniform3f(programInfo.light.diffuseColor,dM ,  dM ,  dM );
  // Specular Lighting
  gl.uniform3f(programInfo.light.specularColor, 0.1,  0.1,  0.1);
  // Eye location 
  gl.uniform3f(programInfo.light.eyeLocation, eye[0],  eye[1],  eye[2]);




  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180*3;   // in radians
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

  // Draw Each obstacle
  gl.disable(gl.BLEND);
  gl.uniform3f(programInfo.light.ambientColorObject,1.0 ,1.0 ,1.0 );
  gl = obstacles.draw(gl,programInfo,projectionMatrix,modelViewMatrix);
  gl.uniform3f(programInfo.light.ambientColorObject,0.5 ,0.5 ,0.5 );  
  if(inOctagon)
   gl.enable(gl.BLEND);
  gl = tunnel.draw(gl,programInfo,projectionMatrix,modelViewMatrix);  
  

}

var mouseX,mouseY;
function key_bindings(){
  
  Mousetrap.bind('up', function() {rot_block -= 0.02},'keypress');
  Mousetrap.bind('w', function() {rot_block -= 0.02},'keypress');

  Mousetrap.bind('s', function() {rot_block += 0.02},'keypress');
  Mousetrap.bind('down', function() {rot_block += 0.02},'keypress');

  Mousetrap.bind('a', function() {camera_roation -= 2*Math.PI/num_sides},'keypress');
  Mousetrap.bind('left', function() {rot_tunnel -= 0.2*Math.PI/num_sides});

  Mousetrap.bind('d', function() {camera_roation += 2*Math.PI/num_sides},'keypress');
  Mousetrap.bind('right', function() {rot_tunnel += 0.2*Math.PI/num_sides});

  Mousetrap.bind('b', function() {eye[2] += 2*zspeed;},'keypress');
  Mousetrap.bind('t', function() {camera_roation += Math.PI;});

  Mousetrap.bind('space', function() {console.log("Jump"); 
                      if(inOctagon)
                        yspeed = -0.2;
                      else yspeed = 0.2;
                      console.log(yspeed)
                       is_jumping = true;});

  Mousetrap.bind('p', function() {pause_status = !pause_status; console.log(pause_status)});
  Mousetrap.bind('m', function() {soundInstance.paused = !soundInstance.paused});
};

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl) {
  // Load the 2 shaders from scripts defined in index.html
  vs = document.getElementById('vertex_shader');
  vsSource = vs.firstChild.textContent;
  frag = document.getElementById('fragment_shader');
  fsSource = frag.firstChild.textContent;

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


function build_obstacle(gl,num_obstacle){

  var obstacle_list = []
  var obj_ind = []
  for (var i = 0; i < num_obstacle; i++) {
    var ob = randint(2);
    if (ob == 0){
      var beam_monster = Beam(gl,[0.0,0.0,-i*5.0]);
      obstacle_list.push(beam_monster);
    }

    else if(ob == 1){
      var spike = Spike(gl,[0.0,0.0,-i*5.0],randint(num_sides));
      obstacle_list.push(spike);   
    }
    
    obj_ind.push(ob);
  };

  function draw_object(gl,programInfo,projectionMatrix,viewMatrix){

    for (var i = 0; i < num_obstacle; i++) {
      gl = obstacle_list[i].draw(gl,programInfo,projectionMatrix,viewMatrix);
    }

    return gl;
  }

  function tick() {
    if(obstacle_list[0].location[2]-eye[2] > 0){
      var old_octagon = obstacle_list.shift();
      var old_obj_ind = obj_ind.shift();
       // Append to the start
      old_octagon.location[2] = obstacle_list[num_obstacle-2].location[2] -5.0;
      obstacle_list.push(old_octagon);
      obj_ind.push(old_obj_ind);
      }

    for (var i = 0; i < num_obstacle; i++) {
      obstacle_list[i].tick();
    };
  }

  function detect_collision(){

    for (var i = 0; i < num_obstacle; i++) {
        if(obj_ind[i] == 0){
          if (obstacle_list[i].detect_collision(camera_radius,camera_roation,eye[2]))
            return true;
        }

        else if(obj_ind[i]== 1){
         if (obstacle_list[i].detect_collision(eye))
            return true; 
        }

        else
          console.log("Error Object not defined")


    }
  
    return false;
  }

  return{
    obstacle_list:obstacle_list,
    draw:draw_object,
    tick:tick,
    detect_collision:detect_collision
  }
}

// Display Variables
var score;
var score_h4;
var lives=3;
var lives_h4;
var levels=0;
var levels_h4;
var mute_box;
var pause_box;
var game_state;
function manage_init(){
  score = 0.0;
  score_h4 = document.getElementById('score_value');  
  lives = 10;
  lives_h4 = document.getElementById('live_value')

  level_h4 = document.getElementById('level_value');

  game_state = document.getElementById('state_value');
  
  mute_box = document.getElementById('mute_box');
  pause_box = document.getElementById('pause_box');


}

function manage_ui(){
  // Update Score
  score = -eye[2] + 2;
  score_h4.innerHTML = "Score:" + score*8;
  lives_h4.innerHTML = "Lives:" + lives;
  level_h4.innerHTML = "Level:" + levels;

  pause_box.checked = pause_status;
  if(soundInstance)
    mute_box.checked = soundInstance.paused;

  levels = Math.floor(score/100); 
  if(levels%2 == 0 ){
    inOctagon = true;
  }
  else
    inOctagon = false;


  if (lives < 0){
  	pause_status = true;
  	game_state.innerHTML = "Gameover:true"
  
  }

  else
  	game_state.innerHTML = "Gameover:false"


}


function initTexture(){
  wallTexture = gl.createTexture();

  // Preload a red texture until the image loads
  gl.bindTexture(gl.TEXTURE_2D, wallTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
              new Uint8Array([255, 0, 0, 255])); // red

  wallTexture.image =  new Image();

  wallTexture.image.src = "./wallTexture.jpg";

  wallTexture.image.onload = function() {
      console.log("Loading image"); 
      handleLoadedTexture(wallTexture);
      loading_image = false;
    }

}

function handleLoadedTexture(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }