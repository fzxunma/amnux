export function applyPanelLayoutRecursive(panel, parent = null) {
  if (!panel) return;

  panel.style ||= {};
  panel.style.user ||= {};
  panel.style.calc ||= {};

  const u = panel.style.user;
  const c = panel.style.calc;

  wipeCalc(c);

  const isLeaf = panel.type === "leaf";
  const isRow = panel.type === "row";
  const isColumn = panel.type === "column";

  if (!isLeaf) {
    if (isRow || isColumn) {
      c.display = "flex";
      c.flexDirection = isRow ? "row" : "column";

      // 默认交叉轴拉伸（解决“留空一个位置”核心问题）
      c.alignItems = u.align || "stretch";

      // 主轴对齐
      if (u.justify) {
        c.justifyContent = u.justify;
      }
    }
  }

  /* ---------- 尺寸轴解析 ---------- */
  resolveAxis("width", panel, parent, u, c);
  resolveAxis("height", panel, parent, u, c);

  /* ---------- gap ---------- */
  if (u.gap) c.gap = u.gap;

  /* ---------- 盒模型 ---------- */
  if (u.padding) c.padding = u.padding;
  if (u.margin) c.margin = u.margin;

  if (u.minHeight) c.minHeight = u.minHeight;
  if (u.maxHeight) c.maxHeight = u.maxHeight;
  if (u.minWidth) c.minWidth = u.minWidth;
  if (u.maxWidth) c.maxWidth = u.maxWidth;

  /* ---------- 边框 / 圆角 / 背景（新增） ---------- */
  // 背景
  if (u && Object.prototype.hasOwnProperty.call(u, "backgroundColor")) {
    c.backgroundColor = u.backgroundColor ?? "";
  }
  if (u && Object.prototype.hasOwnProperty.call(u, "borderColor")) {
    c.borderColor = u.borderColor ?? "";
  }
  // 圆角
  if (u.borderRadius) c.borderRadius = u.borderRadius;

  // 边框：三件套（宽度/样式/颜色）
  // 允许只配置部分；CSS 会按默认值补齐
  if (u.borderWidth) c.borderWidth = u.borderWidth;
  if (u.borderStyle) c.borderStyle = u.borderStyle;
  if (u.overflowX) c.overflowX = u.overflowX;
  if (u.overflowY) c.overflowY = u.overflowY;
  // 可选：如果只填了 width 或 color，但 style 没填，给个默认 solid，避免“看不见”
  if ((u.borderWidth || u.borderColor) && !u.borderStyle) {
    c.borderStyle = "solid";
  }

  // 递归子面板
  panel.children?.forEach((child) => {
    applyPanelLayoutRecursive(child, panel);
  });

  // 重新赋值（避免某些依赖不触发）
  const newCalc = {};
  Object.assign(newCalc, c);
  panel.style.calc = newCalc;
}
// 轴向解析器
function resolveAxis(axis, panel, parent, u, c) {
  const mode = u[axis + "Mode"];
  const value = u[axis];

  const parentIsRow = parent?.type === "row";
  const parentIsColumn = parent?.type === "column";
  const parentIsFlex = parentIsRow || parentIsColumn;

  const isMainAxis = (parentIsRow && axis === "width") ||
    (parentIsColumn && axis === "height");

  // 每次都彻底清理
  c[axis] = undefined;
  c.flex = undefined;
  c.alignSelf = undefined;

  // fill 是默认行为（包括 !mode 和显式 'fill'）
  if (!mode || mode === "fill") {
    c.flex = "1 1 0%";

    if (parentIsFlex && !isMainAxis) {
      c.alignSelf = "stretch";
    }

    if (!parent) {
      c[axis] = "100%"; // 顶级面板占满（无论 leaf 或容器）
    }

    return;
  }

  if (mode === "fixed") {
    if (value) c[axis] = value;
    c.flex = "0 0 auto";
    return;
  }

  if (mode === "auto") {
    c.flex = "0 0 auto";
    if (parentIsFlex && !isMainAxis) {
      c.alignSelf = "stretch";
    }
    return;
  }
}

// 辅助函数
function wipeCalc(calc) {
  for (const k in calc) {
    delete calc[k];
  }
}
