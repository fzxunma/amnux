import { XmMetadataManager } from "./XmMetadataManager.js";

export class XmMetaRouters {
  constructor(kvPath) {
    this.metaManager = new XmMetadataManager(kvPath);
  }

  async init() {
    await this.metaManager.loadAll();
  }
  async close() {
    await this.metaManager.close();
  }
  getMetaAllData(project) {
    return this.metaManager.get(project);
  }
  meta() {
    return async (ctx, next) => await this.metaManager.meta(ctx, next);
  }
}
