// 路由拦截器

import router from '@/router/index.js'

// 导航守卫
router.beforeEach(async (to, from, next) => {
  next()
})

export default router
