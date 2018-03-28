function dot([x, y, z], [p, q, r]) {
  return x*p + y*q + z*r
}

function cross([ux, uy, uz], [vx, vy, vz]) {
  var x = uy*vz - uz*vy;
  var y = uz*vx - ux*vz;
  var z = ux*vy - uy*vx;
  return [x, y, z];
}

function add([x, y, z], [p, q, r]) {
  return [x + p, y + q, z + r]
}

function subtract([x, y, z], [p, q, r]) {
  return [x - p, y - q, z - r]
}

function abs([x, y, z]) {
  return Math.sqrt(x*x + y*y + z*z)
}

function normalize([x, y, z]) {
  var t = abs([x, y, z])
  return [x/t, y/t, z/t]
}

function multiplyScalar([x, y, z], c) {
  return [x*c, y*c, z*c]
}

function matrixMultiply(mat2, mat1)
{
  return [
    mat1[0]*mat2[0]+mat1[1]*mat2[4]+mat1[2]*mat2[8]+mat1[3]*mat2[12],
    mat1[0]*mat2[1]+mat1[1]*mat2[5]+mat1[2]*mat2[9]+mat1[3]*mat2[13],
    mat1[0]*mat2[2]+mat1[1]*mat2[6]+mat1[2]*mat2[10]+mat1[3]*mat2[14],
    mat1[0]*mat2[3]+mat1[1]*mat2[7]+mat1[2]*mat2[11]+mat1[3]*mat2[15],
    mat1[4]*mat2[0]+mat1[5]*mat2[4]+mat1[6]*mat2[8]+mat1[7]*mat2[12],
    mat1[4]*mat2[1]+mat1[5]*mat2[5]+mat1[6]*mat2[9]+mat1[7]*mat2[13],
    mat1[4]*mat2[2]+mat1[5]*mat2[6]+mat1[6]*mat2[10]+mat1[7]*mat2[14],
    mat1[4]*mat2[3]+mat1[5]*mat2[7]+mat1[6]*mat2[11]+mat1[7]*mat2[15],
    mat1[8]*mat2[0]+mat1[9]*mat2[4]+mat1[10]*mat2[8]+mat1[11]*mat2[12],
    mat1[8]*mat2[1]+mat1[9]*mat2[5]+mat1[10]*mat2[9]+mat1[11]*mat2[13],
    mat1[8]*mat2[2]+mat1[9]*mat2[6]+mat1[10]*mat2[10]+mat1[11]*mat2[14],
    mat1[8]*mat2[3]+mat1[9]*mat2[7]+mat1[10]*mat2[11]+mat1[11]*mat2[15],
    mat1[12]*mat2[0]+mat1[13]*mat2[4]+mat1[14]*mat2[8]+mat1[15]*mat2[12],
    mat1[12]*mat2[1]+mat1[13]*mat2[5]+mat1[14]*mat2[9]+mat1[15]*mat2[13],
    mat1[12]*mat2[2]+mat1[13]*mat2[6]+mat1[14]*mat2[10]+mat1[15]*mat2[14],
    mat1[12]*mat2[3]+mat1[13]*mat2[7]+mat1[14]*mat2[11]+mat1[15]*mat2[15]
  ];
}