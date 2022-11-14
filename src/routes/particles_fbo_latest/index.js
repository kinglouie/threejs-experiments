import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SpotLightCone } from './SpotLightCone';
import { Pane } from 'tweakpane';
import { gsap } from "gsap";
import FBO from "./fbo";

export class ThreeScene {
  constructor(container) {
    this.container = document.querySelector(container)
  }

  async init() {

    this.parameters = {
      lightPosZ: 30,
      lightPosX: 0,
      lightPosY: 0,
      speed: 0.1,
      morph: 1.0,
      curlSize: 0.005,
      motion: 0.0,
    };

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      2000
    );
    this.camera.position.set(-1, .5, 300);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    this.mouse = new THREE.Vector2();
    // multiuse vector;
    this.vec3 = new THREE.Vector3();

    this.scene = new THREE.Scene();

    this.clock = new THREE.Clock();

    this.addEvents();

    //this.addWall()
    this.addLights()

    this.fbo = new FBO();
    await this.fbo.init(this.renderer, this.scene)

    this.renderer.setAnimationLoop(() => {
      this.render()
    })
  }

  addWall() {
    const mat = new THREE.MeshStandardMaterial();
    const geometry = new THREE.BoxGeometry(50, 50, 2);
    const wall = new THREE.Mesh(geometry, mat);
    wall.position.z = -20;
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.scene.add(wall);
  }

  addControlsPane(container) {
    this.gui = new Pane({
      title: 'Parameters',
      container: container,
    });

    this.gui.addInput(this.parameters, 'lightPosZ', {
      label: 'light Z',
      min: -100,
      max: 100,
      step: 1,
    })
      .on('change', (ev) => {
        this.light1.position.z = this.parameters.lightPosZ;
        this.light2.position.z = this.parameters.lightPosZ;
      });

    this.gui.addInput(this.parameters, 'lightPosX', {
      label: 'light X',
      min: -100,
      max: 100,
      step: 1,
    })
      .on('change', (ev) => {
        this.light1.position.x = this.parameters.lightPosX-50;
        this.light2.position.x = this.parameters.lightPosX+50;
      });

    this.gui.addInput(this.parameters, 'lightPosY', {
      label: 'light Y',
      min: -100,
      max: 100,
      step: 1,
    })
      .on('change', (ev) => {
        this.light1.position.y = this.parameters.lightPosY;
        this.light2.position.y = this.parameters.lightPosY;
      });

    this.gui.addInput(this.parameters, 'morph', {
      label: 'morph',
      min: 0,
      max: 1,
      step: 0.01,
    })
      .on('change', (ev) => {
        this.fbo.parameters.morph = this.parameters.morph;
      });

    this.gui.addInput(this.parameters, 'motion', {
      label: 'motion',
      min: 0,
      max: 1,
      step: 0.01,
    })
      .on('change', (ev) => {
        this.fbo.parameters.motion = this.parameters.motion;
      });

    this.gui.addInput(this.parameters, 'curlSize', {
      label: 'curlsize',
      min: 0.00,
      max: 0.03,
      step: 0.001,
    })
      .on('change', (ev) => {
        this.fbo.parameters.curlSize = this.parameters.curlSize;
      });

    this.gui.addInput(this.parameters, 'speed', {
      label: 'speed',
      min: 0,
      max: 2,
      step: 0.1,
    })
      .on('change', (ev) => {
        this.fbo.parameters.speed = this.parameters.speed;
      });

  }


  addLights() {
    this.ambi = new THREE.AmbientLight(0xffffff, .1);
    this.scene.add(this.ambi);

    // light1
    this.light1 = new THREE.SpotLight(0x5e81ac, 1, 0, 0.4, 1);
    this.light1.castShadow = true;
    this.light1.position.set(-50, 150, 40);
    this.light1.shadow.camera.fov = 20;
    this.light1.shadow.mapSize.width = 2048; // default is 512
    this.light1.shadow.mapSize.height = 2048; // default is 512
    this.scene.add(this.light1);
    this.scene.add(this.light1.target);
    this.light1.target.position.set(3, 0, 0);
    //cone1
    this.spotLight1Cone = new SpotLightCone(this.light1, 150, 150, 10);
    this.scene.add(this.spotLight1Cone);

    //light2
    this.light2 = new THREE.SpotLight(0xbf616a, 1, 0, .4, .2);
    this.light2.castShadow = true;
    this.light2.position.set(50, 150, 30);
    this.light2.shadow.camera.fov = 20;
    this.light2.shadow.mapSize.width = 2048; // default is 512
    this.light2.shadow.mapSize.height = 2048; // default is 512
    this.scene.add(this.light2);
    this.scene.add(this.light2.target);
    this.light2.target.position.set(-3, 0, 0);
    //cone2
    this.spotLight2Cone = new SpotLightCone(this.light2, 150, 150, 10);
    this.scene.add(this.spotLight2Cone);
  }

  addEvents() {
    window.addEventListener('resize', this.resize.bind(this), { passive: true })
    window.addEventListener('mousemove', this._mousemove.bind(this), { passive: true })
  }

  resize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.camera.updateProjectionMatrix();
  }

  _mousemove(event) {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  render() {
    const dt = this.clock.getDelta();
    this.controls.update();
    this.light1.target.position.lerp(this.vec3.set(this.mouse.x*100, this.mouse.y*100, 0), 0.1);
    this.light2.target.position.lerp(this.vec3.set(this.mouse.x*100, this.mouse.y*100, 0), 0.1);
    this.fbo.update(dt);
    this.renderer.render(this.scene, this.camera);
    this.spotLight1Cone.update();
    this.spotLight2Cone.update();
  }
}