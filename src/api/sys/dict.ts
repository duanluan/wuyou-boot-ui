import http, {FetchOptions} from "@/utils/http.ts";
import BaseApi from "@/api/api.ts";
import {PageQO} from "@/types/common.ts";

interface DictEditForm {
  id: string | null
  tenantId?: string | number | null
  tenantName?: string | null
  name: string
  key: string
  remarks: string
  systemBuiltIn?: boolean
  codeReferenced?: boolean
  allowTenantOverride?: boolean
  sourceScope?: 'PUBLIC_SYSTEM' | 'TENANT_OVERRIDE' | 'TENANT_CUSTOM'
  baseDictId?: string | number | null
  createdTime?: string
}

class DictApi {
  static baseUrl = '/sys/dicts';

  static page(query: PageQO | Record<string, any>, option?: FetchOptions) {
    return BaseApi.page(this.baseUrl, query, option);
  }

  static async list(query: Record<string, any> = {}, option?: FetchOptions): Promise<DictEditForm[]> {
    const response = await this.page(query, option)
    return response?.data ?? []
  }

  static async get(id: string, option?: FetchOptions): Promise<DictEditForm> {
    const response = await http.get<DictEditForm>(`${this.baseUrl}/${id}`, {}, option)
    return response?.data
  }

  static remove(ids: string[] | string, option?: FetchOptions) {
    return http.deleteByIds(`${this.baseUrl}/{}`, ids, option);
  }

  static save(query: DictEditForm, option?: FetchOptions) {
    return http.postByJson(this.baseUrl, query, option);
  }

  static update(query: DictEditForm, option?: FetchOptions) {
    return http.putByJson(`${this.baseUrl}/${query.id}`, {
      id: query.id,
      name: query.name,
      remarks: query.remarks,
    }, option);
  }
}

export default DictApi;
export type {DictEditForm};
