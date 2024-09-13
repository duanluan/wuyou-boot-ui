import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import Icons from "unplugin-icons/vite"
import IconsResolver from 'unplugin-icons/resolver'
import {resolve} from 'path'

export default defineConfig({
  // 开发或生产环境服务的公共基础路径：https://cn.vitejs.dev/config/shared-options.html#base
  base: './',
  resolve: {
    // 路径别名：https://cn.vitejs.dev/config/shared-options.html#resolve-alias
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
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
          // 启用的图标合集。默认启用 mdi（https://icon-sets.iconify.design/mdi/）合集
          // enabledCollections: ['mdi'],
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
