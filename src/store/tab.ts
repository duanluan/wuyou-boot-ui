import {defineStore} from 'pinia';
import type TabPane from "element-plus/es/components/tabs/src/tab-pane.vue";
import {Router} from "vue-router";

interface TabItem extends TabPane {
  componentName?: string;
}

export const useTabStore = defineStore('tab', () => {
  // 标签页列表
  const tabs = ref<TabItem[]>([
    {label: '仪表盘', name: '/dashboard', componentName: 'DashboardView'}
  ])
  const cachedComponentNames = ref<string[]>([])
  // 激活标签页名称
  const activeTabName = ref<string>('/dashboard');

  /**
   * 激活标签页
   * @param name 标签页名称
   * @param router 路由
   */
  const activeTab = (name: string, router: Router) => {
    // 设置激活标签
    activeTabName.value = name;
    // 路由跳转
    router.push({path: name})
  }

  /**
   * 添加标签页
   * @param tab 标签页
   * @param router 路由
   */
  const addTab = (tab: TabItem, router: Router) => {
    // 添加的标签页不存在时
    if (!tabs.value.some(item => item.name === tab.name)) {
      const routeByPath = router.getRoutes().find(item => item.path === tab.name)
      const componentName = routeByPath?.name
      if (componentName) {
        // 将组件名添加到标签页
        tab.componentName = componentName
        // 缓存标签页
        if (routeByPath.meta.keepAlive) {
          addComponentName(componentName)
        }
      }
      // 添加到标签页列表
      tabs.value.push(tab)
    }
    activeTab(tab.name, router)
  }

  const addComponentName = (tabName: string) => {
    // 添加的标签页未缓存时
    if (!cachedComponentNames.value.some(item => item === tabName)) {
      // 添加组件名到缓存
      cachedComponentNames.value.push(tabName)
    }
  }

  /**
   * 移除标签页
   * @param name 标签页名称
   * @param router 路由
   */
  const removeTab = (name: string, router: Router) => {
    // 移除组件名缓存
    const tab = tabs.value.find(item => item.name === name)
    cachedComponentNames.value = cachedComponentNames.value.filter(item => item !== tab?.componentName)

    const index = tabs.value.findIndex(item => item.name === name)
    tabs.value.splice(index, 1)
    // 当前激活标签页为被移除标签页时
    if (activeTabName.value === name) {
      // 移除标签页后，激活被移除标签页的前一个标签页，如果前一个标签页是第一个标签页，则激活后一个标签页，如果没有后一个标签页，则激活第一个标签页
      const prevTab = tabs.value[index - 1]
      const nextTab = tabs.value[index + 1]

      activeTab((prevTab ? prevTab.name : nextTab ? nextTab.name : tabs.value[0].name), router)
    }
  }

  return {tabs, cachedComponentNames, activeTabName, activeTab, addComponentName, addTab, removeTab}
}, {
  // 持久化
  persist: true
});
