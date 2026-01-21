<script setup>
import { ref, watch } from 'vue'
import { NDynamicInput, NInput, NSwitch, NDropdown, NButton } from 'naive-ui'

const props = defineProps({
  options: { type: Array, default: () => [] },       // 下拉选项
  modelValue: { type: Array, default: () => [] }    // 父组件传入的 tabs 数据
})

const emit = defineEmits(['update:modelValue'])

// 本地维护 tabs，直接用父组件传入的数据
const localValue = ref(props.modelValue.map(t => ({ ...t })))

// 监听父组件传入的 modelValue 更新
watch(() => props.modelValue, (val) => {
  // 不替换数组引用，逐个更新对象内容
  val.forEach((t, i) => {
    if (localValue.value[i]) {
      Object.assign(localValue.value[i], t)
    } else {
      localValue.value.push({ ...t })
    }
  })
  // 多余的行删除
  if (localValue.value.length > val.length) localValue.value.splice(val.length)
}, { deep: true })

// 创建新 Tab / 行
const createTab = () => {
  const newTab = { key: '', label: '', type: '', checked: false, showActions: true }
  localValue.value.push(newTab)
  notifyParent()
  return newTab
}

// 通知父组件更新
const notifyParent = () => {
  emit('update:modelValue', localValue.value.map(t => ({ ...t })))
}

// 下拉显示 label
const getLabel = (key) => {
  const opt = props.options.find(o => o.value === key)
  return opt ? opt.label : (key || '类型')
}
</script>

<template>
  <NDynamicInput v-model:value="localValue" :on-create="createTab" class="w-full">
    <template #default="{ value }">
      <div class="flex gap-2 w-full items-center" :class="{ 'opacity-50': !value.showActions }">
        <!-- 显示开关 -->
        <NSwitch v-model:value="value.checked" style="width:15%" @update:value="notifyParent">
          <template #checked>显示</template>
          <template #unchecked>不显示</template>
        </NSwitch>

        <!-- 配置启用开关 -->
        <NSwitch v-model:value="value.showActions" size="small" @update:value="notifyParent">
          <template #checked>可编辑</template>
          <template #unchecked>不可编辑</template>
        </NSwitch>

        <!-- 按钮名称 -->
        <NInput v-model:value="value.label" placeholder="按钮名称" style="width:25%" :disabled="!value.showActions" @input="notifyParent" />

        <!-- 类型下拉 -->
        <NDropdown :options="props.options" trigger="hover" placement="bottom-start"
                   :disabled="!value.showActions"
                   @select="v => { value.key = v; notifyParent() }">
          <NButton :disabled="!value.showActions">{{ getLabel(value.key) }}</NButton>
        </NDropdown>

        <!-- 路径 -->
        <NInput v-model:value="value.type" placeholder="路径" style="width:40%" :disabled="!value.showActions" @input="notifyParent" />
      </div>
    </template>
  </NDynamicInput>
</template>
