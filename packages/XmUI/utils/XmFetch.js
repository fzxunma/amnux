import { XmApiConfig } from "/config/XmApiConfig.js";
export class XmFetch {
  static async metaFetch(payload) {
    try {
      const response = await fetch(XmApiConfig.getMetaApiUrl(), {
        method: "POST",
        headers: XmApiConfig.defaultHeaders,
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.status === 200) return result.data;
      throw new Error(result.message || "操作失败");
    } catch (err) {
      console.error("Meta API Error:", err);
      throw err;
    }
  }
}
