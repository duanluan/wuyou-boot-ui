<template>
  <el-icon>
    <Icon :icon="icon" :style="{'fontSize': fontSize}"/>
  </el-icon>
</template>

<script setup lang="ts">
import {Icon} from '@iconify/vue';

// 定义组件的 props，接收 icon 名称
const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  // 大小
  fontSize: {
    type: [String, Number]
  }
});
</script>
