import http, {FetchOptions} from "@/utils/http.ts";

// 登录表单
interface LoginForm {
  tenantId: number | null // 租户 ID
  username: string // 用户名
  password: string // 密码
  remember: boolean // 记住我
}

class AuthApi {

  /**
   * 登录用户信息
   * @param option 请求配置
   */
  static async profile(option?: FetchOptions) {
    const response = await http.get('/profile', option);
    return response?.data;
  }

  /**
   * 登录
   * @param query 登录表单
   * @param option 请求配置
   */
  static async login(query: LoginForm, option?: FetchOptions) {
    const response = await http.postByQuery('/login', query, option);
    return response?.data;
  }

  /**
   * 登出
   * @param option 请求配置
   */
  static async logout(option?: FetchOptions) {
    const response = await http.post('/logout', option);
    return response?.code === 200;
  }
}

export default AuthApi;
export type {LoginForm};