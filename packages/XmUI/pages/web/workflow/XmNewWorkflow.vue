<script setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'

import { XmFetch } from '/utils/XmFetch'
import { useXmMeta } from "/composables/useXmMeta.js";

const { xmMetaData, xmReloadMetaData } = useXmMeta("XmWorkflows");

const message = useMessage()

// 流程数据
const workflowData = ref(null) // 当前编辑流程
const newWorkflowId = ref('')
const newWorkflowTitle = ref('')

// ======================== API 操作 ========================

async function loadWorkflow(id) {
  try {
    const data = await XmFetch.metaFetch({
      opt: 'get',
      keyPath: `XmWorkflows/${id}`
    })
    workflowData.value = data
    message.success('加载成功')
  } catch (err) {
    message.error(err.message || '加载失败')
    workflowData.value = null
  }
}


async function saveWorkflow(id, content) {
  try {
    await XmFetch.metaFetch({
      opt: 'set',
      keyPath: `XmWorkflows/${id}`,
      value: content
    })
    message.success('保存成功')
    xmReloadMetaData() // 更新列表
  } catch (err) {
    message.error(err.message || '保存失败')
    throw err
  }
}

async function updateWorkflowField(id, fieldPath, newValue) {
  try {
    await XmFetch.metaFetch({
      opt: 'update',
      keyPath: `XmWorkflows/${id}`,
      path: fieldPath,
      value: newValue
    })
    message.success('更新成功')
    if (workflowData.value) {
      const parts = fieldPath.split('/')
      let cur = workflowData.value
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]]
      cur[parts[parts.length - 1]] = newValue
    }
  } catch (err) {
    message.error(err.message || '更新失败')
  }
}

async function deleteWorkflow(id) {
  if (!confirm(`确定要删除流程 "${id}" 吗？`)) return
  try {
    await XmFetch.metaFetch({ opt: 'del', keyPath: `XmWorkflows/${id}` })
    message.success('删除成功')
    xmReloadMetaData()
    if (workflowData.value && workflowData.value.id === id) workflowData.value = null
  } catch (err) {
    message.error(err.message || '删除失败')
  }
}

async function addNewWorkflow() {
  const id = newWorkflowId.value.trim()
  if (!id) return message.error('请输入流程 ID')
  const title = newWorkflowTitle.value.trim() || '新流程'
  const content = { id, title, content: '' }
  try {
    await saveWorkflow(id, content)
    newWorkflowId.value = ''
    newWorkflowTitle.value = ''
    loadWorkflow(id)
  } catch { }
}


</script>

<template>
  <div class="meta-editor">
    <h2>流程管理器</h2>

    <n-space vertical>
      <!-- 新增流程 -->
      <n-space>
        <n-input v-model:value="newWorkflowId" placeholder="流程 ID" />
        <n-input v-model:value="newWorkflowTitle" placeholder="流程标题" />
        <n-button type="primary" @click="addNewWorkflow">添加流程</n-button>
      </n-space>

      <!-- 流程列表 -->
      <div class="workflow-list">
        <h3>所有流程</h3>
        <n-list bordered>
          <n-list-item v-for="id in xmMetaData" :key="id">
            <n-space>
              <span>{{ id }}</span>
              <n-button size="tiny" @click="loadWorkflow(id)">编辑</n-button>
              <n-button size="tiny" type="error" @click="deleteWorkflow(id)">删除</n-button>
            </n-space>
          </n-list-item>
        </n-list>
      </div>
    </n-space>

    <!-- 当前流程编辑区 -->
    <div v-if="workflowData" class="workflow-content">
      <h3>编辑流程: {{ workflowData.id || '未命名' }}</h3>
      <n-input v-model:value="workflowData.title" placeholder="标题"
        @blur="updateWorkflowField(workflowData.id || workflowData.title, 'title', workflowData.title)" />
      <n-input type="textarea" v-model:value="workflowData.content" placeholder="内容" :rows="10"
        @blur="updateWorkflowField(workflowData.id || workflowData.title, 'content', workflowData.content)" />
      <n-button type="primary" @click="saveWorkflow(workflowData.id || workflowData.title, workflowData)">
        完整保存
      </n-button>
    </div>
    <n-empty v-else description="请选择或添加流程" />
  </div>
</template>

<style scoped>
.meta-editor {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.workflow-list {
  margin: 20px 0;
}

.workflow-content {
  margin-top: 20px;
}
</style>
