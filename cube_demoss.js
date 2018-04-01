var block_rotation_x = -0.04,
    o_rad = 2,
    block_rotation_y = 0.0,
    tunnel_rotation = 0.0,
    oct_sides = 8,
    panel_depth = 2.0;

 /**
 *
 * @param {webGL} gl
 * @param {Array} location
 * @param {Array} dimensions
 * @param {Array} rotation
 * @param {Number} cube_type
 */
function Cube(gl, location, dimensions, rotation, cube_type) {

    var location = location,
        rotation = rotation;

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the cube.
    const positions = [
        // Front face
        -dimensions[0] / 2, -dimensions[1] / 2, dimensions[2] / 2,
        dimensions[0] / 2, -dimensions[1] / 2, dimensions[2] / 2,
        dimensions[0] / 2, dimensions[1] / 2, dimensions[2] / 2, -dimensions[0] / 2, dimensions[1] / 2, dimensions[2] / 2,

        // Back face
        -dimensions[0] / 2, -dimensions[1] / 2, -dimensions[2] / 2, -dimensions[0] / 2, dimensions[1] / 2, -dimensions[2] / 2,
        dimensions[0] / 2, dimensions[1] / 2, -dimensions[2] / 2,
        dimensions[0] / 2, -dimensions[1] / 2, -dimensions[2] / 2,

        // Top face
        -dimensions[0] / 2, dimensions[1] / 2, -dimensions[2] / 2, -dimensions[0] / 2, dimensions[1] / 2, dimensions[2] / 2,
        dimensions[0] / 2, dimensions[1] / 2, dimensions[2] / 2,
        dimensions[0] / 2, dimensions[1] / 2, -dimensions[2] / 2,

        // Bottom face
        -dimensions[0] / 2, -dimensions[1] / 2, -dimensions[2] / 2,
        dimensions[0] / 2, -dimensions[1] / 2, -dimensions[2] / 2,
        dimensions[0] / 2, -dimensions[1] / 2, dimensions[2] / 2, -dimensions[0] / 2, -dimensions[1] / 2, dimensions[2] / 2,

        // Right face
        dimensions[0] / 2, -dimensions[1] / 2, -dimensions[2] / 2,
        dimensions[0] / 2, dimensions[1] / 2, -dimensions[2] / 2,
        dimensions[0] / 2, dimensions[1] / 2, dimensions[2] / 2,
        dimensions[0] / 2, -dimensions[1] / 2, dimensions[2] / 2,

        // Left face
        -dimensions[0] / 2, -dimensions[1] / 2, -dimensions[2] / 2, -dimensions[0] / 2, -dimensions[1] / 2, dimensions[2] / 2, -dimensions[0] / 2, dimensions[1] / 2, dimensions[2] / 2, -dimensions[0] / 2, dimensions[1] / 2, -dimensions[2] / 2,
    ];

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Now we will define the normals for each vertex
    const cubeVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    var vertexNormals = [
        // Front face
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // Back face
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        // Top face
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Bottom face
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,

        // Right face
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Left face
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);


    // Now set up the colors for the faces. We'll use solid colors
    var faceColors = [];
    var colors = [];

    // Color depends on purpose
    // For monsters we will use only red color
    switch (cube_type) {
        case 1:
            faceColors = [
                [1.0, 0.0, 0.0, 0.0],
                [1.0, 0.0, 0.0, 0.0],
                [1.0, 0.0, 0.0, 0.0],
                [1.0, 0.0, 0.0, 0.0],
                [1.0, 0.0, 0.0, 0.0],
                [1.0, 0.0, 0.0, 0.0],
            ];
            break;
        case 2:
            faceColors = [
                [1.0, 0.0, 0.0, 1.0],
                [1.0, 0.0, 0.0, 1.0],
                [1.0, 0.0, 0.0, 1.0],
                [1.0, 0.0, 0.0, 1.0],
                [1.0, 0.0, 0.0, 1.0],
                [1.0, 0.0, 0.0, 1.0],
                [1.0, 0.0, 0.0, 1.0],
            ];
            break;
        case 3:
            faceColors = [
                [1.0, 1.0, 1.0, 1.0],
                [0.0, 1.0, 0.0, 1.0],
                [0.0, 0.0, 1.0, 1.0],
                [1.0, 1.0, 0.0, 1.0],
                [1.0, 0.0, 1.0, 1.0],
            ];
            break;
        default:
            console.log("Error in color ind:", cube_type);
            break;
    }


    // Repeat each color four times for the four vertices of the face
    for (let j = 0; j < ((cube_type == 3) ? faceColors.length : 6); j++) {
        const c = faceColors[randint(faceColors.length)];
        colors = (cube_type == 3) ? colors.concat(faceColors[randint(faceColors.length)], faceColors[randint(faceColors.length)],
            faceColors[randint(faceColors.length)], faceColors[randint(faceColors.length)]) : colors.concat(c, c, c, c);
    }

    // Convert the array of colors into a table for all the vertices.
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
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // back
        8, 9, 10, 8, 10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23, // left
    ];

    // Now send the element array to GL
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);


    let draw = (gl, programInfo, projectionMatrix, viewMatrix) => {

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

        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

        // Now bind the normals for lighting
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);
        // Set the shader uniforms
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

        var normalMatrix = mat3.create();
        mat4.toInverseMat3(modelViewMatrix, normalMatrix);
        mat3.transpose(normalMatrix, normalMatrix);
        gl.uniformMatrix3fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);


        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

        return gl;

    };

    let tick = () => {
        rotation[1] = block_rotation_y;
        rotation[0] = block_rotation_x;
    };

    return {
        location: location,
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
        draw: draw,
        tick: tick,
        rotation: rotation
    };
};


/**
 *
 * @param {webGL} gl
 * @param {Number} location
 * @param {Number} radius
 * @param {Number} sides
 */
function Octagon(gl, location, radius, sides) {

    var location = location, cubelist = [], angle = 2 * Math.PI / sides;
    for (let i = 0; i < sides; i++) {
        let cube_location = [];
        vec3.add(cube_location, location, [radius * Math.cos(i * angle), radius * Math.sin(i * angle), 0]);
        let new_cube = Cube(gl, cube_location, [2 * radius * Math.tan(angle / 2), 0.2, panel_depth], [block_rotation_x, block_rotation_y, i * angle + Math.PI / 2], 3);
        cubelist.push(new_cube);
    }

    let draw = (gl, programInfo, projectionMatrix, viewMatrix) => {
        var modelViewMatrix = mat4.create();
        mat4.fromTranslation(modelViewMatrix, location); // amount to translate
        modelViewMatrix = matrixMultiply(viewMatrix, modelViewMatrix);
        for (let i = 0; i < sides; i++) gl = cubelist[i].draw(gl, programInfo, projectionMatrix, modelViewMatrix);
        return gl;
    };

    return {
        location: location,
        sides: sides,
        cubelist: cubelist,
        draw: draw
    };
}


/**
 *
 * @param {webGL} gl
 * @param {Number} bricks
 */
function Tunnel(gl, bricks) {

    var octagonlist = [];
    for (let i = 0; i < bricks; i++) {
        let new_oct = Octagon(gl, [0.0, 0.0, -panel_depth * i / 2], o_rad, 8);
        octagonlist.push(new_oct);
    }

    let draw = (gl, programInfo, projectionMatrix, viewMatrix) => {
        var modelViewMatrix = mat4.create();
        mat4.fromTranslation(modelViewMatrix, [0.0, 0.0, 0.0]); // amount to translate
        mat4.rotate(modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            tunnel_rotation, // amount to rotate in radians
            [0, 0, 1]); // axis to rotate around (Z)
        modelViewMatrix = matrixMultiply(viewMatrix, modelViewMatrix);
        for (var i = 0; i < bricks; i++,'\r') gl = octagonlist[i].draw(gl, programInfo, projectionMatrix, modelViewMatrix);
        return gl;
    };

    let tick = (eye) => {
        if (octagonlist[0].location[2] - eye[2] > panel_depth * bricks / 2) {
            let old_octagon = octagonlist.shift()
            old_octagon.location[2] = octagonlist[bricks - 2].location[2] - panel_depth / 2;
            octagonlist.push(old_octagon);
        }
        for (let i = 0; i < bricks; i++)
            for (let j = 0; j < oct_sides; octagonlist[i].cubelist[j++].tick());
    };

    return {
        bricks: bricks,
        octagonlist: octagonlist,
        draw: draw,
        tick: tick
    };

};


/**
 *
 * @param {webGL} gl
 * @param {Array} location
 */
function Beam(gl, location) {

    var location = location;
    var dimensions = [0.2, 4.0, 0.5];
    var cube = Cube(gl, [0.0, 0.0, 0.0], dimensions, [0, 0, 2 * Math.PI * Math.random()], 2);

    let draw = (gl, programInfo, projectionMatrix, viewMatrix) => {

        var modelViewMatrix = mat4.create();
        mat4.fromTranslation(modelViewMatrix, location); // amount to translate
        mat4.rotate(modelViewMatrix, // destination matrix
            modelViewMatrix, // matrix to rotate
            tunnel_rotation, // amount to rotate in radians
            [0, 0, 1]); // axis to rotate around (Z)
        modelViewMatrix = matrixMultiply(viewMatrix, modelViewMatrix);
        gl = cube.draw(gl, programInfo, projectionMatrix, modelViewMatrix);
        return gl;
    };

    let tick = () => { cube.rotation[2] += Math.PI * location[2] / 20000; };

    let detect_collision = (radius, angle, dist_z) => {
        let base_angle_sin = dimensions[0] / radius * 2;
        let sin_angle = Math.sin(angle - cube.rotation[2] - tunnel_rotation);
        return Math.abs(sin_angle) < base_angle_sin && Math.abs(dist_z - location[2]) < dimensions[2] / 2;
    };

    return {
        draw: draw,
        location: location,
        cube: cube,
        tick: tick,
        detect_collision: detect_collision
    }

}