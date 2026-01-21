import { createRouter, createWebHashHistory, useRoute } from "vue-router";
import { computed, h } from "vue";
import { loadDynamicPage } from "/utils/XmPageload";

// 路由配置（简洁强大）
const routes = [
  // 方式1：/pages/:id → XmXxx.vue (桌面端优先)
  {
    path: "/pages/:pathMatch(.*)*", // 改为通配所有层级，支持 /pages/login/login 等
    component: {
      setup() {
        const route = useRoute();

        const PageComponent = computed(() => {
          // 获取完整路径参数数组，例如 ["login", "login"] 或 ["home"]
          const pathSegments = route.params.pathMatch || [];

          // 转换为 PascalCase 页面名，例如 "Login" 或 "Home"
          let pageId = "Index"; // 默认首页
          let pagePath = "home"; // 默认首页
          if (pathSegments.length > 0) {
            // 取最后一段作为页面 ID，并首字母大写
            pagePath = pathSegments[0];
            if (pathSegments.length > 1) {
              const lastSegment = pathSegments[pathSegments.length - 1];
              if (lastSegment.length > 0) {
                pageId = lastSegment.charAt(0).toUpperCase() +
                  lastSegment.slice(1);
              }
            }
          }

          const pageName = `Xm${pageId}`; // 如 XmLogin、XmHome、XmIndex
          console.log(
            "[Router] 动态加载页面:",
            pageName,
            pagePath,
            pathSegments,
            "(路径:",
            route.fullPath,
            ")",
          );

          // 动态加载组件，支持热更新和错误回退
          return loadDynamicPage("Xm", pagePath, pageName);
        });

        // 返回虚拟节点
        return () => h(PageComponent.value);
      },
    },
  },
  // 根路径重定向
  {
    path: "/",
    redirect: "/pages/login",
  },

  // 可选：404 回退
  {
    path: "/:pathMatch(.*)*",
    redirect: "/pages/login",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
