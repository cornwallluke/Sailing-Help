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

var fragment_shader = "varying vec4 colour;\n"+
"void main( void ) {\n"+
"  gl_FragColor = colour;\n"+
"}\n";


var vertex_shader = "attribute vec3 position;\n"+
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
class cuberenderer {
        
        // canvas;
        // gl;
        // // buffer,
        // // indexbuf,
        // currentProgram;
        // vertex_position;
        // normal_position;
        // vplocation;
        // mlocation;
        // normmlocation;
        // // perspective,
        // // view,
        // // model,
        // // vp,
        // parameters = {
        //   screenWidth: 0,
        //   screenHeight: 0
        // };
        
        constructor(canvasparam) {
          this.parameters = {
            screenWidth: 0,
            screenHeight: 0
          };
          this.canvas = canvasparam;

          // canvas = document.querySelector("canvas");

          // Initialise WebGL

          try {
            this.gl = this.canvas.getContext("experimental-webgl");
          } catch (error) {}

          if (!this.gl) {
            throw "cannot create webgl context";
          }

          this.gl.enable(this.gl.DEPTH_TEST);

          this.currentProgram = this.createProgram(
            vertex_shader,
            fragment_shader
          );
          // console.log(currentProgram);
          let buffer = this.gl.createBuffer();
          this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
          this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(cube),
            this.gl.STATIC_DRAW
          );
          this.vertex_position = this.gl.getAttribLocation(
            this.currentProgram,
            "position"
          );
          this.gl.vertexAttribPointer(
            this.vertex_position,
            3,
            this.gl.FLOAT,
            false,
            0,
            0
          );
          this.gl.enableVertexAttribArray(this.vertex_position);

          let normalbuffer = this.gl.createBuffer();
          this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalbuffer);
          this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(normals),
            this.gl.STATIC_DRAW
          );
          this.normal_position = this.gl.getAttribLocation(
            this.currentProgram,
            "normals"
          );
          this.gl.vertexAttribPointer(
            this.normal_position,
            3,
            this.gl.FLOAT,
            false,
            0,
            0
          );
          this.gl.enableVertexAttribArray(this.normal_position);

          let colourbuffer = this.gl.createBuffer();
          this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colourbuffer);
          this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(colours),
            this.gl.STATIC_DRAW
          );
          this.colour_position = this.gl.getAttribLocation(
            this.currentProgram,
            "colours"
          );
          this.gl.vertexAttribPointer(
            this.colour_position,
            3,
            this.gl.FLOAT,
            false,
            0,
            0
          );
          this.gl.enableVertexAttribArray(this.colour_position);

          let indexbuf = this.gl.createBuffer();
          this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexbuf);
          this.gl.bufferData(
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices),
            this.gl.STATIC_DRAW
          );

          // Create Program

          // currentProgram = createProgram( vertex_shader, fragment_shader );
          this.vplocation = this.gl.getUniformLocation(
            this.currentProgram,
            "vp"
          );
          this.mlocation = this.gl.getUniformLocation(this.currentProgram, "m");
          this.normmlocation = this.gl.getUniformLocation(
            this.currentProgram,
            "normm"
          );
          // timeLocation = this.gl.getUniformLocation( currentProgram, 'time' );
          // resolutionLocation = this.gl.getUniformLocation( currentProgram, 'resolution' );
        }

        createProgram(vertex, fragment) {
          var program = this.gl.createProgram();

          var vs = this.createShader(vertex, this.gl.VERTEX_SHADER);
          var fs = this.createShader(
            "#ifdef GL_ES\nprecision highp float;\n#endif\n\n" + fragment,
            this.gl.FRAGMENT_SHADER
          );

          if (vs == null || fs == null) return null;

          this.gl.attachShader(program, vs);
          this.gl.attachShader(program, fs);

          this.gl.deleteShader(vs);
          this.gl.deleteShader(fs);

          this.gl.linkProgram(program);

          if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            alert(
              "ERROR:\n" +
                "VALIDATE_STATUS: " +
                this.gl.getProgramParameter(program, this.gl.VALIDATE_STATUS) +
                "\n" +
                "ERROR: " +
                this.gl.getError() +
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

        createShader(src, type) {
          var shader = this.gl.createShader(type);

          this.gl.shaderSource(shader, src);
          this.gl.compileShader(shader);

          if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert(
              (type == this.gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") +
                " SHADER:\n" +
                this.gl.getShaderInfoLog(shader)
            );
            return null;
          }

          return shader;
        }

        resizeCanvas(event) {
          if (
            this.canvas.width != this.canvas.clientWidth ||
            this.canvas.height != this.canvas.clientHeight
          ) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;

            this.parameters.screenWidth = this.canvas.width;
            this.parameters.screenHeight = this.canvas.height;

            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
          }
        }

        render(z, y, x) {
          this.resizeCanvas();
          if (!this.currentProgram) return;

          this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

          // Load program into GPU

          this.gl.useProgram(this.currentProgram);

          //fov radians 0.252680255142
          //deg to radians 0.0174532925199
          let perspective = glMatrix.mat4.create();
          let view = glMatrix.mat4.create();
          let vp = glMatrix.mat4.create();
          let model = glMatrix.mat4.create();
          let normm = glMatrix.mat4.create();
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
          glMatrix.mat4.rotateX(model, model, x * 0.0174532925199);
          glMatrix.mat4.rotateY(model, model, y * 0.0174532925199);
          glMatrix.mat4.rotateZ(model, model, z * 0.0174532925199);
          glMatrix.mat4.invert(normm, model);
          glMatrix.mat4.transpose(normm, normm);

          // glMatrix.mat4.multiply(vp, vp, model);
          // Set values to program variables
          this.gl.uniformMatrix4fv(this.vplocation, false, vp);
          this.gl.uniformMatrix4fv(this.mlocation, false, model);
          this.gl.uniformMatrix4fv(this.normmlocation, false, normm);

          // this.gl.uniformMatrix4fv( m)
          // this.gl.uniform1f( timeLocation, parameters.time / 1000 );
          // this.gl.uniform2f( resolutionLocation, parameters.screenWidth, parameters.screenHeight );

          // Render geometry

          // this.gl.bindBuffer( this.gl.ARRAY_BUFFER, buffer );

          // this.gl.bindBuffer( this.gl.ARRAY_BUFFER, normalbuffer)
          // this.gl.vertexAttribPointer( normal_position, 3, this.gl.FLOAT, false, 0, 0 );
          // this.gl.enableVertexAttribArray( normal_position );
          // this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, indexbuf);

          this.gl.drawElements(
            this.gl.TRIANGLES,
            36,
            this.gl.UNSIGNED_SHORT,
            0
          );
        }
      }