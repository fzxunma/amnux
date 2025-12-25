// /utils/XmRuleFormBuilder.js
import { h } from "vue";
import {
  NInput,
  NSelect,
  NTree,
  NText
} from "naive-ui";

export function buildFormItems(rule, model, ctx = {}) {
  if (!rule?.fields) return [];

  return Object.entries(rule.fields).map(([key, field]) => ({
    key,
    label: field.label || key,
    render: () => renderField(key, field, model, ctx)
  }));
}

/* ===================== dispatch ===================== */

function renderField(key, field, model, ctx) {
  switch (field.type) {
    case "string":
      return renderString(key, model);

    case "enum":
      return renderEnum(key, field, model);

    case "relation":
      return renderRelation(key, field, model, ctx);

    default:
      return h(NText, { type: "warning" }, `Unsupported: ${field.type}`);
  }
}

/* ===================== string ===================== */

function renderString(key, model) {
  return h(NInput, {
    value: model[key] ?? "",
    onUpdateValue: v => (model[key] = v)
  });
}

/* ===================== enum ===================== */

function renderEnum(key, field, model) {
  const options = (field.options || []).map(v => ({
    label: v,
    value: v
  }));

  return h(NSelect, {
    value: model[key],
    options,
    onUpdateValue: v => (model[key] = v)
  });
}

/* ===================== relation（核心） ===================== */

function renderRelation(key, field, model, ctx) {
  const treeData = ctx.relationTrees?.[field.ref] || [];
  const checkedKeys = model[key] || [];

  return h(NTree, {
    data: treeData,
    blockLine: true,
    checkable: true,
    draggable: field.ordered === true,
    selectable: false,
    defaultExpandAll: true,
    checkedKeys,

    // 勾选 → 写入 steps
    onUpdateCheckedKeys: keys => {
      model[key] = [...keys];
    },

    // 拖拽 → 更新顺序
    onDrop: ({ node, dragNode, dropPosition }) => {
      if (!field.ordered) return;

      const ids = [...model[key]];
      const from = ids.indexOf(dragNode.key);
      if (from === -1) return;

      ids.splice(from, 1);

      const to = ids.indexOf(node.key);
      if (to === -1) return;

      const insertIndex = dropPosition === "inside"
        ? to
        : dropPosition === "before"
          ? to
          : to + 1;

      ids.splice(insertIndex, 0, dragNode.key);
      model[key] = ids;
    }
  });
}
