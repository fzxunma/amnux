import { Sequelize } from "sequelize";
import { XmConfig } from "@XmConfig";

class XmMySqlDBClient {
  constructor() {
    this.uri = XmConfig.getSubConfig("mysql", "uri");
    this.dbName = XmConfig.getSubConfig("mysql", "dbName");
    this.userName = XmConfig.getSubConfig("mysql", "userName");
    this.password = XmConfig.getSubConfig("mysql", "password");
    this.poolSize = XmConfig.getSubConfig("mysql", "poolSize");
    this.client = new Sequelize(this.dbName, this.userName, this.password, {
      host: this.uri,
      dialect: "mysql",
      define: {
        freezeTableName: true,
      },
      pool: {
        max: this.poolSize, // 最大连接数
        min: 0, // 最小连接数
        acquire: 30000, // 获取连接的超时时间（毫秒）
        idle: 10000, // 连接空闲的超时时间（毫秒）
      },
    });
  }
  getClient() {
    return this.client;
  }
}

export default XmMySqlDBClient;
