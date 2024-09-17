import http, {FetchOptions} from "@/utils/http.ts";

// 登录表单
interface LoginForm {
  username: string
  password: string
  remember: boolean
}

class UserApi {
  static baseUrl = '/sys/users';

  static async login(query: LoginForm, option?: FetchOptions): Promise<boolean> {
    if (!option) {
      option = {};
    }
    option.query = {...query, ...option.query};

    return (await http.post(this.baseUrl + '/login', option))?.code === 200;
  }
}

export default UserApi;
export {LoginForm};