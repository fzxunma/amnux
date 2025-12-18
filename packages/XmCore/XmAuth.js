export class XmAuth {
  static token = "";
  static userId = 0;

  static login(token, userId) {
    this.token = token;
    this.userId = userId;
  }

  static getHeaders() {
    return { Authorization: `Bearer ${this.token}` };
  }

  static isLogin() {
    return !!this.token;
  }
  async authMiddleware(c, next) {
    const token = c.request.headers.get("authorization")?.split(" ")[1];

    if (!token) return c.json({ code: 401, msg: "未登录" }, 401);

    try {
      // 调用统一认证服务验证 token，或直接 jwt.verify
      const payload = await verifyToken(token); // { userId, role, exp... }

      // 透传用户信息给下游微服务（推荐）
      c.request.headers.set("x-user-id", payload.userId);
      c.request.headers.set("x-user-role", payload.role);
      c.set("user", payload); // 上下文携带

      await next();
    } catch {
      return c.json({ code: 401, msg: "无效 token" }, 401);
    }
  }
  async adminMiddleware(c, next) {
    const token = c.request.headers.get("authorization")?.split(" ")[1];

    if (!token) return c.json({ code: 401, msg: "未登录" }, 401);

    try {
      // 调用统一认证服务验证 token，或直接 jwt.verify
      const payload = await verifyToken(token); // { userId, role, exp... }

      // 透传用户信息给下游微服务（推荐）
      c.request.headers.set("x-user-id", payload.userId);
      c.request.headers.set("x-user-role", payload.role);
      c.set("user", payload); // 上下文携带

      await next();
    } catch {
      return c.json({ code: 401, msg: "无效 token" }, 401);
    }
  }
}
