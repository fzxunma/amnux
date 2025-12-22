export class XmApiConfig {
  static #apiBaseUrl = "/api";
  static timeoutMs = 10000; // 请求超时时间，单位毫秒
  static defaultHeaders = {
    "Content-Type": "application/json",
  };
  static getMetaApiUrl() {
    return `${this.#apiBaseUrl}/meta`;
  }
}
