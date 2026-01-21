<script setup>
import XmLayoutPanel from "./XmLayoutPanel.vue"  // 确认路径正确

const props = defineProps({
  panels: { type: Array, default: () => [] }
})
</script>

<template>
  <div class="flex flex-col flex-1 overflow-auto">
    <XmLayoutPanel v-for="(panel, index) in panels" :key="panel.id" :panel="panel" :prefix="String(index + 1)"
      mode="view" />
    <n-empty v-if="!panels.length" description="暂无布局面板" class="m-auto" />
  </div>
</template>