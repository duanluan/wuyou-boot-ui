import http, {FetchOptions} from "@/utils/http.ts";
import {PageQO} from "@/types/common.ts";
import {RoleEditForm} from "@/api/sys/role.ts";

interface DeptEditForm {
  id: string | null // ID
  name: string // 名称
  parentId: string | null // 上级部门
  sort: number // 排序
  status: number, // 状态
}

class DeptApi {
  static baseUrl = '/sys/depts';

  /**
   * 分页列表
   * @param query 查询条件
   * @param option 请求配置
   */
  static async page(query?: PageQO & {}, option?: FetchOptions) {
    return await http.get(this.baseUrl, query, option);
  }

  /**
   * 树
   * @param query 查询条件
   * @param option 请求配置
   */
  static async tree(query?: {}, option?: FetchOptions) {
    return (await http.get(this.baseUrl + '/tree', query, option))?.data;
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

  /**
   * 修改状态
   * @param id ID
   * @param status 状态
   * @param option 请求配置
   */
  static async updateStatus(id: string, status: number, option?: FetchOptions) {
    const responseJson = await http.patchByJson(`${this.baseUrl}/${id}/status`, {id, status}, option)
    return responseJson && responseJson.code === 200;
  }
}

export default DeptApi;
export {DeptEditForm};