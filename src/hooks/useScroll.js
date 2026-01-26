import { ref } from 'vue'

export function useScroll() {
  const scrollRef = ref(null)
  const userStopped = ref(false)
  let isAuto = false

  const scrollToBottom = () => {
    if (!scrollRef.value || userStopped.value) {
      return
    }
    isAuto = true
    scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    setTimeout(() => {
      isAuto = false
    }, 150)
  }

  const scrollToTop = async () => {
    if (scrollRef.value) scrollRef.value.scrollTop = 0
  }

  const scrollToBottomIfAtBottom = async () => {
    if (scrollRef.value) {
      const threshold = 100 // Threshold, indicating the distance threshold to the bottom of the scroll bar.
      const distanceToBottom = scrollRef.value.scrollHeight - scrollRef.value.scrollTop - scrollRef.value.clientHeight
      if (distanceToBottom <= threshold) scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    }
  }

  function handleScroll() {
    if (isAuto) return // 忽略程序触发的滚动
    const distance = scrollRef.value.scrollHeight - scrollRef.value.scrollTop - scrollRef.value.clientHeight
    // 如果距离底部大于一定阈值，认为用户手动滚动了
    userStopped.value = distance > 50
  }

  return {
    scrollRef,
    userStopped,
    scrollToBottom,
    scrollToTop,
    scrollToBottomIfAtBottom,
    handleScroll
  }
}
