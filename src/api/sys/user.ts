import http, {FetchOptions} from "@/utils/http.ts";
import {PageQO} from "@/types/common.ts";
import {RoleEditForm} from "@/api/sys/role.ts";

// 登录表单
interface LoginForm {
  username: string // 用户名
  password: string // 密码
  remember: boolean // 记住我
}

interface UserEditForm {
  id: string | null // ID
  nickName: string // 昵称
  username: string // 用户名
  roleIds: string[] // 角色 ID 数组
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

  /**
   * 分页列表
   * @param query 查询条件
   * @param option 请求配置
   */
  static async page(query?: PageQO & {}, option?: FetchOptions) {
    return await http.get(this.baseUrl, query, option);
  }

  /**
   * 删除
   * @param ids ID 数组
   * @param option 请求配置
   */
  static async remove(ids: string[] | string, option?: FetchOptions) {
    return await http.deleteByIds(`${this.baseUrl}/{}`, ids, option);
  }

  /**
   * 保存
   * @param query 编辑表单
   * @param option 请求配置
   */
  static async save(query: RoleEditForm, option?: FetchOptions) {
    return await http.postByJson(this.baseUrl, query, option);
  }

  /**
   * 修改
   * @param query 编辑表单
   * @param option 请求配置
   */
  static async update(query: RoleEditForm, option?: FetchOptions) {
    return await http.putByJson(`${this.baseUrl}/${query.id}`, query, option);
  }
}

export default UserApi;
export {LoginForm, UserEditForm};