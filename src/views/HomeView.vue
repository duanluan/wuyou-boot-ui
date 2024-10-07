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
          <div>
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
          </div>
          <div class="header-right">
            <div onclick="window.open('https://github.com/duanluan/wuyou-boot')">
              <el-tooltip content="源码地址" :offset="27">
                <i-mdi-github style="color: #5a5e66"/>
              </el-tooltip>
            </div>
            <div>
              <el-dropdown trigger="click">
                <div>
                  <!--<i-mdi-account-box style="color: #5a5e66; font-size: 40px"/>-->
                  <!--<i-mdi-arrow-down-drop style="position: relative; top: 11px; left: -3px"/>-->
                  <span>{{ useUserStore().info.nickName }}</span>
                  <i-mdi-arrow-down-drop/>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>个人中心</el-dropdown-item>
                    <el-dropdown-item @click="useUserStore().logout()">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
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
import {useUserStore} from "../store/user.ts";

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
  if (!menuTreeList.value || menuTreeList.value.length === 0) return;

  // 将树形结构转换为平铺的列表
  const flatten = (items: MenuTreeItem[]) => {
    for (const item of items) {
      // 将当前节点添加到 menuList
      const {children, ...menuItem} = item; // 去掉 children 属性，因为不再需要
      menuList.push(menuItem);
      // 如果有子节点，递归处理
      if (item.children && item.children.length > 0) {
        flatten(item.children);
      }
    }
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
  if (!menuList || menuList.length === 0) return;

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
    if (!parent) return;
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
// 侧边栏 Logo 标题
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

// 左侧菜单全高
.el-menu-vertical {
  height: calc(100vh - @elHeaderHeight);
}

// Collapse 折叠面板：https://element-plus.org/zh-CN/component/menu.html#collapse-%E6%8A%98%E5%8F%A0%E9%9D%A2%E6%9D%BF
// .el-menu--collapse 为已折叠的菜单
.el-menu-vertical:not(
.el-menu--collapse
) {
  width: 200px;
}

// 顶部
.el-header {
  display: flex;
  // 两端对齐
  justify-content: space-between;
  height: @elHeaderHeight;
  line-height: @elHeaderHeight;
  padding: 0;

  div {
    display: flex;
    align-items: center;
  }

  // 折叠菜单图标
  .collapse-menu-icon {
    width: @elHeaderHeight;
    height: 100%;

    // 鼠标悬浮时，背景变深
    &:hover {
      background-color: #f9f9f9;
    }
  }

  // 头部面包屑
  .header-breadcrumb {
    display: inline-block;
    line-height: @elHeaderHeight;
  }

  // 头部右侧
  .header-right {
    // 头部右侧中的每项
    > div {
      height: 100%;
      padding: 0 8px;

      &:hover {
        background-color: #f9f9f9;
      }
    }
  }
}

.el-main {
  border-top: 1px solid #dcdfe6;
}
</style>
