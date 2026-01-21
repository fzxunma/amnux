import { defineStore, storeToRefs } from "pinia";
import { computed, nextTick, ref, toRaw, watch } from "vue";
import { XmMeta } from "/store/XmMeta.js";
import { useMenuDataStore } from "/store/XmMenuData";
import { useLayoutData } from "/store/XmLayoutData";

const LAYOUT_PREFIX = ["xm", "XmLayout"];
const LAYOUT_PAYLOAD_VERSION = 1;

/* ================= 工具函数 ================= */

function clonePlain(data) {
  const raw = toRaw(data);
  try {
    if (typeof structuredClone === "function") return structuredClone(raw);
  } catch { 
    //
  }
  return JSON.parse(JSON.stringify(raw));
}

function sigOfPanels(panels) {
  return JSON.stringify(clonePlain(panels));
}

function buildLayoutEntity(keyPathArray, rootPanelsArray) {
  const last = Array.isArray(keyPathArray) ? keyPathArray.at(-1) : "";
  return {
    id: String(last || ""),
    title: "XmLayout",
    content: {
      version: LAYOUT_PAYLOAD_VERSION,
      updatedAt: Date.now(),
      rootPanels: clonePlain(rootPanelsArray),
    },
  };
}

function extractPanels(entityOrAnything) {
  if (!entityOrAnything) return [];
  if (Array.isArray(entityOrAnything)) return entityOrAnything;
  if (typeof entityOrAnything === "object" && entityOrAnything.content != null) {
    const c = entityOrAnything.content;
    if (Array.isArray(c)) return c;
    if (typeof c === "object" && Array.isArray(c.rootPanels)) {
      return c.rootPanels;
    }
    try {
      const obj = JSON.parse(c);
      if (Array.isArray(obj?.rootPanels)) return obj.rootPanels;
      if (Array.isArray(obj)) return obj;
    } catch {
      //
    }
  }
  return [];
}

/* ================= Store 定义 ================= */

export const useLayoutPersist = defineStore("XmLayoutPersist", () => {
  const menuStore = useMenuDataStore();
  const layoutStore = useLayoutData();
  const { rootPanels } = storeToRefs(layoutStore);
  const { menuKey, menuTabKey } = storeToRefs(menuStore);

  const currentKeyPath = computed(() => {
    const main = menuKey.value;
    const sub = menuStore.getMenuSubKey() || "default";

    let activeTab = menuTabKey.value?.[sub];

    // 🌟 优化：直接从扁平 Map 获取菜单对象，无需递归
    if (!activeTab) {
      const node = menuStore.getMenuItem(sub);
      if (node && Array.isArray(node.tabs) && node.tabs.length > 0) {
        activeTab = node.tabs[0].title;
      }
    }

    const path = [...LAYOUT_PREFIX, main, sub];
    if (activeTab) {
      path.push(activeTab);
    }
    return path;
  });

  const currentLayoutKey = computed(() => currentKeyPath.value.join("/"));

  let saveTimer = null;
  const isRestoring = ref(false);
  const lastSavedSigByKey = new Map();

  // 自动保存逻辑
  watch(rootPanels, (newRoots) => {
    if (isRestoring.value) return;
    if (!Array.isArray(newRoots) || newRoots.length === 0) return;
    
    const key = currentLayoutKey.value;
    const sig = sigOfPanels(newRoots);
    
    if (lastSavedSigByKey.get(key) === sig) return;
    
    clearTimeout(saveTimer);
    const keyAtSchedule = key;
    
    saveTimer = setTimeout(async () => {
      if (currentLayoutKey.value !== keyAtSchedule) return;
      
      const entity = buildLayoutEntity(currentKeyPath.value, newRoots);
      await XmMeta.saveEntity(currentKeyPath.value, entity).catch((err) => {
        console.error("❌ [Layout] 自动保存失败:", err);
      });
      console.log("✅ 自动保存:", keyAtSchedule);
      lastSavedSigByKey.set(keyAtSchedule, sig); // 更新签名
    }, 800);
  }, { deep: true });

  // 切换路径逻辑
  watch(currentKeyPath, async (newPath, oldPath) => {
      if (!newPath) return;

      // 强制保存旧路径数据
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
        if (oldPath && oldPath.length > 0 && rootPanels.value.length > 0) {
          const oldKeyStr = oldPath.join("/");
          const currentSig = sigOfPanels(rootPanels.value);
          if (lastSavedSigByKey.get(oldKeyStr) !== currentSig) {
            console.log(`💾 [Layout] 切换前保存: ${oldKeyStr}`);
            const oldEntity = buildLayoutEntity(oldPath, rootPanels.value);
            XmMeta.saveEntity(oldPath, oldEntity).catch(() => {});
            lastSavedSigByKey.set(oldKeyStr, currentSig);
          }
        }
      }

      // 加载新数据
      const keyStr = newPath.join("/");
      isRestoring.value = true;
      try {
        const data = await XmMeta.fetchEntity(newPath);
        const panels = extractPanels(data);
        if (Array.isArray(panels) && panels.length > 0) {
          rootPanels.value = clonePlain(panels);
        } else {
          layoutStore.resetToDefault();
        }
        await nextTick();
        lastSavedSigByKey.set(keyStr, sigOfPanels(rootPanels.value));
      } catch (_err) {
        layoutStore.resetToDefault();
      } finally {
        isRestoring.value = false;
      }
    },
    { immediate: true },
  );

  return { currentLayoutKey };
});
