
#include <common>
#include <packing>
#include <bsdfs>

#ifdef USE_SHADOW
	#include <lights_pars_begin>
	#include <shadowmap_pars_fragment>
	#include <shadowmask_pars_fragment>
#endif

uniform vec3 color;
uniform float opacity;

void main() {

	//make particles round
	vec2 xy = gl_PointCoord.xy * 2.0 - 1.0;
	if ( length( xy ) > 1.0 ) discard;

  	float z = sqrt(1.0 - (pow(xy.x, 2.0) + pow(xy.y, 2.0)));
	vec3 position = vec3(xy.x, xy.y, z);
	vec3 normal = normalize(position);
	vec3 normal_col = normal * 0.5 + 0.5;

	vec3 outgoingLight = normal_col;

	#ifdef USE_SHADOW
		//float shadow = smoothstep( 0.0, 0.2, getShadowMask() );
		//outgoingLight *= 0.35 + shadow * 0.35;
		outgoingLight *= getShadowMask();
	#endif

	gl_FragColor = vec4( outgoingLight, opacity );

}