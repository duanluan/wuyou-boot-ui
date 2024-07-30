<script setup lang="ts">
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">Aside</el-aside>
      <el-container>
        <el-header>Header</el-header>
        <el-main>Main</el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
/* 布局容器 */
.common-layout>.el-container {
  min-height: 100vh;
}
</style>
