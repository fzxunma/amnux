export class XmApiConfig {
  static #apiBaseUrl = "/xmapi";
  static timeoutMs = 10000; // 请求超时时间，单位毫秒
  // static #apiScrmUrl = "http://qiwei.zncode.com/api";
  static #apiScrmUrl = "http://192.168.0.114:31080/api";
  static defaultHeaders = {
    "Content-Type": "application/json",
  };
  static getMetaApiUrl() {
    return `${this.#apiBaseUrl}/meta`;
  }
  static getMetaDataApiUrl() {
    return `${this.#apiBaseUrl}/metaData`;
  }
  static getScrmApiUrl(path) {
    return `${this.#apiScrmUrl}${path}`;
  }
}
