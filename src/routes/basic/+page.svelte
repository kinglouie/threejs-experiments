<script>
    import { onMount } from 'svelte';
    import { ThreeScene } from "./threescene";
    import { browser } from "$app/environment"
  
    let scene;
  
    onMount(() => {
      if(browser) {
        scene = new ThreeScene('#webgl');
        scene.init()
      }
    });
  </script>
  
  <div id="webgl"></div>
  
  <style lang="scss">
    #webgl {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height:100%;
    }
  </style>
  