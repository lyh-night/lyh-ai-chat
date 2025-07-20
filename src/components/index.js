// 自动引入全局组件

const globalComponents = {
  install(Vue) {
    const requireComponent = import.meta.glob('@/components/**/*.vue', { eager: true })
    Object.keys(requireComponent).forEach((filePath) => {
      const config = requireComponent[filePath]
      const componentName = config.default.name
      Vue.component(componentName, config)
    })
  }
}

export default globalComponents
