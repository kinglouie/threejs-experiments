
uniform sampler2D texturePosition;

#include <common>

#ifdef USE_SHADOW
	#include <shadowmap_pars_vertex>
#endif

void main() {

    vec3 pos = texture2D( texturePosition, position.xy ).xyz;

		// normals
		vec3 objectNormal = pos;
		#include <defaultnormal_vertex>

		// vertex
    vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );
    vec4 mvPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = 500.0 / length( mvPosition.xyz );

		#ifdef USE_SHADOW
			#include <shadowmap_vertex>
		#endif
    
}