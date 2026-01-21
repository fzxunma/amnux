import { defineStore } from "pinia";
import { h, ref, watch, computed } from "vue";
import XmSvgIcon from "/components/icon/XmSvgIcon.vue";
import { useXmMeta } from "/composables/useXmMeta.js";

import {
  menuOptions as defaultMain,
  menuOptionsMap as defaultSubMap,
  menuRightOptions as defaultRight,
} from "./XmSubMenu.js";

const STORAGE_KEY = "xm-menu-state";
const CONFIG_ID = "sys_menu_config_v1";

// 🔥 默认的 Key 到 Path 的映射表
// 用于在菜单项缺失 path 时自动补全
const DEFAULT_KEY_PATH_MAP = {
  "chat-history": "chat/history",
  // 可以在这里继续添加其他映射...
};

// 辅助：处理图标渲染函数 (保持对 NaiveUI NMenu 的兼容)
function hydrateMenuData(items) {
  if (!items) return [];
  if (Array.isArray(items)) {
    return items.map((item) => {
      const newItem = { ...item };
      // 将字符串图标转换为渲染函数
      if (typeof newItem.icon === 'string') {
        if (newItem.icon.trim() !== '') {
          const iconName = newItem.icon;
          newItem.icon = () => h(XmSvgIcon, { name: iconName, size: 20 });
        } else {
          delete newItem.icon; 
        }
      }
      if (newItem.children && newItem.children.length > 0) {
        newItem.children = hydrateMenuData(newItem.children);
      }
      return newItem;
    });
  }
  // 处理 Map 结构
  if (typeof items === "object") {
    const newMap = {};
    for (const key in items) {
      const value = items[key];
      if (Array.isArray(value)) {
        newMap[key] = hydrateMenuData(value);
      }
    }
    return newMap;
  }
  return items;
}

export const useMenuDataStore = defineStore("XmMenuData", () => {
  const { loadMetaData, xmMetaDataCurrent } = useXmMeta("SystemMenuConfig", "metaData");

  const rawDefaults = {
    main: defaultMain,
    sub: defaultSubMap,
    right: defaultRight,
  };

  // --- State ---
  const menuOptions = ref([]);
  const menuOptionsMap = ref({});
  const menuRightOptions = ref([]);
  const isLoaded = ref(false);

  // --- UI State ---
  const menuCollapsed = ref(false);
  const menuKey = ref("user");
  const menuSubKey = ref({}); 
  const menuSubCollapsed = ref({});
  const menuSubLayoutKey = ref("");
  const menuSublayoutData = ref({});
  const menuTabKey = ref({}); 

  // --- Actions ---
  const loadLocalDefaults = () => {
    console.log("[MenuStore] 使用本地默认数据");
    menuOptions.value = hydrateMenuData(defaultMain);
    menuRightOptions.value = hydrateMenuData(defaultRight);
    menuOptionsMap.value = hydrateMenuData(defaultSubMap);
    if (menuOptions.value.length > 0 && !menuKey.value) {
      menuKey.value = menuOptions.value[0].key;
    }
    isLoaded.value = true;
  };

  const initMenuData = async () => {
    try {
      await loadMetaData(CONFIG_ID);
      const entity = xmMetaDataCurrent.value;
      const remote = entity?.content;

      if (remote) {
        const rawMain = (remote.main && remote.main.length > 0) ? remote.main : defaultMain;
        menuOptions.value = hydrateMenuData(rawMain);

        const hasRemoteSub = remote.sub && Object.keys(remote.sub).length > 0;
        const rawSub = hasRemoteSub ? remote.sub : defaultSubMap;
        menuOptionsMap.value = hydrateMenuData(rawSub);

        const rawRight = (remote.right && remote.right.length > 0) ? remote.right : defaultRight;
        menuRightOptions.value = hydrateMenuData(rawRight);

        if (!menuKey.value && menuOptions.value.length > 0) {
          menuKey.value = menuOptions.value[0].key;
        }
      } else {
        loadLocalDefaults();
      }
    } catch (e) {
      loadLocalDefaults();
    } finally {
      isLoaded.value = true;
    }
  };

  // Setters
  const setMenuCollapsed = (val) => menuCollapsed.value = val;
  const setMenuKey = (key) => menuKey.value = key;
  const setMenuSubKey = (key) => {
    if (typeof menuSubKey.value !== "object" || menuSubKey.value === null) {
      menuSubKey.value = {};
    }
    menuSubKey.value[menuKey.value] = key;
  };
  const getMenuSubKey = () => menuSubKey.value?.[menuKey.value];
  const setMenuTabKey = (subKey, tabKey) => {
    if (!subKey) return;
    if (typeof menuTabKey.value !== "object") menuTabKey.value = {};
    menuTabKey.value[subKey] = tabKey;
  };
  const getMenuTabKey = (subKey) => menuTabKey.value?.[subKey];
  const setMenuSubCollapsed = (_key, value) => {
    menuSubCollapsed.value[menuKey.value] = !!value;
  };
  const setLayoutKey = (key) => menuSubLayoutKey.value = key;
  const setLayoutData = (layout) => {
    const currentSub = menuSubKey.value?.[menuKey.value];
    if (!currentSub) return;
    const k = `${menuKey.value}-${currentSub}`;
    menuSublayoutData.value[k] = layout;
  };

  // --- Persistence ---
  const cache = localStorage.getItem(STORAGE_KEY);
  if (cache) {
    try {
      const s = JSON.parse(cache);
      menuCollapsed.value = s.menuCollapsed ?? false;
      if (s.menuKey) menuKey.value = s.menuKey;
      menuSubKey.value = s.menuSubKey || {};
      menuSubCollapsed.value = s.menuSubCollapsed || {};
      menuSubLayoutKey.value = s.menuSubLayoutKey ?? "";
      menuSublayoutData.value = s.menuSublayoutData ?? {};
      menuTabKey.value = s.menuTabKey || {};
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  watch(
    () => ({
      menuCollapsed: menuCollapsed.value,
      menuKey: menuKey.value,
      menuSubKey: menuSubKey.value,
      menuSubCollapsed: menuSubCollapsed.value,
      menuSubLayoutKey: menuSubLayoutKey.value,
      menuSublayoutData: menuSublayoutData.value,
      menuTabKey: menuTabKey.value 
    }),
    (state) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    { deep: true }
  );

  // --- 🌟 核心优化：扁平化菜单映射 (O(1) 查找) ---
  const flatMenuMap = computed(() => {
    const map = new Map();
    
    const traverse = (items, parents = []) => {
      if (!items) return;
      items.forEach(item => {
        // 尝试自动补全 Path
        if (!item.path && DEFAULT_KEY_PATH_MAP[item.key]) {
          item.path = DEFAULT_KEY_PATH_MAP[item.key];
        }

        // 存储节点本身
        map.set(item.key, { ...item, _parents: parents });
        if (item.children) {
          traverse(item.children, [...parents, item.key]);
        }
      });
    };

    // 1. 遍历主菜单
    traverse(menuOptions.value);
    
    // 2. 遍历所有子菜单 Map
    Object.values(menuOptionsMap.value).forEach(list => traverse(list));
    
    return map;
  });

  /**
   * 快速获取菜单项配置
   * @param {string} key 
   * @returns {Object|null} 菜单对象 (包含 _parents 路径)
   */
  const getMenuItem = (key) => {
    return flatMenuMap.value.get(key) || null;
  };

  // --- Full Tree (保持你原有的逻辑用于 TreeSelect) ---
  const fullMenuTree = computed(() => {
    const main = menuOptions.value || [];
    const subMap = menuOptionsMap.value || {};
    const seenKeys = new Set();

    const formatChildren = (items, parentKey) => {
      if (!Array.isArray(items)) return [];
      return items.map((item, index) => {
        const node = { ...item };
        if (!node.key) node.key = `unknown-${parentKey}-${index}`;
        
        // Key 唯一性处理
        if (seenKeys.has(node.key)) {
          let newKey = `${parentKey}-${node.key}`;
          if (seenKeys.has(newKey)) newKey = `${newKey}-${index}`;
          node.key = newKey;
        }
        seenKeys.add(node.key);
        node.value = node.key;

        if (node.children && node.children.length > 0) {
          node.children = formatChildren(node.children, node.key);
        }
        return node;
      });
    };

    seenKeys.clear();
    return main.map(mainItem => {
      const node = { ...mainItem };
      if (seenKeys.has(node.key)) {
         node.key = `${node.key}_${Math.random().toString(36).slice(2, 6)}`;
      }
      seenKeys.add(node.key);
      node.value = node.key;

      const mapChildren = subMap[node.key];
      if (mapChildren && Array.isArray(mapChildren)) {
        node.children = formatChildren(mapChildren, node.key);
      } else if (node.children) {
        node.children = formatChildren(node.children, node.key);
      }
      return node;
    });
  });

  return {
    menuOptions,
    menuOptionsMap,
    menuRightOptions,
    isLoaded,
    rawDefaults,
    menuCollapsed,
    menuKey,
    menuSubKey,
    menuSubCollapsed,
    menuSubLayoutKey,
    menuSublayoutData,
    menuTabKey,
    fullMenuTree,
    // 导出新能力
    flatMenuMap,
    getMenuItem,

    initMenuData,
    setMenuCollapsed,
    setMenuKey,
    setMenuSubKey,
    getMenuSubKey,
    setMenuTabKey,
    getMenuTabKey,
    setMenuSubCollapsed,
    setLayoutKey,
    setLayoutData,
  };
});
