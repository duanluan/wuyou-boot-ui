import {ref} from "vue";

/**
 * 获取枚举的 label 和 value
 * @param enumObj 枚举对象
 * @param labels 映射关系对象
 * @returns {Array} 包含 label 和 value 的对象数组
 */
function getEnumOptions(enumObj: object, labels: { [key: string]: string }) {
  return Object.entries(labels).map(([value, label]) => ({label, value}));
}

/**
 * 公共状态枚举
 */
enum CommonStatus {
  // 禁用
  DISABLE = 0,
  // 启用
  ENABLE = 1
}

// 给枚举添加静态方法 getOptions
namespace CommonStatus {
  export function getOptions() {
    return getEnumOptions(CommonStatus, {
      [CommonStatus.DISABLE]: '禁用',
      [CommonStatus.ENABLE]: '启用'
    });
  }
}

const commonStatusOptions = ref();
commonStatusOptions.value = CommonStatus.getOptions();

export {CommonStatus, commonStatusOptions};