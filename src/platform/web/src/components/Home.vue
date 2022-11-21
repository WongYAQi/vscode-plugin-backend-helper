<template>
  <div class='home'>
    <div class='sidebar'>
    </div>
    <div class='content'>
      <div class=''>{{ username }}</div>
      <div>
        <button @click='handleInstall'>初始化</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'logwire-development-home',
  props: {
    username: String
  },
  methods: {
    handleInstall () {
      axios.post('/api/installProject')
    }
  }
}
</script>

<style>

</style>