<script>
    import { onMount } from 'svelte';
    import { ThreeScene } from "./";
    import { browser } from "$app/environment"
  
    let scene;
  
    onMount(() => {
      if(browser) {
        scene = new ThreeScene('#webgl');
        scene.init()
        scene.addControlsPane(document.getElementById('controlspane'));
      }
    });
  </script>
  
  <div id="controlspane"></div>
  <div id="webgl"></div>
  
  <style lang="scss">
    #controlspane {
      position: fixed;
      width: 250px;
      right:5px;
      top:5px;
      z-index: 1000;
    }
    #webgl {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height:100%;
    }
  </style>
  