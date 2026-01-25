import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'

export function highlightBlock(str, lang) {
  return `<pre class="code-block-wrapper"> <div class="code-block-header"> <span class="code-block-header__lang"> ${lang}</span><span class="code-block-header__copy"><i class="iconfont icon-fuzhi"></i>复制</span> </div> <code class="hljs code-block-body ${lang}">${str}</code> </pre>`
}

export const md = new MarkdownIt({
  html: false,
  linkify: true,
  highlight: function (code, language) {
    // 特殊处理mermaid图表
    if (language === 'mermaid') {
      // 生成mermaid容器，由客户端mermaid.js初始化
      return `<div class="mermaid-container"><div class="code-block-header"><span class="code-block-header__lang">mermaid</span></div><div class="mermaid">${code}</div></div>`
    }
    // 特殊处理echarts图表
    if (language === 'echarts') {
      // 生成echarts容器，由客户端echarts.js初始化
      try {
        const config = JSON.parse(code)
        const configStr = JSON.stringify(config).replace(/"/g, '&quot;')
        return `<div class="echarts-container" data-config="${configStr}"><div class="code-block-header"><span class="code-block-header__lang">echarts</span></div><div class="echarts-chart"></div></div>`
      } catch (error) {
        return `<div class="echarts-error">ECharts配置JSON解析错误: ${error.message}</div>`
      }
    }
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  }
})

// 语义边界检测：检查字符串末尾是否是完整的Markdown语法单元
export function hasCompleteMarkdownSyntax(str) {
  // 检查是否有未闭合的粗体/斜体标记
  const boldItalicPattern = /(?:\*\*|__|\*|_)$/
  if (boldItalicPattern.test(str)) return false

  // 检查是否有未闭合的代码块
  const codeBlockPattern = /```[\s\S]*?$/
  if (codeBlockPattern.test(str)) return false

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

  // 获取新增的文本
  const newText = fullText.slice(lastRenderedLength)

  // 尝试找到完整的Markdown语法单元边界
  let renderableLength = 0
  for (let i = newText.length; i >= 0; i--) {
    const testText = fullText.slice(0, lastRenderedLength + i)
    if (hasCompleteMarkdownSyntax(testText)) {
      renderableLength = i
      break
    }
  }

  // 如果没有找到完整的语法单元，返回空
  if (renderableLength === 0) return { html: '', length: lastRenderedLength }

  // 渲染完整的部分
  const renderableText = fullText.slice(0, lastRenderedLength + renderableLength)
  const rawHtml = md.render(renderableText)
  const sanitizedHtml = DOMPurify.sanitize(rawHtml)

  return { html: sanitizedHtml, length: lastRenderedLength + renderableLength }
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
