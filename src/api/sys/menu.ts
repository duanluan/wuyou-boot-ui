import http, {FetchOptions} from "@/utils/http.ts";

// 菜单树
interface MenuTreeItem {
  id: string,
  name: string,
  sort: number,
  parentid: string,
  icon: string,
  path: string,
  children: MenuTreeItem[],
  checked: boolean,
}

class MenuApi {
  static baseUrl = '/sys/menus';

  static async tree(query?: {
    // 多个类型
    types?: number[] | string
    // 角色编码列表
    roleCodes?: string[] | string,
    // 是否获取全部和选中
    isAllAndChecked?: boolean
  } = {}, option?: FetchOptions): Promise<MenuTreeItem[]> {
    // 逗号拼接
    if (query.types && Array.isArray(query.types)) {
      query.types = query.types.join(',');
    }
    if (query.roleCodes && Array.isArray(query.roleCodes)) {
      query.roleCodes = query.roleCodes.join(',');
    }
    return (await http.get(this.baseUrl + '/tree', query, option))?.data;
  }
}

export default MenuApi;
export type {MenuTreeItem};