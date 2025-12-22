// XmMetaRenderer.js
import { h } from "vue";
import XmTreeRenderer from "./XmTreeRenderer.js";
import XmFormRenderer from "./XmFormRenderer.js";
import XmBreadcrumbRenderer from "./XmBreadcrumbRenderer.js";
import XmTableRenderer from "./XmTableRenderer.js";
import XmListRenderer from "./XmListRenderer.js";

export default function XmMetaRenderer(meta, ctx) {
  switch (meta.type) {
    case "span":
      return h("span", {}, meta.text || "");
    case "tree":
      return h(XmTreeRenderer, { meta, ctx });

    case "form":
      return h(XmFormRenderer, { meta, ctx });

    case "table":
      return h(XmTableRenderer, {
        meta: meta.formMeta,
        data: ctx.list,
        ctx,
      });

    case "list":
      return h(XmListRenderer, {
        meta: meta.formMeta,
        data: ctx.list,
        ctx,
      });

    case "breadcrumb":
      return h(XmBreadcrumbRenderer, { ctx });

    default:
      return null;
  }
}
