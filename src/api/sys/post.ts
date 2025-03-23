import http, {FetchOptions} from "@/utils/http.ts";
import {PageQO} from "@/types/common.ts";
import BaseApi from "@/api/api.ts";

interface PostEditForm {
  id: string | null // ID
  code: string // 编码
  name: string // 名称
  sort: number // 排序
  status: number, // 状态
}

class PostApi {
  static baseUrl = '/sys/posts';

  /**
   * 分页列表
   * @param query 查询条件
   * @param option 请求配置
   */
  static page(query: PageQO & {} | {}, option?: FetchOptions) {
    return BaseApi.page(this.baseUrl, query, option);
  }

  /**
   * 列表
   * @param query 查询条件
   * @param option 请求配置
   */
  static async list(query: {} = {}, option?: FetchOptions) {
    const response = await this.page(query, option)
    return response && response.data
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
  static save(query: PostEditForm, option?: FetchOptions) {
    return http.postByJson(this.baseUrl, query, option);
  }

  /**
   * 修改
   * @param query 编辑表单
   * @param option 请求配置
   */
  static update(query: PostEditForm, option?: FetchOptions) {
    return http.putByJson(`${this.baseUrl}/${query.id}`, query, option);
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

export default PostApi;
export type {PostEditForm};