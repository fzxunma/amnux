<script setup>
import { ref, computed, watch } from 'vue'
import { useXmMeta } from '/composables/useXmMeta'
import XmParamEditor from './XmParamEditor.vue'
import XmParamSchemaEditor from './XmParamSchemaEditor.vue'
import {
  NButton,
  NCard,
  NGrid,
  NGi,
  NTree,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NSpace,
  NTag,
  NEmpty,
  NPopconfirm,
  NInput,
} from 'naive-ui'

const props = defineProps({
  type: { type: String, required: true },
  pageTitle: { type: String, default: '' },
})

const title = computed(() => props.pageTitle || `${props.type} 配置管理`)

const {
  xmMetaTreeData,
  xmMetaDataCurrent,
  xmMetaDataForm,
  loadMetaData,
  saveMetaData,
  deleteMetaData,
  reloadMetaDataList,
  addFormMetaData,
} = useXmMeta([props.type])

const { submit: addSubmit, submitting: addSubmitting } = addFormMetaData()

const selectedKey = ref('')

const handleSelect = (keys) => {
  if (!keys.length) {
    selectedKey.value = ''
    xmMetaDataCurrent.value = { id: 0 }
    return
  }
  selectedKey.value = keys[0]
  loadMetaData(selectedKey.value)
}

/* ================= 抽屉 ================= */

const drawerVisible = ref(false)
const drawerMode = ref('add')
const drawerTitle = computed(() =>
  drawerMode.value === 'add' ? '添加新条目' : '编辑条目'
)

/* ================= 动态字段表单 ================= */

const editForm = ref({
  title: '',
  params: {},   // ⭐ 动态字段
})

/* 编辑时：反解 content */
watch(
  () => xmMetaDataCurrent.value,
  (val) => {
    if (!val?.id) return

    let params = {}
    try {
      const content = typeof val.content === 'string'
        ? JSON.parse(val.content)
        : val.content

      params = content?.params || {}
    } catch { }

    editForm.value = {
      title: val.title || '',
      params: { ...params },
    }
  },
  { immediate: true }
)

/* ================= 抽屉操作 ================= */

const openAddDrawer = () => {
  drawerMode.value = 'add'
  xmMetaDataForm.metaDataId = ''
  xmMetaDataForm.metaDataTitle = ''
  xmMetaDataForm.metaDataContent = ''
  drawerVisible.value = true
}

const openEditDrawer = () => {
  if (!selectedKey.value) {
    window.$message.warning('请先选择条目')
    return
  }
  drawerMode.value = 'edit'
  drawerVisible.value = true
}

/* ================= 动态字段操作 ================= */

const addParam = () => {
  editForm.value.params[`field_${Date.now()}`] = ''
}

const removeParam = (key) => {
  delete editForm.value.params[key]
}

/* ================= 保存 ================= */

const saving = ref(false)

const handleSave = async () => {
  if (saving.value) return
  saving.value = true

  try {
    if (drawerMode.value === 'add') {
      await addSubmit()
      window.$message.success('添加成功')
    } else {
      const updated = {
        ...xmMetaDataCurrent.value,
        title: editForm.value.title.trim(),
        content: JSON.stringify({
          params: editForm.value.params,
        }, null, 2),
      }
      await saveMetaData(selectedKey.value, updated)
      window.$message.success('修改成功')
    }

    drawerVisible.value = false
    await reloadMetaDataList()
  } catch (err) {
    window.$message.error(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}

/* ================= 删除 ================= */

const handleDelete = async () => {
  if (!selectedKey.value) return
  await deleteMetaData(selectedKey.value)
  selectedKey.value = ''
  xmMetaDataCurrent.value = { id: 0 }
  await reloadMetaDataList()
}
</script>

<template>
  <div class="meta-editor">
    <h2>{{ title }}</h2>

    <n-grid :cols="24" :x-gap="24">
      <!-- 左侧 -->
      <n-gi :span="8">
        <n-card embedded>
          <n-space vertical>
            <n-space>
              <n-button type="primary" @click="openAddDrawer">+ 添加</n-button>
              <n-button @click="openEditDrawer" :disabled="!selectedKey">编辑</n-button>
              <n-popconfirm @positive-click="handleDelete">
                <template #trigger>
                  <n-button type="error" :disabled="!selectedKey">删除</n-button>
                </template>
                确定删除？
              </n-popconfirm>
            </n-space>

            <n-tree :data="xmMetaTreeData" block-line selectable default-expand-all
              @update:selected-keys="handleSelect" />
          </n-space>
        </n-card>
      </n-gi>

      <!-- 右侧预览 -->
      <n-gi :span="16">
        <n-card v-if="xmMetaDataCurrent?.id" :title="xmMetaDataCurrent.id" embedded>
          <template #header-extra>
            <n-tag type="info">{{ selectedKey }}</n-tag>
          </template>
          <n-space vertical size="large">
            <div><strong>标题：</strong>{{ xmMetaDataCurrent.title || '(无)' }}</div>
            <div><strong>内容：</strong>
              <pre>{{ xmMetaDataCurrent.content || '(空)' }}</pre>
            </div>
          </n-space>
        </n-card>
        <n-empty v-else description="请选择或添加一条记录" />
      </n-gi>
    </n-grid>

    <!-- 抽屉 -->
    <n-drawer v-model:show="drawerVisible" width="640">
      <n-drawer-content :title="drawerTitle" closable>
        <n-form label-width="100">
          <template v-if="drawerMode === 'add'">
            <n-form-item label="ID">
              <n-input v-model:value="xmMetaDataForm.metaDataId" />
            </n-form-item>
            <n-form-item label="标题">
              <n-input v-model:value="xmMetaDataForm.metaDataTitle" />
            </n-form-item>
          </template>

          <template v-else>
            <n-form-item label="标题">
              <n-input v-model:value="editForm.title" />
            </n-form-item>

            <!-- <n-form-item label="参数">
              <xm-param-editor v-model="editForm.params" />
            </n-form-item> -->
            <n-form-item label="参数">
              <XmParamSchemaEditor v-model="editForm.params" />
            </n-form-item>
          </template>
        </n-form>

        <template #footer>
          <n-space justify="end">
            <n-button @click="drawerVisible = false">取消</n-button>
            <n-button type="primary" :loading="saving" @click="handleSave">保存</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>
