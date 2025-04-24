import http, {FetchOptions} from "@/utils/http.ts";

interface MenuSearchForm {
  notBuildTree?: boolean // 是否不构建树
  name?: string // 名称
  status?: number // 状态

  types?: number[] | string // 多个类型
  roleCodes?: string[] | string // 角色编码列表
  isAllAndChecked?: boolean // 是否获取全部和选中
}

// 菜单树项
interface MenuTreeItem {
  id: string,
  sort: number,
  parentId: string,
  children?: MenuTreeItem[],
  checked?: boolean,
  icon?: string,
  name: string,
  type: number,
  method?: string,
  path?: string,
  permission?: string,
  status: number,
  createTime: string
}

interface MenuEditForm {
  id: string | null
  parentId: string | null
  name: string
  type: number
  method: string
  path: string
  permission: string
  sort: number
  status: number,
}

class MenuApi {
  static baseUrl = '/sys/menus';

  /**
   * 树
   * @param option 请求配置
   */
  static async tree(option?: FetchOptions): Promise<MenuTreeItem[]> {
    return (await http.get(this.baseUrl + '/tree', {}, option))?.data;
  }

  /**
   * 刷新缓存
   * @param option 请求配置
   */
  static async refreshTreeCache(option?: FetchOptions) {
    const responseJson = await http.post(this.baseUrl + '/refreshTreeCache', option);
    return responseJson && responseJson.code === 200;
  }

  /**
   * 树表
   * @param query 查询条件
   * @param option 请求配置
   */
  static async treeTable(query: MenuSearchForm, option?: FetchOptions): Promise<MenuTreeItem[]> {
    return (await http.get(this.baseUrl + '/treeTable', query, option))?.data;
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
  static save(query: MenuEditForm, option?: FetchOptions) {
    return http.postByJson(this.baseUrl, query, option);
  }

  /**
   * 修改
   * @param query 编辑表单
   * @param option 请求配置
   */
  static update(query: MenuEditForm, option?: FetchOptions) {
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

export default MenuApi;
export type {MenuSearchForm, MenuTreeItem, MenuEditForm};