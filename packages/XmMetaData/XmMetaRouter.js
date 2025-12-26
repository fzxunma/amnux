import { XmMetaManager } from "./XmMetaManager.js";
import { XmMetaDataManager } from "./XmMetaDataManager.js";

export class XmMetaRouters {
  constructor(kvPath, kvDataPath) {
    this.metaManager = new XmMetaManager(kvPath);
    this.metaDataManager = new XmMetaDataManager(kvDataPath);
  }

  async init() {
    await this.metaManager.loadAll();
    await this.metaDataManager.loadAll();
  }
  async close() {
    await this.metaManager.close()
    await this.metaDataManager.close();
  }
  getMetaAll(project) {
    return this.metaManager.get(project);
  }
  getMetaDataAll(project) {
    return this.metaDataManager.get(project);
  }
  meta() {
    return async (ctx, next) => await this.metaManager.meta(ctx, next);
  }
  metaData() {
    return async (ctx, next) => await this.metaDataManager.meta(ctx, next);
  }
}
