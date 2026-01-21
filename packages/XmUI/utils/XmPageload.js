import { computed, defineAsyncComponent, h, markRaw } from "vue";

// 通用异步加载工具（自动 markRaw 避免警告）
export const asyncComponent = (loader) => {
  return markRaw(defineAsyncComponent(loader));
};

// 动态页面加载器（支持错误回退）
export const loadDynamicPage = (_typePrefix, pagePath, pageName) => {
  return asyncComponent(() =>
    import(`/pages/web/${pagePath}/${pageName}.vue`).catch((err) => {
      console.error(`[Router] 加载失败 Xm${pageName}.vue:`, err);
      // 回退到默认页面
      return import("/pages/web/login/XmIndex.vue");
    })
  );
};
// 移动端/桌面端判断工具
export const getPagesType = () => {
  // 增加 try-catch 防止 SSR 环境报错（如果涉及）
  try {
    const url = new URL(window.location.href);
    const filename = url.pathname.split("/").pop() || "";
    return filename.startsWith("m") ? "XmMobile" : "Xm";
  } catch (e) {
    return "Xm";
  }
};

/**
 * 核心动态加载器
 * @param {string} pagePath 页面文件夹名称 (如 'user', 'role')
 */
export const loadAsyncPage = (pagePath) => {
  return defineAsyncComponent({
    // 核心修改：在 loader 内部处理 catch
    loader: () => 
      import(`/pages/web/${pagePath}/XmIndex.vue`)
        .catch((err) => {
          console.error(`[Router] 页面 ${pagePath} 加载失败，回退到 404:`, err);
          
          // 这里 return 404 页面的 import Promise
          // Vue 会认为组件加载成功，但是内容变成了 404 页面
          return import('/pages/web/page404/XmIndex.vue');
        }),

    // loadingComponent: LoadingComponent, // (可选) 加载中显示的组件
    // delay: 200, // (可选) 展示 loading 的延迟时间

    // onError 仅用于重试逻辑或最终报错，这里不再需要处理回退
    onError: (error, _retry, fail, _attempts) => {
      // 如果你已经在 loader 里 catch 了，这个 onError 通常不会触发
      // 除非 404 页面也加载失败了
      console.error('Fatal Error:', error);
      fail();
    },
  });
};

