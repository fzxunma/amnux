import { defineStore } from "pinia";
import { computed, ref } from "vue";

// 浏览器原生 UUID 或简单的随机 ID
export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xm-' + Math.random().toString(36).slice(2, 11);
};

// 递归查找面板
const findPanel = (panels, id) => {
  for (const p of panels) {
    if (p.id === id) return p;
    if (p.children) {
      const found = findPanel(p.children, id);
      if (found) return found;
    }
  }
  return null;
};

// 递归删除并坍缩
const removePanelRecursive = (panels, id) => {
  for (let i = 0; i < panels.length; i++) {
    const p = panels[i];
    if (p.id === id) {
      panels.splice(i, 1);
      return true;
    }
    if (p.children && p.children.length > 0) {
      const isDeletedInChild = removePanelRecursive(p.children, id);
      if (isDeletedInChild) {
        if (p.children.length === 0) {
          panels.splice(i, 1);
          i--;
        } else if (p.children.length === 1) {
          // 如果子节点只剩一个，将其提升（坍缩）
          const survivor = p.children[0];
          // 保留父级的样式或属性（可视情况调整）
          panels[i] = { ...survivor, style: { ...p.style, ...survivor.style } };
        }
        return true;
      }
    }
  }
  return false;
};

// 默认空布局生成器
const createDefaultLayout = () => [
  {
    id: generateId(),
    type: "row",
    style: {},
    children: [{ 
      id: generateId(), 
      type: "leaf", 
      style: { minHeight: "200px" },
      // 初始化 content 结构，防止 XmLowCode 报错
      content: { lowCode: {} }
    }],
  },
];

export const useLayoutData = defineStore("XmLayoutData", () => {
  const rootPanels = ref(createDefaultLayout());
  const activePanelId = ref(null);
  const showDrawer = ref(false);

  const activePanel = computed(() =>
    findPanel(rootPanels.value, activePanelId.value)
  );

  const selectPanel = (id, openDrawer = false) => {
    activePanelId.value = id;
    if (openDrawer) showDrawer.value = true;
  };

  const deleteActive = () => {
    if (!activePanelId.value) return;
    removePanelRecursive(rootPanels.value, activePanelId.value);
    if (rootPanels.value.length === 0) {
      resetToDefault();
    }
    activePanelId.value = null;
    showDrawer.value = false;
  };

  const resetToDefault = () => {
    rootPanels.value = createDefaultLayout();
    activePanelId.value = null;
    showDrawer.value = false;
  };

  // 🔥 核心修改：loadLayout (深拷贝)
  const loadLayout = (layoutData) => {
    if (!layoutData) {
      resetToDefault();
      return;
    }

    let sourceData = null;

    // 1. 兼容多种数据格式
    if (Array.isArray(layoutData)) {
      sourceData = layoutData;
    } else if (layoutData && Array.isArray(layoutData.rootPanels)) {
      sourceData = layoutData.rootPanels;
    }

    if (sourceData && sourceData.length > 0) {
      // 🔥 2. 使用 JSON 序列化进行深拷贝 (Deep Copy)
      // 这确保了 layoutStore 中的数据与 menuStore 完全断开联系
      // 也就是你说的 "第二份数据"
      try {
        rootPanels.value = JSON.parse(JSON.stringify(sourceData));
      } catch (e) {
        console.error("[LayoutStore] Layout Parse Error", e);
        resetToDefault();
      }
    } else {
      resetToDefault();
    }

    activePanelId.value = null;
    showDrawer.value = false;
  };

  return {
    rootPanels,
    activePanelId,
    activePanel,
    showDrawer,
    selectPanel,
    deleteActive,
    resetToDefault,
    loadLayout,
    generateId,
  };
});
