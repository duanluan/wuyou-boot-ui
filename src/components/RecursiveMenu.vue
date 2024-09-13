<template>
  <template v-for="item in menuTree">
    <template v-if="item.children && item.children.length > 0">
      <el-sub-menu :index="String(item.id)">
        <!-- SubMenu Slots 自定义标题内容 title：https://element-plus.org/zh-CN/component/menu.html#submenu-slots -->
        <template #title>
          <Iconify :icon="item.icon"/>
          <span>{{ item.name }}</span>
        </template>
        <RecursiveMenu :menu-tree="item.children"/>
      </el-sub-menu>
    </template>
    <template v-else>
      <el-menu-item :index="String(item.id)">
        <Iconify :icon="item.icon"/>
        <span>{{ item.name }}</span>
      </el-menu-item>
    </template>
  </template>
</template>

<script setup lang="ts">
import Iconify from "@/components/Iconify.vue";

const props = defineProps({
  menuTree: {
    type: Array as PropType<any[]>,
    required: true
  }
});
</script>
