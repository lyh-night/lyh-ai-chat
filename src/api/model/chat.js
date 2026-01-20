import instance from '../http.js'

import chatList from '../mock/chatList.json'

export default {
  getChatList(params) {
    return Promise.resolve(chatList)
    // return instance.post('/api/chat/list', params)
  },
  getChatDetail(params) {
    const chatItem = chatList.data.find((item) => item.id == params.id)
    if (!chatItem) {
      return Promise.resolve({ code: 404, msg: '对话不存在', data: [] })
    }
    return Promise.resolve({ code: 0, data: chatItem.children })
    // return instance.post('/api/chat/detail', params)
  }
}
