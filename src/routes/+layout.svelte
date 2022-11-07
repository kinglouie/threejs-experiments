<script>
  import Header from './Header.svelte';
  import "../app.scss";
</script>

<Header />
<main class="container">
<slot />
</main>

<style lang="scss">
  .container {
    margin-top: $header-height;
    @include media-md {
      margin-top: $header-height-md;
    }
  }

</style>

