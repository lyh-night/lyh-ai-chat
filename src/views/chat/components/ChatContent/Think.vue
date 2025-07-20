<template>
  <p v-if="props.data.thinking_time" class="think-time" @click="changeThink">
    已深度思考（用时{{ props.data.thinking_time }}）
    <i :class="['iconfont', isExpanded ? 'icon-arrow-down-filling' : 'icon-arrow-up-filling']" />
  </p>
  <div v-show="isExpanded" class="think-container">
    <div v-html="props.data.thinking_content" class="think-main" />
    <div class="think-line" />
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => {}
  }
})

const isExpanded = ref(true)

function changeThink() {
  isExpanded.value = !isExpanded.value
}
</script>

<style lang="scss" scoped>
.think-time {
  padding: 7px 14px;
  margin-bottom: 12px;
  border-radius: 10px;
  background-color: #f5f5f5;
  line-height: 18px;
  width: fit-content;
  cursor: pointer;
  user-select: none;
  &:hover {
    background-color: #ededed;
  }
}
.think-container {
  margin-bottom: 12px;
  padding-left: 13px;
  box-sizing: border-box;
  position: relative;
  .think-line {
    position: absolute;
    border-left: 2px solid #e5e5e5;
    height: calc(100% - 10px);
    margin-top: 5px;
    top: 0;
    left: 0;
  }
  .think-main {
    white-space: pre-wrap;
    line-height: 26px;
    color: #8b8b8b;
    font-size: 14px;
  }
}
</style>
