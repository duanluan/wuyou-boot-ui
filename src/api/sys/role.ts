import {PageQO} from "@/types/common.ts";
import http from "@/utils/http.ts";

class RoleApi {
  static baseUrl = '/sys/roles';

  /**
   * 分页列表
   * @param query 查询条件
   * @param option 请求配置
   */
  static async page(query?: PageQO & {}, option?: FetchOptions) {
    if (!option) {
      option = {};
    }
    option.query = {...query, ...option.query};

    return await http.get(this.baseUrl, option);
  }
}

export default RoleApi;