import http, {FetchOptions} from "@/utils/http.ts";
import {PageQO} from "@/types/common.ts";
import {RoleEditForm} from "@/api/sys/role.ts";
import BaseApi from "@/api/api.ts";

// 登录表单
interface LoginForm {
  tenantId: number | null // 租户 ID
  username: string // 用户名
  password: string // 密码
  remember: boolean // 记住我
}

interface UserEditForm {
  id: string | null // ID
  nickName: string // 昵称
  username: string // 用户名
  password?: string // 密码
  roleIds: string[] // 角色 ID 数组
  deptIds?: string[] // 部门 ID
  postIds?: string[] // 岗位 ID 数组
  tenantIds?: string[] // 租户 ID 数组
}

interface UserDetail extends UserEditForm{
  isShowTenant: boolean
}

class UserApi {
  static baseUrl = '/sys/users';

  /**
   * 分页列表
   * @param query 查询条件
   * @param option 请求配置
   */
  static page(query: PageQO & {} | {}, option?: FetchOptions) {
    return BaseApi.page(this.baseUrl, query, option);
  }

  /**
   * 删除
   * @param ids ID 数组
   * @param option 请求配置
   */
  static remove(ids: string[] | string, option?: FetchOptions) {
    return http.deleteByIds(`${this.baseUrl}/{}`, ids, option);
  }

  /**
   * 保存
   * @param query 编辑表单
   * @param option 请求配置
   */
  static save(query: RoleEditForm, option?: FetchOptions) {
    return http.postByJson(this.baseUrl, query, option);
  }

  /**
   * 修改
   * @param query 编辑表单
   * @param option 请求配置
   */
  static update(query: RoleEditForm, option?: FetchOptions) {
    return http.putByJson(`${this.baseUrl}/${query.id}`, query, option);
  }

  /**
   * 更新个人信息
   * @param query 编辑表单
   * @param option 请求配置
   */
  static updateProfile(query: RoleEditForm, option?: FetchOptions) {
    return http.putByJson(`${this.baseUrl}/${query.id}/profile`, query, option);
  }

  /**
   * 修改密码
   * @param query 编辑表单
   * @param option 请求配置
   */
  static updatePwd(query: { id: string, oldPassword: string, newPassword: string }, option?: FetchOptions) {
    return http.putByJson(`${this.baseUrl}/${query.id}/pwd`, query, option);
  }
}

export default UserApi;
export type {LoginForm, UserEditForm, UserDetail};