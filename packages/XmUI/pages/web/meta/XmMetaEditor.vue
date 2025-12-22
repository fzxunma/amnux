<script setup>
import { ref, computed, onMounted } from 'vue'
import { useXmMeta } from '/composables/useXmMeta'
import { useXmMessage } from '/composables/useXmMessage'
import {
  NButton,
  NInput,
  NList,
  NListItem,
  NSpace,
  NCard,
  NEmpty,
  NPopconfirm,
  NFormItem,
  NTag,
  NDivider,
  NThing,
  NGrid,
  NGi,
} from 'naive-ui'


// Props 定义（type 必须是字符串，如 'XmUser'、'XmPage' 等）
const props = defineProps({
  type: { type: String, required: true },
  pageTitle: { type: String, default: '' },
  idField: { type: String, default: 'id' },
  titleField: { type: String, default: 'title' },
  contentField: { type: String, default: 'content' },
})

// 页面标题
const title = computed(() => {
  return props.pageTitle
})

const idField = props.idField
const titleField = props.titleField
const contentField = props.contentField

// 使用组合函数（传入字符串 type）
const {
  xmMetaDataList,         // 现在是对象 { id1: {title:...}, id2: {...} }
  xmMetaTreeData,
  xmMetaDataCurrent,
  xmMetaDataForm,
  loadMetaData,
  updateFieldMetaData,
  deleteMetaData,
  addFormMetaData,
} = useXmMeta([props.type])

// 新增条目
const { loading: addLoading, submit: addSubmit } = addFormMetaData()
const addMsg = useXmMessage(addSubmit, '添加成功')

// 更新字段
const updateMsg = useXmMessage(updateFieldMetaData, '更新成功')

// 删除条目
const deleteMsg = useXmMessage(deleteMetaData, '删除成功')

// 防止输入首尾空格
const trimWhitespace = (value) => value.trim()
let keyPath = ""
const handleSelect = (keys, { node }) => {
  console.log('选中:', keys, node)
  keyPath = keys[0]
  // 打开编辑等逻辑
  loadMetaData(keys[0])
}
</script>

<template>
  <div class="meta-editor">
    <h2>{{ title }}</h2>

    <n-grid :cols="24" :x-gap="24" :y-gap="24" style="min-height: calc(100vh - 180px)">
      <!-- 左侧：列表 + 新增 -->
      <n-gi :span="8">
        <n-card embedded :bordered="false" class="left-panel">
          <!-- 新增表单 -->
          <n-space vertical :size="16">
            <n-form-item label="ID（必填）" :label-width="80">
              <n-input v-model:value="xmMetaDataForm.metaDataId" placeholder="ID" clearable
                :allow-input="trimWhitespace" />
            </n-form-item>

            <n-form-item label="标题" :label-width="80">
              <n-input v-model:value="xmMetaDataForm.metaDataTitle" placeholder="可选" clearable
                :allow-input="trimWhitespace" />
            </n-form-item>

            <n-button type="primary" block :loading="addLoading" :disabled="!xmMetaDataForm.metaDataId.trim()"
              @click="addMsg">
              添加
            </n-button>
          </n-space>


          <!-- 列表 -->
          <div class="list-section">
            <!-- 列表标题 -->
            <h3 style="margin: 0 0 16px 0">
              所有条目（{{ Array.isArray(xmMetaDataList) ? xmMetaDataList.length : Object.keys(xmMetaDataList || {}).length
              }}）
            </h3>
            <n-tree :data="xmMetaTreeData" block-line expandable default-expand-all selectable
              @update:selected-keys="handleSelect" show-line />

          </div>
        </n-card>
      </n-gi>

      <!-- 右侧：编辑区 -->
      <n-gi :span="16">
        <n-card v-if="xmMetaDataCurrent?.[idField]" title="编辑详情" embedded class="right-panel">
          <template #header-extra>
            <n-tag type="info">{{ xmMetaDataCurrent[idField] }}</n-tag>
          </template>

          <n-space vertical size="large">
            <n-input :placeholder="`标题（${titleField}）`" :value="xmMetaDataCurrent[titleField]"
              @update:value="(val) => (xmMetaDataCurrent[titleField] = val)"
              @blur="updateMsg(keyPath, titleField, xmMetaDataCurrent[titleField])" />

            <!-- 内容字段（大文本） -->
            <n-input type="textarea" :rows="12" :placeholder="`内容（${contentField}）`"
              :value="xmMetaDataCurrent[contentField]" @update:value="(val) => (xmMetaDataCurrent[contentField] = val)"
              @blur="updateMsg(keyPath, contentField, xmMetaDataCurrent[contentField])" />
          </n-space>
        </n-card>

        <n-empty v-else description="请从左侧列表选择或新建一条记录进行编辑" />
      </n-gi>
    </n-grid>
  </div>
</template>

<style scoped>
.meta-editor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.left-panel {
  padding: 16px;
}

.right-panel {
  padding: 16px;
}

.list-section {
  margin-top: 24px;
}

.item-list .active {
  background-color: #f5f5f5;
}
</style>