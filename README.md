# 简介



# 集成步骤

Vite 5.3.4 创建 Vue + TS

## Element Plus

[使用包管理器安装](https://element-plus.org/zh-CN/guide/installation.html#%E4%BD%BF%E7%94%A8%E5%8C%85%E7%AE%A1%E7%90%86%E5%99%A8)：
```shell
pnpm install element-plus
```

[按需导入](https://element-plus.org/zh-CN/guide/quickstart.html#%E6%8C%89%E9%9C%80%E5%AF%BC%E5%85%A5)：
```shell
pnpm install -D unplugin-vue-components unplugin-auto-import
```

`vite.config.ts`：
```typescript
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
```

## Icon 图标

[自动导入 - Icon 图标](https://element-plus.org/zh-CN/component/icon.html#%E8%87%AA%E5%8A%A8%E5%AF%BC%E5%85%A5)：

```shell
pnpm install unplugin-icons -D
pnpm install unplugin-auto-import -D
pnpm install unplugin-vue-components -D
```

`vite.config.ts`：
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from "unplugin-icons/vite"
import IconsResolver from 'unplugin-icons/resolver'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
      imports: ['vue'],
      resolvers: [
        // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox...（带样式）
        ElementPlusResolver(),
        // 自动导入图标组件
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
    }),
    Components({
      resolvers: [
        // 自动注册图标组件
        IconsResolver({
          enabledCollections: ['ep'],
        }),
        // 自动导入 Element Plus 组件
        ElementPlusResolver(),
      ],
    }),
    Icons({
      autoInstall: true,
    }),
  ],
})

```

## Vue Router

[包管理器安装](https://router.vuejs.org/zh/installation.html#%E5%8C%85%E7%AE%A1%E7%90%86%E5%99%A8)：

```shell
pnpm add vue-router@4
```

在`src/views`下创建页面。

`src/views/Home.vue`：
```ts
<template>
  <h1>主页</h1>
</template>

<script setup lang="ts"></script>
```

`src/views/Login.vue`：
```ts
<template>
  <h1>登录页</h1>
</template>

<script setup lang="ts"></script>
```

在`src/router/index.ts`中配置路由：

```ts
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
```

在`src/main.ts`中注册：

```ts {4,8}
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router';

createApp(App)
  // 注册路由器插件：https://router.vuejs.org/zh/guide/#%E6%B3%A8%E5%86%8C%E8%B7%AF%E7%94%B1%E5%99%A8%E6%8F%92%E4%BB%B6
  .use(router)
  .mount('#app')
```

手动访问`/`和`/login`，查看效果。
