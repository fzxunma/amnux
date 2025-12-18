// XmTabledataManager.js - 优化重构版
import { XmTabledata } from "./XmTabledata.js";
import { XmMetaApi } from "@XmMetaData"; // 假设路径正确

export class XmTabledataManager {
  constructor() {
    // modelName -> XmTabledata 实例
    this.tables = new Map();

    // modelName -> 当前最大 id（用于自增 id）
    this.maxIds = new Map();

    // 控制层（MongoDB 操作封装）
    this.control = null;

    // 元数据缓存（从 XmMetadataManager 获取）
    this.metadata = null;
  }

  /** 释放资源（可选） */
  free() {
    this.tables.clear();
    this.maxIds.clear();
    this.control = null;
    this.metadata = null;
  }

  /** 统一响应格式 */
  _response(status = 200, data = {}, errinfo = "") {
    return {
      status,
      data: status === 200 ? data : undefined,
      errinfo: status !== 200 ? errinfo : undefined,
      download: false,
    };
  }

  /** 获取模型的自增 ID */
  _getNextId(model) {
    const current = this.maxIds.get(model) || 0;
    const next = current + 1;
    this.maxIds.set(model, next);
    return next;
  }

  /** 确保模型的 XmTabledata 实例存在 */
  _ensureTable(model, keywords = []) {
    if (!this.tables.has(model)) {
      this.tables.set(model, new XmTabledata([], keywords));
    }
    return this.tables.get(model);
  }

  /** 初始化：加载所有模型数据到内存 */
  async init(control, metadata) {
    return 
    this.control = control;
    this.metadata = metadata;

    const projectMeta = metadata[XmMetaApi.projectInfo];
    if (!projectMeta?.metadata?.models) {
      console.warn("No models found in metadata");
      return;
    }

    console.time("Init mongodb tables");

    const loadPromises = [];

    for (const modelName of Object.keys(projectMeta.metadata.models)) {
      loadPromises.push(
        (async () => {
          try {
            // 加载数据
            const data = await this.control.loadAllMongoData(modelName);
            const maxId = await this.control.getDocumentsMaxId(modelName);

            // 获取关键词字段
            const keywords = XmMetaApi.getModelKeywords(metadata, modelName) ||
              [];

            // 创建实例并初始化
            const table = new XmTabledata(data, keywords);
            this.tables.set(modelName, table);
            this.maxIds.set(modelName, maxId);

            console.log(`Loaded model: ${modelName} (${data.length} records)`);
          } catch (err) {
            console.error(`Failed to load model ${modelName}:`, err);
          }
        })(),
      );
    }

    await Promise.all(loadPromises);
    console.timeEnd("Init mongodb tables");
  }

  /** 主接口：处理所有 table 操作 */
  async handleRequest(postData) {
    const { opt, model, data, query = {} } = postData;

    if (!model || !opt) {
      return this._response(400, null, "model and opt are required");
    }

    // 确保表存在
    const keywords = XmMetaApi.getModelKeywords(this.metadata, model) || [];
    const table = this._ensureTable(model, keywords);

    let result = {};
    let status = 200;
    let errinfo = "";

    const now = Date.now();

    try {
      switch (opt) {
        case "post": // 新增
          {
            if (!data) {
              return this._response(400, null, "data required for post");
            }

            const items = Array.isArray(data) ? data : [data];

            // 检查唯一性
            if (!table.checkUnique(items)) {
              return this._response(500, null, "添加数据关键字重复！");
            }

            // 添加元信息
            for (const item of items) {
              item._created = now;
              item._updated = now;
              item._creater = "admin";
              item._updater = "admin";
              item.id = this._getNextId(model);
            }

            // 写入 MongoDB
            const inserted = await this.control.postMongoData(model, items);

            // 更新内存表（_id 转为字符串）
            const normalizedItems = items.map((item, i) => ({
              ...item,
              _id: inserted[i]?._id?.toHexString?.() || inserted[i],
            }));
            table.set(normalizedItems);

            result = { data: normalizedItems };
          }
          break;

        case "import": // 批量导入（支持多模型）
          {
            if (!Array.isArray(data)) {
              return this._response(400, null, "data must be array for import");
            }

            const importResults = [];
            for (const { modelName, data: modelData, name } of data) {
              if (!modelName || !Array.isArray(modelData)) continue;

              const modelKeywords =
                XmMetaApi.getModelKeywords(this.metadata, modelName) || [];
              const modelTable = this._ensureTable(modelName, modelKeywords);

              // 去重
              const uniqueData = modelTable.filterUnique(
                modelData,
                name || "name",
                "uuid",
              );
              if (uniqueData.length === 0) {
                importResults.push({
                  model: modelName,
                  inserted: 0,
                  reason: "全部重复",
                });
                continue;
              }

              // 补全信息
              const insertItems = modelData.filter((item) => {
                const key = modelTable.getCompositeKey(item);
                return key && !modelTable.getIdByCompositeKey(key);
              });

              for (const item of insertItems) {
                item._created = now;
                item._updated = now;
                item._creater = "admin";
                item._updater = "admin";
                item.id = this._getNextId(modelName);
              }

              const insertedIds = await this.control.postMongoData(
                modelName,
                insertItems,
              );
              const normalized = insertItems.map((item, i) => ({
                ...item,
                _id: insertedIds[i]?._id?.toHexString?.() || insertedIds[i],
              }));

              modelTable.set(normalized);
              importResults.push({
                model: modelName,
                inserted: insertItems.length,
              });
            }

            result = { importResults };
          }
          break;

        case "put": // 更新
          {
            if (!data) {
              return this._response(400, null, "data required for put");
            }

            const updateItems = Array.isArray(data) ? data : [data];

            if (!table.checkUnique(updateItems)) {
              return this._response(500, null, "编辑数据关键字重复！");
            }

            for (const item of updateItems) {
              item._updated = now;
              item._updater = "admin";
            }

            // 批量更新
            if (Array.isArray(data)) {
              const ids = updateItems.map((item) => item._id);
              const updateFields = updateItems[0];
              delete updateFields._id;
              await this.control.putMongoData(model, ids, updateFields);
            } else {
              const { _id, ...fields } = updateItems[0];
              await this.control.putMongoData(model, _id, fields);
            }

            table.set(updateItems);
            result = { data: updateItems };
          }
          break;

        case "del": // 软删除
          {
            if (!data) {
              return this._response(400, null, "data required for del");
            }

            const delItems = Array.isArray(data) ? data : [data];
            const delIds = delItems.map((item) => item._id);

            const deleteInfo = {
              _deleted: true,
              _deletedTime: now,
              _deleter: "admin",
            };

            await this.control.deleteMongoData(model, delIds, deleteInfo);

            table.del(delIds);
            result = { deleted: delIds.length };
          }
          break;

        case "get": // 分页查询
          result = this._withParents(model, table.getTableData(query));
          break;

        case "getid": // 按 ID 批量获取
          {
            if (!data) {
              return this._response(400, null, "data required for getid");
            }
            const ids = Array.isArray(data)
              ? data.map((d) => d._id || d)
              : [data];
            result = this._withParents(model, table.getById(ids));
          }
          break;

        case "getall": // 获取全部
          result = this._withParents(model, table.getAll());
          break;

        case "getkey": // 仅检查唯一性
          if (!data || !table.checkUnique(data)) {
            return this._response(500, null, "数据关键字重复！");
          }
          result = { valid: true };
          break;

        default:
          return this._response(400, null, `Unknown opt: ${opt}`);
      }
    } catch (error) {
      console.error(`Table operation error [${opt} ${model}]:`, error);
      status = 500;
      errinfo = "服务器内部错误";
    }

    // 支持下载模式
    if (query.download) {
      result.download = true;
    }

    return this._response(status, result, errinfo);
  }

  /** 附加父模型关联数据 */
  _withParents(model, result) {
    const parents = XmMetaApi.getModelParents(this.metadata, model) || {};

    result.parents = {};
    for (const parentModel of Object.keys(parents)) {
      const parentTable = this.tables.get(parentModel);
      if (parentTable) {
        result.parents[parentModel] = parentTable.getAll();
      }
    }

    return result;
  }

  /** 兼容旧接口（推荐使用 handleRequest） */
  table(postData) {
    return this.handleRequest(postData);
  }
}
