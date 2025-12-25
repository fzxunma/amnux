// XmMetaView.js
import { h, reactive, watch } from "vue";
import XmMetaRenderer from "./XmMetaRenderer.js";
import XmInterpreterShell from "./XmInterpreterShell.js";
import { useLoadMetaData } from "/composables/useXmMeta.js";

export default {
  name: "XmMetaView",

  props: {
    /** Meta 声明（外部驱动） */
    metaMap: {
      type: Object,
      required: true,
    },

    /** 当前渲染 schema */
    current: {
      type: Object,
      default: null,
    },

    /** 上下文（选中态 / 权限 / 路由等） */
    context: {
      type: Object,
      default: () => ({}),
    },

    /** 高级模式：直接注入 metas（可选） */
    metas: {
      type: Object,
      default: null,
    },
  },

  setup(props) {
    const view = reactive({
      metas: {},
      current: null,
      context: {},
    });

    /** metas 来源决策 */
    watch(
      () => [props.metaMap, props.metas],
      () => {
        if (props.metas) {
          view.metas = props.metas;
        } else {
          view.metas = useLoadMetaData(props.metaMap);
        }
      },
      { immediate: true, deep: true }
    );

    /** current 同步 */
    watch(
      () => props.current,
      (val) => {
        view.current = val;
      },
      { immediate: true }
    );

    /** context 同步 */
    watch(
      () => props.context,
      (val) => {
        view.context = { ...val };
      },
      { immediate: true, deep: true }
    );

    return () =>
      h(XmInterpreterShell, {
        class: "bg-blue-500",
        render: () => {
          if (!view.current) return null;
          return XmMetaRenderer(view.current, view);
        },
      });
  },
};
