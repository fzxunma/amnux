<script setup>
import { ref, computed, watch } from 'vue'
import {
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NMenu,
  NCard
} from 'naive-ui'
import { menuOptionsMap } from "./XmSubMenu"

import XmLowCode from '/components/lowcode/XmIndex.vue'
import { useMenuDataStore } from '/store/XmMenuData.js'

const menuDataStore = useMenuDataStore()

/* ========================
 * 工具函数
 * ======================== */


function findFirstLeaf(options) {
  for (const item of options) {
    if (item.children?.length) {
      const found = findFirstLeaf(item.children)
      if (found) return found
    } else {
      return item.key
    }
  }
  return ''
}

/* ========================
 * 当前二级 options
 * ======================== */
const menuOptions = computed(
  () => menuOptionsMap[menuDataStore.menuKey] || []
)

/* ========================
 * 二级展开状态
 * ======================== */
const expandedKeys = ref([])


/* ========================
 * 二级选中
 * ======================== */
const selectedKey = computed({
  get: () => menuDataStore.getMenuSubKey() || null,
  set: (val) => val && menuDataStore.setMenuSubKey(val)
})

/* ========================
 * 切换一级时：默认选中第一个二级
 * ======================== */
watch(
  () => menuDataStore.menuKey,
  (key) => {
    const options = menuOptionsMap[key] || []
    expandedKeys.value = options.filter(i => i.children)?.map(i => i.key) || []

    if (!menuDataStore.menuSubKey) {
      const first = findFirstLeaf(options)
      if (first) menuDataStore.setMenuSubKey(first)
    }
  },
  { immediate: true }
)

const collapsed = computed({
  get() {
    const key = menuDataStore.menuKey
    return menuDataStore.menuSubCollapsed[key] ?? true
  },
  set(val) {
    console.log(val)
    const key = menuDataStore.menuKey
    menuDataStore.setMenuSubCollapsed(key, val)
  }
})
</script>

<template>
  <NLayout has-sider class="h-screen">
    <NLayoutSider bordered collapse-mode="width" :collapsed-width="64" :width="240" show-trigger :collapsed="collapsed"   v-model:collapsed="collapsed">
      <NMenu :options="menuOptions" v-model:value="selectedKey" :expanded-keys="expandedKeys"
        @update:expanded-keys="expandedKeys = $event" :collapsed-width="64" :collapsed-icon-size="22" />
    </NLayoutSider>

    <NLayoutContent class="p-4">
      <NCard title="内容区域">
        <XmLowCode />
      </NCard>
    </NLayoutContent>
  </NLayout>
</template>