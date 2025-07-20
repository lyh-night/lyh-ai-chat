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

const historyKeyObj = {
  today: '今天',
  yesterday: '昨天',
  beforeYesterday: '其它时间'
}

function getHsitoryList() {
  chatApi.getChatList().then((res) => {
    if (res.code === 0) {
      const list = res.data || []
      const cur_time = new Date().getTime()

      const classifyDate = (data, cur_time) => {
        const classifyData = {
          today: [],
          yesterday: [],
          beforeYesterday: []
        }
        data.forEach((item) => {
          const updated_time = new Date(item.updated_at * 1000).getTime()
          if (cur_time - updated_time > 2 * 24 * 60 * 60 * 1000) {
            classifyData.beforeYesterday.push(item)
          } else if (cur_time - updated_time > 1 * 24 * 60 * 60 * 1000) {
            classifyData.yesterday.push(item)
          } else {
            classifyData.today.push(item)
          }
        })
        const results = []
        for (let item in classifyData) {
          if (classifyData[item].length > 0) {
            results.push({ label: historyKeyObj[item], key: item, children: classifyData[item] })
          }
        }
        return results
      }
      state.chatHistoryList = classifyDate(list, cur_time)
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
