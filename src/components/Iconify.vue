<template>
  <el-icon>
    <Icon :icon="icon"/>
  </el-icon>
</template>

<script setup lang="ts">
import {Icon} from '@iconify/vue';

// 定义组件的 props，接收 icon 名称
const props = defineProps({
  icon: {
    type: String,
    default: null,
  }
});
</script>
