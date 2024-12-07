/**
 * 角色编码
 */
enum RoleCode {
  // 超级管理员
  SUPER_ADMIN = 'superAdmin',
}

/**
 * 数据权限类型
 */
class DataScopeType {
  private constructor(public readonly value: number, public readonly label: string) {
  }

  static readonly ALL = new DataScopeType(1, '全部')
  static readonly CUSTOM = new DataScopeType(2, '自定义')
  static readonly CURRENT_DEPT_AND_CHILDREN = new DataScopeType(3, '本部门及以下')
  static readonly CURRENT_DEPT = new DataScopeType(4, '本部门')
  static readonly ONLY_SELF = new DataScopeType(5, '仅本人')

  static getOptions() {
    return Object.values(DataScopeType).map(item => ({label: item.label, value: item.value}));
  }
}


/**
 * 数据权限操作类型
 */
enum DataScopeActionType {
  // 查询
  QUERY = 1,
  // 增删改
  UPDATE = 2,
}

export {RoleCode, DataScopeType, DataScopeActionType};