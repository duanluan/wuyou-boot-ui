import {PageQO} from "@/types/common.ts";
import http from "@/utils/http.ts";

// 角色修改表单
interface RoleUpdateForm {
  id: number
  name: string
  code: string
  description: string
}

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
      throw new TypeError('ids is empty');
    }
    // 如果ids类型为number[]
    if (Array.isArray(ids)) {
      ids = ids.join(',')
    }
    return await http.delete(`${this.baseUrl}/${ids}`, option);
  }

  /**
   * 修改
   * @param query 修改表单
   * @param option 请求配置
   */
  static async update(query: RoleUpdateForm, option?: FetchOptions) {
    if (!option) {
      option = {};
    }
    option.json = query;
    return await http.put(`${this.baseUrl}/${query.id}`, option);
  }
}

export default RoleApi;
export {RoleUpdateForm};