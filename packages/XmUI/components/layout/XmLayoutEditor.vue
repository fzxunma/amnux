<script setup>
import { NEmpty } from 'naive-ui'
import XmLayoutPanel from './XmLayoutPanel.vue'
import XmLayoutPanelDrawer from './XmLayoutPanelDrawer.vue'
import { useLayoutData } from '/store/XmLayoutData'

const layoutStore = useLayoutData()
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <!-- 
      布局区域 
      优化点：
      1. 这里的循环是基于 rootPanels 的，确保 :panel 传递的是对象。
      2. mode="edit" 确保子组件进入编辑交互模式。
    -->
    <div class="flex flex-col gap-4 flex-1 overflow-auto p-4">
      <xm-layout-panel 
        v-for="(panel, index) in layoutStore.rootPanels" 
        :key="panel.id" 
        :panel="panel"
        :selected-id="layoutStore.activePanelId" 
        :prefix="String(index + 1)" 
        @select="layoutStore.selectPanel"
        mode="edit" 
      />

      <n-empty 
        v-if="!layoutStore.rootPanels.length" 
        description="暂无布局面板" 
        class="m-auto" 
      />
    </div>

    <!-- 侧边抽屉 (包含配置组件) -->
    <xm-layout-panel-drawer />
  </div>
</template>
