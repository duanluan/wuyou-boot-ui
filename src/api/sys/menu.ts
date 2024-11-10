import http, {FetchOptions} from "@/utils/http.ts";

// 菜单树
interface MenuTreeItem {
  id: number,
  name: string,
  order: number,
  parentId: number,
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
    // 角色 ID
    roleCodeList?: number[],
    // 是否获取全部和选中
    isAllAndChecked?: boolean
  } = {}, option?: FetchOptions): Promise<MenuTreeItem[]> {
    // 逗号拼接
    if (query.types && Array.isArray(query.types)) {
      query.types = query.types.join(',');
    }
    return (await http.get(this.baseUrl + '/tree', query, option))?.data;
  }
}

export default MenuApi;
export {MenuTreeItem};