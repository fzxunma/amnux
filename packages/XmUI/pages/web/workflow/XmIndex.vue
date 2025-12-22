<script setup>
import { ref, computed } from 'vue'
import XmNodeEditor from './XmNodeEditor.vue'
import { NTree, NPopconfirm } from "naive-ui"
import { useXmMeta } from '/composables/useXmMeta'

const {
  xmMetaTreeData,
  deleteMetaData,
  reloadMetaDataList
} = useXmMeta("XmWorkflows")

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


const currentRef = ref(1);
const currentStatus = ref("process");
const current = currentRef;

function next() {
  if (currentRef.value === null)
    currentRef.value = 1;
  else if (currentRef.value >= 5)
    currentRef.value = null;
  else currentRef.value++;
}

function prev() {
  if (currentRef.value === 0)
    currentRef.value = null;
  else if (currentRef.value === null)
    currentRef.value = 5;
  else currentRef.value--;
}

const handleSelect = (keys, { node }) => {
  console.log('选中:', keys, node)
  // 打开编辑等逻辑
}
</script>

<template>
  <n-layout style="height: 100vh;">
    <n-layout-header
      style="height: 64px; padding: 24px;text-align: center;font-size: large;font-weight: bold;line-height: 16px;"
      bordered>
      Xunma Workflow System
    </n-layout-header>
    <n-layout has-sider position="absolute" style="top: 64px; bottom: 64px" bordered>
      <!-- 左侧：流程 + 节点列表 -->
      <n-layout-sider bordered >
        <n-tree :data="xmMetaTreeData" block-line expandable selectable @update:selected-keys="handleSelect" />
      </n-layout-sider>

      <!-- 右侧：节点编辑 -->
      <n-layout-content style="padding: 12px">
        <n-card title="页面流程">
          <n-space vertical>
            <n-steps vertical :current="current" :status="currentStatus">
              <n-step title="I Me Mine">
                <div class="n-step-description">
                  <p>Al through the day, I me mine I me mine, I me mine</p>
                  <XmNodeEditor v-if="selectedNode" :node="selectedNode" :nodes="nodes" @update-next="updateNodeNext" />
                  <n-empty v-else description="请选择一个节点" />
                  <n-button v-if="current === 1" size="small" @click="next">
                    Next
                  </n-button>
                </div>
              </n-step>
              <n-step title="Let It Be" description="When I find myself in times of trouble Mother Mary comes to me" />
              <n-step title="Break" />
              <n-step title="Come Together" description="Here come old flat top He come grooving up slowly" />
              <n-step title="Something" description="Something in the way she moves Attracts me like no other lover" />
            </n-steps>

            <n-button-group>
              <n-button @click="prev">
                <template #icon>
                  上
                </template>
              </n-button>
              <n-button @click="next">
                <template #icon>
                  下
                </template>
              </n-button>
            </n-button-group>
            <n-radio-group v-model:value="currentStatus" size="medium" name="vertical">
              <n-radio-button value="error">
                Error
              </n-radio-button>
              <n-radio-button value="process">
                Process
              </n-radio-button>
              <n-radio-button value="wait">
                Wait
              </n-radio-button>
              <n-radio-button value="finish">
                Finish
              </n-radio-button>
            </n-radio-group>
          </n-space>
        </n-card>
      </n-layout-content>
    </n-layout>
    <n-layout-footer position="absolute" style="height: 64px; padding: 24px" bordered>
      寻码 - Xunma
    </n-layout-footer>
  </n-layout>
</template>
