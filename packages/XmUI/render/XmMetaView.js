// App.js 或 App.vue <script>
import { h } from "vue";
import { XmViewAdapter } from "./XmViewAdapter.js";
import XmMetaRenderer from "./XmMetaRenderer.js";
import XmInterpreterShell from "./XmInterpreterShell.js";
import { XmFormMate } from "./XmFormMate.js";

export default {
  name: "XmMetaView",

  setup() {
    // 1️⃣ 创建视图适配器
    const view = XmViewAdapter(XmFormMate);

    // 2️⃣ 注入列表数据（Table / List 用）
    view.list = [
      { username: "tom", role: "admin", enable: true },
      { username: "jack", role: "user", enable: false },
    ];
    view.current = { type: "span", text: "Hello World" }; // 当前视图类型（form / table / list 等）
    return () =>
      h(XmInterpreterShell, {
        class: "bg-blue-500",
        render: () => {
          return XmMetaRenderer(view.current, view);
        },
      });
  },
};
