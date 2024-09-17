import http, {FetchOptions} from "@/utils/http.ts";

// 菜单树
interface MenuTreeItem {
  id: number,
  name: string,
  order: number,
  parentId: number,
  icon: string,
  path: string,
  children: MenuTreeItem[]
}

class MenuApi {
  static baseUrl = '/sys/menus';

  static async tree(query: {
    // 多个类型
    types?: number[] | string
  }, option?: FetchOptions): Promise<MenuTreeItem[]> {
    // 类型逗号拼接
    if (query.types && Array.isArray(query.types)) {
      query.types = query.types.join(',');
    }
    // 拼接参数
    if (option) {
      if (option && !option.query) {
        option.query = {};
      }
      option.query = {...query, ...option.query};
    }

    return (await http.get(this.baseUrl + '/tree', option))?.data;
  }
}

export default MenuApi;
export {MenuTreeItem};