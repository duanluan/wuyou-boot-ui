<template>
  <div class="common-layout">
    <el-container style="min-height: 100vh">
      <el-aside width="collapse">
        <el-menu
            class="el-menu-vertical"
            :collapse="isCollapseMenu"
        >
          <!-- 递归组件渲染菜单 -->
          <RecursiveMenuItem :menu-tree="menuTreeList" @click-menu="handleClickMenu"/>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <Iconify
              :icon="isCollapseMenu?'ep:expand':'ep:fold'"
              @click="isCollapseMenu = !isCollapseMenu"
              fontSize="23px"
              class="collapse-menu-icon"
          />
        </el-header>
        <el-main>
          <router-view/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import http from "@/utils/http.ts";
import {useRouter} from "vue-router";
import Iconify from "@/components/Iconify.vue";
import RecursiveMenuItem from "@/components/RecursiveMenuItem.vue";

const menuTreeList = ref<any[]>([]);
onMounted(() => {
  // 请求菜单
  http.get('/sys/menus/tree?types=1,2', {
    loadingOption: {target: '.el-aside'}
  }).then(response => {
    menuTreeList.value = response.data
  });
});

// 在 setup 中访问路由和当前路由：https://router.vuejs.org/zh/guide/advanced/composition-api.html#%E5%9C%A8-setup-%E4%B8%AD%E8%AE%BF%E9%97%AE%E8%B7%AF%E7%94%B1%E5%92%8C%E5%BD%93%E5%89%8D%E8%B7%AF%E7%94%B1
const router = useRouter()
const handleClickMenu = (item: object) => {
  if (item && item.path) {
    // 路由跳转
    router.push(item.path);
  }
};

// 菜单是否折叠
const isCollapseMenu = ref(false)
</script>

<style scoped lang="less">
/* 左侧菜单全高 */
.el-menu-vertical {
  min-height: 100vh;
}

/* Collapse 折叠面板：https://element-plus.org/zh-CN/component/menu.html#collapse-%E6%8A%98%E5%8F%A0%E9%9D%A2%E6%9D%BF */
.el-menu-vertical:not(
/* 已折叠的菜单 */
.el-menu--collapse
) {
  width: 200px;
}

/* 顶部 */
.el-header {
  height: @elHeaderHeight;
  line-height: @elHeaderHeight;
  border-bottom: 1px solid #dcdfe6;
  padding: 0;
}

/* 折叠菜单图标 */
.collapse-menu-icon {
  width: @elHeaderHeight;
  height: calc(@elHeaderHeight - 1px);

  &:hover {
    /* 鼠标悬浮时，背景变深 */
    background-color: #f9f9f9;
  }
}
</style>
