<template>
  <div class="common-layout">
    <el-container style="min-height: 100vh">
      <el-aside width="collapse">
        <div class="form-logo-title">
          <i-mdi-alpha-z-circle class="form-logo"/>
          <Transition>
            <span class="form-title" v-if="!isCollapseMenu">无尤管理系统</span>
          </Transition>
        </div>
        <el-menu
            class="el-menu-vertical"
            :collapse="isCollapseMenu"
            :default-active="$route.path"
        >
          <!-- 递归组件渲染菜单 -->
          <RecursiveMenuItem :menu-tree="menuTreeList" @click-menu="handleClickMenu"/>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <Iconify
              :icon="isCollapseMenu?'ep:expand':'ep:fold'"
              @click="isCollapseMenu = !isCollapseMenu"
              fontSize="23px"
              class="collapse-menu-icon"
          />
          <el-breadcrumb separator="/" class="header-breadcrumb">
            <el-breadcrumb-item :to="{path:'/dashboard'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
              <template v-if="item.path">
                <router-link :to="item.path">{{ item.name }}</router-link>
              </template>
              <template v-else>
                {{ item.name }}
              </template>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </el-header>
        <el-main>
          <router-view/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from "vue-router";
import Iconify from "@/components/Iconify.vue";
import RecursiveMenuItem from "@/components/RecursiveMenuItem.vue";
import MenuApi, {MenuTreeItem} from "@/api/sys/menu.ts";

const router = useRouter()
// 菜单树
const menuTreeList = ref<MenuTreeItem[]>([]);
// 菜单是否折叠
const isCollapseMenu = ref(false)
// 菜单列表
let menuList: MenuTreeItem[] = [];
// 面包屑
const breadcrumbs = ref<{ name: string, path: string }[]>([]);
onMounted(async () => {
  // 请求菜单树
  menuTreeList.value = await MenuApi.tree({types: [1, 2]}, {loadingOption: {target: '.el-aside'}})
  // 将树形结构转换为平铺的列表
  const flatten = (items: MenuTreeItem[]) => {
    items.forEach(item => {
      // 将当前节点添加到 menuList
      const {children, ...menuItem} = item; // 去掉 children 属性，因为不再需要
      menuList.push(menuItem);
      // 如果有子节点，递归处理
      if (item.children && item.children.length > 0) {
        flatten(item.children);
      }
    });
  }
  flatten(menuTreeList.value);
  // 加载面包屑
  loadBreadcrumbs(router.currentRoute.value.path)
});

// 在 setup 中访问路由和当前路由：https://router.vuejs.org/zh/guide/advanced/composition-api.html#%E5%9C%A8-setup-%E4%B8%AD%E8%AE%BF%E9%97%AE%E8%B7%AF%E7%94%B1%E5%92%8C%E5%BD%93%E5%89%8D%E8%B7%AF%E7%94%B1
const handleClickMenu = (item: MenuTreeItem) => {
  if (item && item.path) {
    // 路由跳转
    router.push(item.path);
    // 加载面包屑
    loadBreadcrumbs(item);
  }
};

/**
 * 加载面包屑
 * @param itemOrPath 当前菜单项对象或路径
 */
const loadBreadcrumbs = (itemOrPath: MenuTreeItem | string) => {
  // 清空面包屑
  breadcrumbs.value = [];
  /**
   * 根据 parentId 递归往上寻找父级菜单 或 根据 path 递归往下寻找子级菜单
   * @param currentItem 当前菜单项
   *
   */
  const findParentOrChild = (currentItem: MenuTreeItem) => {
    if (currentItem.parentId === 0) {
      return;
    }
    const parent = menuList.find(menu => menu.id === currentItem.parentId);
    if (!parent) {
      return;
    }
    breadcrumbs.value.unshift({name: parent.name, path: parent.path}); // 使用 unshift 将元素加入数组
    if (parent.parentId) {
      findParentOrChild(parent.parentId);
    }
  }
  const currentItem = (typeof itemOrPath !== 'string') ? itemOrPath : menuList.find(menu => menu.path === itemOrPath);
  findParentOrChild(currentItem);
  // 非首页时添加自身
  if (currentItem.path !== '/dashboard') {
    breadcrumbs.value.push({name: currentItem.name, path: currentItem.path});
  }
}
</script>

<style scoped lang="less">
/* 左侧菜单全高 */
.el-menu-vertical {
  min-height: 100vh;
}

/* Collapse 折叠面板：https://element-plus.org/zh-CN/component/menu.html#collapse-%E6%8A%98%E5%8F%A0%E9%9D%A2%E6%9D%BF */
.el-menu-vertical:not(
/* 已折叠的菜单 */
.el-menu--collapse
) {
  width: 200px;
}

/* 侧边栏 Logo 标题 */
.form-logo-title {
  height: @elHeaderHeight;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--el-menu-border-color);

  .form-logo {
    font-size: 20px
  }

  .form-title {
    padding-left: 5px;
  }
}

/* 顶部 */
.el-header {
  display: flex;
  height: @elHeaderHeight;
  line-height: @elHeaderHeight;
  border-bottom: 1px solid #dcdfe6;
  padding: 0;

  .collapse-menu-icon {
    /* 折叠菜单图标 */
    width: @elHeaderHeight;
    height: calc(@elHeaderHeight - 1px);

    &:hover {
      /* 鼠标悬浮时，背景变深 */
      background-color: #f9f9f9;
    }
  }

  .header-breadcrumb {
    /* 头部面包屑 */
    display: inline-block;
    line-height: calc(@elHeaderHeight - 1px);
  }
}
</style>
