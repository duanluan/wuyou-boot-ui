import {shallowRef} from "vue";
import DictItemApi, {DictItemEditForm} from "@/api/sys/dictItem.ts";
import type {FetchOptions} from "@/utils/http.ts";

const DICT_KEYS = {
  COMMON_STATUS: 'common_status',
  MENU_TYPE: 'menu_type',
  MENU_METHOD: 'menu_method',
  DATA_SCOPE_TYPE: 'data_scope_type',
  DATA_SCOPE_ACTION_TYPE: 'data_scope_action_type',
  YES_NO: 'yes_no',
} as const;

type DictValueType = 'string' | 'number' | 'boolean'
type DictValue = string | number | boolean

interface DictOption<T extends DictValue = string> {
  label: string
  value: T
  itemValue: string
  description: string
  sortOrder: number
  remarks: string
}

const MENU_TYPE_TAG_TYPES: Record<string, 'primary' | 'success' | 'info'> = {
  '1': 'primary',
  '2': 'success',
  '3': 'info',
}

const convertDictValue = (itemValue: string, valueType: DictValueType): DictValue => {
  if (valueType === 'number') {
    return Number(itemValue)
  }
  if (valueType === 'boolean') {
    return itemValue === '1' || itemValue.toLowerCase() === 'true'
  }
  return itemValue
}

const toDictOptions = <T extends DictValue>(
  items: DictItemEditForm[],
  valueType: DictValueType
): DictOption<T>[] => {
  return items.map(item => ({
    label: item.label,
    value: convertDictValue(item.itemValue, valueType) as T,
    itemValue: item.itemValue,
    description: item.description ?? '',
    sortOrder: Number(item.sortOrder ?? 0),
    remarks: item.remarks ?? '',
  }))
}

const loadDictOptions = async <T extends DictValue = string>(
  dictKey: string,
  valueType: DictValueType = 'string',
  option?: FetchOptions
): Promise<DictOption<T>[]> => {
  const items = await DictItemApi.list({current: 0, dictKey}, option)
  return toDictOptions<T>(items, valueType)
}

const findDictOption = <T extends DictValue = string>(
  options: DictOption<T>[],
  value: DictValue | null | undefined
) => {
  if (value === null || value === undefined) {
    return undefined
  }
  return options.find(item => String(item.value) === String(value))
}

const getDictLabel = <T extends DictValue = string>(
  options: DictOption<T>[],
  value: DictValue | null | undefined,
  fallback = '-'
) => {
  return findDictOption(options, value)?.label ?? fallback
}

const getDictOptionValue = <T extends DictValue = string>(
  options: DictOption<T>[],
  itemValue: string,
  fallback: T
) => {
  return options.find(item => item.itemValue === itemValue)?.value ?? fallback
}

const getMenuTypeTagType = (value: DictValue | null | undefined): 'primary' | 'success' | 'info' | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }
  return MENU_TYPE_TAG_TYPES[String(value)]
}

const toYesNoBoolean = (value: DictValue | null | undefined) => {
  if (value === null || value === undefined) {
    return false
  }
  return String(value) === '1' || String(value).toLowerCase() === 'true'
}

const toYesNoValue = (value: boolean) => {
  return value ? '1' : '0'
}

const useDictOptions = <T extends DictValue = string>(
  dictKey: string,
  valueType: DictValueType = 'string'
) => {
  const options = shallowRef<DictOption<T>[]>([])

  const load = async (option?: FetchOptions) => {
    options.value = await loadDictOptions<T>(dictKey, valueType, option)
    return options.value
  }

  const getLabel = (value: DictValue | null | undefined, fallback = '-') => {
    return getDictLabel(options.value, value, fallback)
  }

  const getValueByItemValue = (itemValue: string, fallback: T) => {
    return getDictOptionValue(options.value, itemValue, fallback)
  }

  return {
    options,
    load,
    getLabel,
    getValueByItemValue,
  }
}

export {
  DICT_KEYS,
  getDictLabel,
  getDictOptionValue,
  getMenuTypeTagType,
  loadDictOptions,
  toYesNoBoolean,
  toYesNoValue,
  useDictOptions,
}
export type {DictOption, DictValue, DictValueType}
