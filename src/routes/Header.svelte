<script>
	import { page } from '$app/stores';
  
  const nav_links = [
    {
      title: 'Particles 1',
      url:'/webglscene'
    },
    {
      title: 'Particles Basic',
      url:'/basic'
    },
    {
      title: 'Spotlight',
      url:'/webglscene_spotlight'
    }
  ]

</script>

<header>
  <div class="container">
    <nav>
      <ul>
        {#each nav_links as link}
        <li class:current={$page.url.pathname === link.url}>
          <a href="{link.url}">{link.title}</a>
        </li>
        {/each}
      </ul>
    </nav>
  </div>
</header>

<style lang="scss">
  header {
    z-index: 1;
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
  }

  header .container {
    height: $header-height;
    @include media-md {
      height: $header-height-md;
    }
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    color: $color-snowstorm-1;
  }

  nav {
    font-size: 1.6rem;
    font-weight: 600;
    display: flex;
    gap: 4.5rem;
    align-items: center;
    ul {
      display: none;
      @include media-md {
        display: flex;
      }
      align-items: center;
      gap: 4.5rem;
      list-style: none;
    }
  }

</style>