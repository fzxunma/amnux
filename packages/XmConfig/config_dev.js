const config = {
  projectName: "xunma",
  secretKey: "xunma",
  listen: 10011,
  mongodb: {
    using: false,
    // 连接池配置
    poolSize: 10, // 连接池中的连接数
    uri: "mongodb://localhost:27017", // MongoDB 连接 URI
    dbName: "zncode", // 数据库名称
  },
  mysql: {
    using: false,
    dbName: "zncode",
    userName: "root",
    password: "Xunma123456",
    uri: "127.0.0.1",
    poolSize: 10, // 连接池中的连接数
  },
  sqlite: {
    using: false,
    dbName: "zncode",
  },
};

export default config;
