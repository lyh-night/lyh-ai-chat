import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/router/intercept.js'

// 样式
import '@/styles/index.scss'
import 'element-plus/dist/index.css'

// SVG
import 'virtual:svg-icons-register'

// 图标
import '@/assets/icon/iconfont.css'

// 全局组件
import globalComponents from '@/components/index.js'

const app = createApp(App)

app.use(globalComponents)

app.use(createPinia())
app.use(router)

app.mount('#app')
