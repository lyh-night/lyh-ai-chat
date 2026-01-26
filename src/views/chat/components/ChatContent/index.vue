<template>
  <div ref="scrollRef" class="chat-content" @scroll="handleScroll">
    <div ref="contentRef" class="talk-content" @click="handleContentClick">
      <div v-for="(item, i) in props.contentList" :key="i">
        <!-- 问题 -->
        <avatar v-if="item.type == 'send'" :data="item" />
        <!-- 回答 -->
        <div v-if="item.type == 'receive'" class="answer-body">
          <!-- 加载中 -->
          <ChatLoading v-if="item.status == 'loading'" />
          <!-- 思考中 -->
          <Think v-if="item.thinking_content" :data="item" />
          <!-- 回答具体内容 -->
          <div v-html="item.message" class="markdown-body" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUpdated, onUnmounted, nextTick, ref } from 'vue'
import ChatLoading from './ChatLoading.vue'
import Avatar from './Avatar.vue'
import Think from './Think.vue'

import 'github-markdown-css/github-markdown.css'
import { useScroll } from '../../js/useScroll.js'
import { useClipboard } from '../../js/useCopy.js'
import {
  renderVideo,
  renderAudio,
  renderIframe,
  renderMermaidCharts,
  renderECharts,
  cleanupECharts
} from '../../js/render.js'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  contentList: {
    type: Array,
    default: () => []
  }
})

const { scrollRef, userStopped, scrollToBottom, handleScroll } = useScroll()

const contentRef = ref(null)

onMounted(() => {
  nextTick(() => {
    renderChatContent()
    scrollToBottom()
  })
})

onUpdated(() => {
  // 这里若是放开对话时会持续性的向下滚动
  nextTick(() => {
    renderChatContent()
    scrollToBottom()
  })
})

onUnmounted(() => {
  cleanupECharts(contentRef.value)
})

function renderChatContent() {
  renderMermaidCharts(contentRef.value)
  renderECharts(contentRef.value)
  renderVideo(contentRef.value)
  renderAudio(contentRef.value)
  renderIframe(contentRef.value)
}

function scrollChatStart() {
  userStopped.value = false
}

const { copy } = useClipboard()

async function handleContentClick(e) {
  const target = e.target
  if (target.classList.contains('code-block-header__copy')) {
    const pre = target.closest('pre')
    const code = pre?.querySelector('code')?.innerText
    if (code) {
      await copy(code)
    }
  }
}

defineExpose({ scrollChatStart })
</script>

<style lang="scss">
@use '../../style/markdown-body.scss';
@use '../../style/custom-code-block.scss';

.chat-content {
  overflow: auto;
  width: 100%;
  .talk-content {
    width: calc(100% - 40px);
    max-width: 960px;
    min-width: 360px;
    padding: 20px;
    box-sizing: border-box;
    margin: auto;
    .answer-body {
      width: 100%;
      margin-bottom: 20px;
    }
  }
}
</style>
