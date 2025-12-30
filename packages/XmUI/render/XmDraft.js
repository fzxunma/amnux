// XmDraft.js
import { watch } from 'vue'

/**
 * 自动草稿保存
 * @param {String} key localStorage key
 * @param {Object} formModel reactive 表单数据
 * @param {Function} saveFn 后端保存函数 (可选)
 */
export function useDraft(key, formModel, saveFn) {
  const draftKey = `xm_draft_${key}`

  // 恢复草稿
  const stored = localStorage.getItem(draftKey)
  if (stored) {
    try {
      const data = JSON.parse(stored)
      Object.keys(data).forEach(k => (formModel[k] = data[k]))
    } catch (e) {
      console.warn('草稿恢复失败', e)
    }
  }

  // 自动保存
  watch(
    formModel,
    val => {
      localStorage.setItem(draftKey, JSON.stringify(val))
      saveFn?.(val) // 后端保存
    },
    { deep: true }
  )
}
