import { createApp } from 'vue'
import '/@/style.css'
import App from '/@/App.vue'
import router from '/@/router';
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
