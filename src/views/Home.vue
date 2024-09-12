<template>
    <div class="common-layout">
      <el-container style="min-height: 100vh">
        <el-aside width="collapse">
          <el-menu
              default-active="2"
              class="el-menu-vertical"
              :collapse="isCollapse"
              @open="handleOpen"
              @close="handleClose"
          >
            <el-sub-menu index="1">
              <template #title>
                <i-mdi-ab-testing/>
                <span> Navigator One</span>
              </template>
              <el-menu-item-group>
                <template #title><span>Group One</span></template>
                <el-menu-item index="1-1">item one</el-menu-item>
                <el-menu-item index="1-2">item two</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group title="Group Two">
                <el-menu-item index="1-3">item three</el-menu-item>
              </el-menu-item-group>
              <el-sub-menu index="1-4">
                <template #title><span>item four</span></template>
                <el-menu-item index="1-4-1">item one</el-menu-item>
              </el-sub-menu>
            </el-sub-menu>
            <el-menu-item index="2">
              <i-mdi-account-check/>
              <template #title> Navigator Two</template>
            </el-menu-item>
            <el-menu-item index="3" disabled>
              <i-mdi-airplane-marker/>
              <template #title> Navigator Three</template>
            </el-menu-item>
            <el-menu-item index="4">
              <i-mdi-ansible/>
              <template #title> Navigator Four</template>
            </el-menu-item>
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
import http from "/@/utils/http.ts";

const isCollapse = ref(false)
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
  // 请求菜单
  http.get('/sys/menus', {loadingOption: {target: '.el-aside'}}).then(response => {
    console.log(response)
  })
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style scoped>
/* 左侧菜单全高 */
.el-menu-vertical {
  height: 100vh;
}

/* Collapse 折叠面板：https://element-plus.org/zh-CN/component/menu.html#collapse-%E6%8A%98%E5%8F%A0%E9%9D%A2%E6%9D%BF */
.el-menu-vertical:not(
/* 已折叠的菜单 */
.el-menu--collapse
) {
  width: 200px;
}
</style>