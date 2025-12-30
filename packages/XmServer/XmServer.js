import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimit } from "hono/body-limit";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";

import { XmRouters } from "./XmRouters.js";
import { XmConfig } from "@XmConfig";
import { XmMetaRouters } from "@XmMetaData";
import { XmTableRouters } from "@XmTableData";
import { XmControl } from "@XmControl";
import { getKVFS } from "@XmProKVFS";
import { XmRuntimeServer } from "@XmRuntime"; // 你的新类

export class XmServer {
  constructor() {
    if (this.Instance) {
      return this.Instance;
    }
    this.Instance = this;

    this.app = new Hono();

    this.xmRouters = new XmRouters();
    this.xmMetaRouter = new XmMetaRouters("../../data/xmm", "../../data/xmd");
    this.xmTableRouter = new XmTableRouters();
    this.xmControl = new XmControl();
  }
  async initRuntimeServer() {
    //1. 加载 .vue 源码目录
    this.kvfs = await getKVFS("../../data/xmc");
    await this.kvfs.syncFromDisk([
      { vfsPath: "/pages", diskPath: "./packages/XmUI/pages", autoSave: false },
      { vfsPath: "/icon", diskPath: "./packages/XmUI/icon", autoSave: false },
      { vfsPath: "/views", diskPath: "./packages/XmUI/views", autoSave: false },
      {
        vfsPath: "/components",
        diskPath: "./packages/XmUI/components",
        autoSave: false,
      },
      { vfsPath: "/store", diskPath: "./packages/XmUI/store", autoSave: false },
      {
        vfsPath: "/config",
        diskPath: "./packages/XmUI/config",
        autoSave: false,
      },
      { vfsPath: "/utils", diskPath: "./packages/XmUI/utils", autoSave: false },
      {
        vfsPath: "/locales",
        diskPath: "./packages/XmUI/locales",
        autoSave: false,
      },
      { vfsPath: "/color", diskPath: "./packages/XmUI/color", autoSave: false },
      {
        vfsPath: "/composables",
        diskPath: "./packages/XmUI/composables",
        autoSave: false,
      },
      {
        vfsPath: "/theme",
        diskPath: "./packages/XmUI/theme",
        autoSave: false,
      },
      {
        vfsPath: "/render",
        diskPath: "./packages/XmUI/render",
        autoSave: false,
      },
    ]);

    // 2. 创建 Vue 运行时服务器（全局唯一）
    this.vueServer = new XmRuntimeServer(this.kvfs);
    await this.vueServer.start(); // 启动热更新监听
    await this.xmControl.init();
    await this.xmMetaRouter.init();
    const metadata = this.xmMetaRouter.getMetaAll();
    await this.xmRouters.init(this.xmControl);
    await this.xmTableRouter.init(this.xmControl, metadata);
  }
  initHono() {
    this.app.use(compress());
    this.app.use(cors());
    this.app.use("*", requestId());
    this.app.use(secureHeaders());
    this.app.use(csrf());
    this.app.use(
      bodyLimit({
        maxSize: 10 * 1024 * 1024, // 10MB
        onError: (c) => {
          return c.text("overflow :(", 413);
        },
      }),
    );
    this.app.onError((error, _c) => {
      if (error instanceof HTTPException) {
        console.error(error.cause);
        // Get the custom response
        return error.getResponse();
      }
    });
  }
  initServeStatic() {
    this.app.use("/components/*", this.vueServer.middleware());
    this.app.use("/pages/*", this.vueServer.middleware());
    this.app.use("/icon/*", this.vueServer.middleware());
    this.app.use("/views/*", this.vueServer.middleware());
    this.app.use("/store/*", this.vueServer.middleware());
    this.app.use("/config/*", this.vueServer.middleware());
    this.app.use("/utils/*", this.vueServer.middleware());
    this.app.use("/locales/*", this.vueServer.middleware());
    this.app.use("/color/*", this.vueServer.middleware());
    this.app.use("/composables/*", this.vueServer.middleware());
    this.app.use("/theme/*", this.vueServer.middleware());
    this.app.use("/render/*", this.vueServer.middleware());

    // Serve the Vue runtime from CDN
    this.app.get("/@modules/*", this.vueServer.loadVendor());
    // 3. 热更新客户端 SSE
    this.app.get("/__hmr", this.vueServer.hrm());
    this.app.get("/hmr-client.js", this.vueServer.hmcClinet());

    // 6. 其他静态资源（不变）
    ["vendor", "assets", "js"].forEach((name) => {
      this.app.use(`/${name}/*`, serveStatic({ root: "packages/XmAssets/" }));
      this.app.use(`/${name}`, serveStatic({ root: "packages/XmAssets/" }));
    });

    ["mobile", "web", "admin"].forEach((name) => {
      this.app.use(
        `/${name}/*`,
        serveStatic({ root: "apps/XmWebUI/", index: "index.html" }),
      );
      this.app.use(
        `/${name}`,
        serveStatic({ root: "apps/XmWebUI/", index: "index.html" }),
      );
    });
    // 5. 主请求路由
    // app.get("/", async (c) => {
    //   return serveIndexHtml(c);
    // });
    // app.get("/index.html", async (c) => {
    //   return serveIndexHtml(c);
    // });
    // 健康检查 API
    this.app.get(
      "/health",
      (c) =>
        c.json({
          ok: true,
          XmRuntime: "ready",
          cached: this.vueServer.cache.size,
        }),
    );
  }
  initRouter() {
    //this.app.use('/api', this.xmRouters.routes());
    this.app.post("/api/meta", this.xmMetaRouter.meta());
    this.app.post("/api/metaData", this.xmMetaRouter.metaData());
    //this.app.use('/api/table', this.xmTableRouter.routes());
  }
  initProxy() {
    // API 代理
    this.app.all(
      "/api/user/*",
      (c) => this.vueServer.proxy(c, "http://localhost:8001"),
    );
    this.app.all(
      "/api/web/*",
      (c) => this.vueServer.proxy(c, "http://localhost:8002"),
    );
    this.app.all(
      "/api/admin/*",
      (c) => this.vueServer.proxy(c, "http://localhost:8003"),
    );
  }
  async init() {
    await this.initRuntimeServer();
    this.initHono();
    this.initServeStatic();
    this.initRouter();
    this.initProxy();
    // 启动服务器并处理热更新
    Deno.serve({  hostname: "0.0.0.0",port: XmConfig.getConfig("listen") }, this.app.fetch);

    console.log("XmRuntimeServer 已启动！", XmConfig.getConfig("listen"));
  }
  async free() {
    await this.xmRouters.free();
  }
}
