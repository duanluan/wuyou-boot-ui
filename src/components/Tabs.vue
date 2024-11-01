<template>
  <el-tabs
      v-model="tabStore.activeTabName"
      type="card"
      class="header-tabs"
      closable
      @tab-click="clickTab"
      @tab-remove="removeTab"
  >
    <el-tab-pane
        v-for="(item,index) in tabStore.tabs"
        :key="index"
        :label="item.label"
        :name="item.name"
    >
      <el-main>
        <!--
        RouterView 插槽：https://router.vuejs.org/zh/guide/advanced/router-view-slot.html#RouterView-%E6%8F%92%E6%A7%BD
        -->
        <router-view v-slot="{ Component }">
          <!--
          KeepAlive 在多个组件间动态切换时缓存被移除的组件实例：https://cn.vuejs.org/guide/built-ins/keep-alive#keepalive
          KeepAlive 包含：https://cn.vuejs.org/guide/built-ins/keep-alive#include-exclude
          -->
          <keep-alive :include="tabStore.cachedComponentNames">
            <component :is="Component"/>
          </keep-alive>
        </router-view>
      </el-main>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import router from "@/router";
import {useTabStore} from "@/store/tab.ts";
import {TabPaneName, TabsPaneContext} from "element-plus";

// 标签页 store
const tabStore = useTabStore()

onMounted(async () => {
  // 删除 .header-tabs 下第一个 .el-tabs__item class 中的 is-closable，避免 css 隐藏关闭按钮后，鼠标移上有错误缩放效果
  const elTabsItem = document.querySelector('.header-tabs .el-tabs__item')
  if (elTabsItem) {
    elTabsItem.classList.remove('is-closable')
  }
})

// 标签点击触发
const clickTab = (pane: TabsPaneContext, ev: Event) => {
  let name = pane.props.name;
  tabStore.activeTab(name, router)
}

// 删除tabs触发
const removeTab = (name: TabPaneName) => {
  // 删除当前标签
  tabStore.removeTab(name, router)
}
</script>

<style scoped lang="less">
@headerTabsHeight: 30px;

.header-tabs {
  // 标签页
  :deep(.el-tabs__header) {
    // 下外边距超出内容
    margin-bottom: 0;
    height: @headerTabsHeight;
  }

  :deep(.el-tabs__item) {
    height: @headerTabsHeight;
  }

  // 隐藏仪表盘的关闭按钮
  :deep(.el-tabs__item:nth-child(1) i) {
    display: none;
  }
}
</style>