import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import { v4 } from 'uuid'
import katex from 'katex'
import 'katex/dist/katex.min.css'

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
            html = `<div class="echarts-container"><div class="code-block-header"><span class="code-block-header__lang">echarts</span></div><div class="echarts-chart" data-config="${configStr}"></div></div>`
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

// 自定义数学公式渲染插件
function mathPlugin(md) {
  // 覆盖内联渲染器，处理行内公式 $...$
  md.renderer.rules.text = function (tokens, idx, options, env, self) {
    let text = tokens[idx].content

    // 替换行内公式：$...$ -> KaTeX渲染
    text = text.replace(/\$(.*?)\$/g, (match, content) => {
      try {
        return katex.renderToString(content.trim(), {
          throwOnError: false,
          displayMode: false,
          output: 'html'
        })
      } catch (error) {
        console.error('KaTeX行内公式渲染错误:', error)
        return match
      }
    })

    return text
  }

  // 覆盖代码块渲染器，处理块级公式
  const defaultFenceRender =
    md.renderer.rules.fence ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }

  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    const content = token.content.trim()
    const info = token.info.trim()

    // 如果是 math 代码块，直接渲染
    if (info === 'math') {
      try {
        return `<div class="math-block">${katex.renderToString(content, {
          throwOnError: false,
          displayMode: true,
          output: 'html'
        })}</div>`
      } catch (error) {
        console.error('KaTeX块级公式渲染错误:', error)
        return `<div class="math-error">${content}</div>`
      }
    }

    // 否则使用默认渲染
    return defaultFenceRender(tokens, idx, options, env, self)
  }

  // 处理 $$...$$ 格式的块级公式
  md.core.ruler.push('math_blocks', function (state) {
    for (let i = 0; i < state.tokens.length; i++) {
      if (state.tokens[i].type !== 'paragraph_open') continue

      const inlineToken = state.tokens[i + 1]
      if (inlineToken.type !== 'inline') continue

      const text = inlineToken.content
      const mathBlockMatch = text.match(/^\$\$(.*?)\$\$/s)
      if (mathBlockMatch) {
        // 清空原段落的内联内容
        inlineToken.content = ''

        // 创建数学块token
        const mathToken = {
          type: 'math_block',
          content: mathBlockMatch[1].trim(),
          block: true
        }

        // 在段落内插入数学块
        // 位置：在inlineToken之后，paragraph_close之前
        state.tokens.splice(i + 2, 0, mathToken)
      }
    }
  })

  // 添加数学块渲染器
  md.renderer.rules.math_block = function (tokens, idx, options, env, self) {
    const content = tokens[idx].content
    try {
      return `<div class="math-block">${katex.renderToString(content, {
        throwOnError: false,
        displayMode: true,
        output: 'html'
      })}</div>`
    } catch (error) {
      console.error('KaTeX块级公式渲染错误:', error)
      return `<div class="math-error">${content}</div>`
    }
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

// 使用自定义数学公式插件
md.use(mathPlugin)

// 语义边界检测：检查字符串末尾是否是完整的Markdown语法单元
export function hasCompleteMarkdownSyntax(str) {
  // 检查是否有未闭合的粗体/斜体标记
  const boldItalicPattern = /(?:\*\*|__|\*|_)$/
  if (boldItalicPattern.test(str)) return false

  // 检查是否有未闭合的代码块：统计 ``` 的数量，如果奇数则表示未闭合
  const codeBlockStarts = (str.match(/```/g) || []).length
  if (codeBlockStarts % 2 !== 0) {
    // 代码块未闭合，但仍然允许渲染已有的内容
    return true
  }

  // 检查是否有未闭合的HTML标签（简单检查）
  const unclosedTagPattern = /<[^>]*$/i
  if (unclosedTagPattern.test(str)) return false

  // 检查是否有未闭合的括号
  const unclosedBracketPattern = /\([^)]*$|\[[^\]]*$|\{[^}]*$|<[^>]*$/
  if (unclosedBracketPattern.test(str)) return false

  // 数学公式特殊处理：允许未闭合的数学公式通过检查
  // 检查未闭合的行内公式
  const inlineMathCount = (str.match(/\$/g) || []).length
  // 检查未闭合的块级公式
  const blockMathCount = (str.match(/\$\$/g) || []).length

  // 如果只有未闭合的数学公式，仍然允许渲染
  if (inlineMathCount % 2 !== 0 || blockMathCount % 2 !== 0) {
    return true
  }

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
