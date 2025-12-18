import { XmConfig } from "@XmConfig";
import XmMongoDBClient from "./mongodb/index.js";
import XmSqlDBClient from "./sqldb/index.js";
//数据库
export class XmDbs {
  constructor() {
    this.DbCaches = {}; //数据库缓存表 对表进行缓存所有数据    表，id  数字
    this.DbIDCaches = {}; //id缓存表                         表，_id  uuid
    this.DbKeyCaches = {}; //关键字ID缓存表                  表， name  这样key,   user_id:name_id
    this.DbGroupCaches = {}; //分组缓存表                    表， 分组，分类，分日期，分区间的缓存
    this.mongoDBClient = null;
    this.mysqlClient = null;
    this.sqliteClient = null;
  }
  async init() {
    if (XmConfig.getSubConfig("mongodb", "using") === true) {
      this.mongoDBClient = new XmMongoDBClient();
      this.mongoDBClient.Connect();
    }
    if (XmConfig.getSubConfig("mysql", "using") === true) {
      this.mysqlClient = new XmSqlDBClient("mysql");
      await this.mysqlClient.Connect();
    }
    if (XmConfig.getSubConfig("sqlite", "using") === true) {
      this.sqliteClient = new XmSqlDBClient("sqlite");
      await this.sqliteClient.Connect();
    }
  }
  async Free() {
    if (this.mongoDBClient) {
      await this.mongoDBClient.Disconnect();
    }
    if (this.mysqlClient) {
      await this.mysqlClient.Disconnect();
    }
    if (this.sqliteClient) {
      await this.sqliteClient.Disconnect();
    }
  }
  async Api(ctx, _next) {
    if (this.mysqlClient) {
      console.log(ctx.params.table);
      ctx.body = await this.mysqlClient.testUserModels();
    }
    if (this.mongoDBClient) {
      console.log(ctx.params.table);
      ctx.body = await this.mysqlClient.testUserModels();
    }
  }
  async GetTabalData(table, field) {
    if (this.mysqlClient) {
      console.log(ctx.params.table);
      await this.mysqlClient.testUserModels();
    }
    if (this.mongoDBClient) {
      return await this.mongoDBClient.FindDocumentsByField(table, field);
    }
  }
  async loadAllMongoData(tableName) {
    if (this.mongoDBClient) {
      return await this.mongoDBClient.FindDocumentsByField(tableName, {
        "_deleted": { "$ne": true },
      });
    }
  }
  async getDocumentsMaxId(tableName) {
    if (this.mongoDBClient) {
      return await this.mongoDBClient.GetDocumentsMaxId(tableName);
    }
  }
  async postMongoData(tableName, document) {
    if (this.mongoDBClient) {
      if (Array.isArray(document)) {
        return await this.mongoDBClient.InsertManyDocuments(
          tableName,
          document,
        );
      } else {
        return await this.mongoDBClient.InsertDocument(tableName, document);
      }
    }
  }

  async deleteMongoData(tableName, ids, document, _deleted) {
    if (this.mongoDBClient) {
      // let isDeleted = true;
      // if (!_.isNil(deleted)) {
      //   isDeleted = deleted;
      // }
      if (Array.isArray(ids)) {
        return await this.mongoDBClient.DelManyDocuments(
          tableName,
          ids,
          document,
        );
      }
    }
  }

  async putManyMongoData(tableName, document) {
    if (this.mongoDBClient) {
      if (Array.isArray(document)) {
        return await this.mongoDBClient.UpdateManyDocuments(
          tableName,
          document,
        );
      }
    }
  }
  async putAllMongoData(tableName, data) {
    if (this.mongoDBClient) {
      return await this.mongoDBClient.UpdateAllDocuments(tableName, data);
    }
  }
  async putMongoData(tableName, document, data) {
    if (this.mongoDBClient) {
      if (Array.isArray(document)) {
        return await this.mongoDBClient.UpdateDocuments(
          tableName,
          document,
          data,
        );
      } else {
        return await this.mongoDBClient.UpdateDocument(
          tableName,
          document,
          data,
        );
      }
    }
  }
}
