/**
 *
 * @param {*} gl
 * @param {*} location
 * @param {*} dimensions
 * @param {*} rotation
 * @param {*} color_ind
 */
function Pyramid(gl, location, dimensions, rotation, color_ind) {

	var location = location;
	var rotation = rotation;

	const positionBuffer = gl.createBuffer();

	// Select the positionBuffer as the one to apply buffer
	// operations to from here out.
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);


	const positions = [
		// Front face
		-dimensions[0] / 2, 0, dimensions[2] / 2,
		dimensions[0] / 2, 0, dimensions[2] / 2,
		0, dimensions[1] / 2, 0,

		// Back face
		-dimensions[0] / 2, 0, -dimensions[2] / 2,
		dimensions[0] / 2, 0, -dimensions[2] / 2,
		0, dimensions[1] / 2, 0,

		// Right face
		-dimensions[0] / 2, 0, dimensions[2] / 2, -dimensions[0] / 2, 0, -dimensions[2] / 2,
		0, dimensions[1] / 2, 0,

		// Left face
		dimensions[0] / 2, 0, dimensions[2] / 2,
		dimensions[0] / 2, 0, -dimensions[2] / 2,
		0, dimensions[1] / 2, 0,

		// Bottom face
		-dimensions[0] / 2, 0, -dimensions[2] / 2,
		dimensions[0] / 2, 0, -dimensions[2] / 2,
		dimensions[0] / 2, 0, dimensions[2] / 2, -dimensions[0] / 2, 0, dimensions[2] / 2,


	];

	// Now pass the list of positions into WebGL to build the
	// shape. We do this by creating a Float32Array from the
	// JavaScript array, then use it to fill the current buffer.

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	// Now set up the colors for the faces. We'll use solid colors
	var faceColors = [];
	switch(color_ind) {
		case 1:
		faceColors = [
			[1.0, 0.0, 0.0, 1.0],
			[1.0, 0.0, 0.0, 1.0],
			[1.0, 0.0, 0.0, 1.0],
			[1.0, 0.0, 0.0, 1.0],
			[1.0, 0.0, 0.0, 1.0],
		];
		break;
		case 2:
		faceColors = [
			[1.0, 1.0, 1.0, 1.0], // Front face: white
			[1.0, 0.0, 0.0, 1.0], // Back face: red
			[0.0, 0.0, 1.0, 1.0], // Bottom face: blue
			[1.0, 1.0, 0.0, 1.0], // Right face: yellow
			[1.0, 0.0, 1.0, 1.0], // Left face: purple
		];
		break;
		default:
		console.log("Error in color ind:", color_ind);
		break;
	}

	var colors = [];
	for (var j = 0; j < faceColors.length; ++j)
		colors = colors.concat(faceColors[j], faceColors[j], faceColors[j]);
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
		0, 1, 2, // front
		3, 4, 5, // back
		6, 7, 8, // right
		9, 10, 11, // left
		12, 13, 14, 12, 14, 15, // bottom
	];

	// Now send the element array to GL

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(indices), gl.STATIC_DRAW);


	let draw = (gl, programInfo, projectionMatrix, viewMatrix) => {
		// console.log(location)

		var modelViewMatrix = mat4.create();

		mat4.fromTranslation(modelViewMatrix, // matrix to translate
			location); // amount to translate

		mat4.rotate(modelViewMatrix, // destination matrix
			modelViewMatrix, // matrix to rotate
			rotation[2], // amount to rotate in radians
			[0, 0, 1]); // axis to rotate around (Z)

		mat4.rotate(modelViewMatrix, // destination matrix
			modelViewMatrix, // matrix to rotate
			rotation[0], // amount to rotate in radians
			[1, 0, 0]); // axis to rotate around (Z)

		mat4.rotate(modelViewMatrix, // destination matrix
			modelViewMatrix, // matrix to rotate
			rotation[1], // amount to rotate in radians
			[0, 1, 0]); // axis to rotate around (Z)

		modelViewMatrix = matrixMultiply(viewMatrix, modelViewMatrix);


		// Tell WebGL how to pull out the positions from the position
		// buffer into the vertexPosition attribute

		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

		// vertexAttribPointer @params
		// numComponents = 3;
		// type = gl.FLOAT;
		// normalize = false;
		// stride = 0;
		// offset = 0;
		gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

		// Tell WebGL how to pull out the colors from the color buffer
		// into the vertexColor attribute.
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

		// Tell WebGL which indices to use to index the vertices
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		// Tell WebGL to use our program when drawing
		gl.useProgram(programInfo.program);
		// Set the shader uniforms
		gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
		gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

		return gl;

	};

	let tick = () => {};

	let detect_collision = (eye) => {
		var dist = vec2.distance([eye[0], eye[1]], [location[0], location[1]]);
		return dist < 0.6 * dimensions[1];
	};

	return {
		location: location,
		draw: draw,
		tick: tick,
		cubeRotation: rotation,
		detect_collision: detect_collision
	};
};

/**
 *
 * @param {webGL} gl
 * @param {Array} pos
 * @param {Number} num
 */
function Spike(gl, pos, num) {
	var location = pos;
	var spike_rotation = 0.0;
	if (num > num_sides) num = num_sides;

	var pylist = [];
	var angle = 2 * Math.PI / num_sides;
	var j = Math.floor(num_sides / num);
	var dimensions = [0.5, 2.0, 0.5];
	for (var i = 0; i < num; i++) {
		var spike = Pyramid(gl, [octagon_radius * Math.sin(j * i * angle), -octagon_radius * Math.cos(j * i * angle), 0.0], dimensions, [0, 0, j * i * angle], 1)
		pylist.push(spike);
	}

	let draw = (gl, programInfo, projectionMatrix, viewMatrix) => {
		var modelViewMatrix = mat4.create();
		mat4.fromTranslation(modelViewMatrix, // matrix to translate
			location); // amount to translate
		mat4.rotate(modelViewMatrix, // destination matrix
			modelViewMatrix, // matrix to rotate
			rot_tunnel + spike_rotation, // amount to rotate in radians
			[0, 0, 1]); // axis to rotate around (Z)
		modelViewMatrix = matrixMultiply(viewMatrix, modelViewMatrix);
		for (var i = 0; i < num; i++) gl = pylist[i].draw(gl, programInfo, projectionMatrix, modelViewMatrix);
		return gl;
	};

	let tick = () => {
		spike_rotation -= Math.PI * location[2] / 20000;
	}

	let detect_collision = (eye) => {

		for (var i = 0; i < num; i++) {
			if (pylist[i].detect_collision(vec3.rotateZ([0.0, 0.0, 0.0], eye, location, -rot_tunnel - spike_rotation)) && Math.abs(eye[2] - location[2]) < dimensions[2] / 2) {
				return true;
			}
		}

		return false;
	}


	return {
		location: location,
		num: num,
		pylist: pylist,
		draw: draw,
		detect_collision: detect_collision,
		tick: tick
	};
};