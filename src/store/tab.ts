import {defineStore} from 'pinia';
import {TabPaneName} from "element-plus";
import type TabPane from "element-plus/es/components/tabs/src/tab-pane.vue";
import {useMenuStore} from "@/store/menu.ts";
import {Router, useRouter} from "vue-router";

const menuStore = useMenuStore();

export const useTabStore = defineStore('tab', () => {
  // 标签页列表
  const tabList = ref<TabPane[]>([
    {label: '仪表盘', name: '/dashboard'}
  ])
  // 激活标签页名称
  const activeTabName = ref<TabPaneName>('/dashboard');

  /**
   * 添加标签页
   * @param tab 标签页
   * @param router 路由
   */
  const addTab = (tab: TabPane, router: Router) => {
    if (!tabList.value.some(item => item.name === tab.name)) {
      tabList.value.push(tab)
    }
    // 激活添加的标签页
    activeTabName.value = tab.name;
    // 激活菜单
    menuStore.setActiveMenuPath(activeTabName.value);
    // 跳转路由
    router.push(activeTabName.value);
  }

  /**
   * 移除标签页
   * @param name 标签页名称
   * @param router 路由
   */
  const removeTab = (name: TabPaneName, router: Router) => {
    // 当前激活标签页为被移除标签页时
    if (activeTabName.value === name) {
      // 移除标签页后，激活被移除标签页的前一个标签页，如果前一个标签页是第一个标签页，则激活后一个标签页，如果没有后一个标签页，则激活第一个标签页
      const index = tabList.value.findIndex(item => item.name === name)
      const prevTab = tabList.value[index - 1]
      const nextTab = tabList.value[index + 1]
      activeTabName.value = prevTab ? prevTab.name : nextTab ? nextTab.name : tabList.value[0].name
      // 激活菜单
      menuStore.setActiveMenuPath(activeTabName.value);
      // 跳转路由
      router.push(activeTabName.value);
    }

    tabList.value = tabList.value.filter(item => item.name !== name)
  }

  return {tabList, activeTabName, addTab, removeTab}
}, {
  // 持久化
  persist: true
});
