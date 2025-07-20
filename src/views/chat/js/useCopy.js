// 复制 hooks
import { ElMessage } from 'element-plus'

export function useClipboard() {
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      ElMessage({ type: 'success', message: '复制成功' })
    } catch (e) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      try {
        document.execCommand('copy')
        ElMessage({ type: 'success', message: '复制成功' })
      } catch {
        ElMessage({ type: 'error', message: '复制失败' })
      }
      document.body.removeChild(textarea)
    }
  }

  return { copy }
}
