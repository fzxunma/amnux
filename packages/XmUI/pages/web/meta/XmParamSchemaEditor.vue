<script setup>
import { reactive, nextTick, toRaw } from 'vue'
import { NInput, NSelect, NButton, NCheckbox } from 'naive-ui'
import XmParamSchemaEditor from './XmParamSchemaEditor.vue'

defineOptions({ name: 'XmParamSchemaEditor' })

const props = defineProps({
  modelValue: { type: Object, required: true }
})
const emit = defineEmits(['update:modelValue'])

// rows 只管理展示，expanded 独立，不随 modelValue 重建
const rows = reactive([])

const typeOptions = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔', value: 'boolean' },
  { label: '枚举', value: 'enum' },
  { label: '对象', value: 'object' },
]

// 将 modelValue 转 rows（初始化时用）
const buildRows = (obj) => {
  const result = []
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v && typeof v === 'object' && v.type) {
      const schema = JSON.parse(JSON.stringify(v))
      if (schema.type === 'object') schema.properties ||= {}
      if (schema.type === 'enum') schema.options ||= []
      if (Array.isArray(schema.options)) schema.options = schema.options.join(',')
      result.push({ key: k, schema, expanded: false })
    } else {
      const type = typeof v === 'number' ? 'number' :
                   typeof v === 'boolean' ? 'boolean' : 'string'
      result.push({ key: k, schema: { type, value: v, required: false }, expanded: false })
    }
  })
  return result
}

// 初始化 rows（只初始化一次，保留 expanded）
if (!rows.length) {
  buildRows(props.modelValue).forEach(r => rows.push(r))
}

// 每行修改时同步 modelValue
const updateModel = () => {
  const obj = {}
  rows.forEach(r => {
    if (!r.key) return
    const schemaCopy = { ...toRaw(r.schema) }
    if (schemaCopy.type === 'enum' && typeof schemaCopy.options === 'string') {
      schemaCopy.options = schemaCopy.options.split(',').map(s => s.trim())
    }
    obj[r.key] = schemaCopy
  })
  emit('update:modelValue', obj)
}

// 行操作
const addRow = () => {
  rows.push({ key: '', schema: { type: 'string', required: false }, expanded: true })
}
const removeRow = (i) => {
  rows.splice(i, 1)
  updateModel()
}
const toggle = (row) => row.expanded = !row.expanded

const ensureObject = (row) => {
  row.schema.type = 'object'
  if (!row.schema.properties) {
    nextTick(() => {
      row.schema.properties = {}
      updateModel()
    })
  }
}

// 子组件 v-model 更新
const onChildUpdate = (row, newProperties) => {
  row.schema.properties = newProperties
  updateModel()
}
</script>

<template>
  <div style="border-left:2px solid #eee;padding-left:12px">
    <div v-for="(row,i) in rows" :key="i" style="margin-bottom:8px">
      <!-- 行头 -->
      <div
        style="display:flex;align-items:center;gap:8px;cursor:pointer;background:#fafafa;padding:6px;border-radius:4px;"
        @click="toggle(row)"
      >
        <span style="width:14px">{{ row.expanded ? '▾' : '▸' }}</span>

        <n-input v-model:value="row.key" placeholder="字段名" style="width:120px" @click.stop @input="updateModel" />

        <n-select
          v-model:value="row.schema.type"
          :options="typeOptions"
          style="width:100px"
          @update:value="row.schema.type==='object' && ensureObject(row); updateModel()"
          @click.stop
        />

        <n-checkbox v-model:checked="row.schema.required" @click.stop @update:checked="updateModel()">必填</n-checkbox>

        <n-button size="tiny" type="error" @click.stop="removeRow(i)">✕</n-button>
      </div>

      <!-- 展开内容 -->
      <div v-if="row.expanded" style="margin-left:22px;margin-top:6px">
        <template v-if="row.schema.type === 'string'">
          <n-input v-model:value="row.schema.value" placeholder="值" @input="updateModel" />
        </template>

        <template v-else-if="row.schema.type === 'number'">
          <n-input v-model:value="row.schema.value" type="number" @input="updateModel" />
        </template>

        <template v-else-if="row.schema.type === 'boolean'">
          <n-checkbox v-model:checked="row.schema.value" @update:checked="updateModel()">true</n-checkbox>
        </template>

        <template v-else-if="row.schema.type === 'enum'">
          <n-input
            v-model:value="row.schema.options"
            placeholder="选项，用 , 分隔"
            @blur="row.schema.options = String(row.schema.options).split(','); updateModel()"
          />
          <n-input v-model:value="row.schema.value" placeholder="当前值" style="margin-top:4px" @input="updateModel" />
        </template>

        <template v-else-if="row.schema.type === 'object'">
          <XmParamSchemaEditor
            v-model="row.schema.properties"
            @update:modelValue="onChildUpdate(row, $event)"
          />
        </template>
      </div>
    </div>

    <n-button size="small" @click="addRow">+ 新字段</n-button>
  </div>
</template>
