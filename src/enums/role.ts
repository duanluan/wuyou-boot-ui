/**
 * 角色编码
 */
enum RoleCode {
  // 超级管理员
  SUPER_ADMIN = 'superAdmin',
}

/**
 * 角色状态
 */
enum RoleStatus {
  // 禁用
  DISABLE = 0,
  // 启用
  ENABLE = 1
}

export {RoleCode, RoleStatus};