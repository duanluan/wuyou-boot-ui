<template>
  <el-tabs
      :model-value="tabStore.activeTabName"
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
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import router from "@/router";
import {useTabStore} from "@/store/tab.ts";
import {useRoute} from "vue-router";

// 标签页 store
const tabStore = useTabStore()
// 路由对象
const route = useRoute()

// 核心流程说明（单向数据流）：
// 1. 用户点击 Tab -> 触发 clickTab -> 执行 router.push 路由跳转 (异步)
// 2. 浏览器 URL 变更 -> 触发下方的 watch 监听
// 3. watch 更新 tabStore.activeTabName -> :model-value 生效 -> UI 高亮更新
// 优点：确保 URL 是唯一的真理来源，无论是点击标签、浏览器后退还是刷新页面，状态永远同步。
watch(() => route.path, (newPath) => {
  if (newPath) {
    tabStore.activeTabName = newPath
  }
}, {immediate: true})

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
  // 这里只负责触发路由跳转，不直接修改 activeTabName，状态更新交给 watch
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