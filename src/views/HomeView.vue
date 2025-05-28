<template>
  <div>
    <el-container style="min-height: 100vh">
      <el-aside width="collapse">
        <div class="form-logo-title">
          <i-mdi-alpha-z-circle class="form-logo"/>
          <Transition>
            <span class="form-title" v-if="!isCollapseMenu">无尤管理系统</span>
          </Transition>
        </div>
        <!-- :default-active="$route.path"：菜单选中项会根据当前路由自动修改 -->
        <el-menu
            class="el-menu-vertical"
            :collapse="isCollapseMenu"
            :default-active="$route.path"
        >
          <!-- 递归组件渲染菜单，此处的 menuStore.menuTreeList 能保持响应式 -->
          <RecursiveMenuItem :menu-tree="menuStore.menuTreeList" @click-menu="handleClickMenu"/>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div>
            <Iconify
                :icon="isCollapseMenu?'ep:expand':'ep:fold'"
                @click="isCollapseMenu = !isCollapseMenu"
                size="23px"
                class="collapse-menu-icon"
            />
            <el-breadcrumb separator="/" class="header-breadcrumb">
              <el-breadcrumb-item :to="{path: dashboardPath}">首页</el-breadcrumb-item>
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
                  <span>{{ userStore.info?.nickName }}</span>
                  <i-mdi-arrow-down-drop/>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="tabStore.addTab(profileTab, $router)">个人中心</el-dropdown-item>
                    <el-dropdown-item @click="userStore.logout()">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>
        <Tabs/>
        <el-main>
          <!--
          RouterView 插槽：https://router.vuejs.org/zh/guide/advanced/router-view-slot.html#RouterView-%E6%8F%92%E6%A7%BD
          Component 为当前路由匹配到的组件
          -->
          <router-view v-slot="{ Component }">
            <!--
            KeepAlive 在多个组件间动态切换时缓存被移除的组件实例：https://cn.vuejs.org/guide/built-ins/keep-alive#keepalive
            KeepAlive 包含：https://cn.vuejs.org/guide/built-ins/keep-alive#include-exclude
            内部动态渲染 Component 对应的组件
            -->
            <keep-alive :include="tabStore.cachedComponentNames">
              <component :is="Component" :key="$route.fullPath"/>
            </keep-alive>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import Iconify from "@/components/Iconify.vue";
import RecursiveMenuItem from "@/components/RecursiveMenuItem.vue";
import {MenuTreeItem} from "@/api/sys/menu.ts";
import {useMenuStore} from "@/store/menu.ts";
import {useUserStore} from "../store/user.ts";
import Tabs from "@/components/Tabs.vue";
import {useTabStore} from "@/store/tab.ts";
import {dashboardPath, dashboardTab, profileTab} from "@/router";

const router = useRouter();
// 用户 store
const userStore = useUserStore();
// 菜单 store
const menuStore = useMenuStore();
// 菜单是否折叠
const isCollapseMenu = ref(false)
// 菜单列表
let menuList: MenuTreeItem[] = [];
// 面包屑
const breadcrumbs = ref<{ name: string, path: string }[]>([]);
// 标签页 store
const tabStore = useTabStore()

/**
 * 初始化
 */
onMounted(async () => {
  // 请求菜单树
  await menuStore.loadMenuTree({loadingOption: {target: '.el-aside'}});
  if (menuStore.isMenuTreeListEmpty) return;
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
  // 此处的 menuStore.menuTreeList 可以自动解包
  flatten(menuStore.menuTreeList);

  const currentPath = router.currentRoute.value.path;
  // 加载面包屑
  loadBreadcrumbs(currentPath)

  // 根据当前路由去菜单列表中查找对应的菜单项
  const currentItem = menuList.find(menu => menu.path === currentPath);
  if (currentItem) {
    // 添加标签，标签页不存在当前路由时，刷新页面后能正确打开
    tabStore.addTab({label: currentItem.name, name: currentPath}, router);
  } else {
    // 从已打开的标签页中查找
    const tab = tabStore.tabs.find(tab => tab.name === currentPath);
    if (tab) {
      // 如果标签页已打开，则直接打开
      tabStore.addTab(tab, router);
    } else {
      // 从路由列表中查找是否存在面包屑
      const route = router.getRoutes().find(route => route.path === currentPath);
      if (route?.meta?.breadcrumbs) {
        // 打开面包屑最后一项
        const lastBreadcrumbsItem = route.meta.breadcrumbs[route.meta.breadcrumbs.length - 1];
        tabStore.addTab({
          label: lastBreadcrumbsItem.name,
          name: lastBreadcrumbsItem.path
        }, router);
      } else {
        // 打开首页
        tabStore.addTab(dashboardTab, router);
      }
    }
  }
});

// 在 setup 中访问路由和当前路由：https://router.vuejs.org/zh/guide/advanced/composition-api.html#%E5%9C%A8-setup-%E4%B8%AD%E8%AE%BF%E9%97%AE%E8%B7%AF%E7%94%B1%E5%92%8C%E5%BD%93%E5%89%8D%E8%B7%AF%E7%94%B1
const handleClickMenu = (item: MenuTreeItem) => {
  if (!item || !item.path) return;

  // 添加标签
  tabStore.addTab({label: item.name, name: item.path}, router);
};

/**
 * 加载面包屑
 * @param itemOrPath 当前菜单项对象或路径
 */
const loadBreadcrumbs = (itemOrPath: MenuTreeItem | string) => {
  // 清空面包屑
  breadcrumbs.value = [];
  // 当前项：如果不是菜单树项，就根据路径从菜单列表中找
  const currentItem = (typeof itemOrPath !== 'string') ? itemOrPath : menuList.find(menu => menu.path === itemOrPath);
  if (currentItem) {
    /**
     * 根据 parentId 递归往上寻找父级菜单，将找到的父级菜单项添加到面包屑中
     * @param currentItem 当前菜单项
     */
    const findParentOrChild = (currentItem: MenuTreeItem) => {
      // 根据 parentId 查找父级菜单
      const parent = menuList.find(menu => menu.id === currentItem.parentId);
      if (!parent) return false;
      // 使用 unshift 将元素加入数组头部
      breadcrumbs.value.unshift({name: parent.name, path: parent.path});
      // 仍有父级时继续查找
      if (parent.parentId) {
        findParentOrChild(parent);
      }
    }
    findParentOrChild(currentItem);
    // 非首页时添加自身项
    if (currentItem.path !== dashboardPath) {
      breadcrumbs.value.push({name: currentItem.name, path: currentItem.path});
    }
  } else {
    // 根据路由从路由列表中获取 meta.breadcrumb
    const route = router.getRoutes().find(route => route.path === itemOrPath);
    if (route?.meta?.breadcrumbs) {
      // 如果有面包屑，则直接使用
      breadcrumbs.value = route.meta.breadcrumbs;
    }
  }
}

// 监听路由变化
watch(() => router.currentRoute.value.path, (newPath) => {
  // 加载面包屑
  loadBreadcrumbs(newPath)
})
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
</style>
