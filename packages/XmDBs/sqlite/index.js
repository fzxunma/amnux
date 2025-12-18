import { Sequelize } from "sequelize";
import { XmConfig } from "@XmConfig";

class XmSqliteDBClient {
  constructor() {
    this.dbName = XmConfig.getSubConfig("mysql", "dbName");
    this.client = new Sequelize({
      dialect: "sqlite", // 数据库类型，这里使用 SQLite
      storage: this.dbName, // 数据库文件的路径
    });
  }
  getClient() {
    return this.client;
  }
}

export default XmSqliteDBClient;
