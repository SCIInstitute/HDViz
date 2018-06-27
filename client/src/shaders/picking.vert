attribute vec3 coordinates;
attribute vec3 vertexColor;
attribute float sampleIndex;
uniform mat4 uProjectionMatrix;
varying vec2 vertexUV;
varying vec3 geomColor;
varying float index;

void main(void) {
  int UVindex = int(coordinates.z);
  if (UVindex == 0) {
    vertexUV = vec2(0,1);
  } else if(UVindex == 1) {
     vertexUV = vec2(1,1);
  } else if(UVindex == 2) {
     vertexUV = vec2(0,0);
  } else if(UVindex == 3) {
    vertexUV = vec2(1,0);
  }
  geomColor = vertexColor;
  index = sampleIndex;
  gl_Position = uProjectionMatrix * vec4(coordinates.xy, 0.0, 1.0);
}