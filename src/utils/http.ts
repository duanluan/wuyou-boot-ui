import router from "@/router";

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
  headers?: HeadersInit;
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
   * 加载动画配置项：https://element-plus.gitee.io/zh-CN/component/loading.html#%E9%85%8D%E7%BD%AE%E9%A1%B9
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
  debounceDelay: number;
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
  private getRequestKey(url: string, options: FetchOptions): string {
    return `${options.method || 'GET'}:${url}:${JSON.stringify(options.query)}:${JSON.stringify(options.json)}`;
  }

  // 清除请求的防抖计时器
  private clearDebounce(key: string) {
    const timer = this.debounceMap.get(key);
    if (timer) clearTimeout(timer);
    this.debounceMap.delete(key);
  }

  fetch(url: string, options?: FetchOptions): Promise<void | R<any>> {
    const requestKey = this.getRequestKey(url, options || {});
    return new Promise((resolve) => {
      // 防抖处理：如果存在相同请求的计时器，清除旧的请求计时器
      if (this.debounceMap.has(requestKey)) {
        this.clearDebounce(requestKey);
      }
      // 设置新的计时器，延迟请求执行
      const timer = window.setTimeout(async () => {
        this.debounceMap.delete(requestKey);  // 执行后清除计时器

        // 合并默认参数和传入参数
        let loadingOption = {}, okMsgOption = {}, errorMsgOption = {}, headers = {};
        if (options) {
          loadingOption = {...this.config.loadingOption, ...options.loadingOption}
          okMsgOption = {...this.config.okMsgOption, ...options.okMsgOption}
          errorMsgOption = {...this.config.errorMsgOption, ...options.errorMsgOption}
          headers = {...this.config.headers, ...options.headers}
        }
        options = {...this.config, ...options};
        options.loadingOption = loadingOption;
        options.okMsgOption = okMsgOption;
        options.errorMsgOption = errorMsgOption;
        options.headers = headers;

        // 处理参数
        if (options.query) {
          // GET、DELETE 在 url 后拼接参数
          if (options.method === HttpMethod.GET || options.method === HttpMethod.DELETE) {
            const params = new URLSearchParams(options.query).toString();
            url += '?' + params;
          }
          // POST、PUT 用 URLSearchParams 或 FormData 传参
          else if (options.method === HttpMethod.POST || options.method === HttpMethod.PUT || options.method === HttpMethod.PATCH) {
            if (options.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
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
        if (options?.showLoading) {
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
              if (r.code === 200 && options?.showOkMsg) {
                if (r.msg) {
                  options.okMsgOption.message = r.msg;
                }
                ElMessage.success(options?.okMsgOption);
              }
              // 错误提示
              if (r.code !== 200 && options?.showErrorMsg) {
                if (r.msg) {
                  options.errorMsgOption.message = r.msg;
                }
                ElMessage.error(options?.errorMsgOption);
              }
            }
            // 返回响应
            resolve(r);
          } else {
            if (response.status === 401) {
              ElMessage.error("请先登录");
              // 重定向到登录页
              router.push({name: 'LoginView'});
            } else if (response.status === 403) {
              ElMessage.error("无权限");
            } else {
              const r = await response.json();
              if (options?.showErrorMsg) {
                if (r && r.code !== 200 && r.msg) {
                  options.errorMsgOption.message = r.msg;
                }
                ElMessage.error(options?.errorMsgOption);
              }
              // 返回响应
              resolve(r);
            }
          }
        }).catch(error => {
          // 请求异常提示错误
          this.closeLoading(loading);
          if (options?.showErrorMsg) {
            ElMessage.error(options?.errorMsgOption);
          }
        })

      }, options.debounceDelay);

      // 将计时器添加到防抖映射中
      this.debounceMap.set(requestKey, timer);
    });
  }

  /**
   * GET 请求
   * @param url URL
   * @param query 参数
   * @param option 请求选项
   */
  get(url: string, query?: {}, option?: FetchOptions = {query: {}}) {
    // 参数合并
    option.query = {...query, ...option.query};
    return this.fetch(url, {...option, method: 'GET'});
  }

  /**
   * POST 请求
   * @param url URL
   * @param option 请求选项
   */
  post(url: string, option?: FetchOptions) {
    return this.fetch(url, {...option, method: 'POST'});
  }

  /**
   * POST 请求
   * @param url URL
   * @param query 参数
   * @param option 请求选项
   */
  postByQuery(url: string, query: {}, option?: FetchOptions = {query: {}}) {
    // 参数合并
    option.query = {...query, ...option.query};
    return this.fetch(url, {...option, method: 'POST'});
  }

  /**
   * POST 请求
   * @param url URL
   * @param json body json 参数
   * @param option 请求选项
   */
  postByJson(url: string, json: {}, option?: FetchOptions = {json: {}}) {
    // 参数合并
    option.json = {...json, ...option.json};
    return this.fetch(url, {...option, method: 'POST'});
  }

  /**
   * PUT 请求
   * @param url URL
   * @param json body json 参数
   * @param option 请求选项
   */
  putByJson(url: string, json: {}, option?: FetchOptions = {json: {}}) {
    // 参数合并
    option.json = {...json, ...option.json};
    return this.fetch(url, {...option, method: 'PUT'});
  }

  /**
   * PATCH 请求
   * @param url URL
   * @param json body json 参数
   * @param option 请求选项
   */
  patchByJson(url: string, json: {}, option?: FetchOptions = {json: {}}) {
    // 参数合并
    option.json = {...json, ...option.json};
    return this.fetch(url, {...option, method: 'PATCH'});
  }

  /**
   * DELETE 请求
   * @param url URL
   * @param option 请求选项
   */
  delete(url: string, option?: FetchOptions) {
    return this.fetch(url, {...option, method: 'DELETE'});
  }

  /**
   * DELETE 请求删除多个
   * @param url URL
   * @param ids ID 字符串、字符串/数字数组、数字
   * @param option 请求选项
   */
  deleteByIds(url: string, ids: number[] | string[] | number | string, option?: FetchOptions) {
    if (!isValidStrOrNumArrOrNum(ids)) {
      return
    }
    if (Array.isArray(ids)) {
      ids = ids.join(',')
    }
    url = url.replace('{}', ids);
    return this.fetch(url, {...option, method: 'DELETE'});
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
  debounceDelay: 300
})

/**
 * 判断字符串、字符串/数字数组、数字是否有效
 * @param input 字符串、字符串/数字数组、数字
 */
const isValidStrOrNumArrOrNum = (input: string | string[] | number[] | number): string => {
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
      if (typeof input[0] === 'number' && input[0] <= 0) {
        return false
      }
    }
  }
  if (typeof input === 'number' && input <= 0) {
    return false
  }
  return true
}

export default http;
export {FetchOptions, isValidStrOrNumArrOrNum};
