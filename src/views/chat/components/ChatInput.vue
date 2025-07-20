<template>
  <div class="chat-input">
    <textarea
      ref="textareaRef"
      v-model="state.inputMessage"
      :rows="2"
      placeholder="请输入内容开始对话（shift+Enter换行）"
      @keydown.enter="handleEnter"
      @input="updateHeight"
    />
    <div class="chat-send-container">
      <i v-if="!props.loading" class="iconfont icon-fasong" @click="handleSubmit" />
      <i v-else class="iconfont icon-zanting" @click="stopChat" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['createDialogue', 'stopChat'])

const state = reactive({
  inputMessage: ''
})

function handleEnter(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}

function handleSubmit() {
  if (
    !state.inputMessage ||
    state.inputMessage.trim() === '' ||
    state.inputMessage.split(/\r\n/).every((line) => line.trim === '')
  ) {
    return
  }
  emits('createDialogue', state.inputMessage)
  state.inputMessage = ''
}

const textareaRef = ref(null)
const updateHeight = () => {
  const el = textareaRef.value
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

function stopChat() {
  emits('stopChat')
}
</script>

<style lang="scss" scoped>
.chat-input {
  width: calc(100% - 40px);
  max-width: 960px;
  min-width: 360px;
  margin: 0px 20px 20px 20px;
  padding: 5px 10px;
  box-sizing: border-box;
  border-radius: 10px;
  background-color: #f1f2f7;
  textarea {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    border: 0px;
    resize: none;
    overflow: auto;
    background-color: #f1f2f7;
    line-height: 1.5;
    max-height: 120px;
    font-family: inherit;
    transition: height 0.2s ease;
    &:focus {
      outline: none;
    }
    &:disabled {
      cursor: not-allowed;
    }
  }
  .chat-send-container {
    display: flex;
    justify-content: flex-end;
    .iconfont {
      cursor: pointer;
      font-size: 30px;
      color: #222;
    }
  }
}
</style>
