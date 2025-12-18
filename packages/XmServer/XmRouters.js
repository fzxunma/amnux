import { Hono } from "hono";
import { XmMap } from "@XmService";

export class XmRouters {
  constructor() {
    this.router = new Hono();
  }

  init(control) {
    this.xmControl = control;
    this.router.get("/:table", async (ctx, next) => {
      await this.xmControl.Api(ctx, next);
    });
    this.router.get(
      "/papi",
      this.xmControl.AuthMiddleware,
      async (ctx, next) => {
        await this.xmControl.PApi(ctx, next);
      },
    );
    this.router.get("/map/qqlocation", async (ctx) => {
      const address = ctx.query.address;
      ctx.body = await XmMap.getQQAddress(address);
    });
    this.router.get("/private", this.xmControl.AuthMiddleware, async (ctx) => {
      await this.xmControl.Private(ctx, next);
    });
    this.router.post("/sms", async (ctx, next) => {
      await this.xmControl.Sms(ctx, next);
    });
    this.router.get("/exceldownload", async (ctx, next) => {
      await ExcelDownload.download(ctx, next);
    });

    this.router.post("/oldlogin", async (ctx, next) => {
      await this.xmControl.Login(ctx, next);
    });
  }
  async Free() {
    await this.xmControl.Free();
  }
  routes() {
    return this.router;
  }
}
