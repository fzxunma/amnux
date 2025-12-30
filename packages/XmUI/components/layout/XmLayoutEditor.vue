<template>
  <div class="flex flex-col h-screen p-5 gap-5">
    <div class="flex gap-2">
      <n-button type="primary" @click="addRoot('row')">+ 新建横向布局</n-button>
      <n-button type="primary" @click="addRoot('column')">+ 新建纵向布局</n-button>
    </div>

    <div class="flex flex-wrap gap-4 flex-1 overflow-auto">
      <xm-layout-panel
        v-for="(panel, index) in rootPanels"
        :key="panel.id"
        :panel="panel"
        :selected-id="selectedId"
        :prefix="String(index + 1)"
        @select="selectedId = $event"
        @split="handleSplit"
        @delete="handleDelete"
      />

      <n-empty
        v-if="rootPanels.length === 0"
        description="点击上方按钮创建第一个布局"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import XmLayoutPanel from './XmLayoutPanel.vue'
import { NButton, NEmpty, useMessage } from 'naive-ui'

const message = useMessage()

// ✅ 防止 id 冲突
let counter = Date.now()
const nextId = () => ++counter

const rootPanels = ref([])
const selectedId = ref(null)

/* ---------------- 新建 root ---------------- */

const addRoot = (direction) => {
  rootPanels.value.push({
    id: nextId(),
    type: direction,
    children: [
      { id: nextId(), type: 'leaf' },
      { id: nextId(), type: 'leaf' }
    ]
  })
  selectedId.value = null
}

/* ---------------- split ---------------- */

const handleSplit = (targetId, direction) => {
  const split = (panels) => {
    for (const p of panels) {
      if (p.id === targetId && p.type === 'leaf') {
        p.type = direction
        p.children = [
          { id: nextId(), type: 'leaf' },
          { id: nextId(), type: 'leaf' }
        ]
        return true
      }
      if (Array.isArray(p.children) && split(p.children)) return true
    }
    return false
  }

  if (split(rootPanels.value)) {
    message.success('分割成功')
    selectedId.value = null
  }
}

/* ---------------- delete ---------------- */

const handleDelete = (targetId) => {
  const remove = (panels) => {
    for (let i = 0; i < panels.length; i++) {
      const p = panels[i]

      if (p.id === targetId && p.type === 'leaf') {
        panels.splice(i, 1)
        return true
      }

      if (Array.isArray(p.children) && remove(p.children)) {
        if (p.children.length === 0) {
          panels.splice(i, 1)
          i--
        }
        return true
      }
    }
    return false
  }

  if (remove(rootPanels.value)) {
    message.success('删除成功')
    selectedId.value = null
  }
}
</script>
