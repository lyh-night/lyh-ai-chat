/**
 * 判断文件
 *
 * 如果你需要类型判断，请不要再使用 Object.prototype.toString.call()方法
 * 直接调用我们下方封装好的is函数即可
 */

export const toString = Object.prototype.toString

export const is = (val, type) => toString.call(val) === `[object ${type}]`

//判断非undefined
export const isDef = (val) => typeof val !== 'undefined'

//判断是undefined
export const isUnDef = (val) => !isDef(val)

//判断是否是对象
export const isObject = (val) => val !== null && toString.call(val) === `[object Object]`

//判断是否是时间类型
export const isDate = (val) => is(val, 'Date')

//判断是否是null类型
export const isNull = (val) => val === null

//判断不可访问类型
export const isNullAndUnDef = (val) => isUnDef(val) && isNull(val)

//判断undefined和null其中一个
export const isNullOrUnDef = (val) => isUnDef(val) || isNull(val)

//判断是否是数字类型
export const isNumber = (val) => is(val, 'Number')

//判断是否是字符类型
export const isString = (val) => is(val, 'String')

//判断是否为函数
export const isFunction = (val) => typeof val === 'function'

//判断是否为booean类型
export const isBoolean = (val) => is(val, 'Boolean')

//判断是否是正则表达式
export const isRegExp = (val) => is(val, 'RegExp')

//判断是否是数组
export const isArray = (val) => val && Array.isArray(val)

//判断是否是window对象
export const isWindow = (val) => typeof window !== 'undefined' && is(val, 'Window')

//判断是否是Promise类型
export const isPromise = (val) => {
  return is(val, 'Promise')
}

export function getType(data) {
  let type = typeof data
  if (type !== 'object') {
    return type
  }
  return Object.prototype.toString.call(data).replace(/^[object (\S+)]$/, '$1')
}

export const isEmpty = (val) => {
  if (isArray(val) || isString(val)) return val.length === 0
  if (val instanceof Map || val instanceof Set) return val.size === 0
  if (isObject(val)) return Object.keys(val).length === 0
  return ''
}
