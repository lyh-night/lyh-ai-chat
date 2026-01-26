import { v4 } from 'uuid'
import { renderMermaid } from '@/utils/mermaid-loader.js'
import echarts from '@/utils/echarts-loader.js'

// 渲染mermaid图表
export const renderMermaidCharts = (root) => {
  const nodes = root.querySelectorAll('.mermaid')
  if (!nodes || nodes.length === 0) return
  nodes.forEach(async (el) => {
    if (el.__rendered) return
    try {
      const code = el.textContent.trim()
      if (code) {
        const id = 'mermaid-' + v4()
        const svg = await renderMermaid(id, code)
        el.innerHTML = svg
        el.__rendered = true
      }
    } catch (error) {
      console.error('Mermaid渲染错误:', error)
      el.innerHTML = `<div class="mermaid-error">图表渲染失败: ${error.message}</div>`
    }
  })
}

// 渲染echarts图表
export const renderECharts = (root) => {
  const nodes = root.querySelectorAll('.echarts-chart')
  if (!nodes || nodes.length === 0) return
  nodes.forEach((el, index) => {
    if (el.__rendered) return
    try {
      const configStr = el.getAttribute('data-config')
      if (!configStr) {
        console.warn(`el ${index} has no data-config attribute`)
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
      const chart = echarts.init(el)

      // 存储chart实例以便清理
      el._chart = chart
      chart.setOption(config)
      el.__rendered = true

      // 添加响应式调整大小
      if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(() => chart.resize())
        resizeObserver.observe(el)
        // 存储resizeObserver以便清理
        el._resizeObserver = resizeObserver
      } else {
        console.warn('ResizeObserver not supported, fallback to window resize')
      }

      // 添加窗口resize监听作为备用
      const handleResize = () => {
        try {
          chart.resize()
        } catch (e) {
          // 忽略调整大小时的错误
        }
      }
      window.addEventListener('resize', handleResize)
      el._resizeHandler = handleResize
    } catch (error) {
      console.error('ECharts渲染错误:', error)
      el.innerHTML = `<div class="echarts-error" style="padding: 20px; color: #f56c6c;">图表渲染失败: ${error.message}</div>`
    }
  })
}

// 清理echarts图表
export const cleanupECharts = (root) => {
  const nodes = root.querySelectorAll('.echarts-container')
  if (!nodes || nodes.length === 0) return
  nodes.forEach((container) => {
    const chartElement = container.querySelector('.echarts-chart')
    if (chartElement && chartElement._chart) {
      chartElement._chart.dispose()
      chartElement._chart = null
    }

    // 清理resizeObserver
    if (chartElement._resizeObserver) {
      chartElement._resizeObserver.disconnect()
      chartElement._resizeObserver = null
    }

    // 清理resize事件监听
    if (chartElement._resizeHandler) {
      window.removeEventListener('resize', chartElement._resizeHandler)
      chartElement._resizeHandler = null
    }
  })
}

export const renderVideo = (root) => {
  const nodes = root.querySelectorAll('.video-placeholder')
  if (!nodes || nodes.length === 0) return

  nodes.forEach((el) => {
    if (el.__rendered) return

    const src = decodeURIComponent(el.dataset.videoSrc)
    const poster = decodeURIComponent(el.dataset.videoPoster || '')
    const controls = el.dataset.videoControls !== 'false'

    const video = document.createElement('video')
    video.src = src
    video.controls = controls
    video.playsInline = true
    video.preload = 'metadata'

    if (poster) video.poster = poster

    video.style.maxWidth = '100%'
    video.style.borderRadius = '8px'

    el.appendChild(video)
    el.__rendered = true
  })
}

// 渲染音频元素
export const renderAudio = (root) => {
  const nodes = root.querySelectorAll('.audio-placeholder')
  if (!nodes || nodes.length === 0) return

  nodes.forEach((el) => {
    if (el.__rendered) return

    const src = decodeURIComponent(el.dataset.audioSrc)
    const controls = el.dataset.audioControls !== 'false'
    const autoplay = el.dataset.audioAutoplay === 'true'
    const muted = el.dataset.audioMuted === 'true'
    const loop = el.dataset.audioLoop === 'true'

    const audio = document.createElement('audio')
    audio.src = src
    audio.controls = controls
    audio.autoplay = autoplay
    audio.muted = muted
    audio.loop = loop

    audio.style.maxWidth = '100%'
    audio.style.borderRadius = '8px'
    audio.style.display = 'block'

    el.appendChild(audio)
    el.__rendered = true
  })
}

// 渲染iframe元素
export const renderIframe = (root) => {
  const nodes = root.querySelectorAll('.iframe-placeholder')
  if (!nodes || nodes.length === 0) return

  nodes.forEach((el) => {
    if (el.__rendered) return

    const src = decodeURIComponent(el.dataset.iframeSrc)
    const width = parseInt(el.dataset.iframeWidth || '560')
    const height = parseInt(el.dataset.iframeHeight || '315')
    const title = decodeURIComponent(el.dataset.iframeTitle || '')
    const frameborder = parseInt(el.dataset.iframeFrameborder || '0')
    const allow = decodeURIComponent(el.dataset.iframeAllow || '')
    const allowfullscreen = el.dataset.iframeAllowfullscreen === 'true'

    const iframe = document.createElement('iframe')
    iframe.src = src
    iframe.width = width
    iframe.height = height
    iframe.title = title
    iframe.frameborder = frameborder
    iframe.allow = allow
    if (allowfullscreen) {
      iframe.allowFullscreen = true
    }

    iframe.style.maxWidth = '100%'
    iframe.style.borderRadius = '8px'
    iframe.style.border = frameborder === 0 ? 'none' : '1px solid #ddd'

    el.appendChild(iframe)
    el.__rendered = true
  })
}
