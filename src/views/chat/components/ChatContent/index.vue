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
import echarts from '@/utils/echarts-loader.js'
import { renderMermaid } from '@/utils/mermaid-loader.js'
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

// 渲染mermaid图表
const renderMermaidCharts = () => {
  const mermaidContainers = contentRef.value?.querySelectorAll('.mermaid')
  if (mermaidContainers) {
    mermaidContainers.forEach(async (container) => {
      try {
        const code = container.textContent.trim()
        if (code) {
          const id = 'mermaid-' + Date.now() + '-' + Math.floor(Math.random() * 1e6)
          const svg = await renderMermaid(id, code)
          container.innerHTML = svg
        }
      } catch (error) {
        console.error('Mermaid渲染错误:', error)
        container.innerHTML = `<div class="mermaid-error">图表渲染失败: ${error.message}</div>`
      }
    })
  }
}

// 渲染echarts图表
const renderECharts = () => {
  const echartsContainers = contentRef.value?.querySelectorAll('.echarts-container')
  if (echartsContainers && echartsContainers.length > 0) {
    echartsContainers.forEach((container, index) => {
      // 如果已经渲染过，跳过
      if (container._chart) {
        console.log(`Container ${index} already has a chart, skipping`)
        return
      }

      try {
        const chartElement = container.querySelector('.echarts-chart')
        if (!chartElement) {
          console.warn(`Container ${index} has no .echarts-chart element`)
          return
        }

        const configStr = container.getAttribute('data-config')
        if (!configStr) {
          console.warn(`Container ${index} has no data-config attribute`)
          return
        }

        // 解析配置，处理转义字符
        const cleanedConfigStr = configStr
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')

        const config = JSON.parse(cleanedConfigStr)
        const chart = echarts.init(chartElement)

        // 存储chart实例以便清理
        chartElement._chart = chart
        container._chart = chart

        // 添加响应式调整大小
        if ('ResizeObserver' in window) {
          const resizeObserver = new ResizeObserver(() => {
            chart.resize()
          })
          resizeObserver.observe(chartElement)
          // 存储resizeObserver以便清理
          container._resizeObserver = resizeObserver
        } else {
          console.warn('ResizeObserver not supported, fallback to window resize')
        }

        chart.setOption(config)

        // 添加窗口resize监听作为备用
        const handleResize = () => {
          try {
            chart.resize()
          } catch (e) {
            // 忽略调整大小时的错误
          }
        }
        window.addEventListener('resize', handleResize)
        container._resizeHandler = handleResize
      } catch (error) {
        console.error('ECharts渲染错误:', error)
        const errorElement = container.querySelector('.echarts-chart')
        if (errorElement) {
          errorElement.innerHTML = `<div class="echarts-error" style="padding: 20px; color: #f56c6c;">图表渲染失败: ${error.message}</div>`
        }
      }
    })
  }
}

// 清理echarts图表
const cleanupECharts = () => {
  if (typeof window !== 'undefined' && contentRef.value) {
    const echartsContainers = contentRef.value.querySelectorAll('.echarts-container')
    echartsContainers.forEach((container) => {
      const chartElement = container.querySelector('.echarts-chart')
      if (chartElement && chartElement._chart) {
        chartElement._chart.dispose()
        chartElement._chart = null
      }

      // 清理resizeObserver
      if (container._resizeObserver) {
        container._resizeObserver.disconnect()
        container._resizeObserver = null
      }

      // 清理resize事件监听
      if (container._resizeHandler) {
        window.removeEventListener('resize', container._resizeHandler)
        container._resizeHandler = null
      }
    })
  }
}

onMounted(async () => {
  nextTick(() => {
    scrollToBottom()
    renderMermaidCharts()
    renderECharts()
  })
})

onUpdated(() => {
  // 这里若是放开对话时会持续性的向下滚动
  scrollToBottom()
  nextTick(() => {
    renderMermaidCharts()
    renderECharts()
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

onUnmounted(() => {
  cleanupECharts()
})

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
