import http, {FetchOptions} from "@/utils/http.ts";
import {PageQO} from "@/types/common.ts";

class BaseApi {

  /**
   * 分页列表
   * @param baseUrl 基础 URL
   * @param query 查询条件
   * @param option 请求配置
   */
  static async page(baseUrl: string, query: PageQO & {} | {}, option?: FetchOptions) {
    let response = await http.get(baseUrl, query, option)
    if (response) {
      // 如果 current、size、total 类型为字符串，则转换为 Number 类型，避免 Element Plus 分页组件警告
      if (response.current && typeof response.current === 'string') response.current = Number(response.current)
      if (response.size && typeof response.size === 'string') response.size = Number(response.size)
      if (response.total && typeof response.total === 'string') response.total = Number(response.total)
    }
    return response;
  }
}

export default BaseApi