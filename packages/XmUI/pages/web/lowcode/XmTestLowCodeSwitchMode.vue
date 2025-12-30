<script setup>
import { onMounted, ref, computed, nextTick } from 'vue'
import XmLowCodeUI from './XmLowCodeUI.js'

const formData = ref({})
const currentGroupType = ref('step')  // 默认 step 模式

const baseMeta = {
  fields: [
    { key: 'name', label: '姓名', type: 'XmInput', placeholder: '请输入姓名', clearable: true, group: '基本信息' },
    { key: 'age', label: '年龄', type: 'XmInputNumber', min: 0, max: 120, group: '基本信息' },
    { key: 'gender', label: '性别', type: 'category', categoryType: 'single', options: [
      { label: '男', value: 'M' }, { label: '女', value: 'F' }
    ], placeholder: '请选择性别', group: '基本信息' },
    { key: 'hobbies', label: '爱好', type: 'category', categoryType: 'multi', options: [
      { label: '篮球', value: 'basketball' }, { label: '足球', value: 'football' }, { label: '游泳', value: 'swimming' }
    ], group: '兴趣爱好' },
    { key: 'department', label: '部门', type: 'category', categoryType: 'tree', treeOptions: [
      { label: '研发', key: 'dev', children: [{ label: '前端', key: 'fe' }, { label: '后端', key: 'be' }] },
      { label: '产品', key: 'pm' }
    ], multiple: true, group: '兴趣爱好' },
    { key: 'skills', label: '技能', type: 'transfer', options: [
      { key: 'js', label: 'JavaScript' }, { key: 'ts', label: 'TypeScript' },
      { key: 'vue', label: 'Vue' }, { key: 'react', label: 'React' }
    ], titles: ['可选技能','已选技能'], group: '兴趣爱好' }
  ],
  mode: 'form',
  showActions: true,
  actions: [
    { key: 'reset', label: '重置' },
    { key: 'submit', label: '提交', type: 'success' }
  ]
}

const computedMeta = computed(() => ({
  ...baseMeta,
  groupType: currentGroupType.value
}))

// ==================== 自动修改字段 ====================
function simulateFieldChange() {
  formData.value.name = '张三'
  formData.value.age = 28
  formData.value.gender = 'M'
  formData.value.hobbies = ['basketball', 'swimming']
  formData.value.department = ['fe', 'be']
  formData.value.skills = ['js', 'vue']
}

// ==================== 打印 localStorage ====================
function printLocalStorage() {
  const saved = localStorage.getItem('testLowCodeSwitch')
  console.log('localStorage:', saved)
}

// ==================== 自动切换 Step / Tab ====================
async function autoTest() {
  console.log('开始自动化测试')

  const modes = ['step', 'tab', 'default']
  for (const mode of modes) {
    currentGroupType.value = mode
    console.log('切换模式:', mode)
    await nextTick()

    // Step 模式自动遍历步骤
    if (mode === 'step') {
      const steps = [...new Set(baseMeta.fields.map(f => f.group || '_default'))]
      for (let i = 0; i < steps.length; i++) {
        console.log('切换到 Step:', i, steps[i])
        // 设置 step
        document.querySelectorAll('.n-steps-item')[i]?.click()
        await nextTick()
        simulateFieldChange()
        await nextTick()
        printLocalStorage()
        // 自动点击提交按钮
        document.querySelectorAll('button').forEach(btn => {
          if (btn.innerText.includes('提交')) btn.click()
        })
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    // Tab 模式自动切换每个 Tab
    else if (mode === 'tab') {
      const tabs = [...new Set(baseMeta.fields.map(f => f.group || '_default'))]
      for (let i = 0; i < tabs.length; i++) {
        console.log('切换到 Tab:', i, tabs[i])
        document.querySelectorAll('.n-tabs-tab')[i]?.click()
        await nextTick()
        simulateFieldChange()
        await nextTick()
        printLocalStorage()
        document.querySelectorAll('button').forEach(btn => {
          if (btn.innerText.includes('提交')) btn.click()
        })
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    // 默认 form 模式
    else {
      simulateFieldChange()
      await nextTick()
      printLocalStorage()
      document.querySelectorAll('button').forEach(btn => {
        if (btn.innerText.includes('提交')) btn.click()
      })
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }

  console.log('自动化测试完成')
}

// 自动运行
onMounted(() => {
  autoTest()
})
</script>
