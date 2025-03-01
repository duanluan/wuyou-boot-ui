import {PageQO} from "@/types/common.ts"
import http, {FetchOptions} from "@/utils/http.ts"
import {DataScopeType} from "@/enums/role.ts"
import BaseApi from "@/api/api.ts";

// 角色编辑表单
interface RoleEditForm {
  id: string | null // ID
  name: string // 名称
  code: string // 编码
  sort: number, // 顺序
  status: number, // 状态
  description: string // 描述
}

class RoleApi {
  static baseUrl = '/sys/roles'

  /**
   * 分页列表
   * @param query 查询条件
   * @param option 请求配置
   */
  static async page(query?: PageQO & {}, option?: FetchOptions) {
    return BaseApi.page(this.baseUrl, query, option);
  }

  /**
   * 列表
   * @param query 查询条件
   * @param option 请求配置
   */
  static async list(query?: {}, option?: FetchOptions) {
    const response = await this.page(option)
    return response && response.data
  }

  /**
   * 删除
   * @param ids ID 数组
   * @param option 请求配置
   */
  static async remove(ids: string[] | string, option?: FetchOptions) {
    return await http.deleteByIds(`${this.baseUrl}/{}`, ids, option)
  }

  /**
   * 保存
   * @param query 编辑表单
   * @param option 请求配置
   */
  static async save(query: RoleEditForm, option?: FetchOptions) {
    return await http.postByJson(this.baseUrl, query, option)
  }

  /**
   * 修改
   * @param query 编辑表单
   * @param option 请求配置
   */
  static async update(query: RoleEditForm, option?: FetchOptions) {
    return await http.putByJson(`${this.baseUrl}/${query.id}`, query, option)
  }

  /**
   * 修改状态
   * @param id ID
   * @param status 状态
   * @param option 请求配置
   */
  static async updateStatus(id: string, status: number, option?: FetchOptions) {
    const responseJson = await http.patchByJson(`${this.baseUrl}/${id}/status`, {id, status}, option)
    return responseJson && responseJson.code === 200
  }

  /**
   * 更新菜单
   * @param id ID
   * @param menuIds 菜单 ID 数组
   * @param option 请求配置
   */
  static async updateMenus(id: string, menuIds: string[], option?: FetchOptions) {
    const responseJson = await http.patchByJson(`${this.baseUrl}/${id}/menus`, {id, menuIds}, option)
    return responseJson && responseJson.code === 200
  }

  /**
   * 更新数据权限
   * @param id ID
   * @param queryDataScope 查询数据权限
   * @param updateDataScope 更新数据权限
   * @param queryDataScopeDeptIds 查询数据权限自定义部门 ID 数组
   * @param updateDataScopeDeptIds 更新数据权限自定义部门 ID 数组
   * @param option
   */
  static async updateDataScope(id: string, queryDataScope: DataScopeType, updateDataScope: DataScopeType, queryDataScopeDeptIds: string[], updateDataScopeDeptIds: string[], option?: FetchOptions) {
    const responseJson = await http.patchByJson(`${this.baseUrl}/${id}/dataScope`, {id, queryDataScope, updateDataScope, queryDataScopeDeptIds, updateDataScopeDeptIds}, option)
    return responseJson && responseJson.code === 200
  }
}

export default RoleApi
export type {RoleEditForm}