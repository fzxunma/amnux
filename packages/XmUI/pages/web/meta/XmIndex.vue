<script setup>
import XmMetaEditor from './XmMetaEditor.vue'
import { ref } from 'vue'
import { useXmMeta } from '/composables/useXmMeta'

const { xmMetaDataList, xmMetaTreeData } = useXmMeta('XmMetaType')
const activeType = ref('XmMetaType')
const handleSelect = (keys, { node }) => {
  console.log('选中:', keys, node)
  activeType.value = keys[0]
  // 打开编辑等逻辑
}
</script>

<template>
  <n-layout style="height: 100vh;">
    <n-layout-header
      style="height: 64px; padding: 24px; text-align: center; font-size: large; font-weight: bold; line-height: 16px;"
      bordered>
      Xunma Meta Data System
    </n-layout-header>

    <n-layout has-sider position="absolute" style="top: 64px; bottom: 64px" bordered>
      <!-- 左侧：类型 Tab 列表 -->
      <n-layout-sider bordered>
        <n-tree :data="xmMetaTreeData" block-line expandable default-expand-all selectable
          @update:selected-keys="handleSelect" show-line />
        <!-- <n-tabs type="line" animated v-model:value="activeType" justify-content="start" placement="left" class="h-full"
          default-value="XmPage">
          <n-tab v-for="typeKey in xmMetaDataList" :key="typeKey" :name="typeKey" :tab="typeKey">
          </n-tab>
        </n-tabs> -->
      </n-layout-sider>

      <!-- 右侧：根据选中的 Tab 显示对应的 MetaEditor -->
      <n-layout-content style="padding: 24px; background: #fcfcfc;">
        <XmMetaEditor v-if="activeType" :key="activeType" :type="activeType" :page-title="`${activeType} 配置管理`" />
      </n-layout-content>
    </n-layout>

    <n-layout-footer position="absolute" style="height: 64px; padding: 24px" bordered>
      寻码 - Xunma
    </n-layout-footer>
  </n-layout>
</template>