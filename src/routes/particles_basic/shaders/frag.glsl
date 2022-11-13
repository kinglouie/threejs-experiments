uniform vec3 colorA; 
uniform vec3 colorB; 

void main() {
  gl_FragColor = vec4(mix(colorA, colorB, 1.0), 1.0);
}