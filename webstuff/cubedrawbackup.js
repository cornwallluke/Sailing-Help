
var cube = [
1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v1-v3 front
1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
-1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v1 left
-1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v1 down
1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
];
var indices = [
0, 1, 2,   0, 2, 3,
4, 5, 6,   4, 6, 7,
8, 9,10,   8,10,11,
12,13,14,  12,14,15,
16,17,18,  16,18,19,
20,21,22,  20,22,23 
];
var normals = [
0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front perp vecs
1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
-1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
];
var colours = [
0.47, 0.8, 1.0,   0.47, 0.8, 1.0,   0.47, 0.8, 1.0,   0.47, 0.8, 1.0,   // v0-v1-v2-v3 front
1.0, 0.35, 0.3,   1.0, 0.35, 0.3,   1.0, 0.35, 0.3,   1.0, 0.35, 0.3,   // v0-v3-v4-v5 right
0.47, 0.8, 1.0,   0.47, 0.8, 1.0,   0.47, 0.8, 1.0,   0.47, 0.8, 1.0,   // v0-v5-v6-v1 up
1.0, 0.35, 0.3,   1.0, 0.35, 0.3,   1.0, 0.35, 0.3,   1.0, 0.35, 0.3,   // v1-v6-v7-v2 left
0.47, 0.8, 1.0,   0.47, 0.8, 1.0,   0.47, 0.8, 1.0,   0.47, 0.8, 1.0,   // v7-v4-v3-v2 down
0.47, 0.8, 1.0,   0.47, 0.8, 1.0,   0.47, 0.8, 1.0,   0.47, 0.8, 1.0,   // v4-v7-v6-v5 back
];

const fragment_shader = "varying vec4 colour;\n"+
"void main( void ) {\n"+
"  gl_FragColor = colour;\n"+
"}\n";

  
const vertex_shader = "attribute vec3 position;\n"+
"attribute vec3 normals;\n"+
"attribute vec3 colours;\n"+
"uniform mat4 vp;\n"+
"uniform mat4 m;\n"+
"uniform mat4 normm;\n"+
"varying vec4 colour;\n"+
"void main() {\n"+
"  vec4 newpos = m * vec4( position, 1.0 );\n"+
"  vec3 norminterp = vec3(normm * vec4(normals, 0));\n"+
"  gl_Position = vp * newpos;\n"+
"  colour = vec4(colours, 1.0)*(clamp(dot(normalize(norminterp), normalize(vec3(0,0,10)-vec3(newpos))),0.0,1.0)*0.7+vec4(0.3,0.3,0.3,1));\n"+
"}";

// window.requestAnimationFrame =
//   window.requestAnimationFrame ||
//   (function() {
//     return (
//       window.webkitRequestAnimationFrame ||
//       window.mozRequestAnimationFrame ||
//       window.oRequestAnimationFrame ||
//       window.msRequestAnimationFrame ||
//       function(callback, element) {
//         window.setTimeout(callback, 1000 / 60);
//       }
//     );
//   })();

var canvas,
  gl,
  buffer,
  indexbuf,
  currentProgram,
  vertex_position,
  normal_position,
  vplocation,
  mlocation,
  normmlocation,
  perspective,
  view,
  model,
  vp,
  renderparameters = {
    screenWidth: 0,
    screenHeight: 0,
  };


init(canvasparam) {
  canvas = canvasparam

  // canvas = document.querySelector("canvas");

  // Initialise WebGL

  try {
    gl = canvas.getContext("experimental-webgl");
  } catch (error) {}

  if (!gl) {
    throw "cannot create webgl context";
  }

  gl.enable(gl.DEPTH_TEST);

  currentProgram = createProgram(vertex_shader, fragment_shader);
  // console.log(currentProgram);
  buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube), gl.STATIC_DRAW);
  vertex_position = gl.getAttribLocation(currentProgram, "position");
  gl.vertexAttribPointer(vertex_position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertex_position);

  normalbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  normal_position = gl.getAttribLocation(currentProgram, "normals");
  gl.vertexAttribPointer(normal_position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(normal_position);

  colourbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colourbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colours), gl.STATIC_DRAW);
  colour_position = gl.getAttribLocation(currentProgram, "colours");
  gl.vertexAttribPointer(colour_position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colour_position);

  indexbuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexbuf);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // Create Program

  // currentProgram = createProgram( vertex_shader, fragment_shader );
  vplocation = gl.getUniformLocation(currentProgram, "vp");
  mlocation = gl.getUniformLocation(currentProgram, "m");
  normmlocation = gl.getUniformLocation(currentProgram, "normm");
  // timeLocation = gl.getUniformLocation( currentProgram, 'time' );
  // resolutionLocation = gl.getUniformLocation( currentProgram, 'resolution' );
}

function createProgram(vertex, fragment) {
  var program = gl.createProgram();

  var vs = createShader(vertex, gl.VERTEX_SHADER);
  var fs = createShader(
    "#ifdef GL_ES\nprecision highp float;\n#endif\n\n" + fragment,
    gl.FRAGMENT_SHADER
  );

  if (vs == null || fs == null) return null;

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);

  gl.deleteShader(vs);
  gl.deleteShader(fs);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert(
      "ERROR:\n" +
        "VALIDATE_STATUS: " +
        gl.getProgramParameter(program, gl.VALIDATE_STATUS) +
        "\n" +
        "ERROR: " +
        gl.getError() +
        "\n\n" +
        "- Vertex Shader -\n" +
        vertex +
        "\n\n" +
        "- Fragment Shader -\n" +
        fragment
    );

    return null;
  }

  return program;
}

function createShader(src, type) {
  var shader = gl.createShader(type);

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      (type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") +
        " SHADER:\n" +
        gl.getShaderInfoLog(shader)
    );
    return null;
  }

  return shader;
}

function resizeCanvas(event) {
  if (
    canvas.width != canvas.clientWidth ||
    canvas.height != canvas.clientHeight
  ) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    renderparameters.screenWidth = canvas.width;
    renderparameters.screenHeight = canvas.height;

    gl.viewport(0, 0, canvas.width, canvas.height);
  }
}


function render(z, y, x) {
  resizeCanvas();
  if (!currentProgram) return;

  

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Load program into GPU

  gl.useProgram(currentProgram);

  //fov radians 0.252680255142
  //deg to radians 0.0174532925199
  perspective = glMatrix.mat4.create();
  view = glMatrix.mat4.create();
  vp = glMatrix.mat4.create();
  model = glMatrix.mat4.create();
  normm = glMatrix.mat4.create();
  glMatrix.mat4.translate(
    perspective,
    perspective,
    glMatrix.vec3.fromValues(0, 0, -1)
  );
  glMatrix.mat4.scale(
    perspective,
    perspective,
    glMatrix.vec3.fromValues(0.8, 0.8, 0.001)
  );

  // glMatrix.mat4.perspective(perspective, 0.252680255142, parameters.screenWidth/parameters.screenHeight, 1, 500);
  glMatrix.mat4.targetTo(view, [0, 0, -1], [0, 0, 0], [0, 1, 0]);
  glMatrix.mat4.multiply(vp, view, perspective);
  glMatrix.mat4.rotateZ(model, model, z* 0.0174532925199);
  glMatrix.mat4.rotateY(model, model, y* 0.0174532925199);
  glMatrix.mat4.rotateX(model, model, x* 0.0174532925199);
  glMatrix.mat4.invert(normm, model);
  glMatrix.mat4.transpose(normm, normm);

  // glMatrix.mat4.multiply(vp, vp, model);
  // Set values to program variables
  gl.uniformMatrix4fv(vplocation, false, vp);
  gl.uniformMatrix4fv(mlocation, false, model);
  gl.uniformMatrix4fv(normmlocation, false, normm);

  // gl.uniformMatrix4fv( m)
  // gl.uniform1f( timeLocation, parameters.time / 1000 );
  // gl.uniform2f( resolutionLocation, parameters.screenWidth, parameters.screenHeight );

  // Render geometry

  // gl.bindBuffer( gl.ARRAY_BUFFER, buffer );

  // gl.bindBuffer( gl.ARRAY_BUFFER, normalbuffer)
  // gl.vertexAttribPointer( normal_position, 3, gl.FLOAT, false, 0, 0 );
  // gl.enableVertexAttribArray( normal_position );
  // gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexbuf);

  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}