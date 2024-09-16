# 简介

技术栈：

* Vite：https://cn.vitejs.dev/guide/
* TypeScript：https://www.tslang.cn/docs/home.html
* Vue.js：https://cn.vuejs.org/guide/introduction.html
* Element Plus：https://element-plus.org/zh-CN/component/overview.html
* Vue Router：https://router.vuejs.org/zh/guide/
* Pinia：https://pinia.vuejs.org/zh/core-concepts/
* Less：https://lesscss.cn/

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

[三种使用方式](https://github.com/sxzz/element-plus-best-practices/blob/db2dfc983ccda5570033a0ac608a1bd9d9a7f658/src/App.vue)：
```html
<script lang="ts" setup>
// 方式 1:手动导入并注册图标组件
import IconEpApple from '~icons/ep/apple'

const msg = ref('')

const handleClick = () => {
  ElMessage.success('Hello world')
}
</script>

<script lang="ts">
export default defineComponent({
  components: {
    // 方法 3：使用 `unplugin-auto-import` 来自动导入组件，再手动注册组件。（不推荐）
    IconEpRefresh,
  },
})
</script>

<template>
  <el-space direction="vertical">
    <IconEpApple />
    
    <!-- 方法 2：使用 `unplugin-vue-components` 插件来自动注册图标 -->
    <i-ep-add-location />
    <i-ep-aim />

    <!-- 方法 3 -->
    <IconEpRefresh />

    <el-button @click="handleClick">
      <el-icon><i-ep-circle-check-filled /></el-icon> Hello world
    </el-button>

    <el-input v-model="msg" />
  </el-space>

  <div v-loading="{ text: 'Loading...' }" style="height: 500px">
    Loading Area
  </div>
</template>
```

## Vue Router

[包管理器安装](https://router.vuejs.org/zh/installation.html#%E5%8C%85%E7%AE%A1%E7%90%86%E5%99%A8)：

```shell
pnpm add vue-router@4
```

在`src/views`下创建页面。

`src/views/Home.vue`：
```html
<template>
  <h1>主页</h1>
</template>

<script setup lang="ts"></script>
```

`src/views/Login.vue`：
```html
<template>
  <h1>登录页</h1>
</template>

<script setup lang="ts"></script>
```

在`src/router/index.ts`中[配置路由](https://router.vuejs.org/zh/api/#Functions-createRouter)：

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

在`src/main.ts`中[注册](https://router.vuejs.org/zh/guide/#%E6%B3%A8%E5%86%8C%E8%B7%AF%E7%94%B1%E5%99%A8%E6%8F%92%E4%BB%B6)：

```ts {4,7-8}
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router';

createApp(App)
  // 注册路由器插件：https://router.vuejs.org/zh/guide/#%E6%B3%A8%E5%86%8C%E8%B7%AF%E7%94%B1%E5%99%A8%E6%8F%92%E4%BB%B6
  .use(router)
  .mount('#app')
```

修改`src/App.vue`，添加路由视图：

```html {2}
<template>
  <router-view/>
</template>
```

手动访问`/`和`/login`，查看效果。

## Pinia

[包管理器安装](https://pinia.vuejs.org/zh/getting-started.html#installation)：

```shell
pnpm add pinia
```

在`src/main.ts`中使用：

```ts {5,10-11}
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router';
import { createPinia } from 'pinia'

createApp(App)
  // 注册路由器插件：https://router.vuejs.org/zh/guide/#%E6%B3%A8%E5%86%8C%E8%B7%AF%E7%94%B1%E5%99%A8%E6%8F%92%E4%BB%B6
  .use(router)
  // 创建 pinia 实例（根 store）：https://pinia.vuejs.org/zh/api/modules/pinia.html#createpinia
  .use(createPinia())
  .mount('#app')
```

新建`src/store/menu.ts`用于测试：

```ts
import {defineStore} from 'pinia';

// 创建一个 useStore 函数，检索 store 实例：https://pinia.vuejs.org/zh/api/modules/pinia.html#definestore
export const useMenuStore = defineStore('menu', () => {
  const count = ref(0);

  const increment = () => count.value++;

  return {
    count,
    increment,
  };
});
```

在`src/App.vue`中使用查看效果：

```html {3-4,6-13}
<template>
  <router-view/>
  <h1>menuStore.count: {{ menuStore.count }}</h1>
  <el-button type="primary" @click="increment">+1</el-button>
</template>

<script setup lang="ts">
import {useMenuStore} from './store/menu';

const menuStore = useMenuStore();
const increment = () => {
  menuStore.increment();
}
</script>
```

pinia 持久化需要使用插件 [pinia-plugin-persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate)：

```shell
pnpm add pinia-plugin-persistedstate
```

修改`src/main.ts`启用插件：

```ts {6-11,16}
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router';
import { createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate'

// 创建 pinia 实例（根 store）：https://pinia.vuejs.org/zh/api/modules/pinia.html#createpinia
const pinia = createPinia()
// pinia 持久化插件
pinia.use(piniaPersistedstate)

createApp(App)
  // 注册路由器插件：https://router.vuejs.org/zh/guide/#%E6%B3%A8%E5%86%8C%E8%B7%AF%E7%94%B1%E5%99%A8%E6%8F%92%E4%BB%B6
  .use(router)
  .use(pinia)
  .mount('#app')
```

修改`src/store/menu.ts`启用持久化：
```ts {13-16}
import {defineStore} from 'pinia';

// 创建一个 useStore 函数，检索 store 实例：https://pinia.vuejs.org/zh/api/modules/pinia.html#definestore
export const useMenuStore = defineStore('menu', () => {
  const count = ref(0);

  const increment = () => count.value++;

  return {
    count,
    increment,
  };
}, {
  // 持久化
  persist: true
});
```

页面上点击 +1，刷新页面，查看效果。

## 根路径 src 别名 @

在`tsconfig.app.json`中配置：
```json {4-6}
{
  "compilerOptions": {
    "composite": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    // ……
  },
  // ……
}
```

在`vite.config.ts`中配置：
```ts
// ……
import {resolve} from 'path'

export default defineConfig({
  resolve: {
    // 路径别名：https://cn.vitejs.dev/config/shared-options.html#resolve-alias
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  // ……
})
```

之后就可以将`src`目录下的文件路径写为`@`开头的绝对路径。

## Less

[安装](https://lesscss.cn/usage/#command-line-usage--installing)：

```shell
pnpm add less -D
```

```html
<style scoped lang="less">
/* …… */
</style>
```
