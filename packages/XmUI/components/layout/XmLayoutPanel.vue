<template>
  <!-- 容器面板 -->
  <div v-if="panel.type !== 'leaf'" class="flex gap-2 flex-1" :class="panel.type === 'row' ? 'flex-row' : 'flex-col'">
    <xm-layout-panel v-for="(child, index) in panel.children" :key="child.id" :panel="child" :selected-id="selectedId"
      :prefix="prefix + '-' + (index + 1)" @select="$emit('select', $event)" @split="(...args) => handleSplit(...args)"
      @delete="(...args) => handleDelete(...args)" />
  </div>

  <!-- 叶子面板 -->
  <div v-else class="relative flex-1 border rounded shadow cursor-pointer flex flex-col min-w-[50px] min-h-[50px]"
    :style="panel.style" :class="selectedId === panel.id ? 'border-2 border-green-600 shadow-md' : 'border-gray-300'"
    @mouseenter="hovered = true" @mouseleave="hovered = false" @click="handleClick">
    <!-- 悬停显示按钮组 -->
    <div v-if="hovered && selectedId === panel.id" class="absolute top-1 right-1 flex space-x-1 z-10">
      <n-button size="small" type="success" @click.stop="openSetting">
        s
      </n-button>
      <n-button size="small" type="primary" @click.stop="() => handleSplit('row')">r</n-button>
      <n-button size="small" type="primary" @click.stop="() => handleSplit('column')">c</n-button>
    </div>

    <!-- 面板编号显示 -->
    <div class="flex-1 flex items-center justify-center text-2xl font-bold text-white rounded"
      :class="bgColor(panel.id)">
      {{ prefix }}
    </div>
  </div>
  <XmLayoutPanelDrawer/>
</template>
      
<script setup>
import { ref } from 'vue'
import { NButton } from 'naive-ui'
import { useLayoutData } from '/store/XmLayoutData'
import XmLayoutPanelDrawer from "./XmLayoutPanelDrawer.vue"
const layoutStore = useLayoutData()

const openSetting = () => {
  layoutStore.selectPanel(props.panel.id,true)
}
const props = defineProps({
  panel: Object,
  selectedId: [Number, null],
  prefix: { type: String, default: '' },
})

const emit = defineEmits(['select', 'split', 'delete'])
const hovered = ref(false)

const createIdGenerator = () => {
  let uid = Date.now()
  return () => ++uid
}

 const nextId = createIdGenerator()

const handleClick = () => {
  emit('select', props.panel.id)
}
// 拆分叶子面板
const handleSplit = (direction) => {
  if (props.panel.type !== 'leaf') return

  // 直接修改当前 panel（因为是对象引用，父组件会同步看到变化）
  props.panel.type = direction
  props.panel.children = [
    { id: nextId(), type: 'leaf' },
    { id: nextId(), type: 'leaf' }
  ]

  // 可选：发出事件通知根组件做额外处理（如 message）
  emit('split', props.panel.id, direction)
}
// 删除叶子面板
const handleDelete = () => {
  emit('delete', props.panel.id)
}

// 背景色
const bgColor = (id) => {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500']
  return colors[id % colors.length]
}
</script>
