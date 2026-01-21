<script setup>
import { reactive, watch } from 'vue'
import {
  NForm,
  NFormItem,
  NSelect,
  NInputNumber,
  NSwitch
} from 'naive-ui'
import XmTabsEditor from '../../pages/web/menu/XmTabsEditor.vue'
import { action } from '/store/XmMetaDefault'

const props = defineProps({
  meta: { type: Object, required: true }
})

const meta = props.meta

const formModel = reactive({
  tabs: []
})

// ✅ 核心逻辑：只同步「开关打开的」
watch(
  () => formModel.tabs,
  (newVal) => {
    if (!Array.isArray(meta.actions)) {
      meta.actions = []
    }

    meta.actions.splice(0)

    ;(newVal || []).forEach(item => {
      if (item.checked) {
        meta.actions.push({
          key: item.key,
          label: item.label,
          type: item.type
        })
      }
    })
  },
  { deep: true, immediate: true }
)
</script>

<template>
  <NForm label-placement="left" label-width="auto">
    <NFormItem label="布局方向">
      <NSelect
        v-model:value="meta.layout"
        :options="[
          { label: 'Grid 网格', value: 'grid' },
          { label: '纵向流', value: '' }
        ]"
      />
    </NFormItem>

    <div v-if="meta.layout === 'grid'">
      <NFormItem label="列数">
        <NInputNumber v-model:value="meta.cols" />
      </NFormItem>
      <NFormItem label="间距">
        <NInputNumber v-model:value="meta.gap" />
      </NFormItem>
    </div>

    <NFormItem label="标签设置">
      <NSwitch v-model:value="meta.showLabel">
        <template #checked>显示</template>
        <template #unchecked>隐藏</template>
      </NSwitch>
    </NFormItem>

    <NFormItem label="操作事件设置">
      <XmTabsEditor v-model="formModel.tabs" :options="action" />
    </NFormItem>
  </NForm>
</template>
