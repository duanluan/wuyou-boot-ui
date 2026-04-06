import http, {FetchOptions} from "@/utils/http.ts";
import {PageQO} from "@/types/common.ts";
import BaseApi from "@/api/api.ts";

interface TestDataEditForm {
  id: string | null
  value: string,
  deptId: string | null
  deptName?: string
  creatorName?: string
  createdTime?: string
}

class TestDataApi {
  static baseUrl = '/sys/testData';

  static page(query: PageQO & { value?: string } | {}, option?: FetchOptions) {
    return BaseApi.page(this.baseUrl, query, option);
  }

  static remove(ids: string[] | string, option?: FetchOptions) {
    return http.deleteByIds(`${this.baseUrl}/{}`, ids, option);
  }

  static save(query: TestDataEditForm, option?: FetchOptions) {
    return http.postByJson(this.baseUrl, query, option);
  }

  static update(query: TestDataEditForm, option?: FetchOptions) {
    return http.putByJson(`${this.baseUrl}/${query.id}`, query, option);
  }
}

export default TestDataApi;
export type {TestDataEditForm};
