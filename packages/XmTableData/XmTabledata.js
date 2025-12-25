// XmTableData.js - 优化重构版
import { ObjectId } from "mongodb";

export class XmTableData {
  /**
   * @param {Array<Object>} data - 初始数据数组（每个对象必须有 _id）
   * @param {Array<string>} keywords - 用于生成唯一 key 的字段列表（如 ["moduleName", "modelName", "name"]）
   */
  constructor(data = [], keywords = []) {
    this.tabledata = new Map(); // _id -> 数据对象（支持 ObjectId 和 string）
    this.keydata = new Map();   // 复合 key -> _id（使用 Map 更高效，避免属性名冲突）
    this.keywords = keywords || [];

    // 搜索缓存：queryString -> { itemCount, page, pageSize, list }
    this.searchCache = new Map();
    this.MAX_CACHE_SIZE = 20; // 增加到 20，更实用

    if (data.length > 0) {
      this.set(data);
    }
  }

  /** 内部：标准化 _id 为字符串 */
  _normalizeId(id) {
    if (id instanceof ObjectId) {
      return id.toHexString();
    }
    return String(id);
  }

  /** 生成复合唯一 key */
  getCompositeKey(item) {
    if (!this.keywords.length) return "";

    const parts = this.keywords.map((kw) => {
      const val = item[kw];
      return val === undefined || val === null ? "" : JSON.stringify(val);
    });

    return parts.join("-");
  }

  /** 根据复合 key 获取 _id */
  getIdByCompositeKey(compositeKey) {
    return this.keydata.get(compositeKey);
  }

  /** 注册/更新复合 key 映射 */
  _registerKey(item) {
    if (!this.keywords.length) return;

    const key = this.getCompositeKey(item);
    if (key) {
      this.keydata.set(key, item._id);
    }
  }

  /** 删除复合 key 映射 */
  _unregisterKey(item) {
    if (!this.keywords.length) return;

    const key = this.getCompositeKey(item);
    if (key) {
      this.keydata.delete(key);
    }
  }

  // ==================== 核心操作 ====================

  /** 添加或更新多条数据（推荐入口） */
  set(data) {
    if (!Array.isArray(data)) data = [data];

    for (const item of data) {
      const _id = this._normalizeId(item._id);
      item._id = _id; // 统一为字符串

      // 更新前先注销旧 key（防止字段变化导致旧 key 残留）
      const oldItem = this.tabledata.get(_id);
      if (oldItem) {
        this._unregisterKey(oldItem);
      }

      // 注册新 key
      this._registerKey(item);

      // 存入主表
      this.tabledata.set(_id, item);
    }

    this.searchCache.clear(); // 任何写操作都清空搜索缓存
  }

  /** 删除一条或多条 */
  del(ids) {
    if (!Array.isArray(ids)) ids = [ids];

    for (const id of ids) {
      const _id = this._normalizeId(id);
      const item = this.tabledata.get(_id);
      if (item) {
        this._unregisterKey(item);
        this.tabledata.delete(_id);
      }
    }

    this.searchCache.clear();
  }

  /** 获取单条 */
  get(id) {
    return this.tabledata.get(this._normalizeId(id)) || null;
  }

  /** 批量获取 */
  getById(ids) {
    if (!Array.isArray(ids)) ids = [ids];

    const list = ids
      .map((id) => this.get(id))
      .filter(Boolean);

    return {
      itemCount: list.length,
      page: 1,
      pageSize: list.length,
      list,
    };
  }

  /** 获取全部 */
  getAll() {
    const list = Array.from(this.tabledata.values());
    return {
      itemCount: list.length,
      page: 1,
      pageSize: list.length,
      list,
    };
  }

  /** 总数 */
  count() {
    return this.tabledata.size;
  }

  /** 求和 */
  sum(field) {
    let total = 0;
    for (const item of this.tabledata.values()) {
      const val = item[field];
      if (typeof val === "number") total += val;
    }
    return total;
  }

  /** 分组统计 */
  groupCount(field) {
    const counts = {};
    for (const item of this.tabledata.values()) {
      const val = item[field];
      const key = val === undefined || val === null ? "" : String(val);
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }

  // ==================== 唯一性检查 ====================

  /**
   * 检查数据是否会产生关键词冲突（重复）
   * @param {Object|Array} data
   * @returns {boolean} true 表示无冲突（可安全插入）
   */
  checkUnique(data) {
    if (!this.keywords.length) return true;

    const items = Array.isArray(data) ? data : [data];
    for (const item of items) {
      const key = this.getCompositeKey(item);
      if (!key) continue;

      const existingId = this.keydata.get(key);
      if (existingId && existingId !== this._normalizeId(item._id)) {
        return false; // 冲突！
      }
    }
    return true;
  }

  /**
   * 过滤出不重复的数据（用于导入去重）
   * @param {Array} data
   * @param {string} nameField - 用于返回的字段名（如 "name"）
   * @param {string} uuidField - 返回的 uuid 字段名
   * @returns {Array} 不重复的项目
   */
  filterUnique(data, nameField = "name", uuidField = "uuid") {
    if (!this.keywords.length) return data;

    return data.filter((item) => {
      const key = this.getCompositeKey(item);
      if (!key) return true;

      const existingId = this.keydata.get(key);
      return !existingId || existingId === this._normalizeId(item._id);
    }).map((item) => ({
      [uuidField]: item[nameField],
    }));
  }

  // ==================== 高级搜索 + 分页 + 缓存 ====================

  /**
   * 高级查询
   * @param {Object} query
   *   - page, pageSize
   *   - sortBy, sortOrder ('asc'|'desc')
   *   - search: { conditions: [{ field, value, match }] }
   */
  getTableData(query = {}) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = "_id",
      sortOrder = "asc",
      search,
    } = query;

    const cacheKey = JSON.stringify({ page, pageSize, sortBy, sortOrder, search });

    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey);
    }

    let results = Array.from(this.tabledata.values());

    // 搜索过滤
    if (search?.conditions?.length) {
      results = results.filter((item) =>
        search.conditions.every(({ field, value, match }) => {
          const itemVal = item[field];
          if (itemVal === undefined) return false;

          switch (match) {
            case "eq": return itemVal === value;
            case "ne": return itemVal !== value;
            case "gt": return itemVal > value;
            case "gte": return itemVal >= value;
            case "lt": return itemVal < value;
            case "lte": return itemVal <= value;
            case "like":
            case "contains":
              return String(itemVal).toLowerCase().includes(String(value).toLowerCase());
            case "starts": return String(itemVal).startsWith(value);
            case "ends": return String(itemVal).endsWith(value);
            case "in": return Array.isArray(value) && value.includes(itemVal);
            case "some":
              return Array.isArray(itemVal) && Array.isArray(value) && itemVal.some(v => value.includes(v));
            case "match":
              return _.isEqual(itemVal, value);
            case "range":
              return Array.isArray(value) && itemVal >= value[0] && itemVal <= value[1];
            default: return false;
          }
        })
      );
    }

    // 排序
    const order = sortOrder === "desc" ? "desc" : "asc";
    results = _.orderBy(results, [sortBy], [order]);

    // 分页
    const total = results.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = results.slice(start, end);

    const result = {
      itemCount: total,
      page,
      pageSize,
      list,
    };

    // 缓存管理（LRU 简单实现）
    if (this.searchCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.searchCache.keys().next().value;
      this.searchCache.delete(firstKey);
    }
    this.searchCache.set(cacheKey, result);

    return result;
  }
}