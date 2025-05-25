import router, {dashboardPath, loginPath} from "@/router";
import {useMenuStore} from "@/store/menu.ts";
import {useTabStore} from "@/store/tab.ts";
import AuthApi, {LoginForm} from "@/api/sys/auth.ts";
import {UserDetail} from "@/api/sys/user.ts";

// 创建一个 useStore 函数，检索 store 实例：https://pinia.vuejs.org/zh/api/modules/pinia.html#definestore
export const useUserStore = defineStore('user', () => {
  /**
   * 用户信息
   */
  const info = ref<Partial<UserDetail>>({});

  /**
   * 是否登录，会获取登录用户信息，401 也会跳转登录页
   */
  const loggedIn = async () => {
    if (Object.keys(info.value).length === 0) {
      return false
    }
    try {
      await profile()
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * 登录用户信息
   */
  const profile = async () => {
    // 保存用户信息
    info.value = await AuthApi.profile();
  }

  /**
   * 登录成功后跳转到仪表盘
   * @param loginForm 登录表单
   */
  const login = (loginForm: LoginForm) => {
    AuthApi.login(loginForm).then(async (data: any) => {
      if (data) {
        // 保存用户信息
        info.value = data
        // 确保数据反应完成，避免 loggedIn 方法中获取不到又跳回登录页
        await nextTick();
        router.push({path: dashboardPath})
      }
    })
  }

  /**
   * 清空
   */
  const clean = () => {
    info.value = {}
  }

  const menuStore = useMenuStore()
  const tabStore = useTabStore()

  /**
   * 登出
   */
  const logout = async () => {
    if (await AuthApi.logout()) {
      clean()
      menuStore.clean()
      tabStore.clean()
      // 确保数据反应完成，避免 loggedIn 方法中获取到跳不到登录页
      await nextTick();
      router.push({path: loginPath});
    }
  }

  return {
    loggedIn,
    login,
    clean,
    logout,
    info
  };
}, {
  // 持久化
  persist: true
});
