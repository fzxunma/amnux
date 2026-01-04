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
import { vDraggable } from 'vue-draggable-plus'

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
const nameRef = ref(1)
const panelsRef = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])

function handleClose(name) {
  const { value: panels } = panelsRef
  if (panels.length === 1) {
    return
  }
  const index = panels.findIndex(v => name === v)
  panels.splice(index, 1)
  if (nameRef.value === name) {
    nameRef.value = panels[index]
  }
}

const name = nameRef
const panels = panelsRef
const activeTab = ref('oasis')

const tabs = ref([
  { key: 'oasis', label: 'Oasis' },
  { key: 'beatles', label: 'The Beatles' },
  { key: 'jay', label: 'Jay Chou' },
  { key: 'oasis1', label: 'Oasis 1' },
  { key: 'beatles1', label: 'The Beatles 1' },
  { key: 'jay1', label: 'Jay Chou 1' }
])

function handleTabClose(key) {
  const index = tabs.value.findIndex(t => t.key === key)
  if (index === -1) return

  tabs.value.splice(index, 1)

  if (activeTab.value === key) {
    activeTab.value = tabs.value[index]?.key || tabs.value[index - 1]?.key || null
  }
}
</script>

<template>
  <NLayout has-sider class="h-screen">
    <NLayoutSider bordered collapse-mode="width" :collapsed-width="64" :width="240" show-trigger :collapsed="collapsed"
      v-model:collapsed="collapsed">
      <NMenu :options="menuOptions" v-model:value="selectedKey" :expanded-keys="expandedKeys"
        @update:expanded-keys="expandedKeys = $event" :collapsed-width="64" :collapsed-icon-size="22" />
    </NLayoutSider>

    <NLayoutContent class="h-full">
      <NCard :bordered="false" :segmented="{ content: true }" size="small" class="h-full overflow-hidden"
        content-style=" height: 100%; overflow: auto;" footer-style="padding:0">
        <template #header>
          <n-breadcrumb>
            <n-breadcrumb-item>消息</n-breadcrumb-item>
            <n-breadcrumb-item>消息看板</n-breadcrumb-item>
          </n-breadcrumb>
        </template>
        <XmLowCode />
        <!-- <template #footer>

          <n-tabs v-draggable="[
            tabs,
            {
              animation: 150,
            }
          ]" v-model:value="activeTab" type="card" closable animated placement="bottom" @close="handleTabClose">
            <template #prefix>
              < </template>

                <template #suffix>
                  >
                </template>
                <template #default>
                  <n-tab :name="element.key" :tab="element.label" v-for="element in tabs" :key="element.key">

                  </n-tab>
                </template>
          </n-tabs>
        </template> -->
      </NCard>
    </NLayoutContent>
  </NLayout>
</template>