<script setup>
import { NInput, NCheckbox } from 'naive-ui'

defineOptions({ name: 'XmJsonValueForm' })

const props = defineProps({
  schema: { type: Object, required: true },
  modelValue: { type: Object, required: true }
})
const emit = defineEmits(['update:modelValue'])

const update = (k, v) => {
  emit('update:modelValue', { ...props.modelValue, [k]: v })
}
</script>
<template>
  <div v-if="schema.type === 'object'">
    <div
      v-for="(child, key) in schema.properties"
      :key="key"
      style="margin-bottom:12px"
    >
      <label>{{ child.title || key }}</label>

      <n-input
        v-if="child.type === 'string'"
        :value="modelValue[key]"
        @update:value="v => update(key, v)"
      />

      <n-input
        v-else-if="child.type === 'number'"
        type="number"
        :value="modelValue[key]"
        @update:value="v => update(key, Number(v))"
      />

      <n-checkbox
        v-else-if="child.type === 'boolean'"
        :checked="modelValue[key]"
        @update:checked="v => update(key, v)"
      />

      <xm-json-value-form
        v-else-if="child.type === 'object'"
        :schema="child"
        :model-value="modelValue[key] || {}"
        @update:model-value="v => update(key, v)"
      />
    </div>
  </div>
</template>
