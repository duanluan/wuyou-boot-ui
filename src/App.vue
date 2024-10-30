<template>
  <el-config-provider :locale="zhCn">
    <router-view/>
  </el-config-provider>
</template>

<script setup lang="ts">
import {ElConfigProvider} from 'element-plus'
// 国际化 | Element Plus：https://element-plus.org/zh-CN/guide/i18n.html#configprovider
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>
