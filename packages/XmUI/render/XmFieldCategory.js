// XmFieldCategory.js
import { h } from 'vue'
import { NSelect, NTreeSelect, NCheckboxGroup, NCheckbox, NRadioGroup, NRadio } from 'naive-ui'

export function renderCategoryField(f, formModel, updateField) {
  const value = formModel[f.key]

  if (f.categoryType === 'single') {
    return h(NSelect, {
      value,
      options: f.options || [],
      placeholder: f.placeholder,
      'onUpdate:value': v => updateField(f, v)
    })
  }

  if (f.categoryType === 'multi') {
    return h(NCheckboxGroup, {
      value: Array.isArray(value) ? value : [],
      'onUpdate:value': v => updateField(f, v)
    }, () =>
      (f.options || []).map(o =>
        h(NCheckbox, { key: o.value, value: o.value }, () => o.label)
      )
    )
  }

  if (f.categoryType === 'tree') {
    return h(NTreeSelect, {
      value: f.multiple ? (Array.isArray(value) ? value : []) : value,
      multiple: !!f.multiple,
      options: f.treeOptions || [],
      'onUpdate:value': v => updateField(f, v)
    })
  }

  return null
}
