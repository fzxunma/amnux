import { reactive, watch } from 'vue'

export function useXmFormModel(props, emit) {
  const formModel = reactive({})
  const meta = props.meta

  function initModel() {
    meta.data ||= {}
    meta.fields?.forEach(f => {
      const v =
        meta.data[f.key] ??
        props.modelValue?.[f.key] ??
        f.default ??
        null

      formModel[f.key] = v
      meta.data[f.key] = v
    })
  }

  initModel()

  /** formModel → meta.data（永不丢） */
  watch(
    formModel,
    v => {
      Object.keys(v).forEach(k => (meta.data[k] = v[k]))
      emit('update:modelValue', { ...meta.data })
    },
    { deep: true }
  )

  /** 外部 modelValue → formModel */
  watch(
    () => props.modelValue,
    v => {
      if (!v) return
      Object.keys(v).forEach(k => {
        if (k in formModel) formModel[k] = v[k]
      })
    },
    { deep: true }
  )

  function updateField(field, value) {
    formModel[field.key] = value
    meta.data[field.key] = value
    field.onChange?.(value, meta.data)
  }

  return {
    formModel,
    updateField,
    initModel
  }
}
