uniform vec2 resolution;
uniform sampler2D texturePosition;
uniform sampler2D textureMorphPositionA;
uniform sampler2D textureMorphPositionB;
uniform float morph;
uniform float motion;
uniform float time;
uniform float speed;
uniform float dieSpeed;
uniform float radius;
uniform float curlSize;
uniform float attraction;
uniform float initAnimation;
uniform vec3 mouse3d;

#pragma glslify: curl = require(./helpers/curl4)

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec3 pos = texture2D( texturePosition, uv ).xyz;
    vec3 posMorphA = texture2D( textureMorphPositionA, uv ).xyz;
    vec3 posMorphB = texture2D( textureMorphPositionB, uv ).xyz;

    vec3 target = mix( posMorphA, posMorphB, morph );

    vec3 delta = target - pos;

    pos = mix( target, pos, motion );

    vec3 motionOffset = pos;
    motionOffset += delta * 0.001 * (1.0 - smoothstep(50.0, 350.0, length(delta))) * speed;
    motionOffset += curl(pos * curlSize, time, 0.1 * 0.1) * speed;

    pos = mix( pos, motionOffset, motion );
    gl_FragColor = vec4(pos, 1.0);

}
