<script setup>
import { ref, computed, onMounted } from 'vue'
import XmNodeEditor from './XmNodeEditor.vue'
import { useXmMeta } from "/composables/useXmMeta.js";

const { xmMetaDataList, xmReloadMetaData } = useXmMeta("XmWorkflows");

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
  <n-layout style="height: 100vh;">
    <n-layout-header
      style="height: 64px; padding: 24px;text-align: center;font-size: large;font-weight: bold;line-height: 16px;"
      bordered>
      Xunma Workflow Edit System
    </n-layout-header>
    <n-layout has-sider position="absolute" style="top: 64px; bottom: 64px" bordered>
      <!-- 左侧：流程 + 节点列表 -->
      <n-layout-sider bordered width="528">
        <n-tabs addable type="line" animated placement="left" class="h-full">
          <!-- <template #suffix>
            <n-button size="small" strong secondary type="info">新建</n-button>
          </template> -->
          <n-tab-pane :name="value" :tab="value" v-for="value in xmMetaDataList" :key="value">
            <n-list>
              <n-list-item v-for="n in xmMetaDataList" :key="n" @click="selectedNodeId = n" style="cursor: pointer">
                <n-tag :type="n === selectedNodeId ? 'primary' : 'default'">
                  {{ n }}
                </n-tag>
              </n-list-item>
            </n-list>
          </n-tab-pane>
        </n-tabs>
      </n-layout-sider>
      <!-- 右侧：节点编辑 -->
      <n-layout-content style="padding: 12px">
        <n-card title="节点编辑">
          <XmNodeEditor v-if="selectedNode" :node="selectedNode" :nodes="nodes" @update-next="updateNodeNext" />
          <n-empty v-else description="请选择一个节点" />
        </n-card>
      </n-layout-content>
    </n-layout>
    <n-layout-footer position="absolute" style="height: 64px; padding: 24px" bordered>
      寻码 - Xunma
    </n-layout-footer>
  </n-layout>
</template>
