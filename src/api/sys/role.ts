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

  /**
   * 删除
   * @param ids ID 数组
   * @param option 请求配置
   */
  static async remove(ids: number[] | number | string, option?: FetchOptions) {
    if (ids.length === 0) {
      console.error('ids不能为空');
    }
    // 如果ids类型为number[]
    if (Array.isArray(ids)) {
      ids = ids.join(',')
    }
    return await http.delete(`${this.baseUrl}/${ids}`, option);
  }
}

export default RoleApi;