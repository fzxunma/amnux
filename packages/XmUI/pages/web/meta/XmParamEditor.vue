<script setup>
import { computed } from 'vue'
import { NInput, NButton } from 'naive-ui'

defineOptions({
  name: 'XmParamEditor'
})

const props = defineProps({
  modelValue: { type: Object, required: true },
})

const emit = defineEmits(['update:modelValue'])

const data = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const addField = () => {
  data.value[`field_${Date.now()}`] = ''
}

const removeField = (key) => {
  delete data.value[key]
}

const toObject = (key) => {
  data.value[key] = {}
}
</script>

<template>
  <div style="border-left:2px solid #eee;padding-left:12px">
    <div
      v-for="(v,k) in data"
      :key="k"
      style="margin-bottom:8px"
    >
      <div style="display:flex;gap:6px;align-items:center">
        <strong style="min-width:80px">{{ k }}</strong>

        <!-- 值是字符串 -->
        <n-input
          v-if="typeof v === 'string'"
          v-model:value="data[k]"
          placeholder="value"
        />

        <!-- 值是对象（递归） -->
        <xm-param-editor
          v-else
          v-model="data[k]"
        />

        <n-button size="tiny" @click="toObject(k)" v-if="typeof v === 'string'">
          +
        </n-button>
        <n-button size="tiny" type="error" @click="removeField(k)">
          ✕
        </n-button>
      </div>
    </div>

    <n-button size="small" @click="addField">+ 子字段</n-button>
  </div>
</template>
