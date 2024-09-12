import {defineStore} from 'pinia';

// 创建一个 useStore 函数，检索 store 实例：https://pinia.vuejs.org/zh/api/modules/pinia.html#definestore
export const useMenuStore = defineStore('menu', () => {
  const count = ref(0);

  const increment = () => count.value++;

  return {
    count,
    increment,
  };
}, {
  // 持久化
  persist: true
});
