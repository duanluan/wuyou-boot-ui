import {defineStore} from 'pinia';
import MenuApi, {MenuTreeItem} from "@/api/sys/menu.ts";

// 创建一个 useStore 函数，检索 store 实例：https://pinia.vuejs.org/zh/api/modules/pinia.html#definestore
export const useMenuStore = defineStore('menu', () => {
  // 菜单树列表
  const menuTreeList = ref<MenuTreeItem[]>([]);

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

  return {menuTreeList, isMenuTreeListEmpty, loadMenuTreeList, clearMenuTreeList
  };
}, {
  // 持久化
  persist: true
});
