import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router"

const dashboardPath = "/dashboard"
const dashboardPath = "/dashboard", dashboardTab = {label: '仪表盘', name: dashboardPath}

/**
 * 路由中的名字要和组件名一致，否则 keep-alive 无法缓存组件
 */
const routes: RouteRecordRaw[] = [
  {
    // 首页
    path: "/",
    component: () => import("@/views/HomeView.vue"),
    redirect: dashboardPath,
    children: [
      {
        // 仪表盘
        name: "DashboardView",
        path: "dashboard",
        component: () => import("@/views/DashboardView.vue"),
      }, {
        // 用户管理
        name: "UsersView",
        path: "sys/users",
        component: () => import("@/views/sys/UsersView.vue"),
        meta: {
          keepAlive: true
        }
      }, {
        // 角色管理
        name: "RolesView",
        path: "sys/roles",
        component: () => import("@/views/sys/RolesView.vue"),
        meta: {
          keepAlive: true
        }
      }, {
        // 部门管理
        name: "DeptsView",
        path: "sys/depts",
        component: () => import("@/views/sys/DeptsView.vue"),
        meta: {
          keepAlive: true
        }
      }, {
        // 岗位管理
        name: "PostsView",
        path: "sys/posts",
        component: () => import("@/views/sys/PostsView.vue"),
        meta: {
          keepAlive: true
        }
      }, {
        // 菜单管理
        name: "MenusView",
        path: "sys/menus",
        component: () => import("@/views/sys/MenusView.vue"),
        meta: {
          keepAlive: true
        }
      }, {
        // 租户管理
        name: "TenantsView",
        path: "sys/tenants",
        component: () => import("@/views/sys/TenantsView.vue"),
        meta: {
          keepAlive: true
        }
      }
    ]
  }, {
    // 登录页
    name: "LoginView",
    path: "/login",
    component: () => import("@/views/LoginView.vue")
  }
]

// 创建路由器实例：https://router.vuejs.org/zh/guide/#%E5%88%9B%E5%BB%BA%E8%B7%AF%E7%94%B1%E5%99%A8%E5%AE%9E%E4%BE%8B
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
export {dashboardPath}
