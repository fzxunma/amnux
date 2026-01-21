import { createApp } from "vue";
import { createPinia } from "pinia";
import naive from "naive-ui";
import "unocss";
import XmRouter from "./XmRouter.js";
import XmApp from "./XmApp.vue";
import {  ww } from "wecom"; 
// const myTicket = "sM4AOVdWfPE4DxkXGEs8VMCPGGVi4C3VM0P37wVUCFvr..."; // 获取当前页面 URL (去除 # 号后面的部分)
// const currentUrl = window.location.href.split("#")[0];
// initWeComSDK(myTicket, currentUrl).then((_wwInstance) => {
//   console.log("SDK 初始化配置已提交");
// });
class XmAppWeb {
  static loadApp() {
    const pinia = createPinia();
    const App = createApp(XmApp);
    // 关键一行：排除 ion-icon（以及所有以 ion- 开头的自定义元素）
    App.config.compilerOptions.isCustomElement = (tag) =>
      tag.startsWith("ion-");
    console.log(ww.SDK_VERSION);
 
    App.use(pinia);
    for (const compName in naive) {
      const component = naive[compName];
      if (component && component.name) {
        App.component(component.name, component);
      }
    }
    //App.use(umodoc.useUmoEditor, {});
    App.use(naive);
    App.use(XmRouter);
    App.mount("#app");
  }
}
try {
  XmAppWeb.loadApp();
  console.log("XmUI Web App started.");
} catch (error) {
  console.error("Failed to load app:", error);
}
