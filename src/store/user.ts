import {defineStore} from 'pinia';
import UserApi, {LoginForm} from "@/api/sys/user.ts";
import router from "@/router";
import {useMenuStore} from "@/store/menu.ts";
import {useTabStore} from "@/store/tab.ts";

// 创建一个 useStore 函数，检索 store 实例：https://pinia.vuejs.org/zh/api/modules/pinia.html#definestore
export const useUserStore = defineStore('user', () => {
  const info = ref({});
  const menuStore = useMenuStore()
  const tabStore = useTabStore()

  /**
   * 登录成功后跳转到仪表盘
   * @param loginForm 登录表单
   */
  const login = (loginForm: LoginForm) => {
    UserApi.login(loginForm, {errorMsgOption: {message: '登录失败'}}).then((data: any) => {
      if (data) {
        // 保存用户信息
        info.value = data
        router.push({name: 'DashboardView'})
      }
    })
  }

  /**
   * 清空
   */
  const clean = () => {
    info.value = {}
  }

  /**
   * 登出
   */
  const logout = () => {
    if (UserApi.logout()) {
      router.push({name: 'LoginView'});
      clean()
      menuStore.clean()
      tabStore.clean()
    }
  }

  return {
    login,
    clean,
    logout,
    info
  };
}, {
  // 持久化
  persist: true
});
