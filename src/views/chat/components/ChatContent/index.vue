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
import { onMounted, onUpdated, nextTick, ref } from 'vue'
import ChatLoading from './ChatLoading.vue'
import Avatar from './Avatar.vue'
import Think from './Think.vue'

import 'github-markdown-css/github-markdown.css'
import { useScroll } from '../../js/useScroll.js'
import { useClipboard } from '../../js/useCopy.js'

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

// 加载mermaid库
const loadMermaid = async () => {
  if (typeof window !== 'undefined' && !window.mermaid) {
    const mermaid = await import('mermaid')
    window.mermaid = mermaid.default
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true
      }
    })
  }
}

// 渲染mermaid图表
const renderMermaidCharts = () => {
  if (typeof window !== 'undefined' && window.mermaid) {
    const mermaidContainers = contentRef.value?.querySelectorAll('.mermaid')
    if (mermaidContainers) {
      mermaidContainers.forEach(async (container) => {
        try {
          const code = container.textContent.trim()
          if (code) {
            const id = 'mermaid-' + Date.now() + '-' + Math.floor(Math.random() * 1e6)
            const { svg } = await window.mermaid.render(id, code)
            container.innerHTML = svg
          }
        } catch (error) {
          console.error('Mermaid渲染错误:', error)
          container.innerHTML = `<div class="mermaid-error">图表渲染失败: ${error.message}</div>`
        }
      })
    }
  }
}

onMounted(async () => {
  await loadMermaid()
  nextTick(() => {
    scrollToBottom()
    renderMermaidCharts()
  })
})

// 这里若是放开对话时会持续性的向下滚动
onUpdated(() => {
  scrollToBottom()
  nextTick(() => {
    renderMermaidCharts()
  })
})

const contentRef = ref(null)

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
