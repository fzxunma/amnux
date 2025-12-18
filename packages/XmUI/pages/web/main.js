import { createApp } from "vue";
import { createPinia } from "pinia";
import naive from "naive-ui";
import "unocss";
import XmRouter from "./XmRouter.js";
import XmApp from "./XmApp.vue";

class XmAppWeb {
  static loadApp() {
    const pinia = createPinia();
    const App = createApp(XmApp);
    // 关键一行：排除 ion-icon（以及所有以 ion- 开头的自定义元素）
    App.config.compilerOptions.isCustomElement = (tag) =>
      tag.startsWith("ion-");

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
