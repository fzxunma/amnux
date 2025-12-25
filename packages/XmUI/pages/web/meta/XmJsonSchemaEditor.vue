<script setup>
import { reactive, watch } from 'vue'
import { NInput, NSelect, NButton, NCheckbox, NCollapse, NCollapseItem } from 'naive-ui'

defineOptions({ name: 'XmJsonSchemaEditor' })

const props = defineProps({
  modelValue: { type: Object, required: true }
})
const emit = defineEmits(['update:modelValue'])

const schema = reactive({})

watch(
  () => props.modelValue,
  v => Object.assign(schema, JSON.parse(JSON.stringify(v || {}))),
  { immediate: true }
)

watch(
  schema,
  v => emit('update:modelValue', JSON.parse(JSON.stringify(v))),
  { deep: true }
)

const typeOptions = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔', value: 'boolean' },
  { label: '对象', value: 'object' },
  { label: '数组', value: 'array' }
]

const ensureObject = () => {
  schema.type = 'object'
  schema.properties ||= {}
  schema.required ||= []
}

const addProp = () => {
  ensureObject()
  const key = `field_${Date.now()}`
  schema.properties[key] = { type: 'string' }
}
</script>
<template>
  <n-collapse default-expanded-names="root">
    <n-collapse-item name="root" title="参数结构">

      <div style="display:flex;gap:8px;margin-bottom:8px">
        <n-select v-model:value="schema.type" :options="typeOptions" />
        <n-input v-model:value="schema.title" placeholder="标题" />
      </div>

      <!-- object -->
      <template v-if="schema.type === 'object'">
        <n-button size="small" @click="addProp">+ 添加字段</n-button>

        <div
          v-for="(child, key) in schema.properties"
          :key="key"
          style="margin-top:12px;padding-left:12px;border-left:2px solid #eee"
        >
          <div style="display:flex;gap:6px;align-items:center">
            <n-input v-model:value="child.title" placeholder="字段名" />
            <n-checkbox
              :checked="schema.required?.includes(key)"
              @update:checked="v => {
                schema.required ||= []
                v
                  ? schema.required.push(key)
                  : schema.required = schema.required.filter(i => i !== key)
              }"
            >
              必填
            </n-checkbox>
          </div>

          <xm-json-schema-editor
            v-model="schema.properties[key]"
          />
        </div>
      </template>

      <!-- array -->
      <template v-else-if="schema.type === 'array'">
        <strong>数组元素</strong>
        <xm-json-schema-editor v-model="schema.items" />
      </template>

    </n-collapse-item>
  </n-collapse>
</template>

