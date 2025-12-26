// /store/XmMeta.js
import { XmFetch } from "/utils/XmFetch.js";

export class XmMeta {
  /** 标准化 keyPath 为数组，并过滤空段 */
  static normalizeKeyPath(keyPath) {
    if (Array.isArray(keyPath)) {
      return keyPath.filter(Boolean);
    }
    return keyPath.split("/").filter(Boolean);
  }

  /** 获取字符串 key，用于日志或调试 */
  static getKeyStr(keyPath) {
    return this.normalizeKeyPath(keyPath).join("/");
  }

  // ==================== 列表 ====================
  static async fetchList(keyPath, metaFetch = "metaDataFetch") {
    const normalized = this.normalizeKeyPath(keyPath);
    const data = await XmFetch[metaFetch]({ opt: "list", keyPath: normalized });
    return data || {};
  }

  // ==================== 实体 ====================
  static async fetchEntity(keyPath, metaFetch = "metaDataFetch") {
    const normalized = this.normalizeKeyPath(keyPath);
    const data = await XmFetch[metaFetch]({ opt: "get", keyPath: normalized });
    return data || {};
  }
  static async saveEntity(keyPath, value, metaFetch = "metaDataFetch") {
    const normalized = this.normalizeKeyPath(keyPath);
    if (normalized.length === 0) throw new Error("keyPath 不能为空");

    for (const part of normalized) {
      if (typeof part !== "string") {
        throw new Error("keyPath 部分必须是字符串");
      }
      if (part.trim() === "") {
        throw new Error("keyPath 部分不能为空");
      }

      // 禁止反斜杠和控制字符（核心安全）
      if (/[\\\0-\x1F\x7F]/.test(part)) {
        throw new Error(`keyPath 部分 "${part}" 包含非法控制字符或分隔符`);
      }

      // ⭐ 强烈建议保留：严格字符集限制（不影响多级目录）
      if (!/^[\/a-zA-Z0-9._-]+$/.test(part)) {
        throw new Error(`keyPath 部分 "${part}" 只能包含字母、数字、下划线、短横线和点号（建议遵守）`);
      }

      // 可选：长度限制
      if (part.length > 128) {
        throw new Error(`keyPath 部分 "${part}" 过长（最多128字符）`);
      }
    }

    await XmFetch[metaFetch]({ opt: "set", keyPath: normalized, value });
  }

  static async updateField(keyPath, path, value,  metaFetch = "metaDataFetch") {
    const normalized = this.normalizeKeyPath(keyPath);
    await XmFetch[metaFetch]({ opt: "update", keyPath: normalized, path, value });
  }

  static async deleteEntity(keyPath, metaFetch = "metaDataFetch") {
    const normalized = this.normalizeKeyPath(keyPath);
    if (normalized.length === 0) {
      throw new Error("keyPath 不能为空");
    }

    // 第一步：检查是否有子节点
    const hasChildren = await this.hasChildEntities(normalized);
    if (hasChildren) {
      throw new Error(`无法删除 "${normalized.join('/')}": 存在子节点，请先删除子节点或使用强制删除`);
    }

    // 第二步：执行删除
    await XmFetch[metaFetch]({ opt: "del", keyPath: normalized });
  }

  // 辅助方法：检查是否存在子节点（任意深度后代）
  static async hasChildEntities(prefixPath) {
    try {
      // 调用后端 list，获取所有后代
      const children = await XmFetch.metaFetch({
        opt: "list",
        keyPath: prefixPath,
      });

      // 如果返回的对象有任何键，说明有子节点
      return Object.keys(children || {}).length > 0;
    } catch (err) {
      // 如果 list 失败（比如网络问题），保守策略：假设有子节点，拒绝删除
      console.warn("检查子节点失败，默认拒绝删除:", err);
      return true;
    }
  }
  static async deleteEntityforce(keyPath, metaFetch = "metaDataFetch", { force = false } = {}) {
    const normalized = this.normalizeKeyPath(keyPath);
    if (normalized.length === 0) {
      throw new Error("keyPath 不能为空");
    }

    if (!force) {
      const hasChildren = await this.hasChildEntities(normalized);
      if (hasChildren) {
        throw new Error(
          `节点 "${normalized.join('/')}" 下存在子节点。使用 { force: true } 可强制删除整个目录树（慎用！）`
        );
      }
    }

    // 执行删除（后端 del 支持 force 时可递归）
    await XmFetch[metaFetch]({
      opt: "del",
      keyPath: normalized,
      value: { force }, // 传给后端，让后端决定是否递归
    });
  }
}