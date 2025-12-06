import router, {loginPath} from "@/router";
import {LoadingOptions, MessageOptions} from "element-plus";

type HttpVerb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE';

/**
 * HTTP 方法
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  CONNECT = 'CONNECT',
  TRACE = 'TRACE'
}

/**
 * 请求选项
 */
interface FetchOptions extends RequestInit {
  // 请求方法
  method?: HttpVerb;
  // 基础 URL
  baseUrl?: string | '',
  // 请求头
  // headers?: HeadersInit;
  headers?: Record<string, string>;
  // 请求体
  body?: BodyInit | null;

  // 在 url 后拼接参数
  query?: Record<string, any>;
  // json 参数
  json?: Record<string, any>;
  /**
   * 是否显示加载动画
   */
  showLoading?: boolean;
  /**
   * 加载动画配置项：https://element-plus.org/zh-CN/component/loading.html#%E9%85%8D%E7%BD%AE%E9%A1%B9
   */
  loadingOption?: LoadingOptions;
  /**
   * 是否显示成功提示
   */
  showOkMsg?: boolean;
  /**
   * 成功提示配置项
   */
  okMsgOption?: MessageOptions;
  /**
   * 是否显示错误提示
   */
  showErrorMsg?: boolean;
  /**
   * 错误提示配置项
   */
  errorMsgOption?: MessageOptions;
  /**
   * 防抖延迟
   */
  debounceDelay?: number;
  /**
   * 是否启用防抖
   */
  enableDebounce?: boolean;
  /**
   * 是否处理 401 错误
   */
  handle401?: boolean;
}

interface R<T> {
  // 编码
  code: number;
  // 消息
  msg: string;
  // 数据
  data: T;

  // 当前页码
  current?: number;
  // 每页条数
  size?: number;
  // 总条数
  total?: number;
}

class Http {
  config: FetchOptions;
  private debounceMap: Map<string, number> = new Map();

  constructor(config: FetchOptions) {
    this.config = config;
  }

  closeLoading(loading: any) {
    if (loading) loading.close();
  }

  // 生成请求的唯一标识
  private getRequestKey(url: string, options?: FetchOptions): string {
    return `${options?.method || 'GET'}:${url}:${JSON.stringify(options?.query)}:${JSON.stringify(options?.json)}`;
  }

  // 清除请求的防抖计时器
  private clearDebounce(key: string) {
    const timer = this.debounceMap.get(key);
    if (timer) clearTimeout(timer);
    this.debounceMap.delete(key);
  }

  private executeFetch(url: string, options?: FetchOptions, resolve?: any) {
    // 合并默认参数和传入参数
    options = {
      ...this.config, ...options,
      headers: {...this.config.headers, ...options?.headers},
      loadingOption: {...this.config.loadingOption, ...options?.loadingOption},
      okMsgOption: {...this.config.okMsgOption, ...options?.okMsgOption},
      errorMsgOption: {...this.config.errorMsgOption, ...options?.errorMsgOption}
    };

    // 处理参数
    if (options.query) {
      // 去除 null 或 undefined 的参数
      options.query = cleanParams(options.query);

      // GET、DELETE 在 url 后拼接参数
      if (options.method === HttpMethod.GET || options.method === HttpMethod.DELETE) {
        const params = new URLSearchParams(options.query).toString();
        url += '?' + params;
      }
      // POST、PUT 用 URLSearchParams 或 FormData 传参
      else if (options.method === HttpMethod.POST || options.method === HttpMethod.PUT || options.method === HttpMethod.PATCH) {
        if (options.headers?.['Content-Type'] === 'application/x-www-form-urlencoded') {
          const urlSearchParams = new URLSearchParams();
          for (let key in options.query) {
            urlSearchParams.append(key, options.query[key]);
          }
          options.body = urlSearchParams;
        } else {
          let formData = new FormData();
          for (let key in options.query) {
            formData.append(key, options.query[key]);
          }
          options.body = formData;
        }
      }
    }

    // json 传参：POST、PUT、PATCH
    if (options.json && (options.method === HttpMethod.POST || options.method === HttpMethod.PUT || options.method === HttpMethod.PATCH)) {
      // 去除 null 或 undefined 的参数
      options.json = cleanParams(options.json);

      // 设置 body
      options.body = JSON.stringify(options.json);
      // 设置 headers
      if (!options.headers) {
        options.headers = {"Content-Type": "application/json"};
      } else {
        if (options.headers instanceof Headers) {
          options.headers.append("Content-Type", "application/json");
        } else if (Array.isArray(options.headers)) {
          options.headers.push(["Content-Type", "application/json"]);
        } else {
          options.headers["Content-Type"] = "application/json";
        }
      }
    }

    // 显示加载动画
    let loading: any;
    if (options.showLoading) {
      loading = ElLoading.service(options.loadingOption);
    }

    // 请求
    fetch(options.baseUrl + url, options).then(async response => {
      this.closeLoading(loading);
      if (response.ok) {
        // JSON 响应
        const r = await response.json();
        if (r) {
          // 成功提示
          if (options.showOkMsg && options.okMsgOption && r.code === 200) {
            if (r.msg) {
              options.okMsgOption.message = r.msg;
            }
            ElMessage.success(options.okMsgOption);
          }
          // 错误提示
          if (options.showErrorMsg && options.errorMsgOption && r.code !== 200) {
            if (r.msg) {
              options.errorMsgOption.message = r.msg;
            }
            ElMessage.error(options.errorMsgOption);
          }
        }
        // 返回响应
        resolve(r);
      } else {
        if (response.status === 401 && options.handle401) {
          ElMessage.error("请先登录");
          // 重定向到登录页
          router.push({path: loginPath});
        } else if (response.status === 403) {
          ElMessage.error("无权限");
        } else {
          const r = await response.json();
          if (options.showErrorMsg && options.errorMsgOption && r && r.code !== 200) {
            if (r.msg) {
              options.errorMsgOption.message = r.msg;
            }
            ElMessage.error(options.errorMsgOption);
          }
          // 返回响应
          resolve(r);
        }
      }
    }).catch(error => {
      console.debug('请求异常', error);
      // 请求异常提示错误
      this.closeLoading(loading);
      if (options.showErrorMsg) {
        ElMessage.error(options.errorMsgOption);
      }
    })
  }

  // 泛型支持 <T>
  fetch<T = any>(url: string, options?: FetchOptions): Promise<R<T>> {
    return new Promise((resolve) => {
      // 启用防抖
      if (options?.enableDebounce ?? this.config.enableDebounce) {
        const requestKey = this.getRequestKey(url, options);

        // 防抖处理：如果存在相同请求的计时器，清除旧的请求计时器
        if (this.debounceMap.has(requestKey)) {
          this.clearDebounce(requestKey);
        }
        // 设置新的计时器，延迟请求执行
        const timer = window.setTimeout(async () => {
          // 执行后清除计时器
          this.debounceMap.delete(requestKey);
          // 执行
          this.executeFetch(url, options, resolve)
        }, options?.debounceDelay);

        // 将计时器添加到防抖映射中
        this.debounceMap.set(requestKey, timer);
      }
      // 不启用防抖，直接执行
      else {
        this.executeFetch(url, options, resolve);
      }
    });
  }

  /**
   * GET 请求
   * @param url URL
   * @param query 参数
   * @param option 请求选项
   */
  get<T = any>(url: string, query?: {}, option: FetchOptions = {query: {}}) {
    // 参数合并
    option.query = {...query, ...option.query};
    return this.fetch<T>(url, {...option, method: 'GET'});
  }

  /**
   * POST 请求
   * @param url URL
   * @param option 请求选项
   */
  post<T = any>(url: string, option?: FetchOptions) {
    return this.fetch<T>(url, {...option, method: 'POST'});
  }

  /**
   * POST 请求
   * @param url URL
   * @param query 参数
   * @param option 请求选项
   */
  postByQuery<T = any>(url: string, query: {}, option: FetchOptions = {query: {}}) {
    // 参数合并
    option.query = {...query, ...option.query};
    return this.fetch<T>(url, {...option, method: 'POST'});
  }

  /**
   * POST 请求
   * @param url URL
   * @param json body json 参数
   * @param option 请求选项
   */
  postByJson<T = any>(url: string, json: {}, option: FetchOptions = {json: {}}) {
    // 参数合并
    option.json = {...json, ...option.json};
    return this.fetch<T>(url, {...option, method: 'POST'});
  }

  /**
   * PUT 请求
   * @param url URL
   * @param json body json 参数
   * @param option 请求选项
   */
  putByJson<T = any>(url: string, json: {}, option: FetchOptions = {json: {}}) {
    // 参数合并
    option.json = {...json, ...option.json};
    return this.fetch<T>(url, {...option, method: 'PUT'});
  }

  /**
   * PATCH 请求
   * @param url URL
   * @param json body json 参数
   * @param option 请求选项
   */
  patchByJson<T = any>(url: string, json: {}, option: FetchOptions = {json: {}}) {
    // 参数合并
    option.json = {...json, ...option.json};
    return this.fetch<T>(url, {...option, method: 'PATCH'});
  }

  /**
   * DELETE 请求
   * @param url URL
   * @param option 请求选项
   */
  delete<T = any>(url: string, option?: FetchOptions) {
    return this.fetch<T>(url, {...option, method: 'DELETE'});
  }

  /**
   * DELETE 请求删除多个
   * @param url URL
   * @param ids ID 字符串、字符串/数字数组、数字
   * @param option 请求选项
   */
  deleteByIds<T = any>(url: string, ids: string[] | string, option?: FetchOptions) {
    if (!isValidStrOrStrArr(ids)) {
      return
    }
    if (Array.isArray(ids)) {
      ids = ids.join(',')
    }
    url = url.replace('{}', ids);
    return this.fetch<T>(url, {...option, method: 'DELETE'});
  }
}

// 创建一个默认实例
const http = new Http({
  method: "GET",
  baseUrl: '/api',
  headers: {
    // 内容类型为表单
    "Content-Type": "application/x-www-form-urlencoded",
  },
  // 显示加载动画
  showLoading: true,
  // 加载动画选项
  loadingOption: {text: "加载中..."},
  // 不显示成功提示
  showOkMsg: false,
  // 成功提示选项
  okMsgOption: {message: "操作成功"},
  // 显示错误提示
  showErrorMsg: true,
  // 错误提示选项
  errorMsgOption: {message: "请求失败"},
  // 防抖延迟
  debounceDelay: 300,
  // 启用防抖
  enableDebounce: true,
})

/**
 * 判断字符串、字符串数组是否有效
 * @param input 字符串、字符串数组
 */
const isValidStrOrStrArr = (input: string | string[]): boolean => {
  if (!input) {
    return false
  }
  if (typeof input === 'string' && input.trim() === '') {
    return false
  }
  if (Array.isArray(input)) {
    if (input.length == 0) {
      return false
    } else if (input.length == 1) {
      if (typeof input[0] === 'string' && input[0].trim() === '') {
        return false
      }
    }
  }
  return true
}

/**
 * 递归移除对象中值为 null 或 undefined 的字段
 * @param obj 要处理的对象或数组
 * @returns 处理后的对象或数组
 */
function cleanParams<T>(obj: T): T {
  // 如果输入为 null 或 undefined，直接返回
  if (obj === null || obj === undefined) {
    return obj;
  }
  // 如果不是对象类型（包括数组），直接返回
  if (typeof obj !== 'object') {
    return obj;
  }
  // 处理数组类型
  if (Array.isArray(obj)) {
    return obj.map(item => cleanParams(item)) as any;
  }

  // 处理对象类型
  const result = {} as T;
  for (const key in obj) {
    // 只处理对象自身的属性，不处理继承属性
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      // 如果值不是 null 或 undefined，则保留该属性
      if (value !== null && value !== undefined) {
        // 递归处理值
        result[key] = cleanParams(value);
      }
    }
  }
  return result;
}

export default http;
export type {R, FetchOptions};
export {isValidStrOrStrArr};