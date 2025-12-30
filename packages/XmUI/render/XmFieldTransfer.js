// XmFieldTransfer.js
import { h } from 'vue'
import { NTransfer } from 'naive-ui'

export function renderTransferField(f, formModel, updateField) {
  return h(NTransfer, {
    value: Array.isArray(formModel[f.key]) ? formModel[f.key] : [],
    options: f.options || [],
    titles: f.titles || ['可选', '已选'],
    filterable: f.filterable ?? true,
    'onUpdate:value': v => updateField(f, v)
  })
}
