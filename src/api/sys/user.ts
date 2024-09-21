import http, {FetchOptions} from "@/utils/http.ts";
import {useUserStore} from "@/store/user.ts";

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
  static async login(query: LoginForm, option?: FetchOptions) {
    if (!option) {
      option = {};
    }
    option.query = {...query, ...option.query};

    const response = await http.post(this.baseUrl + '/login', option);
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