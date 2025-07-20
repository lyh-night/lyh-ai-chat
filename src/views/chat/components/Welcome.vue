<template>
  <div class="welcome-container">
    <h1>{{ state.title }}</h1>
    <p>{{ state.welcome }}</p>
  </div>
</template>

<script setup>
const state = reactive({
  title: '我是 lyh 智能助手，很高兴见到你。',
  welcome: '我可以帮你写代码、读文件、写作各种创意内容，请把你的任务交给我吧~'
})
</script>

<style lang="scss" scoped>
.welcome-container {
  width: calc(100% - 40px);
  max-width: 960px;
  min-width: 360px;
  margin: 120px 20px 20px 20px;
  text-align: center;
  h1 {
    margin-bottom: 20px;
    font-size: 24px;
  }
  p {
    color: #8f9aad;
    font-size: 14px;
  }
}
</style>
