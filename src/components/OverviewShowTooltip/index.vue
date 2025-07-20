<template>
  <el-tooltip :placement="props.placement" :disabled="isShow">
    <template #content> {{ props.content }} </template>
    <div class="content" :style="{ width: `${props.width}px` }" @mouseover="isShowTooltip">
      <span ref="contentRef">
        <slot name="content">{{ props.content }}</slot>
      </span>
    </div>
  </el-tooltip>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  placement: {
    type: String,
    default: 'top'
  },
  width: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  }
})

const isShow = ref(true)
const contentRef = ref(null)

function isShowTooltip() {
  if (contentRef.value.parentNode.offsetWidth > contentRef.value.offsetWidth) {
    isShow.value = true
  } else {
    isShow.value = false
  }
}
</script>

<style lang="scss" scoped>
.content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
