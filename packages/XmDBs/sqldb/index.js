import { Sequelize } from "sequelize";
import XmMySqlDBClient from "../mysql/index.js";
import XmSqliteDBClient from "../sqlite/index.js";
import MyUser from "./my_user.js";

class XmSqlDBClient {
  constructor(type) {
    switch (type) {
      case "mysql":
        this.createMysqlDbClient();
        break;
      case "sqlite":
        this.createSqliteDbClient();
        break;
    }
    this.dbType = type;
    this.models = {}
    this.db = {
      model: {},
      collection: this.collection.bind(this),
    };
  }
  createMysqlDbClient() {
    const client = new XmMySqlDBClient();
    this.client = client.getClient();
  }
  createSqliteDbClient() {
    const client = new XmSqliteDBClient();
    this.client = client.getClient();
  }
  async testUserModels() {
    try {
      const result = await this.models.my_user.model.findAll();
      return result.map((item) => item.toJSON());
    } catch (error) {
      console.error('无法连接到数据库:', error);
    }
  }
  createCollection(collectionName, data) {
    const seqData = data.map((item) => {
      switch (item.xmtype) {
        case "xmString":
          item.type = Sequelize.STRING;
          break;
        case "xmInteger":
          item.type = Sequelize.INTEGER;
          break;
        default:
          break;
      }
    });
    this.db.model[collectionName] = this.client.define(
      collectionName,
      seqData,
      {
        paranoid: true,
      }
    );
  }
  collection(collectionName) {
    return this.db.model[collectionName];
  }

  async queryTableStructure() {
    try {
      const tables = await this.client.query("SHOW TABLES", {
        type: Sequelize.QueryTypes.SELECT
      });

      const tableNames = tables.map(table => table[`Tables_in_${this.client.config.database}`]);
      const queries = tableNames.map(tableName => this.client.query(`SHOW COLUMNS FROM ${tableName}`, {
        type: Sequelize.QueryTypes.SELECT
      }));

      const results = await Promise.all(queries);
      console.log(results);
    } catch (error) {
      console.error('查询表结构失败:', error);
    }
  }

  async Connect() {
    try {
      await this.client.authenticate();
      this.models.my_user = new MyUser(this.client)
      //await this.queryTableStructure()
      //this.client.sync();
      console.log("Connected to the " + this.dbType + " database");
    } catch (err) {
      console.error("Failed to connect to the database:", err);
    }
  }

  async Disconnect() {
    try {
    } catch (err) {
      console.error("Failed to disconnect from the database:", err);
    }
  }

  async InsertDocument(collectionName, document) {
    try {
      const collection = this.db.collection(collectionName);
      const result = await collection.create(document);
      return result.id;
    } catch (err) {
      console.error("Failed to insert document:", err);
    }
  }

  async UpdateDocument(collectionName, documentId, update) {
    try {
      const collection = this.db.collection(collectionName);
      const filter = { id: documentId };
      await collection.update(update, { where: filter });
      return result.modifiedCount;
    } catch (err) {
      console.error("Failed to update document:", err);
    }
  }

  async DeleteDocument(collectionName, documentId) {
    try {
      const collection = this.db.collection(collectionName);
      const filter = { id: documentId };
      const result = await collection.destroy({ where: filter });
      return result.deletedCount;
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  }

  async FindDocuments(collectionName) {
    try {
      const collection = this.db.collection(collectionName);
      const result = await collection.findAll();
      return result.map((item) => item.toJSON());
    } catch (err) {
      console.error("Failed to find documents:", err);
    }
  }
}

export default XmSqlDBClient;
