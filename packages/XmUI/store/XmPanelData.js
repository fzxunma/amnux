import { ref, watch, watchEffect } from "vue";
import { applyPanelLayoutRecursive } from "./XmPanelKernel.js";
import { useLayoutData } from "/store/XmLayoutData";

export function usePanelData(panelRef, parentRef) {
  const local = ref(createLocal());

  /* ---------- panel → local 双向同步（带防闪） ---------- */
  watch(panelRef, (newPanel, oldPanel) => {
    if (!newPanel) {
      local.value = createLocal();
      return;
    }

    // 初始化 style
    newPanel.style ||= {};
    newPanel.style.user ||= {};

    const user = newPanel.style.user;

    // 关键优化：只有在面板真正切换时才重置 local
    // 避免同一面板反复触发 watch 导致输入框闪烁或丢失未保存内容
    if (newPanel.id !== oldPanel?.id) {
      local.value = {
        ...createLocal(),
        ...user, // 直接用持久化值填充（包括 heightMode: 'fixed', height: '400px' 等）
      };
    } else {
      // 同面板：保留当前输入框内容，只合并新持久化值（防止覆盖未保存输入）
      local.value = { ...local.value, ...user };
    }
  }, { immediate: true });

  watchEffect(() => {
    const panel = panelRef.value;
    if (!panel) return;

    panel.style ||= {};
    panel.style.user ||= {};
    panel.style.calc ||= {};

    const user = panel.style.user;
    const calc = panel.style.calc;

    const normalized = normalizeLocal(local.value);
    Object.assign(user, normalized);
    const cleanDimension = (modeKey, sizeKey) => {
      // Normalize "empty" mode values (null, empty string) to undefined
      const mode = local.value[modeKey];
      if (
        mode === undefined || mode === null ||
        (typeof mode === "string" && mode.trim() === "")
      ) {
        local.value[modeKey] = undefined;
        delete user[modeKey];
        delete user[sizeKey];
        delete calc[sizeKey];
        return;
      }

      // Only remove explicit size when mode isn't fixed; keep the mode itself
      if (local.value[modeKey] !== "fixed") {
        delete user[sizeKey];
        delete calc[sizeKey];
      }
    };
    cleanDimension("widthMode", "width");
    cleanDimension("heightMode", "height");

    const root = findRootPanel(panel);
    if (root) {
      applyPanelLayoutRecursive(root);
    }
  });
  function findRootPanel(panel) {
    if (!panel) return null;

    // First try walking up via parent pointers (if present)
    let current = panel;
    while (current?.parent) {
      current = current.parent;
    }
    if (current) return current;

    // Fallback: scan store roots, but guard against unexpected shapes
    let layout;
    try {
      layout = useLayoutData();
    } catch (_e) {
      return null;
    }

    const roots = layout?.rootPanels?.value;
    if (!Array.isArray(roots)) return null;

    const contains = (node, id) => {
      if (!node) return false;
      if (node.id === id) return true;
      if (node.children) {
        for (const child of node.children) {
          if (contains(child, id)) return true;
        }
      }
      return false;
    };

    for (const root of roots) {
      if (contains(root, panel.id)) return root;
    }
    return null;
  }
  /* ---------- 重置尺寸 ---------- */
  const resetSize = () => {
    Object.assign(local.value, {
      widthMode: undefined,
      heightMode: undefined,
      width: "",
      height: "",
    });
  };

  /* ---------- 重置盒模型 ---------- */
  const resetBox = () => {
    const keys = [
      "margin",
      "padding",
      "minWidth",
      "maxWidth",
      "minHeight",
      "maxHeight",
    ];
    keys.forEach((key) => {
      local.value[key] = "";
    });
  };

  /* ---------- 重置容器属性 ---------- */
  const resetContainer = () => {
    local.value.gap = "";
    local.value.justify = undefined;
    local.value.align = undefined;
  };

  /* ---------- 完全重置（可选暴露） ---------- */
  const resetAll = () => {
    local.value = createLocal();
  };
  /* ---------- 重置边框 ---------- */
  const resetBorder = () => {
    const keys = ["borderWidth", "borderStyle", "borderColor", "borderRadius"];
    keys.forEach((
      k,
    ) => (local.value[k] = k === "borderStyle" ? undefined : ""));
  };

  /* ---------- 重置背景 ---------- */
  const resetBg = () => {
    local.value.backgroundColor = "";
  };
  const resetScroll = () => {
    local.value.overflowX = undefined;
    local.value.overflowY = undefined;
  };
  return {
    local,
    resetSize,
    resetBox,
    resetContainer,
    resetBorder,
    resetBg,
    resetAll,
    resetScroll
  };
}

function createLocal() {
  return {
    // === 高度 ===
    heightMode: undefined,
    height: "",
    minHeight: "",
    maxHeight: "",

    // === 宽度 ===
    widthMode: undefined,
    width: "",
    minWidth: "",
    maxWidth: "",

    // === 盒模型 ===
    margin: "",
    padding: "",

    // === 容器属性 ===
    gap: "",
    justify: undefined,
    align: undefined,

    // === 边框与背景（新增）===
    borderWidth: "", // 1px
    borderStyle: undefined, // solid/dashed/...
    borderColor: "", // #e5e7eb
    borderRadius: "", // 8px / 50%
    backgroundColor: "", // #fff / transparent

    overflowX: undefined, // 'auto' | 'scroll' | 'hidden' | 'visible' | undefined
    overflowY: undefined,
  };
}
function normalizeLocal(local) {
  const out = {};

  for (const key in local) {
    let value = local[key];

    // 跳过空值
    if (value === "" || value === undefined || value === null) continue;

    // 纯数字自动加 px
    if (typeof value === "string" && /^\d+$/.test(value.trim())) {
      value = value.trim();

      const needsPx = key === "width" ||
        key === "height" ||
        key.startsWith("min") ||
        key.startsWith("max") ||
        key === "margin" ||
        key === "padding" ||
        key === "gap" ||
        key === "borderWidth" ||
        key === "borderRadius";

      if (needsPx) {
        out[key] = `${value}px`;
        continue;
      }
    }

    // 其他值透传（颜色、solid、rgba、百分比、复合值等）
    out[key] = value;
  }

  return out;
}
