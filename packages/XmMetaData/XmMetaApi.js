// XmMetaApi.js - 优化版：适配 XmMetadataManager 的内存缓存结构
export class XmMetaApi {
  // 项目名前缀（可根据实际项目调整，或从 manager 传入）
  static projectName = "xmmeeting"; // 不带 system_ 前缀

  static recurse(curr, currPath, map) {
    if (curr === null || typeof curr !== "object") {
      map.set(currPath, curr);
      return;
    }

    if (Array.isArray(curr)) {
      curr.forEach((item, index) => {
        XmMetaApi.recurse(item, currPath ? `${currPath}/${index}` : `${index}`);
      });
    } else {
      for (const [key, value] of Object.entries(curr)) {
        XmMetaApi.recurse(value, currPath ? `${currPath}/${key}` : key);
      }
    }
  }

  static flattenToPathMap(obj, path = "") {
    const map = new Map();
    XmMetaApi.recurse(obj, path, map);
    return map;
  }

  static pathMapToObject(map) {
    const obj = {};

    for (const [path, value] of map.entries()) {
      const keys = path.split("/");
      let curr = obj;
      keys.forEach((key, index) => {
        const isLast = index === keys.length - 1;
        //const nextKey = keys[index + 1];
        const isArrayIndex = !isNaN(Number(key));

        if (isLast) {
          if (isArrayIndex) {
            if (!Array.isArray(curr)) curr = []; // 临时修正
            curr[key] = value;
          } else {
            curr[key] = value;
          }
        } else {
          if (isArrayIndex) {
            if (!Array.isArray(curr[key])) curr[key] = [];
          } else {
            if (!(key in curr)) curr[key] = {};
          }
          curr = curr[key];
        }
      });
    }

    return obj;
  }
}
