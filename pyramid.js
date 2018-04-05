function Pyramid(gl,pos,dim,rot,color_ind) { 

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
    -w,  0,  d,
     w,  0,  d,
     0,  h,  0,

    // Back face
    -w,  0, -d,
     w,  0, -d,
     0,  h,  0,

    // Right face
    -w,  0,  d,
    -w,  0, -d,
     0,  h,  0,

    // Left face
     w,  0,  d,
     w,  0, -d,
     0,  h,  0,

    // Bottom face
    -w, 0, -d,
     w, 0, -d,
     w, 0,  d,
    -w, 0,  d,


  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  var faceColors = [];
  // Color depends on purpose 
  // For monsters we will use only red color
  if (color_ind === 1){
    faceColors = [
    [1.0,  0.0,  0.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [1.0,  0.0,  0.0,  1.0],    // Bottom face: blue
    [1.0,  0.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  0.0,  1.0],    // Left face: purple
  ];
  }


  // for each face.
  // For tunnel multiple colors
  else if(color_ind == 0){
  faceColors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
  ];
  }

  else
    console.log("Error in color ind:",color_ind);

  // Convert the array of colors into a table for all the vertices.

  var colors = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];
    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c);
  }

  // For the bottom face add another c
  colors = colors.concat(faceColors[faceColors.length - 1]);

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
    0,  1,  2,    // front
    3,  4,  5,    // back
    6,  7,  8,    // right
    9, 10, 11,    // left
    12, 13, 14,    12, 14, 15,   // bottom
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
              cubeRotation[2] + Math.PI*(!inOctagon),     // amount to rotate in radians
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

  // No texture for pyramid
  gl.uniform1i(programInfo.texture.isTexture, false);

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);
  // Set the shader uniforms
  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,false,projectionMatrix);
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,false,modelViewMatrix);

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  return gl;

  };

  function tick() {
  };

  function detect_collision(eye){

      var dist = vec2.distance([eye[0],eye[1]],[location[0],location[1]]);
      return dist < 0.6*dim[1];
  };



  return {
    location:location,
    draw: draw_object,
    tick: tick,
    cubeRotation:cubeRotation,
    detect_collision:detect_collision
  };
};

// @params 
// gl => our canvas
// num = number of spikes

function Spike(gl,pos,num){
  var location = pos;
  var spike_rotation = 0.0;

  if (num > num_sides)
    num = num_sides;

  var pylist = [];
  var angle = 2*Math.PI/num_sides;
  var j = Math.floor(num_sides/num);
  var dim = [0.8,2.0,0.5];
  for (var i = 0; i < num; i++) {
    var spike = Pyramid(gl,[octagon_radius*Math.sin(j*i*angle),-octagon_radius*Math.cos(j*i*angle),0.0],dim,[0,0,j*i*angle],1)
    pylist.push(spike);
  }

  function draw_object(gl,programInfo,projectionMatrix,viewMatrix){

  var modelViewMatrix  = mat4.create();
    mat4.fromTranslation(modelViewMatrix,     // matrix to translate
                 location);  // amount to translate

    mat4.rotate(modelViewMatrix,  // destination matrix
            modelViewMatrix,  // matrix to rotate
            rot_tunnel + spike_rotation,     // amount to rotate in radians
            [0,0,1]);       // axis to rotate around (Z)

    modelViewMatrix = matrixMultiply(viewMatrix,modelViewMatrix);
  
  // No need to tranperancy here

  for (var i = 0; i < num;  i++) {
    gl = pylist[i].draw(gl,programInfo,projectionMatrix,modelViewMatrix);
  };


  return gl;
  };

  function tick(){
      spike_rotation -= Math.PI*location[2]/20000;

  }

  function detect_collision(eye){

    for (var i = 0; i < num; i++) {
      if(pylist[i].detect_collision(vec3.rotateZ([0.0,0.0,0.0],eye,location,-rot_tunnel-spike_rotation)) && Math.abs(eye[2] - location[2]) < dim[2]/2){
        return true;
      }
    }

    return false;  
  }


  return {
    location:location,
    num:num,
    pylist: pylist,
    draw: draw_object,
    detect_collision:detect_collision,
    tick:tick
  }
};