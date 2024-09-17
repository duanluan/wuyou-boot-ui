import http, {FetchOptions} from "@/utils/http.ts";

interface MenuTree {
  id: number,
  name: string,
  order: number,
  parentId: number,
  icon: string,
  path: string,
}

class MenuApi {
  static async tree(query: {
    // 多个类型
    types?: number[] | string
  }, option?: FetchOptions): Promise<MenuTree[]> {
    // 类型逗号拼接
    if (query.types && Array.isArray(query.types)) {
      query.types = query.types.join(',');
    }
    // 拼接参数
    if (!option.query) {
      option.query = {};
    }
    option.query = {...query, ...option.query};

    return (await http.get('/sys/menus/tree', option))?.data;
  }
}

export default MenuApi;