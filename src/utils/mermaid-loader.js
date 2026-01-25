let mermaidInstance = null
let initialized = false

export async function getMermaid() {
  if (mermaidInstance) return mermaidInstance

  const mermaid = await import('mermaid')
  const instance = mermaid.default || mermaid

  mermaidInstance = instance
  return mermaidInstance
}

export async function initMermaidOnce() {
  const mermaid = await getMermaid()

  if (!initialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true
      }
    })

    initialized = true
  }

  return mermaid
}

export async function renderMermaid(id, code) {
  const mermaid = await initMermaidOnce()

  const result = await Promise.resolve(mermaid.render(id, code))

  return result.svg
}
