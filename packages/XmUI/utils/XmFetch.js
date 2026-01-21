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
  static async metaDataFetch(payload) {
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
      console.error("Meta Data API Error:", err);
      throw err;
    }
  }
  static async ScrmFetch(path, payload) {
    try {
      console.log('ScrmFetch body', JSON.stringify(payload));
      const response = await fetch(XmApiConfig.getScrmApiUrl(path), {
        method: "POST",
        headers: XmApiConfig.defaultHeaders,
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      console.log('ScrmFetch result', result)
      if (result.code === 200) return result.data;
      throw new Error(result.message || "操作失败");
    } catch (err) {
      console.error("Meta Data API Error:", err);
      throw err;
    }
  }
  static async ScrmListFetch(path) {
    try {
      const response = await fetch(XmApiConfig.getScrmApiUrl(path), {
        method: "GET",
        headers: XmApiConfig.defaultHeaders
      });
      const result = await response.json();
            console.log('ScrmFetch result', result)
      if (result.code === 200) return result.data;
      throw new Error(result.message || "操作失败");
    } catch (err) {
      console.error("Meta Data API Error:", err);
      throw err;
    }
  }
 static async ScrmPutFetch(path, payload) {
  try {
    console.log('ScrmPut body', JSON.stringify(payload));
    const response = await fetch(XmApiConfig.getScrmApiUrl(path), {
      method: 'PUT',
      headers: XmApiConfig.defaultHeaders,
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    console.log('ScrmPut result', result);
    if (result.code === 200) return result.data;
    throw new Error(result.message || '操作失败');
  } catch (err) {
    console.error('ScrmPut Error:', err);
    throw err;
  }
}
}
