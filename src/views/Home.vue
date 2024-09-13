<template>
  <div class="common-layout">
    <el-container style="min-height: 100vh">
      <el-aside width="collapse">
        <el-menu
            class="el-menu-vertical"
            :collapse="isCollapse"
            @open="handleOpen"
            @close="handleClose"
        >
          <!-- 递归组件渲染菜单 -->
          <RecursiveMenu :menu-tree="menuTreeList"/>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <el-radio-group v-model="isCollapse">
            <el-radio-button :value="false">expand</el-radio-button>
            <el-radio-button :value="true">collapse</el-radio-button>
          </el-radio-group>
        </el-header>
        <el-main>Main</el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import http from "@/utils/http.ts";
import RecursiveMenu from "@/components/RecursiveMenu.vue";

const menuTreeList = ref<any[]>([]);
onMounted(() => {
  // 请求菜单
  http.get('/sys/menus/tree?types=1,2', {
    loadingOption: {target: '.el-aside'}
  }).then(response => {
    menuTreeList.value = response.data
  });
});

const isCollapse = ref(false)
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style scoped>
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
</style>
