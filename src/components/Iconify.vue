<template>
  <el-icon :size="size">
    <Icon :icon="icon"/>
  </el-icon>
</template>

<script setup lang="ts">
import {Icon} from '@iconify/vue';

defineProps({
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
