import http, {FetchOptions} from "@/utils/http.ts";

// 登录表单
interface LoginForm {
  username: string
  password: string
  remember: boolean
}

class UserApi {
  static baseUrl = '/sys/users';

  /**
   * 登录
   * @param query 登录表单
   * @param option 请求配置
   */
  static async login(query: LoginForm = {}, option?: FetchOptions) {
    const response = await http.postByQuery(this.baseUrl + '/login', query, option);
    return response?.data;
  }

  /**
   * 登出
   * @param option 请求配置
   */
  static async logout(option?: FetchOptions) {
    const response = await http.post(this.baseUrl + '/logout', option);
    return response?.code === 200;
  }
}

export default UserApi;
export {LoginForm};