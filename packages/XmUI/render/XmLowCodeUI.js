import { h, reactive, computed, ref, watch, nextTick } from 'vue'
import XmFormRenderer from './XmFormRenderer.js'
import XmDataTableRenderer from './XmDataTableRenderer.js'
import XmCardRenderer from './XmCardRenderer.js'
import XmCardListRenderer from './XmCardListRenderer.js'
import XmEChartsRenderer from './XmEChartsRenderer.js'


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
    // 🔥 核心修复 1: 定义一个内部更新标志位
    let isUpdatingInternally = false

    // ========== form 状态 ==========
    // 初始状态深拷贝，断开引用
    const formModel = reactive(JSON.parse(JSON.stringify({
      ...props.meta.data,
      ...(Array.isArray(props.modelValue) ? {} : props.modelValue)
    })))

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
        isUpdatingInternally = true
        try {
          metaFields.value.forEach(f => {
            const val = props.modelValue?.[f.key] ?? props.meta.data?.[f.key] ?? f.default ?? null
            formModel[f.key] = val
          })
        } finally {
          isUpdatingInternally = false
        }
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

    // ========== Watchers ==========

    // 🔥 核心修复 2: Props -> Internal (下行同步)
    watch(() => props.modelValue, (newVal) => {
      if (Array.isArray(newVal)) return

      // 上锁：标记当前正在进行“外部数据同步”
      isUpdatingInternally = true

      try {
        // 智能更新：只更新变化了的字段，减少不必要的触发
        Object.keys(newVal).forEach(k => {
          // 这里可以加一个简单的判等，防止重复赋值
          // 注意：如果字段是对象，引用不同也会触发，这是预期的
          if (formModel[k] !== newVal[k]) {
            formModel[k] = newVal[k]
          }
        })
      } finally {
        // 这里的关键是：必须等待当前同步代码块结束后（如果 watch(formModel) 是 sync 的，它已经跑完了）再解锁
        // 但为了安全起见，我们在 nextTick 解锁，确保这一轮 reactivity 彻底结束
        nextTick(() => {
          isUpdatingInternally = false
        })
      }
    }, { deep: true })

    // 模式切换监听
    watch(() => props.meta.mode, v => { mode.value = v || 'default' })
    watch(mode, saveToLocalStorage)
    watch(activeTab, saveToLocalStorage)
    watch(activeStep, v => { emit('stepChange', v); saveToLocalStorage() })

    // 🔥 核心修复 3: Internal -> Emit (上行通知)
    watch(formModel, (v) => {
      // ⛔️ 如果锁是开着的，说明是 Props 在更新我，绝对不能 Emit，否则死循环
      if (isUpdatingInternally) return

      saveToLocalStorage()

      // 这里的拷贝很重要，防止传出去引用
      emit('update:modelValue', { ...v })

      if (props.autoSave) emit('autoSave', { ...v })
    }, {
      deep: true,
      // ⭐ 关键点：使用 sync 模式
      // 强制这个 watcher 在依赖变更时立即同步执行
      // 这样它就能在 props.modelValue watcher 的 `finally` 解锁之前运行，
      // 从而正确读到 `isUpdatingInternally === true` 并被 return 拦截
      flush: 'sync'
    })

    // ========== 渲染 ==========
    return () => {
      // 渲染逻辑保持不变，但 onUpdate 处理需要注意
      const handleUpdate = (v) => {
        // 这是用户操作触发的更新
        // 我们手动合并到 formModel
        Object.assign(formModel, v)
        // 注意：因为上面修改了 formModel，会触发 watch(formModel)
        // 此时 isUpdatingInternally 是 false，所以会 Emit。这是正确的。
      }

      switch (mode.value) {
        case 'table':
          return h(XmDataTableRenderer, {
            meta: props.meta,
            modelValue: tableData.value,
            'onUpdate:modelValue': v => {
              if (Array.isArray(props.modelValue)) emit('update:modelValue', v)
              else handleUpdate(v[0] || {})
            }
          })

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
        case 'chart':
          return h(XmEChartsRenderer, {
            meta: props.meta,
            modelValue: tableData.value,
            showDefaultGroupTitle: true
          })
          case 'view':
          return h(XmCardListRenderer, {
            meta: props.meta,
            modelValue: tableData.value,
            showDefaultGroupTitle: true
          })
          


        case 'step':
        case 'tab':
        case 'default':
        default:
          return h(XmFormRenderer, {
            meta: props.meta,
            modelValue: formModel,
            'onUpdate:modelValue': handleUpdate,
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
