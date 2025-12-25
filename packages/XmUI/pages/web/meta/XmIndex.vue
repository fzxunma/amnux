<script setup>
import { ref } from 'vue'
import XmMetaEditor from './XmMetaEditor.vue'
import { useXmMeta } from '/composables/useXmMeta'

const { xmMetaTreeData } = useXmMeta([])  // 空数组 → list(["xm"])
const activeType = ref('')

const handleSelect = (keys) => {
  if (keys.length > 0) {
    activeType.value = keys[0]
  }
}
</script>

<template>
  <n-layout style="height: 100vh;">
    <n-layout-header bordered style="height: 48px; padding: 4px;line-height:40px; text-align: center; font-size: large; font-weight: bold;">
      Xunma Meta Data System
    </n-layout-header>

    <n-layout has-sider position="absolute" style="top: 48px; bottom: 32px" bordered>
      <n-layout-sider width="300" bordered>
        <div style="padding: 16px; font-weight: bold;">元数据类型</div>
        <n-tree
          :data="xmMetaTreeData"
          block-line
          expandable
          default-expand-all
          selectable
          @update:selected-keys="handleSelect"
          show-line
        />
      </n-layout-sider>

      <n-layout-content style="padding: 24px; background: #fcfcfc;">
        <XmMetaEditor
          :key="activeType"
          :type="activeType"
          :page-title="`${activeType} 配置管理`"
        />
      </n-layout-content>
    </n-layout>

    <n-layout-footer position="absolute" style="height: 32px; padding: 4px" bordered>
      寻码 - Xunma
    </n-layout-footer>
  </n-layout>
</template>