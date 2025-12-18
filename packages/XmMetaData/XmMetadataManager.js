// XmMetadataManager.js
export class XmMetadataManager {
  constructor(kvPath = undefined) {
    const absolutePath = kvPath
      ? new URL(kvPath, import.meta.url).pathname
      : undefined;
    this.kvPromise = Deno.openKv(absolutePath);
    this.cache = new Map(); // key: "xm/pages/page1" → { data: object, versionstamp }
    this.loaded = false;
  }

  async kv() {
    return await this.kvPromise;
  }

  async close() {
    (await this.kv()).close();
  }

  // ==================== 核心操作 ====================

  /** 启动时预加载所有数据到内存 */
  async loadAll(prefix = ["xm"]) {
    if (this.loaded) return;

    const kv = await this.kv();
    const entries = [];
    for await (const entry of kv.list({ prefix })) {
      entries.push(entry);
    }

    // 按 key 深度倒序（子节点先加载）
    entries.sort((a, b) => b.key.length - a.key.length);

    this.cache.clear();
    for (const { key, value, versionstamp } of entries) {
      if (value !== null) {
        const keyStr = key.join("/");
        this.cache.set(keyStr, { data: value, versionstamp });
      }
    }

    this.loaded = true;
  }

  /** 递归合并子节点到父对象 */
  _mergeInto(parent, childKey, childData) {
    if (
      childData && typeof childData === "object" && !Array.isArray(childData)
    ) {
      // 子节点是对象，递归合并
      for (const [k, v] of Object.entries(childData)) {
        if (parent[k] === undefined) {
          parent[k] = v;
        } else {
          // 如果已存在，尝试深合并（对象合并，数组/原始值覆盖）
          if (
            typeof v === "object" && v !== null && !Array.isArray(v) &&
            typeof parent[k] === "object" && parent[k] !== null &&
            !Array.isArray(parent[k])
          ) {
            this._mergeInto(parent[k], k, v);
          } else {
            parent[k] = v; // 覆盖
          }
        }
      }
    } else {
      // 原始值或数组，直接覆盖
      parent[childKey] = childData;
    }
  }

  /** 获取指定 keyPath 的完整合并对象（自动合并所有子节点） */
  get(keyPath) {
    if (!Array.isArray(keyPath) || keyPath.length === 0) return null;

    const prefix = keyPath.join("/") + "/";
    const result = {};
    console.log("Getting metadata for prefix:", prefix,this.cache);
    for (const [cacheKey, { data }] of this.cache) {
      if (cacheKey.startsWith(prefix)) {
        const relativePath = cacheKey.slice(prefix.length);
        const parts = relativePath.split("/");

        // 递归构建嵌套结构
        let current = result;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part] || typeof current[part] !== "object") {
            current[part] = {};
          }
          current = current[part];
        }
        // 最后一个部分是叶子数据
        const leafKey = parts[parts.length - 1];
        if (leafKey) {
          current[leafKey] = structuredClone(data);
        }
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  }

  /** 更新指定 keyPath 的完整对象（覆盖式） */
  async set(keyPath, value) {
    if (!Array.isArray(keyPath) || keyPath.length === 0) {
      throw new Error("keyPath 必须是非空数组");
    }

    const kv = await this.kv();
    const keyStr = keyPath.join("/");

    const atomic = kv.atomic();
    atomic.set(keyPath, value);
    const result = await atomic.commit();

    if (result.ok) {
      this.cache.set(keyStr, {
        data: value,
        versionstamp: result.versionstamp,
      });
      return structuredClone(value);
    }

    throw new Error("写入失败");
  }

  /** 更新子路径字段（支持文档不存在时自动创建） */
  async updatePath(keyPath, subPath, value) {
    let fullData = await this.get(keyPath);

    // 如果文档不存在，初始化为空对象（相当于创建新文档）
    if (fullData === null) {
      console.log(`文档 ${keyPath.join("/")} 不存在，自动创建`);
      fullData = {};
    }

    // 深路径设置
    const parts = subPath.split("/");
    let current = fullData;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (current[p] == null || typeof current[p] !== "object") {
        current[p] = {};
      }
      current = current[p];
    }
    current[parts[parts.length - 1]] = value;

    // 写入（会覆盖整个文档）
    return await this.set(keyPath, fullData);
  }
  /** 删除指定 keyPath（包括所有子节点） */
  async delete(keyPath) {
    const kv = await this.kv();
    const keyStr = keyPath.join("/");

    // 删除所有子节点 + 自身
    const atomic = kv.atomic();
    const iter = kv.list({ prefix: keyPath });
    for await (const entry of iter) {
      atomic.delete(entry.key);
      this.cache.delete(entry.key.join("/"));
    }

    const result = await atomic.commit();
    if (result.ok) {
      this.cache.delete(keyStr);
      return true;
    }
    return false;
  }

  // ==================== Hono 接口 ====================

  ctxOk(ctx, data) {
    return ctx.json({ status: 200, data }, 200);
  }

  ctxError(ctx, message = "操作失败", code = 400) {
    return ctx.json({ status: code, message }, code);
  }
  _normalizeKeyPath(rawKeyPath) {
    let parts;

    if (typeof rawKeyPath === "string") {
      parts = rawKeyPath.split("/").filter((part) => part.length > 0);
    } else if (Array.isArray(rawKeyPath)) {
      parts = rawKeyPath.filter((part) => part.length > 0);
    } else {
      throw new Error("keyPath 必须是字符串或数组");
    }

    // 如果第一个部分不是 "xm"，则自动补上
    if (parts.length === 0 || parts[0] !== "xm") {
      parts.unshift("xm");
    }

    return parts;
  }
  /**
   * 请求体示例：
   * {
   *   "opt": "get" | "set" | "update" | "del",
   *   "keyPath": ["xm", "pages", "page1"],
   *   "path": "title",           // update 时用（可选）
   *   "value": "新标题"          // set/update 时用
   * }
   */
  async meta(ctx) {
    let body;
    try {
      body = await ctx.req.json();
    } catch {
      return this.ctxError(ctx, "无效的 JSON 请求体", 400);
    }

    const { opt, keyPath: rawKeyPath, path, value } = body;

    if (!opt) {
      return this.ctxError(ctx, "缺少 opt", 400);
    }

    // === 关键修复：统一规范化，自动补 xm 前缀 ===
    let keyPathArray;
    try {
      keyPathArray = this._normalizeKeyPath(rawKeyPath);
    } catch (err) {
      return this.ctxError(ctx, err.message, 400);
    }

    if (keyPathArray.length === 0) {
      return this.ctxError(ctx, "keyPath 不能为空", 400);
    }

    try {
      switch (opt) {
        case "get": {
          const data = this.get(keyPathArray);
          return this.ctxOk(ctx, data ?? {});
        }
        case "set": {
          if (value === undefined) {
            return this.ctxError(ctx, "set 需要 value", 400);
          }
          const setResult = await this.set(keyPathArray, value);
          return this.ctxOk(ctx, setResult);
        }
        case "update": {
          if (!path) return this.ctxError(ctx, "update 需要 path", 400);
          const updated = await this.updatePath(keyPathArray, path, value);
          return this.ctxOk(ctx, updated);
        }
        case "del": {
          await this.delete(keyPathArray);
          return this.ctxOk(ctx, { deleted: true });
        }
        default:
          return this.ctxError(ctx, `未知操作: ${opt}`, 400);
      }
    } catch (err) {
      console.error("XmMetadataManager error:", err);
      return this.ctxError(ctx, err.message || "内部错误", 500);
    }
  }
}
