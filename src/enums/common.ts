/**
 * 公共状态枚举
 */
class CommonStatus {
  private constructor(public readonly value: number, public readonly label: string) {
  }

  static readonly DISABLE = new CommonStatus(0, '禁用');
  static readonly ENABLE = new CommonStatus(1, '启用');

  static getOptions() {
    return Object.values(CommonStatus).map(item => ({label: item.label, value: item.value}));
  }
}

export {CommonStatus};