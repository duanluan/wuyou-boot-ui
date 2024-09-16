import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import Icons from "unplugin-icons/vite"
import IconsResolver from 'unplugin-icons/resolver'
import {resolve} from 'path'

export default defineConfig({
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
          enabledCollections: ['mdi', 'ep'],
        }),
        // 自动导入 Element Plus 组件
        ElementPlusResolver(),
      ],
    }),
    Icons({
      autoInstall: true,
    }),
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
