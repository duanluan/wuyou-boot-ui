import {defineStore} from 'pinia';
import {Router, RouteRecordNameGeneric} from "vue-router";
import {dashboardPath} from "@/router";

interface TabItem {
  label: string;
  name: string;
  componentName: RouteRecordNameGeneric;
}

export const useTabStore = defineStore('tab', () => {
  // 默认标签页列表
  const defaultTabs: TabItem[] = [{label: '仪表盘', name: dashboardPath, componentName: 'DashboardView'}]
  // 标签页列表
  const tabs = ref<TabItem[]>(defaultTabs)
  // 缓存的组件名
  const cachedComponentNames = ref<RouteRecordNameGeneric[]>([])
  // 默认激活标签页名称
  const defaultActiveTabName = dashboardPath
  // 激活标签页名称
  const activeTabName = ref<string>(defaultActiveTabName);

  /**
   * 激活标签页
   * @param nameOrIndex 标签页名称或索引
   * @param router 路由
   */
  const activeTab = (nameOrIndex: string | number, router: Router) => {
    if (typeof nameOrIndex === 'number') {
      nameOrIndex = tabs.value[nameOrIndex]?.name
      if (!nameOrIndex) {
        throw new TypeError('nameOrIndex is number, but tab not found')
      }
    }
    // 设置激活标签
    activeTabName.value = nameOrIndex;
    // 路由跳转
    router.push({path: nameOrIndex})
  }

  /**
   * 添加标签页
   * @param tabOrIndex 标签页或索引
   * @param router 路由
   */
  const addTab = (tabOrIndex: TabItem | number, router: Router) => {
    if (typeof tabOrIndex === 'number') {
      tabOrIndex = tabs.value[tabOrIndex]
      if (!tabOrIndex) {
        throw new TypeError('tabOrIndex is number, but tab not found')
      }
    }
    // 添加的标签页不存在时
    if (!tabs.value.some(item => item.name === tabOrIndex.name)) {
      const routeByPath = router.getRoutes().find(item => item.path === tabOrIndex.name)
      const componentName = routeByPath?.name
      if (componentName) {
        // 将组件名添加到标签页
        tabOrIndex.componentName = componentName
        // 缓存标签页
        if (routeByPath.meta.keepAlive) {
          addComponentName(componentName)
        }
      }
      // 添加到标签页列表
      tabs.value.push(tabOrIndex)
    }
    activeTab(tabOrIndex.name, router)
  }

  const addComponentName = (tabName: RouteRecordNameGeneric) => {
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

  /**
   * 清空
   */
  const clean = () => {
    tabs.value = defaultTabs
    cachedComponentNames.value = []
    activeTabName.value = defaultActiveTabName
  }

  return {tabs, cachedComponentNames, activeTabName, activeTab, addComponentName, addTab, removeTab, clean}
}, {
  // 持久化
  persist: true
});
