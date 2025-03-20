/**
 * 菜单类型
 */
class MenuType {
  private constructor(public readonly value: number, public readonly label: string, public readonly tagType: string) {
  }

  static readonly DIR = new MenuType(1, '目录', 'primary')
  static readonly MENU = new MenuType(2, '菜单', 'success')
  static readonly BUTTON = new MenuType(3, '按钮', 'info')

  static getOptions() {
    return Object.values(MenuType).map(item => ({label: item.label, value: item.value}));
  }

  static getLabelByValue(value: number): string {
    const item = Object.values(MenuType).find(item => item.value === value);
    return item ? item.label : '-';
  }

  static getTagTypeByValue(value: number) {
    const item = Object.values(MenuType).find(item => item.value === value);
    return item ? item.tagType : null;
  }
}

class MenuMethod {
  private constructor(public readonly value: string) {
  }

  static readonly GET = new MenuMethod( 'GET')
  static readonly POST = new MenuMethod('POST')
  static readonly PUT = new MenuMethod( 'PUT')
  static readonly DELETE = new MenuMethod( 'DELETE')

  static getOptions() {
    return Object.values(MenuMethod).map(item => ({value: item.value}));
  }
}

export {MenuType, MenuMethod};