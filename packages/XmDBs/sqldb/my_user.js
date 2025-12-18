import { DataTypes } from "sequelize";

class MyUser {
  constructor(sequelize) {
    this.model = sequelize.define('my_user', {
      uid: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '用户id'
      },
      wechat_user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '微信用户 id'
      },
      account: {
        type: DataTypes.STRING(32),
        allowNull: false,
        comment: '用户账号'
      },
      pwd: {
        type: DataTypes.STRING(128),
        allowNull: false,
        comment: '用户密码'
      },
      real_name: {
        type: DataTypes.STRING(25),
        allowNull: false,
        defaultValue: '',
        comment: '真实姓名'
      },
      sex: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '性别'
      },
      birthday: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '生日'
      },
      card_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: '',
        comment: '身份证号码'
      },
      mark: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: '',
        comment: '用户备注'
      },
      label_id: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: '用户标签 id'
      },
      group_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '用户分组id'
      },
      nickname: {
        type: DataTypes.STRING(16),
        allowNull: false,
        comment: '用户昵称'
      },
      avatar: {
        type: DataTypes.STRING(256),
        allowNull: false,
        comment: '用户头像'
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: true,
        comment: '手机号码'
      },
      addres: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: '地址'
      },
      cancel_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '注销时间'
      },
      create_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '添加时间'
      },
      last_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '最后一次登录时间'
      },
      last_ip: {
        type: DataTypes.STRING(16),
        allowNull: false,
        comment: '最后一次登录ip'
      },
      now_money: {
        type: DataTypes.DECIMAL(8, 2).UNSIGNED,
        allowNull: false,
        defaultValue: 0.00,
        comment: '用户余额'
      },
      brokerage_price: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: '佣金金额'
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '1为正常，0为禁止'
      },
      spread_uid: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '推广员id'
      },
      spread_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '推广员关联时间'
      },
      spread_limit: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '推广员到期时间'
      },
      brokerage_level: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        comment: '推广员等级'
      },
      user_type: {
        type: DataTypes.STRING(32),
        allowNull: false,
        comment: '用户类型'
      },
      promoter_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '成功推广时间'
      },
      is_promoter: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '是否为推广员'
      },
      main_uid: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        comment: '主账号'
      },
      pay_count: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '用户购买次数'
      },
      pay_price: {
        type: DataTypes.DECIMAL(10, 2).UNSIGNED,
        allowNull: false,
        defaultValue: 0.00,
        comment: '用户消费金额'
      },
      spread_count: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '下级人数'
      },
      spread_pay_count: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        comment: '下级订单数'
      },
      spread_pay_price: {
        type: DataTypes.DECIMAL(10, 2).UNSIGNED,
        allowNull: true,
        defaultValue: 0.00,
        comment: '下级订单金额'
      },
      integral: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        comment: '积分'
      },
      member_level: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        comment: '免费会员等级'
      },
      member_value: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        comment: '免费会员成长值'
      },
      count_start: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        comment: '用户获赞数'
      },
      count_fans: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
        comment: '用户粉丝数'
      },
      is_svip: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: -1,
        comment: '是否为付费会员 -1未开通过 0到期 1体验卡 2 有效期 3 永久'
      },
      svip_endtime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '会员结束时间'
      },
      svip_save_money: {
        type: DataTypes.DECIMAL(10, 2).UNSIGNED,
        allowNull: false,
        defaultValue: 0.00,
        comment: '会员节省金额'
      },
      is_group: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
        comment: '是否组长 0成员 1组长'
      },
      worker_label_id: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: '师傅标签 id'
      },
      worker_group_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: '师傅分组id'
      },
      is_worker: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
        comment: '是否为师傅 0普通  1师傅'
      }
    }, {
      tableName: 'my_user',
      timestamps: false
    });
  }
}

export default MyUser;
