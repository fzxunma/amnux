// XmLowCodeUI.js
import { h, reactive, computed, ref, watch } from 'vue'
import XmFormRenderer from './XmFormRenderer.js'
import XmDataTableRenderer from './XmDataTableRenderer.js'
import XmCardRenderer from './XmCardRenderer.js'
import XmCardListRenderer from './XmCardListRenderer.js'

export default {
  name: 'XmLowCodeUI',
  props: {
    meta: { type: Object, default: () => ({ fields: [], data: {}, mode: 'form' }) },
    modelValue: { type: [Object, Array], default: () => ({}) },
    autoSave: { type: Boolean, default: true },
    localStorageKey: { type: String, default: '' }
  },
  emits: ['update:modelValue', 'submit', 'reset', 'cancel', 'stepChange', 'autoSave'],
  setup(props, { emit }) {
    // ========== form 状态 ==========
    const formModel = reactive({
      ...props.meta.data,
      ...(Array.isArray(props.modelValue) ? {} : props.modelValue)
    })

    const metaFields = computed(() => props.meta.fields || [])
    const mode = ref(props.meta.mode || 'default')
    const activeTab = ref('')
    const activeStep = ref(0)

    // 响应式 table / cardlist 数据
    const tableData = computed(() =>
      Array.isArray(props.modelValue) ? props.modelValue : [formModel]
    )

    // ========== 初始化表单 ==========
    function initModel() {
      if (!Array.isArray(props.modelValue)) {
        metaFields.value.forEach(f => {
          formModel[f.key] =
            props.modelValue?.[f.key] ??
            props.meta.data?.[f.key] ??
            f.default ??
            null
        })
      }
    }
    initModel()

    // ========== 本地存储 ==========
    function saveToLocalStorage() {
      if (!props.localStorageKey) return
      const saveData = Array.isArray(props.modelValue) ? [...props.modelValue] : { ...formModel }
      if (mode.value === 'tab') saveData._activeTab = activeTab.value
      if (mode.value === 'step') saveData._activeStep = activeStep.value
      localStorage.setItem(props.localStorageKey, JSON.stringify(saveData))
    }

    // ========== watch ==========
    watch(props.modelValue, v => {
      if (Array.isArray(v)) return
      Object.keys(v).forEach(k => k in formModel && (formModel[k] = v[k]))
    }, { deep: true })

    watch(() => props.meta.mode, v => { mode.value = v || 'default' })
    watch(mode, saveToLocalStorage)
    watch(activeTab, saveToLocalStorage)
    watch(activeStep, v => { emit('stepChange', v); saveToLocalStorage() })

    watch(formModel, v => {
      saveToLocalStorage()
      emit('update:modelValue', { ...v })
      if (props.autoSave) emit('autoSave', { ...v })
    }, { deep: true })

    // ========== 渲染 ==========
    return () => {
      switch (mode.value) {
        // 表格模式
        case 'table':
          return h(XmDataTableRenderer, {
            meta: props.meta,
            modelValue: tableData.value,
            'onUpdate:modelValue': v => {
              if (Array.isArray(props.modelValue)) emit('update:modelValue', v)
              else Object.assign(formModel, v[0] || {})
            }
          })

        // 卡片列表模式
        case 'cardlist':
          return h(XmCardListRenderer, {
            meta: props.meta,
            modelValue: tableData.value,
            showDefaultGroupTitle: true
          })
        case 'card':
          return h(XmCardRenderer, {
            meta: props.meta,
            modelValue: tableData.value,
            showDefaultGroupTitle: true
          })

        // Step / Tab / Default 模式
        case 'step':
        case 'tab':
        case 'default':
        default:
          return h(XmFormRenderer, {
            meta: props.meta,
            modelValue: formModel,
            'onUpdate:modelValue': v => Object.assign(formModel, v),
            onSubmit: data => emit('submit', data),
            onReset: () => { initModel(); emit('reset') },
            onCancel: () => emit('cancel'),
            onStepChange: v => activeStep.value = v,
            onAutoSave: data => emit('autoSave', data)
          })
      }
    }
  }
}
