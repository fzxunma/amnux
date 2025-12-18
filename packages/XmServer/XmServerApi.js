import { Hono } from "hono";
export class XmServerApi {
  constructor() {
    if (this.Instance) {
      return this.Instance;
    }
    this.Instance = this;
    this.app = new Hono();
  }

  init(namespace) {
    // 启动服务器并处理热更新
    app.get("/ping", (c) => c.json({ service: "user", ok: true }));
    app.get("/", (c) =>
      c.json({
        service: "User API",
        status: "running",
        endpoints: ["/ping", "/login", "/profile"],
        time: new Date(),
      }));
    Deno.serve({
      port: XmConfig.getConfig("listen"),
      hostname: "0.0.0.0", // 允许外网访问
      onListen({ port, hostname }) {
        console.log(`Server running on http://${hostname}:${port}`);
      },
    }, app.fetch);
    console.log(
      "XmServerApi 已启动！",
      namespace,
      XmConfig.getConfig("listen"),
    );
  }
}

