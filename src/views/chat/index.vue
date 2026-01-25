<template>
  <div class="chat-container">
    <ChatHistory @changeChat="changeChat" />
    <div class="chat-window">
      <Welcome v-if="state.contentList.length === 0" />
      <ChatContent v-else ref="ChatContentRef" :loading="state.loading" :contentList="state.contentList" />
      <ChatInput :loading="state.loading" @createDialogue="createDialogue" @stopChat="stopChat" />
    </div>
  </div>
</template>

<script setup>
import ChatHistory from './components/ChatHistory.vue'
import Welcome from './components/Welcome.vue'
import ChatInput from './components/ChatInput.vue'
import ChatContent from './components/ChatContent/index.vue'

import { fetchEventSource } from '@microsoft/fetch-event-source'
import { handleChatMessage, handleThinkMessage, parseThinkContent, incrementalRenderMarkdown } from './js/mdInstance.js'
import 'highlight.js/styles/github.css'
import chatApi from '@/api/model/chat.js'
import { formatDuration } from './js/time.js'

const baseUrl = import.meta.env.VITE_APP_BASE_API

const state = reactive({
  loading: false,
  contentList: [],
  eventSourceChat: null,
  chatController: null
})

const ChatContentRef = ref(null)

async function createDialogue(message) {
  ChatContentRef.value && ChatContentRef.value.scrollChatStart()
  state.contentList.push({ type: 'send', message: message })
  state.contentList.push({ type: 'receive', status: 'loading', message: '', thinking_content: '', raw_message: '' })

  let buffer = ''
  let lastRenderedLength = 0
  const start_time = new Date().getTime()

  state.chatController = new AbortController()

  state.loading = true
  await fetchEventSource(`${baseUrl}/api/chat`, {
    method: 'POST',
    body: JSON.stringify({ prompt: message }),
    headers: {
      'Content-Type': 'application/json'
      // Authorization: 'Bearer your-token'
    },
    signal: state.chatController.signal,

    onopen(res) {
      if (res.ok && res.headers.get('content-type') === 'text/event-stream') {
        console.log('✔️ 连接成功')
      } else {
        updateChatEndContent({ key: 'status', value: 'error' })
        throw new Error('❌ 连接失败')
      }
    },

    onmessage(event) {
      console.log('📥 收到消息:', event.data)
      if (event.data == '[DONE]') {
        // 确保所有剩余内容都被渲染
        if (buffer && lastRenderedLength < buffer.length) {
          // 使用剩余内容进行增量渲染
          const { html } = incrementalRenderMarkdown(buffer, lastRenderedLength)
          if (html) {
            updateChatEndContent({
              key: 'message',
              value: state.contentList[state.contentList.length - 1].message + html
            })
          }
        }
        updateChatEndContent({ key: 'status', value: 'finish' })
        state.loading = false
        return
      }
      updateChatEndContent({ key: 'status', value: 'response' })
      const content = JSON.parse(event.data)
      if (content) {
        buffer += content

        // 使用parseThinkContent处理think标签，确保正确分离思考内容和普通内容
        const { nonThinkContent, thinkingContent } = parseThinkContent(buffer)

        if (thinkingContent) {
          updateChatEndContent({ key: 'thinking_content', value: handleThinkMessage(thinkingContent) })
          const thinking_time = formatDuration(Math.floor((new Date().getTime() - start_time) / 1000))
          updateChatEndContent({ key: 'thinking_time', value: thinking_time })
        }

        // 使用增量渲染功能，只渲染完整的Markdown部分
        const { html, length } = incrementalRenderMarkdown(nonThinkContent, lastRenderedLength)
        if (html) {
          updateChatEndContent({ key: 'message', value: html })
          lastRenderedLength = length
        }
      }
    },

    onclose() {
      console.log('🔌 连接关闭')
      // 确保所有内容都被渲染
      if (buffer) {
        updateChatEndContent({ key: 'message', value: handleChatMessage(buffer) })
      }
      updateChatEndContent({ key: 'status', value: 'close' })
      state.loading = false
    },

    onerror(err) {
      console.error('🔥 连接出错:', err)
      state.loading = false
      updateChatEndContent({ key: 'status', value: 'error' })
      throw err
    }
  })
}

function updateChatEndContent(obj) {
  state.contentList[state.contentList.length - 1][obj.key] = obj.value
}

// 取消对话
function stopChat() {
  state.chatController && state.chatController.abort()
  state.loading = false
}

function changeChat(id) {
  if (id) {
    getChatDetail(id)
  } else {
    state.contentList = []
  }
}

function getChatDetail(id) {
  chatApi.getChatDetail({ id }).then((res) => {
    if (res.code == 0) {
      const chat_messages = res.data || []
      state.contentList = chat_messages.map((item) => {
        if (item.role == 'USER') {
          return {
            type: 'send',
            message: item.content
          }
        } else {
          return {
            type: 'receive',
            status: 'finish',
            thinking_time: formatDuration(item.thinking_elapsed_secs),
            thinking_content: handleThinkMessage(item.thinking_content),
            message: handleChatMessage(item.content)
          }
        }
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.chat-container {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: auto;
  .chat-window {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    .chat-content {
      flex: 1;
    }
  }
}
</style>
