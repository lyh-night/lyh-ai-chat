import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import { v4 } from 'uuid'

export function highlightBlock(str, lang) {
  return `<pre class="code-block-wrapper"> <div class="code-block-header"> <span class="code-block-header__lang"> ${lang}</span><span class="code-block-header__copy"><i class="iconfont icon-fuzhi"></i>复制</span> </div> <code class="hljs code-block-body ${lang}">${str}</code> </pre>`
}

// 自定义插件：直接渲染特定类型的代码块，不被pre/code包裹
function resourcePlugin(md) {
  // 保存原始的代码块渲染器
  const defaultRender =
    md.renderer.rules.fence ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }

  // 覆盖代码块渲染器
  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    const code = token.content.trim()
    const language = token.info.trim()

    // 处理特殊类型的代码块
    if (['mermaid', 'echarts', 'video', 'audio', 'iframe'].includes(language)) {
      let html = ''

      try {
        switch (language) {
          case 'mermaid':
            html = `<div class="mermaid-container"><div class="code-block-header"><span class="code-block-header__lang">mermaid</span></div><div class="mermaid">${code}</div></div>`
            break

          case 'echarts':
            const config = JSON.parse(code)
            const configStr = JSON.stringify(config).replace(/"/g, '&quot;')
            html = `<div class="echarts-container" data-config="${configStr}"><div class="code-block-header"><span class="code-block-header__lang">echarts</span></div><div class="echarts-chart"></div></div>`
            break

          case 'video':
            const videoData = JSON.parse(code)
            const videoId = 'video-' + v4()
            html = `<div class="video-placeholder" data-video-id="${videoId}" data-video-src="${encodeURIComponent(videoData.src)}" data-video-poster="${encodeURIComponent(videoData.poster || '')}" data-video-controls="${videoData.controls !== false}"> </div>`
            break

          case 'audio':
            const audioData = JSON.parse(code)
            const audioId = 'audio-' + v4()
            html = `<div class="audio-placeholder" data-audio-id="${audioId}" data-audio-src="${encodeURIComponent(audioData.src)}" data-audio-controls="${audioData.controls !== false}" data-audio-autoplay="${audioData.autoplay === true}" data-audio-muted="${audioData.muted === true}" data-audio-loop="${audioData.loop === true}"> </div>`
            break

          case 'iframe':
            const iframeData = JSON.parse(code)
            const iframeId = 'iframe-' + v4()
            html = `<div class="iframe-placeholder" data-iframe-id="${iframeId}" data-iframe-src="${encodeURIComponent(iframeData.src)}" data-iframe-width="${iframeData.width || 560}" data-iframe-height="${iframeData.height || 315}" data-iframe-title="${encodeURIComponent(iframeData.title || '')}" data-iframe-frameborder="${iframeData.frameborder || 0}" data-iframe-allow="${encodeURIComponent(iframeData.allow || '')}" data-iframe-allowfullscreen="${iframeData.allowfullscreen === true}"> </div>`
            break
        }
      } catch (error) {
        html = `<div class="${language}-error">${language}配置JSON解析错误: ${error.message}</div>`
      }

      // 直接返回HTML，不被pre/code包裹
      return html
    }

    // 其他类型的代码块，使用默认渲染器
    return defaultRender(tokens, idx, options, env, self)
  }
}

export const md = new MarkdownIt({
  html: false,
  linkify: true,
  highlight: function (code, language) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  }
})

// 使用自定义插件
md.use(resourcePlugin)

// 语义边界检测：检查字符串末尾是否是完整的Markdown语法单元
export function hasCompleteMarkdownSyntax(str) {
  // 检查是否有未闭合的粗体/斜体标记
  const boldItalicPattern = /(?:\*\*|__|\*|_)$/
  if (boldItalicPattern.test(str)) return false

  // 检查是否有未闭合的代码块：统计 ``` 的数量，如果奇数则表示未闭合
  const codeBlockStarts = (str.match(/```/g) || []).length
  if (codeBlockStarts % 2 !== 0) {
    // 代码块未闭合，但仍然允许渲染已有的内容
    // 这里返回 true，允许增量渲染，因为代码块内部的内容不需要实时渲染
    return true
  }

  // 检查是否有未闭合的HTML标签（简单检查）
  const unclosedTagPattern = /<[^>]*$/i
  if (unclosedTagPattern.test(str)) return false

  // 检查是否有未闭合的括号
  const unclosedBracketPattern = /\([^)]*$|\[[^\]]*$|\{[^}]*$|<[^>]*$/
  if (unclosedBracketPattern.test(str)) return false

  return true
}

// 增量渲染HTML：只渲染完整的Markdown部分
export function incrementalRenderMarkdown(fullText, lastRenderedLength = 0) {
  // 如果没有新增内容，直接返回空字符串
  if (fullText.length <= lastRenderedLength) return { html: '', length: lastRenderedLength }

  // 尝试找到完整的Markdown语法单元边界
  let renderableLength = fullText.length - lastRenderedLength

  // 从后向前检查，找到第一个完整的语法单元
  for (let i = fullText.length; i >= lastRenderedLength; i--) {
    const testText = fullText.slice(0, i)
    if (hasCompleteMarkdownSyntax(testText)) {
      renderableLength = i - lastRenderedLength
      break
    }
  }

  // 如果没有找到完整的语法单元，返回空
  if (renderableLength === 0) return { html: '', length: lastRenderedLength }

  // 获取当前已渲染的HTML长度（用于定位）
  let currentMessage = ''
  if (lastRenderedLength > 0) {
    // 渲染到上一次的位置，获取当前HTML
    const prevRenderedText = fullText.slice(0, lastRenderedLength)
    currentMessage = DOMPurify.sanitize(md.render(prevRenderedText))
  }

  // 渲染到当前找到的完整语法单元位置
  const renderableText = fullText.slice(0, lastRenderedLength + renderableLength)
  const fullHtml = DOMPurify.sanitize(md.render(renderableText))

  // 计算新增的HTML部分
  const newHtml = fullHtml.slice(currentMessage.length)

  return { html: newHtml, length: lastRenderedLength + renderableLength }
}

export function handleChatMessage(aiText) {
  const rawHtml = md.render(aiText)
  return DOMPurify.sanitize(rawHtml)
}

// 处理think标签的工具函数
export function parseThinkContent(content) {
  const thinkPattern = /<think>([\s\S]*?)<\/think>/g
  const nonThinkContent = content.replace(thinkPattern, '')
  let thinkingContent = ''
  let match

  while ((match = thinkPattern.exec(content)) !== null) {
    thinkingContent += match[1]
  }

  return { nonThinkContent, thinkingContent }
}

export function handleThinkMessage(val) {
  return val.replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\n', '<div style="height: 6px"></div>')
}
