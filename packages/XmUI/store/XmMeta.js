import { ref } from "vue";
import { XmFetch } from "/utils/XmFetch.js";

export class XmMeta {
  static metaDataCache = new Map(); // keyPath → ref(ID数组)
  static entityCache = new Map(); // keyPath → ref(完整对象)
  static fullListCache = new Map(); // keyStr → 完整对象

  // ================= 工具方法 =================
  static normalizeKeyPath(keyPath) {
    return Array.isArray(keyPath) ? keyPath : keyPath.split("/");
  }

  static getKeyStr(keyPath) {
    return Array.isArray(keyPath) ? keyPath.join("/") : keyPath;
  }

  // ================= Meta List =================
  static ensure(keyPath) {
    const keyStr = this.getKeyStr(keyPath);
    let r = this.metaDataCache.get(keyStr);
    if (!r) {
      r = ref([]);
      this.metaDataCache.set(keyStr, r);
    }
    return r;
  }

  static async load(keyPath) {
    const keyStr = this.getKeyStr(keyPath);
    const r = this.ensure(keyPath);

    const data = await XmFetch.metaFetch({ opt: "get", keyPath });
    const fullData = data || {};

    r.value = Object.keys(fullData);
    this.fullListCache.set(keyStr, fullData);

    return r;
  }

  static getCachedFullList(keyPath) {
    const keyStr = this.getKeyStr(keyPath);
    return this.fullListCache.get(keyStr) || {};
  }

  static clearFullListCache(keyPath) {
    const normalized = this.normalizeKeyPath(keyPath);
    const keyStr = normalized.join("/");
    this.fullListCache.delete(keyStr);

    // 清空列表缓存，强制刷新
    const listRef = this.metaDataCache.get(keyStr);
    if (listRef) listRef.value = [];
  }

  // ================= Entity =================
  static ensureEntity(keyPath) {
    const keyStr = this.getKeyStr(keyPath);
    let r = this.entityCache.get(keyStr);
    if (!r) {
      r = ref({ id: 0 });
      this.entityCache.set(keyStr, r);
    }
    return r;
  }

  static async loadEntity(keyPath) {
    //const keyStr = this.getKeyStr(keyPath);
    const r = this.ensureEntity(keyPath);
    const data = await XmFetch.metaFetch({ opt: "get", keyPath });
    r.value = { ...(data || {}) };
    return r;
  }

  static async saveEntity(keyPath, value) {
    if (!keyPath || (Array.isArray(keyPath) && keyPath.length === 0)) {
      throw new Error("keyPath 不能为空");
    }

    // 强制转为数组，并防御非法字符
    let normalized = Array.isArray(keyPath) ? keyPath : keyPath.split("/");
    normalized = normalized.map((part) => {
      if (
        typeof part !== "string" || part.includes("/") || part.includes("\\")
      ) {
        throw new Error(`keyPath 部分 "${part}" 包含非法字符`);
      }
      return part;
    });
    // 关键：正确传 keyPath
    await XmFetch.metaFetch({ opt: "set", keyPath: normalized, value });

    // 更新缓存
    const keyStr = normalized.join("/");
    const entityRef = this.entityCache.get(keyStr);
    if (entityRef) entityRef.value = { ...value };

    // 清除父级缓存
    if (normalized.length > 1) {
      const parentKey = normalized.slice(0, -1);
      this.clearFullListCache(parentKey);
    }

    return true;
  }

  static async updateEntityField(keyPath, path, value) {
    await XmFetch.metaFetch({ opt: "update", keyPath, path, value });
    const keyStr = this.getKeyStr(keyPath);
    const entityRef = this.entityCache.get(keyStr);
    if (entityRef) {
      const fresh = await XmFetch.metaFetch({ opt: "get", keyPath });
      entityRef.value = { ...(fresh || {}) };
    }
    const parentKey = this.normalizeKeyPath(keyPath).slice(0, -1);
    this.clearFullListCache(parentKey);
    return true;
  }
  static normalizeListKey(listKey) {
    let keyArray;

    if (typeof listKey === "string") {
      // 字符串路径，用 / 分割，过滤空段（如 "meta/" 或 "//"）
      keyArray = listKey.split("/").filter(Boolean);
    } else if (Array.isArray(listKey)) {
      keyArray = [...listKey];
    } else {
      throw new Error("LIST_KEY 必须是字符串或数组");
    }

    // 冻结数组，防止后续代码意外修改（如 push）
    return Object.freeze(keyArray);
  }
  static async deleteEntity(keyPath) {
    console.log(keyPath)
    await XmFetch.metaFetch({ opt: "del", keyPath });
    const keyStr = this.getKeyStr(keyPath);
    this.entityCache.delete(keyStr);

    const parentKey = this.normalizeKeyPath(keyPath).slice(0, -1);
    this.clearFullListCache(parentKey);

    // 刷新列表 ID
    const listRef = this.metaDataCache.get(parentKey.join("/"));
    if (listRef) await this.load(parentKey);

    return true;
  }
}
