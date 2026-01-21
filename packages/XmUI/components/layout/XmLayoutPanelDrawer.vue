<script setup>
import { computed, watch } from 'vue'
import { useLayoutData } from '/store/XmLayoutData'
import { usePanelData } from '/store/XmPanelData'
import { applyPanelLayoutRecursive } from '/store/XmPanelKernel'
import { getPanelPath } from '/utils/XmLayout'
import XmLayoutPanelSetting from './XmLayoutPanelSetting.vue'
import XmLayoutPanelLowCode from './XmLayoutPanelLowCode.vue'

const layoutStore = useLayoutData()
const panel = computed(() => layoutStore.activePanel)
const parentPanel = computed(() => {
  if (!panel.value || !layoutStore.rootPanels) return null
  const targetId = panel.value.id
  const search = (nodes) => {
    for (const node of nodes) {
      if (node.children?.some(child => child.id === targetId)) return node
      if (node.children) {
        const found = search(node.children)
        if (found) return found
      }
    }
    return null
  }
  return search(layoutStore.rootPanels)
})

const { local, resetSize, resetBox, resetBorder, resetBg } = usePanelData(panel, parentPanel)
const panelPath = computed(() => {
  if (!panel.value) return ''
  return getPanelPath(panel.value, layoutStore.rootPanels)
})
watch(panel, (newPanel) => {
  if (newPanel) applyPanelLayoutRecursive(newPanel)
}, { immediate: true })
</script>

<template>
  <n-drawer v-model:show="layoutStore.showDrawer" placement="right" width="800">
    <n-drawer-content :title="'设置:' + panelPath" closable>
      <n-tabs type="segment" animated>
        <n-tab-pane name="layout" tab="布局">
          <XmLayoutPanelSetting
            v-if="panel"
            :panel="panel"
            :local="local"
            :parentPanel="parentPanel"
            @applyPanelLayoutRecursive="applyPanelLayoutRecursive"
            @resetSize="resetSize"
            @resetBox="resetBox"
            @resetBorder="resetBorder"
            @resetBg="resetBg"
          />
        </n-tab-pane>
        <n-tab-pane name="setting" tab="配置">
          <XmLayoutPanelLowCode v-if="panel" :panel-id="panel.id"/>
        </n-tab-pane>
      </n-tabs>
    </n-drawer-content>
  </n-drawer>
</template>
