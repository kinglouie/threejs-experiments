import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShadowMapViewer } from 'three/addons/utils/ShadowMapViewer.js';
import { Pane } from 'tweakpane';
import { gsap } from "gsap";
import FBO from "./fbo";

import testDistanceVert from './shaders/testDistance.vert';
import testDistanceFrag from './shaders/testDistance.frag';

export class ThreeScene {
  constructor(container) {
    this.container = document.querySelector(container)
  }

  async init() {

    this.parameters = {
      animationProgress: 0,
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

    this.scene = new THREE.Scene();

    this.clock = new THREE.Clock();

    this.addEvents();

    await this.addLogo()
    this.addWall()
    this.addLights()

    this.fbo = new FBO();
    await this.fbo.init(this.renderer, this.scene)

    this.setupTimeLine()

    this.renderer.setAnimationLoop(() => {
      this.render()
    })
  }

  async addLogo() {
    const loader = new GLTFLoader();
    const logoData = await loader.loadAsync('/logo.glb');
    const model = logoData.scene;
    model.rotation.x = Math.PI / 2;
    model.position.z = 2;
    model.scale.set(10, 10, 10);

    var newMaterial = new THREE.MeshLambertMaterial({ color: 0xbf616a });
    model.traverse((o) => {
      if (o.isMesh) {
        o.material = newMaterial;
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    this.logo = model;
    this.scene.add(model);
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

  setupTimeLine() {
    this.tl = new gsap.timeline({
      paused: true.valueOf,
      repeat: -1,
    });
    this.tl.to(this.light.position, {
      z: -100,
      duration: 4,
    });
    this.tl.to(this.light.position, {
      z: 100,
      duration: 4,
    });
  }

  addControlsPane(container) {
    this.gui = new Pane({
      title: 'Parameters',
      container: container,
    });

    this.gui.addInput(this.parameters, 'animationProgress', {
      label: 'animation',
      min: 0,
      max: 1,
      step: 0.01,
    })
      .on('change', (ev) => {
        this.tl.progress(this.parameters.animationProgress);
      });

    this.gui.addInput(this.parameters, 'lightPosZ', {
      label: 'light Z',
      min: -100,
      max: 100,
      step: 1,
    })
      .on('change', (ev) => {
        this.light.position.z = this.parameters.lightPosZ;
      });

    this.gui.addInput(this.parameters, 'lightPosX', {
      label: 'light X',
      min: -100,
      max: 100,
      step: 1,
    })
      .on('change', (ev) => {
        this.light.position.x = this.parameters.lightPosX;
      });

    this.gui.addInput(this.parameters, 'lightPosY', {
      label: 'light Y',
      min: -100,
      max: 100,
      step: 1,
    })
      .on('change', (ev) => {
        this.light.position.y = this.parameters.lightPosY;
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




    this.light = new THREE.PointLight(0xffff00, 1, 0);
    this.light.castShadow = true;
    this.light.position.set(this.parameters.lightPosX, this.parameters.lightPosY, this.parameters.lightPosZ);
    this.light.shadow.mapSize.width = 2048; // default is 512
    this.light.shadow.mapSize.height = 2048; // default is 512
    this.scene.add(this.light);

    const pointLightHelper = new THREE.PointLightHelper(this.light, 2);
    this.scene.add(pointLightHelper);




    // this.light = new THREE.SpotLight(0xffff00, 1, undefined, 0.5,.5);
    // this.light.castShadow = true;
    // this.light.position.set(this.parameters.lightPosX, this.parameters.lightPosY, this.parameters.lightPosZ);
    // this.light.shadow.mapSize.width = 2048; // default is 512
    // this.light.shadow.mapSize.height = 2048; // default is 512
    // this.scene.add(this.light);

    // const spotLightHelper = new THREE.SpotLightHelper(this.light, 2);
    // this.scene.add(spotLightHelper);


    this.pointLightShadowMapViewer = new ShadowMapViewer( this.light );
    const size = window.innerWidth * 0.3;
    this.pointLightShadowMapViewer.size.set( size, size );
    this.pointLightShadowMapViewer.position.set( 0, 0 );
  }

  addEvents() {
    window.addEventListener('resize', this.resize.bind(this), { passive: true })
  }

  resize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.camera.updateProjectionMatrix();
  }

  render() {
    const dt = this.clock.getDelta();
    this.controls.update();
    this.fbo.update(dt);
    this.renderer.render(this.scene, this.camera);
    this.pointLightShadowMapViewer.render(this.renderer);
  }
}