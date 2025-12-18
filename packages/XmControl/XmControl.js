import { jwt } from "hono/jwt";
import { XmDbs } from "@XmDBs";
import { XmConfig } from "@XmConfig";
import { XmSmsAliyun } from "@XmService";

export class XmControl {
  constructor() {
    this.dbs = new XmDbs();
  }
  async init() {
    await this.dbs.init();
  }
  async loadAllMongoData(tableName) {
    return await this.dbs.loadAllMongoData(tableName);
  }
  async getDocumentsMaxId(tableName) {
    return await this.dbs.getDocumentsMaxId(tableName);
  }
  async postMongoData(tableName, document) {
    return await this.dbs.postMongoData(tableName, document);
  }
  async putMongoData(tableName, document, data) {
    return await this.dbs.putMongoData(tableName, document, data);
  }
  async deleteMongoData(tableName, ids, document) {
    return await this.dbs.deleteMongoData(tableName, ids, document);
  }
  async Free() {
    await this.dbs.Free();
  }
  async Api(ctx, next) {
    try {
      await this.dbs.Api(ctx, next);
    } catch (error) {
      console.log(error);
    }
  }
  PApi(ctx, _next) {
    const user = ctx.state.user;
    ctx.body = `PApi,${user.username}`;
  }
  Private(ctx, _next) {
    // 从上下文中获取用户信息
    const user = ctx.state.user;
    ctx.body = `Private endpoint. User: ${user.username}`;
  }
  async Login(ctx, _next) {
    // 假设用户身份验证通过，生成 JWT
    let status = 404;
    //let token = "";
    let timestamp = 0;
    let timeoutstamp = 0;
    let userName = "";
    let isLogin = false;
    let userUnit = "";
    let timeoutnum = 0;
    const postData = ctx.request.body;
    const phonenum = postData.phonenum;
    const accountInfo = await this.dbs.GetTabalData("account", {
      "手机号码": phonenum,
    });
    if (accountInfo.length > 0) {
      const account = accountInfo[0];
      if (account["是否启用"] === true) {
        const smsCode = XmSmsAliyun.GetPhoneSmsCode(phonenum);
        if (smsCode && smsCode.length == 6 && postData.smscode === smsCode) {
          //token = jwt.sign(account, XmConfig.getConfig("secretKey"));
          status = 200;
          isLogin = true;
          timeoutnum = Number(account["登录超时"]);
          userName = account["姓名"];
          userUnit = account["单位"];
          if (timeoutnum > 0) {
            // nothing
          } else {
            timeoutnum = 7;
          }
          const timeout = timeoutnum * 24 * 60 * 60 * 1000;
          timestamp = Date.now();
          timeoutstamp = timeout + timestamp;
        } else {
          status = 200;
          isLogin = false;
        }
      }
    }
    ctx.body = {
      status,
      //token,
      isLogin,
      timestamp,
      timeoutnum,
      timeoutstamp,
      userName,
      userUnit,
    };
  }
  async Sms(ctx, _next) {
    // 假设用户身份验证通过，生成 JWT
    let status = 404;
    const postData = ctx.request.body;
    const phonenum = postData.phonenum;
    const accountInfo = await this.dbs.GetTabalData("account", {
      "手机号码": phonenum,
    });
    if (accountInfo.length > 0) {
      const account = accountInfo[0];
      if (account["是否启用"] === true) {
        await XmSmsAliyun.SendSms(phonenum);
        status = 200;
      }
    }
    ctx.body = {
      status: status,
    };
  }
  async AuthMiddleware(ctx, next) {
    // 从请求头中获取 JWT
    const token = ctx.headers.authorization;

    if (token) {
      try {
        // 验证 JWT
        const decoded = jwt.verify(token, XmConfig.getConfig("secretKey"));

        // 将解码后的数据存储在上下文中，以便后续中间件和路由可以使用
        ctx.state.user = decoded;

        // 继续执行下一个中间件
        await next();
      } catch (_err) {
        // 验证失败，返回 401 Unauthorized
        ctx.status = 401;
        ctx.body = "Unauthorized";
      }
    } else {
      // 没有提供 JWT，返回 401 Unauthorized
      ctx.status = 401;
      ctx.body = "Unauthorized";
    }
  }
}

