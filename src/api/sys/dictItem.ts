import http, {FetchOptions} from "@/utils/http.ts";
import BaseApi from "@/api/api.ts";
import {PageQO} from "@/types/common.ts";

interface DictItemEditForm {
  id: string | null
  dictId: string | null
  dictKey: string
  itemValue: string
  label: string
  description: string
  sortOrder: number
  remarks: string
  systemBuiltIn?: boolean
  codeReferenced?: boolean
  baseItemId?: string | number | null
  createdTime?: string
}

class DictItemApi {
  static baseUrl = '/sys/dict-items';

  static page(query: PageQO | Record<string, any>, option?: FetchOptions) {
    return BaseApi.page(this.baseUrl, query, option);
  }

  static async list(query: Record<string, any> = {}, option?: FetchOptions): Promise<DictItemEditForm[]> {
    const response = await this.page(query, option)
    return response?.data ?? []
  }

  static async get(id: string, option?: FetchOptions): Promise<DictItemEditForm> {
    const response = await http.get<DictItemEditForm>(`${this.baseUrl}/${id}`, {}, option)
    return response?.data
  }

  static remove(ids: string[] | string, option?: FetchOptions) {
    return http.deleteByIds(`${this.baseUrl}/{}`, ids, option);
  }

  static save(query: DictItemEditForm, option?: FetchOptions) {
    return http.postByJson(this.baseUrl, {
      dictId: query.dictId,
      itemValue: query.itemValue,
      label: query.label,
      description: query.description,
      sortOrder: query.sortOrder,
      remarks: query.remarks,
    }, option);
  }

  static update(query: DictItemEditForm, option?: FetchOptions) {
    return http.putByJson(`${this.baseUrl}/${query.id}`, {
      id: query.id,
      dictId: query.dictId,
      itemValue: query.itemValue,
      label: query.label,
      description: query.description,
      sortOrder: query.sortOrder,
      remarks: query.remarks,
    }, option);
  }
}

export default DictItemApi;
export type {DictItemEditForm};
