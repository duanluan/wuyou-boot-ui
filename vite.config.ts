import {ConfigEnv, defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import Icons from "unplugin-icons/vite"
import IconsResolver from 'unplugin-icons/resolver'
import {resolve} from 'path'

export default ({mode}: ConfigEnv) => defineConfig({
  // 服务器选项：https://cn.vitejs.dev/config/server-options.html
  server: {
    // 自定义代理规则：https://cn.vitejs.dev/config/server-options.html#server-proxy
    proxy: {
      '/api': {
        // 目标为环境变量 VITE_API_URL
        target: loadEnv(mode, process.cwd()).VITE_API_URL,
        changeOrigin: true,
        // 重写路径，去掉 /api 前缀
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    // 路径别名：https://cn.vitejs.dev/config/shared-options.html#resolve-alias
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [
    vue(),
    // 按需自动导入 API：https://github.com/unplugin/unplugin-auto-import
    AutoImport({
      // TypeScript 需配置：https://github.com/unplugin/unplugin-auto-import?tab=readme-ov-file#typescript
      dts: true,
      imports: [
        'vue',
        'vue-router', {
          'vue-router': [
            'createRouter', 'createWebHistory'
          ]
        }, {
          from: 'vue-router',
          imports: [
            'RouteRecordRaw', 'Router', 'RouteRecordNameGeneric'
          ],
          type: true
        },
        'pinia',
        {
          'element-plus': [
            'ElLoading',
            'ElMessage', 'ElMessageBox'
          ]
        }, {
          from: 'element-plus',
          imports: [
            'FormInstance', 'FormRules',
            'TreeInstance',
            'TabPaneName', 'TabsPaneContext'
          ],
          type: true,
        }
      ],
      resolvers: [
        // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox...（带样式）
        ElementPlusResolver(),
        // 自动导入图标组件
        IconsResolver({
          prefix: 'Icon',
        }),
      ]
    }),
    Components({
      resolvers: [
        // 自动注册图标组件
        IconsResolver({
          // 启用的图标合集。默认启用 mdi（https://icones.netlify.app/collection/mdi、https://icon-sets.iconify.design/mdi/）合集
          enabledCollections: ['mdi', 'ep'],
        }),
        // 自动导入 Element Plus 组件
        ElementPlusResolver(),
      ],
    }),
    Icons({
      autoInstall: true,
    })
  ],
  css: {
    // 传递给 CSS 预处理器的选项：https://cn.vitejs.dev/config/shared-options#css-preprocessoroptions
    preprocessorOptions: {
      less: {
        // less 变量运行时修改：https://lesscss.org/usage/#using-less-in-the-browser-modify-variables
        modifyVars: {
          // 导入外部文件：https://lesscss.org/features/#import-atrules-feature-reference
          hack: `true; @import (reference) "${resolve('src/style/global.less')}";`,
        }
      }
    }
  }
})
