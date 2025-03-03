import {defineStore} from 'pinia';
import MenuApi, {MenuTreeItem} from "@/api/sys/menu.ts";
import {FetchOptions} from "@/utils/http.ts";

// 创建一个 useStore 函数，检索 store 实例：https://pinia.vuejs.org/zh/api/modules/pinia.html#definestore
export const useMenuStore = defineStore('menu', () => {
  // 菜单树列表
  const menuTreeList = ref<MenuTreeItem[]>([]);

  /**
   * 获取菜单树
   */
  const loadMenuTreeList = async (isRefreshCache: boolean = false, apiOption?: FetchOptions) => {
    // 如果菜单树为空，且不是刷新缓存，则请求加载菜单树
    if (isMenuTreeListEmpty.value || isRefreshCache) {
      menuTreeList.value = await MenuApi.tree({isRefreshCache, types: [1, 2]}, apiOption);
    }
  };

  /**
   * 菜单树是否为空，增加 computed 关键词，只有在 menuTreeList 变化时才会重新计算
   */
  const isMenuTreeListEmpty = computed(() => {
    return !menuTreeList.value || menuTreeList.value.length === 0;
  });

  /**
   * 清空
   */
  const clean = () => {
    menuTreeList.value = [];
  };

  return {
    menuTreeList, isMenuTreeListEmpty, loadMenuTreeList, clean
  };
}, {
  // 持久化
  persist: true
});
