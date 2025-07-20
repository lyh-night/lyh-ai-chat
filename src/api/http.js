import axios from 'axios'

// 创建 axios 实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 请求成功
    return Promise.resolve(response.data)
  },
  (error) => {
    // 请求失败
    return Promise.reject(error)
  }
)

export default instance
