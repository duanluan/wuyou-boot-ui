import * as CryptoJS from 'crypto-js';

const debounceMap: Map<string, number> = new Map();

const debounceExecution = (callback: any, delay = 300) => {
  // 生成请求的唯一标识
  const key = CryptoJS.SHA256(callback.toString()).toString()

  // 如果存在则清除
  if (debounceMap.has(key)) {
    clearTimeout(debounceMap.get(key))
    debounceMap.delete(key)
  }
  // 延迟执行
  const timeout = setTimeout(() => {
    debounceMap.delete(key)
    callback()
  }, delay)
  debounceMap.set(key, timeout)
}

const onDebounceMounted = (callback: any, delay = 300) => {
  onMounted(() => {
    debounceExecution(callback, delay)
  })
}

export {onDebounceMounted}
