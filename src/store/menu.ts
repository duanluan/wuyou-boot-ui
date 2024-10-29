import {defineStore} from 'pinia';
import MenuApi, {MenuTreeItem} from "@/api/sys/menu.ts";

// 创建一个 useStore 函数，检索 store 实例：https://pinia.vuejs.org/zh/api/modules/pinia.html#definestore
export const useMenuStore = defineStore('menu', () => {
  // 菜单树列表
  const menuTreeList = ref<MenuTreeItem[]>([]);
  // 激活菜单路径
  const activeMenuPath = ref<string>('/dashboard');

  /**
   * 获取菜单树
   */
  const loadMenuTreeList = async (apiOption) => {
    if (isMenuTreeListEmpty.value) {
      menuTreeList.value = await MenuApi.tree({types: [1, 2]}, apiOption);
    }
  };

  /**
   * 菜单树是否为空，增加 computed 关键词，只有在 menuTreeList 变化时才会重新计算
   */
  const isMenuTreeListEmpty = computed(() => {
    return !menuTreeList.value || menuTreeList.value.length === 0;
  });

  /**
   * 清空菜单树
   */
  const clearMenuTreeList = () => {
    menuTreeList.value = [];
  };

  /**
   * 设置激活菜单路径
   * @param path 菜单路径
   */
  const setActiveMenuPath = (path: string) => {
    activeMenuPath.value = path;
  }

  return {
    menuTreeList,
    loadMenuTreeList,
    isMenuTreeListEmpty,
    clearMenuTreeList,
    activeMenuPath,
    setActiveMenuPath
  };
}, {
  // 持久化
  persist: true
});
