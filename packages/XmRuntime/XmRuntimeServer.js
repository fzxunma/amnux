// 使用 Deno 的 npm 生态
import {
  compileScript,
  compileStyle,
  compileTemplate,
  parse,
} from "@vue/compiler-sfc";
import { stdpath } from "@XmVendor";
const { dirname, fromFileUrl, isAbsolute, join, normalize} = stdpath
let _instance = null;

export class XmRuntimeServer {
  constructor(kvfs) {
    if (_instance) return _instance;
    this.kvfs = kvfs;
    this.sfcCache = new Map();
    this.watcher = null;
    // 热更新客户端列表
    this.hmrControllers = new Set();
    _instance = this;

    this.vendorDir = join(dirname(fromFileUrl(import.meta.url)), "../XmVendor");

    // CDN 映射表
    this.vendorCdnMap = {
      // "/@modules/vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js",
      // "/@modules/naive-ui":
      //   "https://unpkg.com/naive-ui@2.43.2/dist/index.prod.mjs",
      // "/@modules/unocss":
      //   "https://unpkg.com/@unocss/runtime@66.5.10/uno.global.js",
      // "/@modules/@vueuse/core": "https://unpkg.com/@vueuse/core",
      // "/@modules/pinia":
      //   "https://unpkg.com/pinia@latest/dist/pinia.iife.prod.js",
      // "/@modules/vue-router":
      //   "https://unpkg.com/vue-router@latest/dist/vue-router.esm-browser.js"
    };
  }
  // 代理函数，用于 API 代理
  async proxy(c, targetUrl) {
    const url = c.req.url.pathname;
    const proxyUrl = new URL(url, targetUrl);
    const response = await fetch(proxyUrl, {
      method: c.req.method,
      headers: c.req.headers,
      body: c.req.body,
    });
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  }

  start() {
    const paths = [
      "/components",
      "/pages",
      "/store",
      "/views",
      "/utils",
      "/composables",
      "/theme",
      "/render",
    ];
    try {
      this.watcher = this.kvfs.fallbackToFsWatch(paths, this.sfcCache);
      console.log("KV watch started:", paths);
    } catch (err) {
      console.warn("KV watch failed:", err.message);
    }
  }
  hrm() {
    let clientController;
    const stream = new ReadableStream({
      start: (controller) => {
        clientController = controller;
        this.hmrControllers.add(clientController);
        clientController.enqueue(
          "data: " + JSON.stringify({ type: "connected" }) + "\n\n",
        );
      },
      cancel: () => {
        if (clientController) this.hmrControllers.delete(clientController);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }
  toDenoPath(path) {
    // 1️⃣ file:// URL
    if (path.startsWith("file://")) {
      return normalize(fromFileUrl(path));
    }

    // 2️⃣ Windows 风格：/C:/xxx
    if (/^\/[A-Za-z]:/.test(path)) {
      return normalize(path.slice(1));
    }

    // 3️⃣ Windows 原生：C:\xxx
    if (/^[A-Za-z]:[\\/]/.test(path)) {
      return normalize(path);
    }

    // 4️⃣ POSIX 绝对路径（mac / linux）
    if (isAbsolute(path)) {
      return normalize(path);
    }

    // 5️⃣ Vite / 虚拟路径（真正需要映射的）
    if (path.startsWith("/")) {
      const __filename = fromFileUrl(import.meta.url);
      const __dirname = dirname(__filename);

      // ⚠️ 这里才是你真正的项目映射逻辑
      return normalize(
        join(__dirname, "packages/XmUI", path),
      );
    }

    // 6️⃣ 兜底：相对路径
    return normalize(path);
  }
  // Helper functions
  hashStr(s) {
    let h = 5381;
    for (let i = s.length - 1; i >= 0; i--) {
      h = ((h << 5) + h) ^ s.charCodeAt(i);
    }
    return (h >>> 0).toString(36);
  }
  rewriteVueImports(code) {
    let updated = code;

    // 统一使用 \s* 兼容有无空格的情况
    updated = updated
      // vue
      .replace(/\bfrom\s*(['"])vue\1/g, `from "/@modules/vue"`)
      // naive-ui
      .replace(/\bfrom\s*(['"])naive-ui\1/g, `from "/@modules/naive-ui"`)
      // @vueuse/core
      .replace(
        /\bfrom\s*(['"])@vueuse\/core\1/g,
        `from "/@modules/@vueuse/core"`,
      )
      .replace(
        /\bfrom\s*(['"])vue-draggable-plus\1/g,
        `from "/@modules/vue-draggable-plus"`,
      )
      .replace(
        /\bfrom\s*(['"])xion\1/g,
        `from "/@modules/vue-draggable-plus"`,
      )
      // pinia
      .replace(/\bfrom\s*(['"])pinia\1/g, `from "/@modules/pinia"`)
      // vue-router
      .replace(/\bfrom\s*(['"])vue-router\1/g, `from "/@modules/vue-router"`);

    // 删除 @vue/devtools-api 导入
    updated = updated.replace(
      /^\s*import\s+.*?['"]@vue\/devtools-api['"];\s*(\n|$)/gm,
      "const setupDevtoolsPlugin = () =>{}",
    );
    updated = updated.replace(
      /\bfrom\s*(['"])@vicons\/ionicons5\1/g,
      `from "/@modules/@vicons/ionicons5"`,
    );
    // 副作用导入
    updated = updated.replace(
      /\bimport\s*(['"])unocss\1/g,
      `import "/@modules/unocss"`,
    );
    updated = updated.replace(
      /\bimport\s*(['"])virtual:uno\.css\1/g,
      `import "/uno.css"`,
    );

    return updated;
  }
  // 支持热更新监听
  startHmrPolling() {
    setInterval(async () => {
      try {
        for (const cacheKey of Array.from(sfcCache.keys())) {
          const parts = cacheKey.split("::");
          const p = parts.slice(0, -1).join("::") || parts[0];
          const oldHash = parts[parts.length - 1];

          try {
            const source = await Deno.readTextFile("." + p);
            const newHash = hashStr(source);

            if (newHash !== oldHash) {
              console.log(`[HMR] Change detected for ${p}. Reloading...`);

              for (const k of Array.from(sfcCache.keys())) {
                if (k.startsWith(p + "::")) sfcCache.delete(k);
              }

              const message = `data: ${JSON.stringify({ type: "reload", path: p })
                }\n\n`;
              for (const c of Array.from(this.hmrControllers)) {
                try {
                  c.enqueue(message);
                } catch (_e) {
                  this.hmrControllers.delete(c);
                }
              }
            }
          } catch (_e) {
            // Ignore missing files or read errors
          }
        }
      } catch (_e) {
        // Swallow poll errors
      }
    }, 700);
  }
  hmcClinet() {
    const js = `
  const es = new EventSource('/__hmr');
  es.onmessage = (e) => {
    try {
      const d = JSON.parse(e.data);
      if (d.type === 'reload') {
        console.log('[HMR] File change detected: ', d.path);
        location.reload();
      }
    } catch (e) {}
  };
  `;
    return new Response(js, {
      headers: { "Content-Type": "application/javascript" },
    });
  }
  getLocalPath(vfsPath) {
    return join(this.vendorDir, vfsPath.replace(/^\/XmVendor\//, ""));
  }
  loadVendor() {
    return async (c, next) => {
      const path = c.req.path;
      console.log(path);
      if (!path.startsWith("/@modules/")) {
        return next(); // 不处理非 vendor 路径
      }

      // 1. 先查内存缓存
      if (this.sfcCache.has(path)) {
        console.log(`[Vendor] 命中内存缓存 ${path}`);
        return c.text(this.sfcCache.get(path), 200, {
          "content-type": "application/javascript",
          "cache-control": "no-cache",
        });
      }

      const localPath = this.getLocalPath(path);
      const cdnUrl = this.vendorCdnMap[path];

      // 2. 优先尝试读取本地文件
      try {
        let source = await Deno.readTextFile(localPath);
        console.log(`[Vendor] 从本地文件加载 ${path}`);
        source = this.rewriteVueImports(source);
        this.sfcCache.set(path, source); // 缓存到内存
        return c.text(source, 200, {
          "content-type": "application/javascript",
          "cache-control": "no-cache",
        });
      } catch (_e) {
        // 本地文件不存在或读取失败，继续走 CDN
        console.log(`[Vendor] 本地文件不存在 ${localPath}，尝试从 CDN 下载`);
      }

      // 3. CDN 不存在配置，直接 404
      if (!cdnUrl) {
        return c.text(`Vendor not found: ${path}`, 404);
      }

      // 4. 从 CDN 下载
      try {
        const res = await fetch(cdnUrl);
        if (!res.ok || !res.body) {
          return c.text(`Failed to fetch from CDN: ${res.status}`, 502);
        }

        const source = await res.text();

        // 5. 保存到本地（确保目录存在）
        try {
          await Deno.mkdir(dirname(localPath), { recursive: true });
          await Deno.writeTextFile(localPath, source);
          console.log(`[Vendor] 已下载并保存到本地 ${localPath}`);
        } catch (saveErr) {
          console.warn(
            `[Vendor] 保存到本地失败（权限或磁盘问题）: ${localPath}`,
            saveErr,
          );
          // 不影响返回，继续走内存
        }

        // 6. 缓存到内存并返回
        this.sfcCache.set(path, source);
        return c.text(source, 200, {
          "content-type": "application/javascript",
          "cache-control": "no-cache",
        });
      } catch (err) {
        console.error(`[Vendor] CDN 下载失败 ${path}:`, err);
        return c.text("Failed to load vendor from CDN", 500);
      }
    };
  }
  serveIndexHtml() {
    return async (c) => {
      try {
        let html = await Deno.readTextFile("index.html");
        if (!html.includes("/hmr-client.js")) {
          html = html.replace(
            "</body>",
            `<script src="/hmr-client.js" type="module"></script></body>`,
          );
        }
        return c.text(html, 200, { headers: { "Content-Type": "text/html" } });
      } catch (err) {
        return c.text(`/* Vue Compile Error: ${err.message} */`, 500);
      }
    };
  }
  //.vue 文件请求
  async handleSfcRequest(path) {
    const source = await Deno.readTextFile(this.toDenoPath(path));

    const cacheKey = path + "::" + this.hashStr(source);
    if (this.sfcCache.has(cacheKey)) {
      return this.sfcCache.get(cacheKey);
    }

    const { descriptor } = parse(source, { filename: path });

    const script = compileScript(descriptor, {
      id: path,
      inlineTemplate: true,
    });

    const scriptCode = this.rewriteVueImports(
      script.content.replace(/export\s+default/, "const __sfc__ ="),
    );

    let code = `${scriptCode}`;

    if (!descriptor.scriptSetup && descriptor.template) {
      const template = compileTemplate({
        source: descriptor.template.content,
        filename: path,
        id: path,
        bindingMetadata: script.bindings,
        inline: true,
      });

      code += `
${rewriteVueImports(template.code)}
__sfc__.render = render;
    `;
    }

    code += `
export default __sfc__; // Export the final component definition
`;

    for (const style of descriptor.styles) {
      const css = compileStyle({
        source: style.content,
        filename: path,
        id: path,
        scoped: style.scoped,
      }).code;

      code += `
const s = document.createElement("style");
s.textContent = ${JSON.stringify(css)};
document.head.appendChild(s);
    `;
    }

    this.sfcCache.set(cacheKey, code);
    return code;
  }

  // 超级简洁终极版 middleware（强烈推荐！）
  middleware() {
    return async (c, next) => {
      console.log("middleware:", c.req.path);
      let path = c.req.path;
      if (!path.includes(".")) {
        path = path + ".js";
      }
      const absolutePath = new URL("../XmUI" + path, import.meta.url).pathname;
      console.log(path, absolutePath);
      // 1. .vue 文件 → 实时编译
      if (path.endsWith(".vue")) {
        try {
          const code = await this.handleSfcRequest(absolutePath);
          return c.text(code, 200, {
            "content-type": "application/javascript",
            "cache-control": "no-cache",
          });
        } catch (err) {
          console.error("[XmRuntime] 编译失败", absolutePath, err);
          return c.text(`/* Vue Compile Error: ${err.message} */`, 500);
        }
      } else {
        // 2. .js / .css / .json 等静态资源 → 直接从 KVFS 读（已缓存 + 热更新）
        try {
          const file = await this.kvfs.readFile(path);
          const ext = path.slice(path.lastIndexOf(".")).toLowerCase();

          // 只需要对 JS 相关文本文件进行导入重写
          if ([".js", ".ts", ".jsx", ".tsx", ".vue"].includes(ext)) {
            let code = "";
            if (typeof file === "string") {
              code = file;
            } else if (file instanceof Uint8Array) {
              code = new TextDecoder("utf-8").decode(file);
            } else if (file instanceof ArrayBuffer) {
              code = new TextDecoder("utf-8").decode(new Uint8Array(file));
            } else {
              console.log(file);
              throw new Error("Unsupported file type from kvfs.readFile");
            }
            code = this.rewriteVueImports(code);

            // 可以继续加其他包...
            // code = code.replace(/from\s+['"]pinia['"]/g, `from "/@modules/pinia"`);
            const isDev = true; // 这里可以根据环境变量设置
            const cacheControl = isDev
              ? "no-cache, no-store, must-revalidate"
              : "public, max-age=31536000, immutable";
            return c.text(code, 200, {
              "content-type": "application/javascript",
              "cache-control": cacheControl,
            });
          }
          const mime = {
            ".js": "application/javascript",
            ".css": "text/css",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".svg": "image/svg+xml",
          }[path.slice(path.lastIndexOf("."))] || "application/octet-stream";

          return c.body(file, 200, {
            "content-type": mime,
            "cache-control": "public, max-age=31536000, immutable",
          });
        } catch {
          // 没找到就交给下一个中间件（比如 serveStatic 处理 html）
          console.log("[XmRuntime] 文件未找到于 KVFS:", path);
          return next();
        }
      }
    };
  }
}
