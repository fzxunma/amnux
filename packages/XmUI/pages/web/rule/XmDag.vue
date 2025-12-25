<script setup>
import { ref, reactive, computed, watch } from "vue";
import {
  NLayout, NLayoutSider, NLayoutContent,
  NTree, NForm, NFormItem, NInput, NSelect, NButton, useMessage
} from "naive-ui";

import { useLoadMetaData } from "/composables/useXmMeta.js";
import { XmMetaRules } from "/store/XmMetaRules.js";
import { buildFormItems } from "/utils/XmRuleFormBuilder.js";
import { buildRelationTree } from "/utils/XmRuleTreeBuilder.js";
import { validateByRules } from "/utils/XmRuleValidator.js";

const message = useMessage();

// =================== 元数据 ===================
const metas = useLoadMetaData({ workflows: "XmWorkflows", steps: "XmSteps" });
const selectedWorkflowId = ref(null);

watch(() => metas.workflows?.xmMetaTreeData?.value, tree => {
  if (!tree || !tree.length) return;
  if (!selectedWorkflowId.value) selectedWorkflowId.value = tree[0].key;
}, { immediate: true });

const currentWorkflow = computed(() => {
  const map = metas.workflows?.fullListData?.value;
  if (!map || !selectedWorkflowId.value) return null;
  return map[selectedWorkflowId.value] || null;
});

// =================== DAG ===================
const dagNodes = ref([]);
const dagEdges = ref([]);
const selectedNodeId = ref(null);

function makeReactiveNode(step, index) {
  return reactive({
    id: step.id || `step_${index}`,
    label: step.title || "新步骤",
    type: step.type || "action",
    params: reactive({ ...(step.params || {}) }),
    x: 50 + index * 180,
    y: 100,
  });
}

watch(currentWorkflow, wf => {
  if (!wf || !wf.steps) {
    dagNodes.value = [];
    dagEdges.value = [];
    return;
  }
  dagNodes.value = wf.steps.map((step, index) => makeReactiveNode(step, index));

  dagEdges.value = [];
  for (let i = 0; i < dagNodes.value.length - 1; i++) {
    dagEdges.value.push({ from: dagNodes.value[i].id, to: dagNodes.value[i + 1].id });
  }
}, { immediate: true, deep: true });

const selectedNode = computed(() => dagNodes.value.find(n => n.id === selectedNodeId.value));

// 节点类型
const nodeTypes = [
  { label: "开始", value: "start" },
  { label: "动作", value: "action" },
  { label: "结束", value: "end" },
];

// =================== workflow 表单 ===================
const workflowRule = XmMetaRules.XmWorkflows;
const formModel = reactive({ title: "", steps: [] });

watch(currentWorkflow, wf => {
  if (!wf) { formModel.title = ""; formModel.steps = []; return; }
  formModel.title = wf.title || "";
  formModel.steps = wf.steps || [];
}, { immediate: true, deep: true });

const stepsTreeData = computed(() => {
  if (!currentWorkflow.value) return [];
  const stepsMeta = metas.steps || { xmMetaTreeData: { value: [] } };
  return buildRelationTree(currentWorkflow.value, "steps", stepsMeta);
});

const formItems = computed(() => buildFormItems(workflowRule, formModel, { relationTrees: { XmSteps: stepsTreeData.value } }));

// =================== 拖拽 ===================
let dragNode = null;
let offset = { x: 0, y: 0 };
function startDrag(e, node) { dragNode = node; offset.x=e.clientX-node.x; offset.y=e.clientY-node.y; e.preventDefault(); }
function onDrag(e) { if(!dragNode) return; dragNode.x=e.clientX-offset.x; dragNode.y=e.clientY-offset.y; }
function stopDrag() { dragNode=null; }

// =================== 节点管理 ===================
function addNode() { dagNodes.value.push(makeReactiveNode({ id:`step_${Date.now()}`, title:"新步骤", type:"action", params:{} }, dagNodes.value.length)); }
function deleteNode(nodeId) { dagNodes.value = dagNodes.value.filter(n=>n.id!==nodeId); dagEdges.value = dagEdges.value.filter(e=>e.from!==nodeId && e.to!==nodeId); if(selectedNodeId.value===nodeId) selectedNodeId.value=null; }

// =================== 连线 ===================
const newEdge = reactive({ from:null, to:null });
function startConnect(nodeId) { newEdge.from = nodeId; newEdge.to = null; }
function endConnect(nodeId) {
  if(newEdge.from && nodeId!==newEdge.from){
    if(!createsCycle(newEdge.from,nodeId)) dagEdges.value.push({ from:newEdge.from, to:nodeId });
    else message.error("连接会产生环，禁止操作");
  }
  newEdge.from=null; newEdge.to=null;
}
function createsCycle(fromId,toId){
  const adj={}; dagNodes.value.forEach(n=>adj[n.id]=[]); dagEdges.value.forEach(e=>adj[e.from].push(e.to)); adj[fromId].push(toId);
  const visited=new Set(), rec=new Set();
  function dfs(n){ if(!visited.has(n)){visited.add(n); rec.add(n); for(const nei of adj[n]||[]) if(!visited.has(nei) && dfs(nei)) return true; else if(rec.has(nei)) return true;} rec.delete(n); return false;}
  return dagNodes.value.some(n=>dfs(n.id));
}

// =================== 节点参数动态增减 ===================
function addParamField() {
  if(!selectedNode.value) return;
  let key = `field_${Date.now()}`;
  selectedNode.value.params[key] = "";
}

function removeParamField(key) {
  if(!selectedNode.value) return;
  delete selectedNode.value.params[key];
}

// =================== workflow 操作 ===================
function handleSelect(keys){ if(keys && keys.length>0) selectedWorkflowId.value = keys[0]; }
async function saveWorkflow(){
  if(!currentWorkflow.value) return;
  try{
    validateByRules(formModel, workflowRule);
    const updatedSteps = dagNodes.value.map(n=>({ id:n.id, title:n.label, type:n.type, params:{...n.params} }));
    const updated = {...currentWorkflow.value, title:formModel.title, steps:updatedSteps };
    await metas.workflows.saveMetaData(updated.id, updated);
    message.success("保存成功");
  }catch(err){ message.error(err.message||"保存失败"); }
}
async function addWorkflow(){ if(!metas.workflows) return; const id=`workflow_${Date.now()}`; const newEntity={id,title:"新流程",steps:[]}; await metas.workflows.saveMetaData(id,newEntity); selectedWorkflowId.value=id; message.success("新增成功"); }
async function deleteWorkflow(){ if(!currentWorkflow.value) return; await metas.workflows.deleteMetaData(currentWorkflow.value.id); selectedWorkflowId.value=null; message.success("删除成功"); }
</script>

<template>
<n-layout style="height:100vh" @mousemove="onDrag" @mouseup="stopDrag">
  <n-layout-header bordered style="height:64px;text-align:center;font-weight:bold">
    DAG 编辑器 - Xunma
  </n-layout-header>

  <n-layout has-sider>
    <n-layout-sider bordered width="250px">
      <div style="margin:8px 0">
        <n-button @click="addWorkflow" size="small">新增流程</n-button>
        <n-button @click="deleteWorkflow" size="small" style="margin-left:4px">删除流程</n-button>
        <n-button @click="addNode" size="small" style="margin-left:4px">新增节点</n-button>
      </div>

      <n-tree
        v-if="metas.workflows?.xmMetaTreeData?.value?.length"
        :data="metas.workflows.xmMetaTreeData.value"
        block-line selectable default-expand-all
        :selected-keys="selectedWorkflowId ? [selectedWorkflowId] : []"
        @update:selected-keys="handleSelect"
      />
    </n-layout-sider>

    <n-layout-content style="padding:16px;overflow:auto">
      <div v-if="currentWorkflow">
        <n-form label-placement="left" label-width="120px">
          <n-form-item v-for="item in formItems" :key="item.key" :label="item.label">
            <component :is="item.render"/>
          </n-form-item>
        </n-form>

        <div style="margin-top:24px">
          <h3>DAG 编辑器</h3>
          <div style="position:relative;width:100%;height:500px;border:1px solid #ccc">
            <svg style="position:absolute;width:100%;height:100%">
              <line
                v-for="edge in dagEdges"
                :key="edge.from+'-'+edge.to"
                :x1="dagNodes.find(n=>n.id===edge.from)?.x+50"
                :y1="dagNodes.find(n=>n.id===edge.from)?.y+25"
                :x2="dagNodes.find(n=>n.id===edge.to)?.x+50"
                :y2="dagNodes.find(n=>n.id===edge.to)?.y+25"
                stroke="#1890ff" stroke-width="2"
                marker-end="url(#arrow)"
              />
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                  <path d="M0,0 L0,10 L10,5 Z" fill="#1890ff"/>
                </marker>
              </defs>
            </svg>

            <div
              v-for="node in dagNodes"
              :key="node.id"
              @mousedown="startDrag($event,node); selectedNodeId=node.id"
              @dblclick="startConnect(node.id)"
              :style="{
                position:'absolute',
                left:node.x+'px',
                top:node.y+'px',
                border: node.id===selectedNodeId?'2px solid #1890ff':'1px solid #ccc',
                padding:'8px',
                cursor:'grab',
                minWidth:'100px',
                background:'#fff',
                borderRadius:'4px',
                boxShadow:'0 1px 3px rgba(0,0,0,0.2)'
              }"
            >
              {{ node.label }} ({{ node.type }})
              <n-button size="tiny" @click.stop="deleteNode(node.id)" style="margin-left:4px">删除</n-button>
            </div>
          </div>
        </div>

        <!-- 节点参数 -->
        <div v-if="selectedNode" style="margin-top:24px">
          <h4>节点参数: {{ selectedNode.label }}</h4>
          <n-form>
            <n-form-item label="节点名称">
              <n-input v-model="selectedNode.label"/>
            </n-form-item>
            <n-form-item label="节点类型">
              <n-select v-model="selectedNode.type" :options="nodeTypes"/>
            </n-form-item>

            <div v-for="(v,k) in selectedNode.params" :key="k" style="display:flex;align-items:center;margin-bottom:4px">
              <n-form-item :label="k" style="flex:1">
                <n-input v-model="selectedNode.params[k]"/>
              </n-form-item>
              <n-button size="tiny" type="error" @click="removeParamField(k)">删除</n-button>
            </div>

            <n-button size="small" type="success" @click="addParamField">新增字段</n-button>
          </n-form>
        </div>

        <n-button type="primary" style="margin-top:24px" @click="saveWorkflow">保存流程</n-button>
      </div>

      <div v-else>
        <p>请选择左侧流程</p>
      </div>
    </n-layout-content>
  </n-layout>
</n-layout>
</template>

<style scoped>
</style>
