import {createRouter, createWebHashHistory, RouteRecordRaw} from "vue-router";

import HomeView from "../views/Home.vue";
import LoginView from "../views/Login.vue";


const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: HomeView,
  }, {
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
