<template>
  <div id="app">
    <X6></X6>
  </div>
</template>

<script>
import X6 from '@/components/X6'
export default {
  name: 'App',
  components: {
    X6,
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fff;
}
body,
div {
  margin: 0;
  padding: 0;
}
</style>
