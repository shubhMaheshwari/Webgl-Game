// @params: 
// gl = our canvas 
// pos = position vector
// dim = dimensions of the cube
// rot = rotaion in z axis
var rot_block = -0.1;
var cock_block = -3;
var num_sides = 8; 


function Cube(gl,pos,dim,rot,color) { 

  // console.log("Cube Location at creation",pos);
  // Create a buffer for the cube's vertex positions.
  var location = pos;
  var cubeRotation = rot;

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.
  // w,h,d = width,depth,height /2
  w = dim[0]/2;
  h = dim[1]/2;
  d = dim[2]/2;

  const positions = [
    // Front face
    -w, -h,  d,
     w, -h,  d,
     w,  h,  d,
    -w,  h,  d,

    // Back face
    -w, -h, -d,
    -w,  h, -d,
     w,  h, -d,
     w, -h, -d,

    // Top face
    -w,  h, -d,
    -w,  h,  d,
     w,  h,  d,
     w,  h, -d,

    // Bottom face
    -w, -h, -d,
     w, -h, -d,
     w, -h,  d,
    -w, -h,  d,

    // Right face
     w, -h, -d,
     w,  h, -d,
     w,  h,  d,
     w, -h,  d,

    // Left face
    -w, -h, -d,
    -w, -h,  d,
    -w,  h,  d,
    -w,  h, -d,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face.

  const faceColors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
  ];

  // Convert the array of colors into a table for all the vertices.

  var colors = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];
    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);


  function draw_object(gl,programInfo,projectionMatrix,viewMatrix){
    // console.log(location)

  var modelViewMatrix = mat4.create();
    
  mat4.fromTranslation(modelViewMatrix,     // matrix to translate
                 location);  // amount to translate

  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation[2],     // amount to rotate in radians
              [0,0,1]);       // axis to rotate around (Z)

  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation[0],     // amount to rotate in radians
              [1,0,0]);       // axis to rotate around (Z)

  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation[1],     // amount to rotate in radians
              [0,1,0]);       // axis to rotate around (Z)

  modelViewMatrix = matrixMultiply(viewMatrix,modelViewMatrix);


  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
    
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
      // vertexAttribPointer @params
      // numComponents = 3;
      // type = gl.FLOAT;
      // normalize = false;
      // stride = 0;
      // offset = 0;
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition,3,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  
  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(programInfo.attribLocations.vertexColor,4,gl.FLOAT,false,0,0);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);
  // Set the shader uniforms
  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,false,projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,false,modelViewMatrix);

  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

  return gl;

  };

  function tick() {
    cubeRotation[0] = rot_block;
    // rot_block += 0.00001;
    cubeRotation[1] = cock_block;
    // Only take values between pi/2 - pi and 3pi/2 to 0
    // mod_block = cock_block/Math.PI - Math.floor(cock_block/Math.PI);
    // if(0 <= mod_block &&  mod_block <= 0.5)
    //   cock_block += 0.0001;

    // else
    //   cock_block = Math.PI/4;

  };

  return {
    location:location,
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    draw: draw_object,
    tick: tick
  };
};


function Octagon(gl,pos,radius,sides){
  // console.log(radius,sides)
  var location = pos;

  var cubelist = [];

  var angle = 2*Math.PI/sides;
  for (var i = 0; i < sides; i++) {
    var cube_location = [];
    vec3.add(cube_location,location,[radius*Math.cos(i*angle), radius*Math.sin(i*angle), 0]);

    // width depends on distance from center w = tan(angle/2)*2*r
    var new_cube = Cube(gl,cube_location,[2*radius*Math.tan(angle/2),0.1,4.0],[rot_block,cock_block,i*angle+ Math.PI/2] ,1);
    cubelist.push(new_cube);
  }

  function draw_object(gl,programInfo,projectionMatrix,viewMatrix){
  
  var modelViewMatrix = mat4.create();
  // console.log(location)
  mat4.fromTranslation(modelViewMatrix,     // matrix to translate
                 location);  // amount to translate


  modelViewMatrix = matrixMultiply(viewMatrix,modelViewMatrix);

  for (var i = 0; i < sides;  i++) {
    gl = cubelist[i].draw(gl,programInfo,projectionMatrix,modelViewMatrix);
  };

  return gl;
  };

  return {
    location:location,
    sides:sides,
    cubelist: cubelist,
    draw: draw_object
  }
};


function Tunnel(gl,bricks){

  var octagonlist = [];

  for (var i = 0; i < bricks; i++) {
    // width depends on distance from center w = tan(angle/2)*2*r
    var new_oct = Octagon(gl,[0.0,0.0,-2.0*i],2,8);
    octagonlist.push(new_oct);
  }

  function draw_object(gl,programInfo,projectionMatrix,viewMatrix){
  
  var modelViewMatrix = mat4.create();

  mat4.fromTranslation(modelViewMatrix,[0.0,0.0,0.0]);  // amount to translate
  

  modelViewMatrix = matrixMultiply(viewMatrix,modelViewMatrix);


  for (var i = 0; i < bricks;  i++,'\r') {
    // console.log(i)
    gl = octagonlist[i].draw(gl,programInfo,projectionMatrix,modelViewMatrix);
  };

  return gl;
  };

  function tick(eye) {
    if(octagonlist[0].location[2]-eye[2] > 2*bricks){
      console.log(octagonlist[0].location[2],eye[2])
      var old_octagon = octagonlist.shift()
       // Append to the start
      old_octagon.location[2] = octagonlist[bricks-2].location[2] -2.0;
      octagonlist.push(old_octagon);

      }


    // Update each cube
    for (var i = 0; i < bricks; i++) {
       for (var j = 0; j < num_sides; j++) {
         octagonlist[i].cubelist[j].tick()
       };
     }; 

  
  }



  return {
    bricks:bricks,
    octagonlist: octagonlist,
    draw:draw_object,
    tick:tick
  }

};



function monsters(){
  

  var type = Math.random() %3;



  function draw_object(){

  };

  function tick(){

  };

}