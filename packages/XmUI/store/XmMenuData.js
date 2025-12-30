import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'xm-menu-state'

export const useMenuDataStore = defineStore('XmMenuData', () => {
  /* ========================
   * ① Layout 层（整体侧栏）
   * ======================== */
  const menuCollapsed = ref(false)

  /* ========================
   * ② Menu 层（一级 / 二级）
   * ======================== */

  // 当前一级
  const menuKey = ref('user')

  // 当前二级
  const menuSubKey = ref({})

  /**
   * 二级展开状态（按一级）
   * { [mainKey]: string[] }
   */
  const menuSubCollapsed = ref({})

  /* ========================
   * ③ Content / Layout 层
   * ======================== */

  const menuSubLayoutKey = ref('')
  const menuSublayoutData = ref({})

  /* ========================
   * actions
   * ======================== */

  /* ---- Layout ---- */
  const setMenuCollapsed = (val) => {
    menuCollapsed.value = val
  }

  /* ---- 一级菜单 ---- */
  const setMenuKey = (key) => {
    menuKey.value = key
  }

  /* ---- 二级菜单 ---- */
  const setMenuSubKey = (key) => {
    if (typeof menuSubKey.value !== 'object' || menuSubKey.value === null) {
      menuSubKey.value = {}
    }
    menuSubKey.value[menuKey.value] = key
  }

  const getMenuSubKey = () => {
    return menuSubKey.value[menuKey.value]
  }

  const setMenuSubCollapsed = (_key, value) => {
    menuSubCollapsed.value[menuKey.value] = !!value
  }

  /* ---- 内容布局 ---- */
  const setLayoutKey = (key) => {
    menuSubLayoutKey.value = key
  }

  const setLayoutData = (layout) => {
    const k = `${menuKey.value}-${menuSubKey[menuKey.value].value}`
    menuSublayoutData.value[k] = layout
  }

  /* ========================
   * 持久化
   * ======================== */
  watch(
    () => ({
      menuCollapsed: menuCollapsed.value,
      menuKey: menuKey.value,
      menuSubKey: menuSubKey.value,
      menuSubCollapsed: menuSubCollapsed.value,
      menuSubLayoutKey: menuSubLayoutKey.value,
      menuSublayoutData: menuSublayoutData.value
    }),
    (state) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    { deep: true }
  )
  function normalizeMenuSubCollapsed(raw) {
    const result = {}

    if (!raw || typeof raw !== 'object') return result

    for (const [key, value] of Object.entries(raw)) {
      // 旧版本：数组 → 展开 = true
      if (Array.isArray(value)) {
        result[key] = value.length === 0 ? false : true
      }
      // 新版本：boolean
      else if (typeof value === 'boolean') {
        result[key] = value
      }
      // 兜底
      else {
        result[key] = false
      }
    }

    return result
  }
  /* ========================
   * 初始化恢复
   * ======================== */
  const cache = localStorage.getItem(STORAGE_KEY)
  if (cache) {
    const s = JSON.parse(cache)
    menuCollapsed.value = s.menuCollapsed ?? false
    menuKey.value = s.menuKey ?? 'user'
    menuSubKey.value = s.menuSubKey ?? ''
    menuSubCollapsed.value = normalizeMenuSubCollapsed(s.menuSubCollapsed)
    menuSubLayoutKey.value = s.menuSubLayoutKey ?? ''
    menuSublayoutData.value = s.menuSublayoutData ?? {}
  }

  return {
    /* state */
    menuCollapsed,
    menuKey,
    menuSubKey,
    menuSubCollapsed,
    menuSubLayoutKey,
    menuSublayoutData,

    /* actions */
    setMenuCollapsed,
    setMenuKey,
    setMenuSubKey,
    setMenuSubCollapsed,
    setLayoutKey,
    setLayoutData,

    getMenuSubKey
  }
})
