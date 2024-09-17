import {createRouter, createWebHashHistory, RouteRecordRaw} from "vue-router";

import HomeView from "@/views/Home.vue";
import LoginView from "@/views/Login.vue";
import UsersView from "@/views/sys/UsersView.vue";
import RolesView from "@/views/sys/RolesView.vue";
import MenusView from "@/views/sys/MenusView.vue";

const routes: RouteRecordRaw[] = [
  {
    // 首页
    path: "/",
    component: () => import("@/views/HomeView.vue"),
    children: [
      {
        // 角色管理
        path: "sys/roles",
        component: RolesView
      }, {
        // 用户管理
        path: "sys/users",
        component: UsersView
      }, {
        // 菜单管理
        path: "sys/menus",
        component: MenusView
      }
    ]
  }, {
    // 登录页
    path: "/login",
    component: LoginView
  }
];

// 创建路由器实例：https://router.vuejs.org/zh/guide/#%E5%88%9B%E5%BB%BA%E8%B7%AF%E7%94%B1%E5%99%A8%E5%AE%9E%E4%BE%8B
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
