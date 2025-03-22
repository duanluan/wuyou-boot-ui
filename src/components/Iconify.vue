<template>
  <el-icon :size="size">
    <Icon :icon="icon"/>
  </el-icon>
</template>

<script setup lang="ts">
import {Icon} from '@iconify/vue';

// 定义组件的 props，接收 icon 名称
const props = defineProps({
  // 图标名称：https://icones.js.org/
  icon: {
    type: String,
    required: true
  },
  // 图标大小
  size: {
    type: [String, Number]
  }
});
</script>
