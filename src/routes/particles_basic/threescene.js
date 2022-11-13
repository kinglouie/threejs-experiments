import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import frag from './shaders/frag.glsl';
import vert from './shaders/vert.glsl';
import Stats from 'stats.js'
import { dev } from "$app/environment"



export class ThreeScene {
  constructor(container) {
    this.container = document.querySelector(container)

    this._resizeCb = () => this._onResize()
    this._mousemoveCb = e => this._onMousemove(e)
  }

  async init() {
    this._createScene()
    this.mouse = new THREE.Vector2()
    this._createCamera()
    this._createRenderer()
    this._addListeners()

    this._setupParticles()
    await this._addLogo()

    this.stats = new Stats()
    if(dev) {
      document.body.appendChild(this.stats.dom)
    }
    this.renderer.setAnimationLoop(() => {
      this.stats.begin()

      this._update()
      this._render()

      this.stats.end()
    })
    console.log(this)
  }

  destroy() {
    this.renderer.dispose()
    this._removeListeners()
  }

  async _addLogo() {
    const loader = new GLTFLoader();
    const logoData = await loader.loadAsync('/logo.glb');
    const model = logoData.scene;
    model.rotation.x = Math.PI / 2;
    model.position.z = 40;
    model.scale.set(25, 25, 25); 
    console.log(logoData);
    this.scene.add(model);

  }

  _update() {
    this.phase += 0.002;
    for (var i = 0, l = this.mesh.count; i < l; i++) {
      this.mesh.getMatrixAt( i, this.matrix );
      this.dummy.position.setFromMatrixPosition( this.matrix );
      var dest = this.particleData[i].dests[Math.floor(this.phase)%this.particleData[i].dests.length].clone();
      var diff = dest.sub(this.dummy.position);
      this.particleData[i].speed.divideScalar(1.05); // Some drag on the speed
      this.particleData[i].speed.add(diff.divideScalar(400));// Modify speed by a fraction of the distance to the dest    
      this.dummy.position.add(this.particleData[i].speed);
      // this.dummy.lookAt(dest);
      this.dummy.updateMatrix();
      this.matrix.setPosition( this.dummy.position );
      this.mesh.setMatrixAt( i, this.matrix );
		  this.mesh.instanceMatrix.needsUpdate = true;
    }
    
    this.mesh.rotation.y = this.phase*3;
    this.mesh.rotation.x = (this.mouse.y-0.5) * Math.PI;
    this.mesh.rotation.z = (this.mouse.x-0.5) * Math.PI;
  }

  _render() {
    this.renderer.render(this.scene, this.camera)
  }

  _createScene() {
    this.scene = new THREE.Scene()
  }

  _setupParticles() {
    this.phase = 0;

    var boxSize = 0.2;
    var pitchSegments = 120;
    var elevationSegments = pitchSegments/2;
    var numParticles = pitchSegments*elevationSegments
    console.log(numParticles)
    var side = Math.pow(numParticles, 1/3);
    var radius = 16;
    this.dummy = new THREE.Object3D();
    this.matrix = new THREE.Matrix4();
    this.particleData = {};

    //var mat = new MeshBasicMaterial({transparent: true,  color: 0x8fbcbb,  opacity: 0.4,  side: DoubleSide});
    var mat = new THREE.ShaderMaterial({
      uniforms: {
        colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)},
        colorA: {type: 'vec3', value: new THREE.Color(0x74ebd5)}
      },
      vertexShader: vert,
      fragmentShader: frag,
      blending: THREE.NoBlending,
      transparent: true,
      depthWrite: true,
      depthTest: false
    });
    this.mesh = new THREE.InstancedMesh(new THREE.BoxBufferGeometry(boxSize, boxSize, boxSize), mat, numParticles);
    this.scene.add(this.mesh)

    function posInBox(place) {
      return ((place/side) - 0.5) * radius * 1.2;  
    }

    //Plant the seeds, grow some trees in a grid!
    for (var p = 0; p < pitchSegments; p++) {
      var pitch = Math.PI * 2 * p / pitchSegments ;
      for (var e = 0; e < elevationSegments; e++) {
        var elevation = Math.PI  * ((e / elevationSegments)-0.5)
        var index = p * elevationSegments + e;


        var dest = new THREE.Vector3();
        dest.z = (Math.sin(pitch) * Math.cos(elevation)) * radius; //z pos in sphere
        dest.x = (Math.cos(pitch) * Math.cos(elevation)) * radius; //x pos in sphere
        dest.y = Math.sin(elevation) * radius; //y pos in sphere

        this.dummy.position.x = posInBox((index+1) % side);
        this.dummy.position.y = posInBox(Math.floor((index+1)/side) % side);
        this.dummy.position.z = posInBox(Math.floor((index+1)/Math.pow(side,2)) % side);
        this.dummy.updateMatrix()
        this.mesh.setMatrixAt(index, this.dummy.matrix)
        this.particleData[index] = {dests: [dest,this.dummy.position.clone()], speed: new THREE.Vector3() };
      }
    }
  }

  _createCamera() {
    this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 100)
    this.camera.position.set(0, 0, 50)
  }

  _createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: window.devicePixelRatio === 1
    })

    this.container.appendChild(this.renderer.domElement)

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio))
    this.renderer.physicallyCorrectLights = true
  }



  _addListeners() {
    window.addEventListener('resize', this._resizeCb, { passive: true })
    window.addEventListener('mousemove', this._mousemoveCb, { passive: true })
  }

  _removeListeners() {
    window.removeEventListener('resize', this._resizeCb, { passive: true })
    window.removeEventListener('mousemove', this._mousemoveCb, { passive: true })
  }

  _onMousemove(e) {
    const x = e.clientX / this.container.offsetWidth * 2 - 1
    const y = -(e.clientY / this.container.offsetHeight * 2 - 1)
    this.mouse.set(x, y)
  }

  _onResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
  }
}