<template>
  <div class="chat-sidebar" :style="{ 'flex-basis': sidebarWidth }">
    <div class="header">
      <div v-show="!state.isCollapsed" class="chat-add" @click="createChat">
        <span>新建对话</span>
      </div>
      <i class="fold-btn iconfont icon-sidebar" @click="changeCollapsed" />
    </div>
    <div v-show="!state.isCollapsed" class="history-list">
      <div v-for="item in state.chatHistoryList" :key="item.key">
        <div class="title">{{ item.label }}</div>
        <div>
          <div
            v-for="children_item in item.children"
            :key="children_item.id"
            :class="['history-item', state.activeId == children_item.id ? 'active' : '']"
            @click="selectChat(children_item)"
          >
            <OverviewShowTooltip :content="children_item.title" width="100%" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import chatApi from '@/api/model/chat.js'
import { formatTime } from '@/utils/time.js'

const state = reactive({
  activeId: '',
  isCollapsed: true,
  chatHistoryList: []
})

const sidebarWidth = computed(() => {
  return state.isCollapsed ? '60px' : '250px'
})

function changeCollapsed() {
  state.isCollapsed = !state.isCollapsed
}

const emits = defineEmits(['changeChat'])
function selectChat(row) {
  state.activeId = row.id
  emits('changeChat', row.id)
}

function createChat() {
  state.activeId = ''
  emits('changeChat', '')
}

onMounted(() => {
  getHsitoryList()
})

function getChatClassify(time) {
  const cur_time = Math.floor(new Date().getTime() / 1000)
  if (cur_time - time < 24 * 60 * 60) {
    return { label: '今天', value: 'today' }
  } else if (cur_time - time < 2 * 24 * 60 * 60) {
    return { label: '昨天', value: 'yesterday' }
  } else if (cur_time - time < 7 * 24 * 60 * 60) {
    return { label: '7天内', value: 'with7' }
  } else if (cur_time - time < 30 * 24 * 60 * 60) {
    return { label: '30天内', value: 'with30' }
  } else {
    return { label: formatTime(time * 1000, 'YYYY-MM'), value: formatTime(time * 1000, 'YYYY-MM') }
  }
}

function getHsitoryList() {
  chatApi.getChatList().then((res) => {
    if (res.code === 0) {
      const list = res.data || []
      const classifyData = {}
      list.forEach((item) => {
        const { label, value } = getChatClassify(item.updated_at)
        if (!classifyData[value]) {
          classifyData[value] = {
            label: label,
            value: value,
            children: []
          }
        }
        classifyData[value].children.push(item)
      })
      state.chatHistoryList = Object.values(classifyData)
    }
  })
}
</script>

<style lang="scss" scoped>
.chat-sidebar {
  padding: 10px;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background-color: #f9fbff;
  flex-shrink: 0;
  flex-grow: 0;
  overflow: hidden;
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    .chat-add {
      width: 134px;
      height: 46px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #4d6bfe;
      background-color: #dbeafe;
      border-radius: 10px;
      user-select: none;
      &:hover {
        background-color: #c6dcf8;
      }
    }
    .fold-btn {
      font-size: 30px;
      cursor: pointer;
    }
  }
  .history-list {
    height: calc(100% - 46px);
    overflow-y: auto;
    .title {
      font-weight: 600;
      font-size: 16px;
      color: #000;
      line-height: 20px;
      padding: 10px;
      box-sizing: border-box;
    }
    .history-item {
      padding: 10px;
      box-sizing: border-box;
      cursor: pointer;
      border-radius: 4px;
      &:hover {
        background-color: #eff6ff;
      }
      &.active {
        background-color: #dbeafe;
      }
    }
  }
}
</style>
