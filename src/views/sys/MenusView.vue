<template>
  <div>
    <h1>菜单管理</h1>
    <button @click="refreshMenuTreeCache">刷新菜单缓存</button>
  </div>
</template>

<script setup lang="ts">
import {useMenuStore} from "@/store/menu.ts";

function refreshMenuTreeCache() {
  const menuStore = useMenuStore();
  menuStore.loadMenuTreeList(true, {loadingOption: {target: '.el-aside'}});
}
</script>

<style scoped>

</style>