<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia' 
import {
  NLayout, NLayoutSider, NLayoutContent, NMenu, NCard,
  NDrawer, NDrawerContent
} from 'naive-ui'
import XmSvgIcon from '/components/icon/XmSvgIcon.vue'
import XmBreadcrumb from '/components/breadcrumb/XmBreadcrumb.vue'
import XmLayoutView from '/components/layout/XmLayoutView.vue'  // 假設已改成 props 驅動版本
import XmLayoutEditor from '/components/layout/XmLayoutEditor.vue'
import { useMenuDataStore } from '/store/XmMenuData.js'
import { useLayoutData } from '/store/XmLayoutData'

const layoutStore = useLayoutData()

const menuDataStore = useMenuDataStore()
const { menuOptionsMap, menuKey } = storeToRefs(menuDataStore)

// ── 側邊欄相關邏輯（保持不變） ──
const subMenuOptions = computed(() => {
  return menuOptionsMap.value[menuKey.value] || []
})

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

function findParentsPath(tree, targetKey, currentPath = []) {
  if (!tree) return null
  for (const node of tree) {
    if (node.key === targetKey) return currentPath
    if (node.children && node.children.length > 0) {
      const foundPath = findParentsPath(node.children, targetKey, [...currentPath, node.key])
      if (foundPath) return foundPath
    }
  }
  return null
}

const expandedKeys = ref([])
const drawerVisible = ref(false)

const selectedKey = computed({
  get: () => menuDataStore.getMenuSubKey() || null,
  set: (val) => val && menuDataStore.setMenuSubKey(val)
})

watch(
  () => menuDataStore.menuKey,
  (key) => {
    const options = menuOptionsMap.value[key] || []
    let activeKey = menuDataStore.getMenuSubKey()
    
    if (!activeKey) {
      activeKey = findFirstLeaf(options)
      if (activeKey) menuDataStore.setMenuSubKey(activeKey)
    }

    if (activeKey) {
      const path = findParentsPath(options, activeKey)
      expandedKeys.value = path || []
    } else {
      expandedKeys.value = []
    }
  },
  { immediate: true }
)

const collapsed = computed({
  get() {
    const key = menuDataStore.menuKey
    return menuDataStore.menuSubCollapsed[key] ?? false 
  },
  set(val) {
    const key = menuDataStore.menuKey
    menuDataStore.setMenuSubCollapsed(key, val)
  }
})

</script>

<template>
  <NLayout has-sider class="h-screen">
    <NLayoutSider 
      bordered 
      collapse-mode="width" 
      :collapsed-width="64" 
      :width="240" 
      show-trigger 
      :collapsed="collapsed"
      @update:collapsed="(val) => collapsed = val"
    >
      <NMenu 
        :options="subMenuOptions" 
        v-model:value="selectedKey" 
        :expanded-keys="expandedKeys"
        @update:expanded-keys="expandedKeys = $event" 
        :collapsed-width="64" 
        :collapsed-icon-size="22" 
      />
    </NLayoutSider>

    <NLayoutContent class="h-full" id="drawer-target">
      <NCard 
        :bordered="false" 
        :segmented="{ content: true }" 
        size="small" 
        class="h-full overflow-hidden"
        content-style="height: 100%; overflow: auto;" 
        footer-style="padding:0"
      >
        <template #header>
          <XmBreadcrumb/>
        </template>
        <template #header-extra>
          <span @click="drawerVisible = true" class="cursor-pointer">
            <XmSvgIcon name="settings" class="w-6 h-6 block" />
          </span>
        </template>
       
        <!-- 修改為 props 驅動的 XmLayoutView -->
        <XmLayoutView 
          :panels="layoutStore.rootPanels"
        />
      </NCard>
      
      <NDrawer v-model:show="drawerVisible" width="100%" to="#drawer-target">
        <NDrawerContent title="设置" closable>
          <XmLayoutEditor />
        </NDrawerContent>
      </NDrawer>
    </NLayoutContent>
  </NLayout>
</template>