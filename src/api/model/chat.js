import instance from '../http.js'

export default {
  getChatList(params) {
    return instance.post('/api/chat/list', params)
  },
  getChatDetail(params) {
    return instance.post('/api/chat/detail', params)
  }
}
