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
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  }
})

export function handleChatMessage(aiText) {
  const rawHtml = md.render(aiText)
  return DOMPurify.sanitize(rawHtml)
}

export function handleThinkMessage(val) {
  return val.replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\n', '<div style="height: 6px"></div>')
}
