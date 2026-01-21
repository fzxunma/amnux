<script setup>
import { ref, watch } from 'vue'
import {
  NModal, NForm, NFormItem, NInput, NSelect, NSpace, NButton,
  useMessage, NGrid, NFormItemGi, NSwitch
} from 'naive-ui'
import XmTabsEditor from './XmTabsEditor.vue'
import { action } from '/store/XmMetaDefault'

const props = defineProps({
  show: Boolean,
  editingData: Object
})

const emit = defineEmits(['update:show', 'submit'])

const message = useMessage()

const formModel = ref({
  label: '',
  key: '',
  icon: '',
  show: true,
  action: { type: null, page: '' },
  tabs: []
})

const actionTypeOptions = [
  { label: '无 (默认)', value: '' },
  { label: '抽屉 (XmDrawer)', value: 'XmDrawer' },
  { label: '弹窗 (XmDialog)', value: 'XmDialog' }
]

watch(() => props.show, (val) => {
  if (val) {
    if (props.editingData) {
      const raw = JSON.parse(JSON.stringify(props.editingData))
      if (!raw.action) raw.action = { type: null, page: '' }
      if (raw.show === undefined) raw.show = true
      if (!Array.isArray(raw.tabs)) raw.tabs = []

      // 补齐 tabs 字段
      raw.tabs = raw.tabs.map(t => ({
        key: t.key || '',
        label: t.label || '',
        type: t.type || '',
        checked: t.checked === undefined ? false : t.checked,
        showActions: t.showActions === undefined ? true : t.showActions
      }))

      formModel.value = raw
    } else {
      formModel.value = {
        label: '',
        key: '',
        icon: '',
        show: true,
        action: { type: null, page: '' },
        tabs: []
      }
    }
  }
})

const handleSubmit = () => {
  if (!formModel.value.label || !formModel.value.key) {
    message.warning('名称和Key为必填项')
    return
  }
  if (!formModel.value.action.type) formModel.value.action.page = ''

  formModel.value.tabs = formModel.value.tabs.filter(t => t.label || t.type)

  emit('submit', { ...formModel.value })
  emit('update:show', false)
}
</script>

<template>
  <NModal :show="show" @update:show="(v)=>emit('update:show',v)" preset="card"
          :title="editingData ? '编辑菜单' : '新增菜单'" class="w-700px">
    <NForm :model="formModel" label-placement="left" label-width="90px">
      <NGrid :cols="2" :x-gap="12">
        <NFormItemGi label="菜单名称" path="label" required>
          <NInput v-model:value="formModel.label" placeholder="例如: 系统管理"/>
        </NFormItemGi>

        <NFormItemGi label="Key 标识" path="key" required>
          <NInput v-model:value="formModel.key" placeholder="例如: system-manage"/>
        </NFormItemGi>

        <NFormItemGi label="图标名称" path="icon">
          <NInput v-model:value="formModel.icon" placeholder="例如: menu-sharp"/>
        </NFormItemGi>

        <NFormItemGi label="是否显示" path="show">
          <NSwitch v-model:value="formModel.show">
            <template #checked>显示</template>
            <template #unchecked>隐藏</template>
          </NSwitch>
        </NFormItemGi>
      </NGrid>

      <div class="text-gray-500 font-bold mb-4 mt-2 border-b pb-1">交互配置 (Action)</div>
      <NGrid :cols="2" :x-gap="12">
        <NFormItemGi label="交互类型">
          <NSelect v-model:value="formModel.action.type" :options="actionTypeOptions" placeholder="请选择" clearable/>
        </NFormItemGi>
        <NFormItemGi label="页面路径">
          <NInput v-model:value="formModel.action.page" :disabled="!formModel.action.type"/>
        </NFormItemGi>
      </NGrid>

      <div class="text-gray-500 font-bold mb-4 mt-2 border-b pb-1">
        多页签配置 (Tabs)
        <span class="text-xs font-normal text-gray-400 ml-2">通常用于详情页内的子Tab</span>
      </div>
      <NFormItem label-width="0">
        <XmTabsEditor v-model="formModel.tabs" :options="action"/>
      </NFormItem>
    </NForm>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="emit('update:show', false)">取消</NButton>
        <NButton type="primary" @click="handleSubmit">确定</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
