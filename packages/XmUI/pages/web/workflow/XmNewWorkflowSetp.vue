<script setup>
import { useXmMeta } from "/composables/useXmMeta.js";
import { useXmMessage } from "/composables/useXmMessage.js";

const {
  xmMetaDataList,
  xmMetaDataCurrent,
  xmMetaDataForm,
  loadMetaData,
  updateFieldMetaData,
  deleteMetaData,
  addFormMetaData
} = useXmMeta("XmWorkflows");
const { loading, submit } = addFormMetaData();
const saveMetaDataMsg = useXmMessage(submit, "保存成功");
const updateFieldMetaDataMsg = useXmMessage(updateFieldMetaData, "更新成功");
const deleteMetaDataMsg = useXmMessage(deleteMetaData, "删除成功");

</script>

<template>
  <div class="meta-editor">
    <h2>流程管理器</h2>

    <n-space vertical>
      <!-- 新增流程 -->
      <n-space>
        <n-input v-model:value="xmMetaDataForm.metaDataId" placeholder="流程 ID" />
        <n-input v-model:value="xmMetaDataForm.metaDataTitle" placeholder="流程标题" />
        <n-button type="primary" :loading="loading" @click="saveMetaDataMsg">添加流程</n-button>
      </n-space>

      <!-- 流程列表 -->
      <div class="workflow-list">
        <h3>所有流程</h3>
        <n-list bordered>
          <n-list-item v-for="id in xmMetaDataList" :key="id">
            <n-space>
              <span>{{ id }}</span>
              <n-button size="tiny" @click="() => loadMetaData(id)">编辑</n-button>
              <n-button size="tiny" type="error" @click="() => deleteMetaDataMsg(id)">删除</n-button>
            </n-space>
          </n-list-item>
        </n-list>
      </div>
    </n-space>

    <!-- 当前流程编辑区 -->
    <div v-if="xmMetaDataCurrent.id" class="workflow-content">
      <h3>编辑流程: {{ xmMetaDataCurrent.id || '未命名' }}</h3>
      <n-input v-model:value="xmMetaDataCurrent.title" placeholder="标题"
        @blur="() => updateFieldMetaDataMsg(xmMetaDataCurrent.id || xmMetaDataCurrent.title, 'title', xmMetaDataCurrent.title)" />
      <n-input type="textarea" v-model:value="xmMetaDataCurrent.content" placeholder="内容" :rows="10"
        @blur="() => updateFieldMetaDataMsg(xmMetaDataCurrent.id || xmMetaDataCurrent.title, 'content', xmMetaDataCurrent.content)" />
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
