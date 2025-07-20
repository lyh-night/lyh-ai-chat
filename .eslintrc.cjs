require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier/skip-formatting',
    'plugin:prettier/recommended',
    './.eslintrc-auto-import.json' // 自动导入后 eslint 提示未定义报错
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['vue'],
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  },
  rules: {
    /* 
      "off" 或 0 - 关闭规则
      "warn" 或 1 - 打开规则作为警告（不影响退出代码）
      "error" 或 2 - 打开规则作为错误（触发时退出代码为 1）
     */
    'no-alert': 0, // 禁止使用 alert
    'no-console': 0, // 禁用console
    'no-lone-blocks': 0, //禁止不必要的嵌套块
    'no-class-assign': 2, //禁止给类赋值
    'no-cond-assign': 2, //禁止在条件表达式中使用赋值语句
    'no-const-assign': 2, //禁止修改const声明的变量
    'no-delete-var': 2, //不能对var声明的变量使用delete操作符
    'no-dupe-keys': 2, //在创建对象字面量时不允许键重复
    'no-duplicate-case': 2, //switch中的case标签不能重复
    'no-dupe-args': 2, //函数参数不能重复
    'no-func-assign': 2, //禁止重复的函数声明
    'no-empty': 2, //块语句中的内容不能为空
    'no-redeclare': 2, //禁止重复声明变量
    'no-undef': 2, //不能有未定义的变量
    'no-unused-vars': 0,
    // 'no-use-before-define': 2, //未定义前不能使用
    'no-unreachable': 1, //不能有无法执行的代码
    'default-case': 2, //switch语句最后必须有default
    'vue/multi-word-component-names': 'off',
    'vue/html-self-closing': [
      //标签自闭合
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always'
        },
        svg: 'always',
        math: 'always'
      }
    ]
  }
}
