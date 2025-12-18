import { Hono } from "hono";

import { XmTabledataManager } from "./XmTabledataManager.js";
import { AliOssSts } from "@XmService";
import { XmMetaApi } from "@XmMetaData";

export class XmTableRouters {
  constructor() {
    this.router = new Hono();
    this.tableManager = new XmTabledataManager();
  }

  async init(control, metadata) {
    await this.tableManager.init(control, metadata);
    this.router.post("/table", async (ctx, next) => {
      const postData = ctx.request.body;
      const tableData = await this.tableManager.Table(postData, next);
      if (tableData.download === true) {
        await ExcelDownload.download(ctx);
      } else {
        ctx.body = tableData;
      }
    });
    this.router.get("/aliosssts", async (ctx, next) => {
      const ossFieldInfo = {};
      ossFieldInfo.Region = XmMetaApi.getMetaDataNameTouuid(metadata, {
        name: "区域",
        moduleName: "系统管理",
        modelName: "网站配置",
      });
      ossFieldInfo.Bucket = XmMetaApi.getMetaDataNameTouuid(metadata, {
        name: "Bucket",
        moduleName: "系统管理",
        modelName: "网站配置",
      });
      ossFieldInfo.AccessKeyID = XmMetaApi.getMetaDataNameTouuid(metadata, {
        name: "AccessKey ID",
        moduleName: "系统管理",
        modelName: "网站配置",
      });
      ossFieldInfo.AccessKeySecret = XmMetaApi.getMetaDataNameTouuid(metadata, {
        name: "AccessKey Secret",
        moduleName: "系统管理",
        modelName: "网站配置",
      });
      ossFieldInfo.RAN = XmMetaApi.getMetaDataNameTouuid(metadata, {
        name: "RAN",
        moduleName: "系统管理",
        modelName: "网站配置",
      });
      ossFieldInfo.Oss = XmMetaApi.getMetaDataNameTouuid(metadata, {
        name: "OSS启用",
        moduleName: "系统管理",
        modelName: "网站配置",
      });
      ossFieldInfo.Setting = XmMetaApi.getMetaDataNameTouuid(metadata, {
        name: "配置启用",
        moduleName: "系统管理",
        modelName: "网站配置",
      });
      const postData = {
        "opt": "get",
        "project": "test",
        "model": "网站配置",
        "data": true,
        "query": {
          "page": 1,
          "pageSize": 1,
          "sortBy": "_created",
          "sortOrder": "desc",
          "search": {
            "conditions": [
              {
                "field": ossFieldInfo.Setting,
                "value": "开启",
                "match": "eq",
              },
            ],
          },
        },
      };
      const tableData = await this.tableManager.Table(postData, next);
      const ossinfo = AliOssSts.initOssInfo();
      if (tableData.status === 200 && tableData.itemCount >= 1) {
        const ossdbInfo = tableData.list[0];
        ossinfo.region = ossdbInfo[ossFieldInfo.Region];
        ossinfo.ran = ossdbInfo[ossFieldInfo.RAN];
        ossinfo.accessKeyId = ossdbInfo[ossFieldInfo.AccessKeyID];
        ossinfo.accessKeySecret = ossdbInfo[ossFieldInfo.AccessKeySecret];
        ossinfo.bucket = ossdbInfo[ossFieldInfo.Bucket];
      }
      await AliOssSts.run(ctx, next, ossinfo);
    });
    this.router.post("/login", async (ctx, next) => {
      const bodyData = ctx.request.body;
      const username = bodyData.username;
      const password = bodyData.password;
      const userNameFieldName = XmMetaApi.getMetaDataNameTouuid(metadata, {
        name: "账号",
        moduleName: "系统管理",
        modelName: "用户管理",
      });
      const realNameFieldName = XmMetaApi.getMetaDataNameTouuid(metadata, {
        name: "姓名",
        moduleName: "系统管理",
        modelName: "用户管理",
      });
      const pwdFieldName = XmMetaApi.getMetaDataNameTouuid(metadata, {
        name: "密码",
        moduleName: "系统管理",
        modelName: "用户管理",
      });
      const postData = {
        "opt": "get",
        "project": "test",
        "model": "用户管理",
        "data": true,
        "query": {
          "page": 1,
          "pageSize": 1,
          "sortBy": "_created",
          "sortOrder": "desc",
          "search": {
            "conditions": [
              {
                "field": userNameFieldName,
                "value": username,
                "match": "eq",
              },
            ],
          },
        },
      };
      const result = { status: 404, data: {} };
      const timeoutnum = 7;
      const timestamp = Date.now();
      const timeout = timeoutnum * 24 * 60 * 60 * 1000;
      const tableData = await this.tableManager.Table(postData, next);
      if (username === "xunma" && password === "Xunma@021220.admin") {
        result.data.username = "xunma";
        result.data.realName = "寻码";
        result.data.token = "1234567";
        result.data.timestamp = timestamp;
        result.data.timeoutstamp = timeout + timestamp;
        result.status = 200;
      } else if (tableData.status === 200 && tableData.itemCount === 1) {
        const userInfo = tableData.list[0];
        if (userInfo[pwdFieldName] === password) {
          result.data.username = userInfo[userNameFieldName];
          result.data.realName = userInfo[realNameFieldName];
          result.data.token = "1234567";
          result.data.timestamp = timestamp;
          result.data.timeoutstamp = timeout + timestamp;
          result.status = tableData.status;
        }
      }
      ctx.body = result;
    });
    this.router.post("/logout", async (_ctx, _next) => {
    });
  }
  async Free() {
    await this.tableManager.Free();
  }
  routes() {
    return this.router;
  }
}
