<script setup>
import { ref, computed } from 'vue'
import XmNodeEditor from './XmNodeEditor.vue'

/** 流程基础信息 */
const workflow = ref({
  id: 'wf_demo',
  name: '示例流程',
  version: 1
})

/** 节点数据 */
const nodes = ref([
  { id: 'start', type: 'start', next: 'step1' },
  { id: 'step1', type: 'script', script: 'console.log("hello")', next: 'end' },
  { id: 'end', type: 'end' }
])

/** 当前选中节点 */
const selectedNodeId = ref('start')

const selectedNode = computed(() => {
  return nodes.value.find(n => n.id === selectedNodeId.value) ?? null
})

/** 更新节点 next */
function updateNodeNext(nodeId, nextId) {
  const node = nodes.value.find(n => n.id === nodeId)
  if (node) node.next = nextId
}
</script>

<template>
  <n-layout has-sider style="height: 100%">
    <!-- 左侧：流程 + 节点列表 -->
    <n-layout-sider width="260" bordered>
      <n-card title="流程信息" size="small">
        <n-form label-width="80">
          <n-form-item label="ID">
            <n-input v-model:value="workflow.id" />
          </n-form-item>

          <n-form-item label="名称">
            <n-input v-model:value="workflow.name" />
          </n-form-item>

          <n-form-item label="版本">
            <!-- 关键点：必须用 n-input-number -->
            <n-input-number v-model:value="workflow.version" />
          </n-form-item>
        </n-form>
      </n-card>

      <n-divider />

      <n-card title="节点列表" size="small">
        <n-list>
          <n-list-item
            v-for="n in nodes"
            :key="n.id"
            @click="selectedNodeId = n.id"
            style="cursor: pointer"
          >
            <n-tag
              size="small"
              :type="n.id === selectedNodeId ? 'primary' : 'default'"
            >
              {{ n.id }} ({{ n.type }})
            </n-tag>
          </n-list-item>
        </n-list>
      </n-card>
    </n-layout-sider>

    <!-- 右侧：节点编辑 -->
    <n-layout-content style="padding: 12px">
      <n-card title="节点编辑">
        <XmNodeEditor
          v-if="selectedNode"
          :node="selectedNode"
          :nodes="nodes"
          @update-next="updateNodeNext"
        />
        <n-empty v-else description="请选择一个节点" />
      </n-card>
    </n-layout-content>
  </n-layout>
</template>
