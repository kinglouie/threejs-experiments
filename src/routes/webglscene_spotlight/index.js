import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { SpotLightCone } from './SpotLightCone';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap } from "gsap";


export class ThreeScene {
  constructor(container) {
    this.container = document.querySelector(container)
  }

  async init() {
    this.enableControls = false;
    this._addEvents();
    this._createRenderer();
    this.container.appendChild(this.renderer.domElement);

    this._createCamera();

    //this._addOrbitControls();

    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2();
    this.scrollY = window.scrollY;

    // multiuse vector;
    this.vec3 = new THREE.Vector3();

    //this._addFog()

    await this._addLogo()
    this._addLights()
    //this._addFloor()

    this._createAnimations();

    this.renderer.setAnimationLoop(() => {
      this._render()
    })
  }

  _createAnimations() {
    this.tl = new gsap.timeline();
    this.tl.eventCallback("onComplete", () => {
      this.enableControls = true;
    });

    this.tl.to(this.logo.position, {
      z: 0,
      duration: .8,
      ease: "power2.inOut"
    }, 'start');

    this.tl.to(this.light1.target.position, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1,
    }, 'start');
    this.tl.to(this.spotLight1Cone, {
      distance: 13,
      attenuation: 13,
      anglePower: 6,
      duration: .8,
      ease: "power2.out"
    }, 'start');

    this.tl.to(this.light2.target.position, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1,
    }, 'start');
    this.tl.to(this.spotLight2Cone, {
      distance: 13,
      attenuation: 13,
      anglePower: 6,
      duration: .8,
      ease: "power1.out"
    }, 'start');



    this.tl.to(this.camera.position, {
      z: 2.5,
      y: .2,
      duration: .8,
      ease: "power1.out"
    }, '>.6');
    this.tl.to(this.logo.rotation, {
      x: -2,
      y: 2.9,
      duration: .8,
      ease: "power1.out"
    }, '<');
  }

  _createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
  }

  _addOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();
  }

  _createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 0, 8);
  }

  _addFog() {
    this.scene.fog = new THREE.Fog(0x2e3440, 0.25, 50);
  }

  async _addLogo() {
    const loader = new GLTFLoader();
    const logoData = await loader.loadAsync('/logo.glb');
    const model = logoData.scene;
    model.position.z = -1;
    model.scale.set(10, 10, 10);

    var newMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0,
      emissive: 0x111111,
      roughness: .6,
    });
    model.traverse((o) => {
      if (o.isMesh) {
        o.material = newMaterial;
        o.geometry.computeVertexNormals(true);
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    this.logo = model;
    this.scene.add(model);
  }

  _addFloor() {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0,
      //emissive: 0xeceff4,
      emissive: 0x2e3440,
      roughness: .6,
    });
    const geometry = new THREE.BoxGeometry(150, 1, 150);
    const wall = new THREE.Mesh(geometry, mat);
    wall.position.y = -5;
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.scene.add(wall);
  }

  _addLights() {
    // light1
    this.light1 = new THREE.SpotLight(0x5e81ac, 1, 0, 0.35, 1);
    this.light1.castShadow = true;
    this.light1.position.set(-4, 5, -1);
    this.light1.shadow.camera.fov = 20;
    this.light1.shadow.mapSize.width = 2048; // default is 512
    this.light1.shadow.mapSize.height = 2048; // default is 512
    this.scene.add(this.light1);
    this.scene.add(this.light1.target);
    this.light1.target.position.set(3, 0, 0);
    //cone1
    this.spotLight1Cone = new SpotLightCone(this.light1, 8, 6, 22);
    this.scene.add(this.spotLight1Cone);

    //light2
    this.light2 = new THREE.SpotLight(0xbf616a, 1, 0, .3, .2);
    this.light2.castShadow = true;
    this.light2.position.set(3, 7, 0);
    this.light2.shadow.camera.fov = 20;
    this.light2.shadow.mapSize.width = 2048; // default is 512
    this.light2.shadow.mapSize.height = 2048; // default is 512
    this.scene.add(this.light2);
    this.scene.add(this.light2.target);
    this.light2.target.position.set(-3, 0, 0);
    //cone2
    this.spotLight2Cone = new SpotLightCone(this.light2, 8, 6, 22);
    this.scene.add(this.spotLight2Cone);
  }

  _render() {
    const dt = this.clock.getDelta();
    if(this.enableControls) {
      this.light1.target.position.lerp(this.vec3.set(this.mouse.x*2, this.mouse.y*2, 0), 0.1);
      this.light2.target.position.lerp(this.vec3.set(this.mouse.x*2, this.mouse.y*2, 0), 0.1);
      this.logo.position.lerp(this.vec3.set(this.mouse.x*-.05, this.mouse.y*-.05, 0), 0.5);
      this.logo.rotation.x = THREE.MathUtils.lerp(this.logo.rotation.x, -2 + this.mouse.x*-.05, .05);
      this.logo.rotation.y = THREE.MathUtils.lerp(this.logo.rotation.y, 2.9 + this.mouse.y*-.05, .05);
      // this.camera.position.y = -this.scrollY/500;
      // this.camera.position.z = +this.scrollY/500;
      if(this.controls !== undefined) {
        this.controls.update();
      }
    }
    
    this.spotLight1Cone.update();
    this.spotLight2Cone.update();
    this.renderer.render(this.scene, this.camera);
  }

  _addEvents() {
    window.addEventListener('resize', this._resize.bind(this), { passive: true })
    window.addEventListener('mousemove', this._mousemove.bind(this), { passive: true })
    window.addEventListener('touchmove', this._touchmove.bind(this), { passive: true })
    window.addEventListener('scroll', this._scroll.bind(this), { passive: true })
  }

  _resize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.camera.updateProjectionMatrix();
  }

  _mousemove(event) {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  _touchmove(event) {
    this.mouse.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1;
  }

  _scroll() {
    this.scrollY = window.scrollY;
  }
}