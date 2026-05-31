/**
 * 角色编码
 */
enum RoleCode {
  // 超级管理员
  SUPER_ADMIN = 'superAdmin',
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

export {RoleCode, DataScopeActionType};
