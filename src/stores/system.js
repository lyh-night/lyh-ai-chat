// 存放系统需要使用的全局变量

import { defineStore } from 'pinia'
import { isObject, isArray } from '@/utils/is.js'

export const useSystemStore = defineStore('systemStore', {
  state: () => {
    return {
      token: ''
    }
  },
  actions: {
    setState(options) {
      if (isObject(options)) {
        this[options.attr] = options.val
      }
      if (isArray(options)) {
        if (options.length > 0) {
          options.forEach((item) => {
            this[item.attr] = item.val
          })
        }
      }
    }
  }
})
