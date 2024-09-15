<template>
    <template v-for="item in menuTree">
      <template v-if="item.children && item.children.length > 0">
        <el-sub-menu :index="String(item.id)">
          <!-- SubMenu Slots 自定义标题内容 title：https://element-plus.org/zh-CN/component/menu.html#submenu-slots -->
          <template #title>
            <Iconify :icon="item.icon"/>
            <span>{{ item.name }}</span>
          </template>
          <RecursiveMenuItem :menu-tree="item.children" @click-menu="handleClickMenu"/>
        </el-sub-menu>
      </template>
      <template v-else>
        <!-- $emit 方法触发自定义事件：https://cn.vuejs.org/guide/components/events#emitting-and-listening-to-events -->
        <el-menu-item :index="String(item.id)" @click="handleClickMenu(item)">
          <Iconify :icon="item.icon"/>
          <span>{{ item.name }}</span>
        </el-menu-item>
      </template>
    </template>
</template>

<script setup lang="ts">
import Iconify from "@/components/Iconify.vue";

// 传递 props 入参：https://cn.vuejs.org/guide/essentials/component-basics.html#passing-props
defineProps({
  // 菜单树
  menuTree: {
    type: Array as PropType<any[]>,
    required: true
  }
})

// 监听事件：https://cn.vuejs.org/guide/essentials/component-basics.html#listening-to-events
const emit = defineEmits([
  // 点击菜单
  'click-menu'
])

const handleClickMenu = (item: any) => {
  // 触发父组件的 click-menu 事件
  emit('click-menu', item);
}
</script>
