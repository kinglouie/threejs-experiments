
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
	vec2 toCenter = ( gl_PointCoord.xy - 0.5 ) * 2.0;
	float len = length( toCenter );
	if ( len > 0.8 ) discard;

	vec3 outgoingLight = color;

	#ifdef USE_SHADOW
		//float shadow = smoothstep( 0.0, 0.2, getShadowMask() );
		//outgoingLight *= 0.35 + shadow * 0.35;
		outgoingLight *= getShadowMask();
	#endif

	gl_FragColor = vec4( outgoingLight, opacity );

}