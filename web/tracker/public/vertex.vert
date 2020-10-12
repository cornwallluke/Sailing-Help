attribute vec3 position;
attribute vec3 normals;
attribute vec3 colours;

uniform mat4 vp;
uniform mat4 m;
uniform mat4 normm;
varying vec4 colour;

void main() {
  //light = vec3(10, 10, -20);
  //surface = vec4(0.7,0.9,1,1);

  vec4 newpos = m * vec4( position, 1.0 );
  vec3 norminterp = vec3(normm * vec4(normals, 0));
  gl_Position = vp * newpos;
  colour = vec4(colours, 1.0)*(clamp(dot(normalize(norminterp), normalize(vec3(0,0,10)-vec3(newpos))),0.0,1.0)*0.7+vec4(0.3,0.3,0.3,1));

}
