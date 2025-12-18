import { Sequelize } from 'sequelize';

// 创建 Sequelize 实例
const sequelize = new Sequelize('your_database', 'your_username', 'your_password', {
  host: 'localhost',
  dialect: 'mysql'
});

// 定义模型
const User = sequelize.define('User', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  age: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

// 同步模型与数据库
sequelize.sync();

// 导出模型
export { User };