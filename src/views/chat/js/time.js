// 时间转换

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  const hh = h > 0 ? `${h}时` : ''
  const mm = m > 0 ? `${m}分` : ''
  const ss = s > 0 ? `${s}秒` : ''

  return `${hh}${mm}${ss}`
}
