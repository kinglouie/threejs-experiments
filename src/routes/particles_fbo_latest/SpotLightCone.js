import * as THREE from 'three';
import { SpotLightMaterial } from './SpotLightMaterial';

const _vector = new THREE.Vector3();

class SpotLightCone extends THREE.Object3D {

	constructor( light, distance = 5, attenuation = 5, anglePower = 5) {

		super();

		this.light = light;
		this.distance = distance;
		this.attenuation = attenuation;
		this.anglePower = anglePower;

		this.light.updateMatrixWorld();
		this.matrix = light.matrixWorld;
		this.matrixAutoUpdate = false;

        const mat = new SpotLightMaterial();
		mat.uniforms.attenuation.value = attenuation;
		mat.uniforms.anglePower.value = anglePower;

        const geometry = new THREE.CylinderGeometry(0, 1, 1, 128, 64, true);
        geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -1 / 2, 0))
        geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2))

        this.cone = new THREE.Mesh(geometry, mat);

		this.add( this.cone );

		this.update();

	}

	dispose() {

		this.cone.geometry.dispose();
		this.cone.material.dispose();

	}

	update() {

		this.light.updateMatrixWorld();

		//const coneLength = this.light.distance ? this.light.distance : 1000;
		const coneLength = this.distance;
		const coneWidth = coneLength * Math.tan( this.light.angle );

		this.cone.scale.set( coneWidth, coneWidth, coneLength );

		

		this.cone.material.uniforms.lightColor.value.copy(this.light.color);
		this.cone.material.uniforms.spotPosition.value.copy(this.cone.getWorldPosition(_vector))
		this.cone.material.uniforms.anglePower.value = this.anglePower;
		this.cone.material.uniforms.attenuation.value = this.attenuation;

		// set cone target to lights target
		_vector.setFromMatrixPosition( this.light.target.matrixWorld );
		this.cone.lookAt( _vector );


	}

}


export { SpotLightCone };