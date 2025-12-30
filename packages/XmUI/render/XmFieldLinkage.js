// XmFieldLinkage.js
import { watch } from 'vue'

/**
 * @param {Array} fields - 元数据字段数组
 * @param {Object} formModel - reactive 表单数据
 */
export function useFieldLinkage(fields, formModel) {
  fields.forEach(f => {
    if (f.linkage) {
      // linkage = { trigger: 'otherFieldKey', effect: (value, formModel) => {...} }
      const triggerKey = f.linkage.trigger
      watch(
        () => formModel[triggerKey],
        val => f.linkage.effect(val, formModel),
        { immediate: true }
      )
    }
  })
}
