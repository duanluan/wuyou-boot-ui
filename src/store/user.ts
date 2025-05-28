import router, {dashboardPath, loginPath} from "@/router";
import {useMenuStore} from "@/store/menu.ts";
import {useTabStore} from "@/store/tab.ts";
import AuthApi, {LoginForm} from "@/api/sys/auth.ts";
import {UserDetail} from "@/api/sys/user.ts";
import {FetchOptions} from "@/utils/http.ts";

// 创建一个 useStore 函数，检索 store 实例：https://pinia.vuejs.org/zh/api/modules/pinia.html#definestore
export const useUserStore = defineStore('user', () => {
  /**
   * 用户信息
   */
  const info = ref<Partial<UserDetail>>({});

  /**
   * 是否登录，会获取登录用户信息，401 也会跳转登录页
   */
  const loggedIn = async (handle401: boolean) => {
    // 如果本地没有用户信息，直接认为未登录，不需要调用 API
    if (Object.keys(info.value).length === 0) {
      return false
    }
    try {
      await profile({showErrorMsg: false, handle401})
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * 登录用户信息
   * @param option 请求配置
   */
  const profile = async (option?: FetchOptions) => {
    // 保存用户信息
    info.value = await AuthApi.profile(option);
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
        // 确保保存用户信息后再跳转到仪表盘，因为仪表盘路由守卫中要使用用户信息
        await nextTick()
        // 跳转到仪表盘
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
      // 清空用户信息
      clean()
      // 确保清空信息后再跳转到登录页，因为登录页路由守卫中要使用用户信息
      await nextTick()
      // 跳转到登录页
      router.push({path: loginPath}).then(() => {
        // 清空菜单、标签页信息
        menuStore.clean()
        tabStore.clean()
      })
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
