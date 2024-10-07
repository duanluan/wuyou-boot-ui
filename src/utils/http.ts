import {LoadingOptions, MessageOptions} from "element-plus";
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
   * 是否显示错误提示
   */
  showErrorMsg?: boolean;
  /**
   * 错误提示配置项：https://element-plus.gitee.io/zh-CN/component/message.html#message-%E9%85%8D%E7%BD%AE%E9%A1%B9
   */
  errorMsgOption?: MessageOptions;
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

  constructor(config: FetchOptions) {
    this.config = config;
  }

  closeLoading(loading: any) {
    loading.close();
  }

  fetch(url: string, options?: FetchOptions): Promise<void | R<any>> {
    // 默认参数和传入参数合并
    let loadingOption = {}, headers = {};
    if (options) {
      loadingOption = {...this.config.loadingOption, ...options.loadingOption}
      headers = {...this.config.headers, ...options.headers}
    }
    options = {...this.config, ...options};
    options.loadingOption = loadingOption;
    options.headers = headers;

    // 处理参数
    if (options.query) {
      // GET、DELETE 在 url 后拼接参数
      if (options.method === HttpMethod.GET || options.method === HttpMethod.DELETE) {
        const params = new URLSearchParams(options.query).toString();
        url += '?' + params;
      }
      // POST、PUT 用 URLSearchParams 或 FormData 传参
      else if (options.method === HttpMethod.POST || options.method === HttpMethod.PUT) {
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

    // GET 和 PUT 用 json 传参
    if (options.json && (options.method === HttpMethod.POST || options.method === HttpMethod.PUT)) {
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
    return fetch(options.baseUrl + url, options)
      .then(async response => {
        this.closeLoading(loading);
        if (response.ok) {
          // 响应中 code 不为 200 时提示 msg
          const r = await response.json();
          if (r && r.code !== 200 && options?.errorMsgOption) {
            options.errorMsgOption.message = r.msg;
            ElMessage.error(options?.errorMsgOption);
          }
          return Promise.resolve(r);
        } else {
          if (response.status === 401) {
            ElMessage.error("请先登录");
            // 重定向到登录页
            router.push({name: 'login'});
          } else if (response.status === 403) {
            ElMessage.error("无权限");
          } else {
            // http 状态码不为 200 时提示错误
            if (options?.showErrorMsg) {
              ElMessage.error(options?.errorMsgOption);
            }
          }
        }
      }).catch(error => {
        // 请求异常提示错误
        this.closeLoading(loading);
        if (options?.showErrorMsg) {
          ElMessage.error(options?.errorMsgOption);
        }
      })
  }

  get(url: string, option?: FetchOptions) {
    return this.fetch(url, {...option, method: 'GET'});
  }

  post(url: string, option?: FetchOptions) {
    return this.fetch(url, {...option, method: 'POST'});
  }

  put(url: string, option?: FetchOptions) {
    return this.fetch(url, {...option, method: 'PUT'});
  }

  delete(url: string, option?: FetchOptions) {
    return this.fetch(url, {...option, method: 'DELETE'});
  }
}

const http = new Http({
  method: "GET",
  baseUrl: '/api',
  headers: {
    // 默认内容类型为表单
    "Content-Type": "application/x-www-form-urlencoded",
  },
  // 默认显示加载动画
  showLoading: true,
  // 加载动画选项
  loadingOption: {text: "加载中..."},
  // 默认显示错误提示
  showErrorMsg: true,
  // 错误提示选项
  errorMsgOption: {message: "请求失败"},
})

export default http;
export {FetchOptions};
