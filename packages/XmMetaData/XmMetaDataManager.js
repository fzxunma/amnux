// XmMetaDataManager.js
import { stdpath } from "@XmVendor";
const { normalize, fromFileUrl } = stdpath;

export class XmMetaDataManager {
  constructor(kvPath = undefined) {
    const absolutePath = normalize(fromFileUrl(new URL(kvPath , import.meta.url)));
    this.kvPromise = Deno.openKv(absolutePath);
    this.cache = new Map(); // keyStr → { data, versionstamp }
  }

  async kv() {
    
    return await this.kvPromise;
  }

  async close() {
    (await this.kv()).close();
  }

  // ==================== 预加载所有数据（可选，用于加速） ====================
  async loadAll(prefix = ["xm"]) {
    const kv = await this.kv();
    this.cache.clear();

    for await (const entry of kv.list({ prefix })) {
      if (entry.value !== null) {
        const keyStr = entry.key.join("/");
        this.cache.set(keyStr, {
          data: entry.value,
          versionstamp: entry.versionstamp,
        });
      }
    }
  }

  // ==================== 内部工具 ====================
  // 在 XmMetaDataManager 类中添加或替换这个方法
  _normalizeAndValidateKeyPath(rawKeyPath) {
    const parts = [];

    const addSegment = (seg) => {
      if (typeof seg !== "string") {
        throw new Error(`路径段必须是字符串，收到: ${typeof seg}`);
      }
      const trimmed = seg.trim();
      if (trimmed === "") {
        throw new Error("路径段不能为空或仅包含空格");
      }
      // 关键：每段内部禁止包含 / 或 \ （因为 / 是我们用来分隔层级的）
      if (/[\/\\]/.test(trimmed)) {
        throw new Error(`路径段 "${trimmed}" 不能包含 / 或 \\，如需创建子目录，请在 ID 中使用 / 分隔（如 folder/sub）`);
      }
      // 推荐：严格字符集（防止奇怪字符）
      if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
        throw new Error(`路径段 "${trimmed}" 只能包含字母、数字、下划线、短横线和点号`);
      }
      if (trimmed.length > 128) {
        throw new Error(`路径段 "${trimmed}" 太长（最多128字符）`);
      }
      parts.push(trimmed);
    };

    if (typeof rawKeyPath === "string") {
      // 支持 "admin/users/list" 直接拆分
      rawKeyPath.split("/").filter(Boolean).forEach(addSegment);
    } else if (Array.isArray(rawKeyPath)) {
      rawKeyPath.forEach((item) => {
        if (Array.isArray(item)) {
          item.forEach(addSegment);
        } else if (typeof item === "string") {
          item.split("/").filter(Boolean).forEach(addSegment);
        } else {
          addSegment(item);
        }
      });
    } else {
      throw new Error("keyPath 必须是字符串或数组");
    }

    // 自动添加根前缀 "xm"
    if (parts.length === 0 || parts[0] !== "xm") {
      parts.unshift("xm");
    }

    return parts;
  }
  _normalizeKeyPath(raw) {
    const parts = [];
    const add = (p) => {
      if (p && p !== "") parts.push(String(p));
    };

    if (typeof raw === "string") {
      raw.split("/").filter(Boolean).forEach(add);
    } else if (Array.isArray(raw)) {
      raw.forEach((item) => {
        if (Array.isArray(item)) item.forEach(add);
        else if (typeof item === "string") item.split("/").filter(Boolean).forEach(add);
        else add(item);
      });
    }

    if (parts.length === 0 || parts[0] !== "xm") {
      parts.unshift("xm");
    }

    // 校验：除 xm 外每段至少 4 个字符（可根据需要调整）
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].length < 1) {
        throw new Error(`keyPath 段 "${parts[i]}" 无效`);
      }
    }

    return parts;
  }

  _validateEntity(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("value 必须是非数组对象");
    }
    if (!value.id || typeof value.id !== "string") {
      throw new Error("value.id 必须是字符串");
    }
    // 强制 id 为最后一级
    const lastSegment = this._normalizeKeyPath(value.id).at(-1);
    if (value.id !== lastSegment) {
      value = { ...value, id: lastSegment };
    }
    return value;
  }

  // ==================== 核心操作 ====================

  /** 获取单个完整实体 */
  async get(keyPath) {
    const normalized = this._normalizeKeyPath(keyPath);
    const keyStr = normalized.join("/");

    const cached = this.cache.get(keyStr);
    if (cached) return structuredClone(cached.data);

    const kv = await this.kv();
    const result = await kv.get(normalized);
    if (result.value === null) return null;

    this.cache.set(keyStr, {
      data: result.value,
      versionstamp: result.versionstamp,
    });
    return structuredClone(result.value);
  }

  /** 列出目录下所有直接子节点（返回 {id: entity} 对象） */
  async list(prefixPath) {
    const prefix = this._normalizeKeyPath(prefixPath);
    const kv = await this.kv();
    const result = {};

    for await (const entry of kv.list({ prefix })) {
      if (entry.value === null) continue;

      // 移除深度限制，接受所有后代叶子
      const relativeParts = entry.key.slice(prefix.length);
      if (relativeParts.length === 0) continue;

      const id = relativeParts.join('/');  // 如 "test/sdfsf"

      const entity = structuredClone(entry.value);
      entity.id = relativeParts[relativeParts.length - 1];  // 或保留完整路径

      result[id] = entity;

      this.cache.set(entry.key.join("/"), {
        data: entry.value,
        versionstamp: entry.versionstamp,
      });
    }

    return result;
  }

  /** 覆盖写入完整实体 */
  async set(keyPath, value) {
    const normalized = this._normalizeKeyPath(keyPath);
    const keyStr = normalized.join("/");

    const validated = this._validateEntity(value);

    const kv = await this.kv();
    const atomic = kv.atomic();

    // 如果缓存中有旧版本，添加 check 防止并发覆盖丢失
    const cached = this.cache.get(keyStr);
    if (cached) {
      atomic.check({ key: normalized, versionstamp: cached.versionstamp });
    }

    atomic.set(normalized, validated);
    const commit = await atomic.commit();

    if (!commit.ok) {
      throw new Error("写入冲突，请重试");
    }

    this.cache.set(keyStr, {
      data: validated,
      versionstamp: commit.versionstamp,
    });
    console.log(`Saved entity at ${keyStr} (versionstamp: ${commit.versionstamp})`);
    return structuredClone(validated);
  }

  /** 局部更新字段（读-改-写 + 版本检查） */
  async update(keyPath, subPath, newValue) {
    const normalized = this._normalizeKeyPath(keyPath);
    const keyStr = normalized.join("/");

    // 先获取当前完整对象
    let current = await this.get(normalized);
    if (current === null) {
      current = { id: normalized.at(-1) };
    }

    // 深路径设置
    const parts = subPath.split("/");
    let obj = current;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!obj[p] || typeof obj[p] !== "object") obj[p] = {};
      obj = obj[p];
    }
    obj[parts.at(-1)] = newValue;

    // 再整体写入
    return await this.set(normalized, current);
  }

  /** 删除实体（可选 force 删除子节点） */
  async del(keyPath, { force = false } = {}) {
    const normalized = this._normalizeKeyPath(keyPath);
    const keyStr = normalized.join("/");

    const kv = await this.kv();

    if (force) {
      // 先删除所有子节点
      const atomic = kv.atomic();
      for await (const entry of kv.list({ prefix: normalized })) {
        atomic.delete(entry.key);
        this.cache.delete(entry.key.join("/"));
      }
      const commit = await atomic.commit();
      if (!commit.ok) throw new Error("批量删除失败");
    }

    // 删除自身
    await kv.delete(normalized);
    this.cache.delete(keyStr);

    return true;
  }

  // ==================== Hono 接口 ====================
  ctxOk(ctx, data) {
    return ctx.json({ status: 200, data }, 200);
  }
  ctxError(ctx, message, code = 400) {
    return ctx.json({ status: code, message }, code);
  }

  async meta(ctx) {
    let body;
    try {
      body = await ctx.req.json();
    } catch {
      return this.ctxError(ctx, "无效 JSON", 400);
    }

    const { opt, keyPath: rawKeyPath, path, value } = body;

    if (!opt) return this.ctxError(ctx, "缺少 opt");

    let keyPath;
    try {
      keyPath = this._normalizeKeyPath(rawKeyPath);
    } catch (e) {
      return this.ctxError(ctx, e.message, 400);
    }

    try {
      switch (opt) {
        case "get":
          const entity = await this.get(keyPath);
          return this.ctxOk(ctx, entity ?? {});

        case "list": // ⭐ 新增操作：前端列表依赖这个
          const listData = await this.list(keyPath);
          return this.ctxOk(ctx, listData);

        case "set":
          if (value === undefined) return this.ctxError(ctx, "set 需要 value");
          const saved = await this.set(keyPath, value);
          return this.ctxOk(ctx, saved);

        case "update":
          if (!path) return this.ctxError(ctx, "update 需要 path");
          if (value === undefined) return this.ctxError(ctx, "update 需要 value");
          const updated = await this.update(keyPath, path, value);
          return this.ctxOk(ctx, updated);

        case "del":
          await this.del(keyPath, { force: value?.force });
          return this.ctxOk(ctx, { deleted: true });

        default:
          return this.ctxError(ctx, `未知 opt: ${opt}`);
      }
    } catch (e) {
      console.error("meta error:", e);
      return this.ctxError(ctx, e.message || "服务器错误", 500);
    }
  }
}