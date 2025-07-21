import instance from '../http.js'

import chatList from './mock/chatList.json'

export default {
  getChatList(params) {
    return Promise.resolve(chatList)
    // return instance.post('/api/chat/list', params)
  },
  getChatDetail(params) {
    const children = chatList.data.find((item) => item.id == params.id).children
    return Promise.resolve({ code: 0, data: children })
    // return instance.post('/api/chat/detail', params)
  }
}
