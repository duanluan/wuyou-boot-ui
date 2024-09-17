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
  headers?: HeadersInit;
  // 请求体
  body?: BodyInit | null;

  // // TODO
  // timeout?: number;
  // // TODO
  // responseType?: ResponseType;
  // // TODO 请求地址，没用到？
  // url?: string;
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

interface Data<T> {
  error: any;

  // 编码
  code: number;
  // 消息
  msg: string;
  // 数据
  data: T;

  // 当前页码
  current: number;
  // 每页条数
  size: number;
  // 总条数
  total: number;
}

class Http {
  config: FetchOptions;

  constructor(config: FetchOptions) {
    this.config = config;
  }

  closeLoading(loading: any) {
    loading.close();
  }

  fetch(url: string, options?: FetchOptions): Promise<void | Data<any>> {
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
      // POST、PUT 用 FormData 传参
      else if (options.method === HttpMethod.POST || options.method === HttpMethod.PUT) {
        let formData = new FormData();
        for (let key in options.query) {
          formData.append(key, options.query[key]);
        }
        options.body = formData;
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
    // const response: Response<Data<any>> = await fetch(url, options);

    // if (!response.ok || response.data?.code !== 200) {
    //   // 显示错误提示
    //   if (options?.showErrorMsg) {
    //     let msg;
    //     if (response.data?.msg) {
    //       msg = response.data.msg;
    //     } else if (response.data?.error) {
    //       msg = response.data.error;
    //     }
    //     ElMessage.error(msg);
    //   }
    //   return null;
    // }
    // return response.data;
    return fetch(options.baseUrl + url, options)
      .then(response => {
        this.closeLoading(loading);
        if (response.ok) {
          return response.json()
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
  baseUrl: import.meta.env.VITE_BASE_URL,
  // baseURL: BASE_URL,
  headers: {
    // 默认内容类型为表单
    "Content-Type": "application/x-www-form-urlencoded",
  },
  // 默认显示加载动画
  showLoading: true,
  // 加载动画选项
  loadingOption: {text: "加载中..."},
  // 默认显示错误提示
  showErrorMsg: true
})

export default http;
export {FetchOptions};
