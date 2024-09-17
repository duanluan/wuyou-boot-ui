import {createRouter, createWebHashHistory, RouteRecordRaw} from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    // 首页
    path: "/",
    component: () => import("@/views/HomeView.vue"),
    children: [
      {
        // 仪表盘
        name: "dashboard",
        path: "dashboard",
        component: () => import("@/views/DashboardView.vue")
      },
      {
        // 角色管理
        path: "sys/roles",
        component: () => import("@/views/sys/RolesView.vue")
      }, {
        // 用户管理
        path: "sys/users",
        component: () => import("@/views/sys/UsersView.vue")
      }, {
        // 菜单管理
        path: "sys/menus",
        component: () => import("@/views/sys/MenusView.vue")
      }
    ]
  }, {
    // 登录页
    name: "login",
    path: "/login",
    component: () => import("@/views/LoginView.vue")
  }
];

// 创建路由器实例：https://router.vuejs.org/zh/guide/#%E5%88%9B%E5%BB%BA%E8%B7%AF%E7%94%B1%E5%99%A8%E5%AE%9E%E4%BE%8B
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
