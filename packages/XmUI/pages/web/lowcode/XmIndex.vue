<script setup>
import { reactive, ref, watch } from 'vue'
import XmLowCodeUI from '/render/XmLowCodeUI.js'

const currentGroupType = ref('default')
const meta = reactive({
  fields: [
    { key: 'name', label: '姓名', type: 'XmInput', editable: false, placeholder: '请输入姓名', clearable: true, group: '基本信息' },
    { key: 'age', label: '年龄', type: 'XmInputNumber', min: 0, max: 120, group: '基本信息' },
    {
      key: 'gender',
      label: '性别',
      type: 'category',
      categoryType: 'single',
      options: [
        { label: '男', value: 'M' },
        { label: '女', value: 'F' }
      ],
      placeholder: '请选择性别',
      group: '基本信息'
    },
    {
      key: 'hobbies',
      label: '爱好',
      type: 'category',
      categoryType: 'multi',
      options: [
        { label: '篮球', value: 'basketball' },
        { label: '足球', value: 'football' },
        { label: '游泳', value: 'swimming' }
      ],
      group: '兴趣爱好'
    },
    {
      key: 'department',
      label: '部门',
      type: 'category',
      categoryType: 'tree',
      treeOptions: [
        { label: '研发', key: 'dev', children: [{ label: '前端', key: 'fe' }, { label: '后端', key: 'be' }] },
        { label: '产品', key: 'pm' }
      ],
      multiple: true,
      group: '兴趣爱好'
    },
    {
      key: 'skills',
      label: '技能',
      type: 'transfer',
      options: [
        { key: 'js', label: 'JavaScript' },
        { key: 'ts', label: 'TypeScript' },
        { key: 'vue', label: 'Vue' },
        { key: 'react', label: 'React' }
      ],
      titles: ['可选技能', '已选技能'],
      group: '兴趣爱好'
    }
  ],
  mode: 'form',
  showActions: true,
  actions: [
    { key: 'reset', label: '重置' },
    { key: 'submit', label: '提交', type: 'success' }
  ],
  data: [
    { name: '张三', age: 28, gender: '男' },
    { name: '李四', age: 32, gender: '女' }
  ],
  groupType: 'table',
  mode: 'form'
})

watch(currentGroupType, (val) => {
  if (val === 'cardlist') {
    meta.mode = 'cardlist'
  } else if (val === 'card') {
    meta.mode = 'card'
  } else if (val === 'table') {
    meta.mode = 'table'
  } else {
    meta.mode = 'form'
    meta.groupType = val
  }
})
const groupTypeOptions = [
  { label: 'Step 模式', value: 'step' },
  { label: 'Tab 模式', value: 'tab' },
  { label: '普通 Form 模式', value: 'default' },
  { label: 'Table 模式', value: 'table' },
  { label: 'Card 模式', value: 'card' },
  { label: 'CardList 模式', value: 'cardlist' }
]
</script>

<template>
  <n-layout class="h-screen">
    <div style="margin-bottom: 20px;">
      <label>选择模式: </label>
      <n-select v-model:value="currentGroupType" :options="groupTypeOptions" placeholder="请选择模式">
      </n-select>
    </div>
    <XmLowCodeUI :meta="meta" :model-value="meta.data" />
  </n-layout>
</template>