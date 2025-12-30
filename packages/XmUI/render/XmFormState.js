// XmFormState.js
import { reactive, watch } from 'vue'

export function useXmFormState(props, emit) {
  const formModel = reactive({})
  const meta = props.meta
  meta.data ||= {}

  function init(fields) {
    Object.keys(formModel).forEach(k => delete formModel[k])
    fields.forEach(f => {
      const v =
        meta.data[f.key] ??
        props.modelValue?.[f.key] ??
        f.default ??
        null

      formModel[f.key] = v
      meta.data[f.key] = v
    })
  }

  function updateField(field, value) {
    formModel[field.key] = value
    meta.data[field.key] = value
    field.onChange?.(value, meta.data)
  }

  watch(
    formModel,
    v => {
      Object.keys(v).forEach(k => (meta.data[k] = v[k]))
      emit('update:modelValue', { ...meta.data })

      if (meta.autoSave) {
        emit('autoSave', { ...meta.data })
      }
    },
    { deep: true }
  )

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

  return {
    formModel,
    init,
    updateField
  }
}
