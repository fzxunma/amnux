// XmFormFields.js
import { h } from 'vue'
import { NFormItem, NGrid, NGridItem } from 'naive-ui'
import { renderField } from './XmFieldRenderer.js'

export function renderFields({
  list,
  meta,
  formModel,
  exprCtx,
  updateField,
  resolveFieldProps
}) {
  const renderItem = f => {
    // visible 表达式
    if (typeof f.visible === 'function' && !f.visible(exprCtx)) {
      return null
    }

    const style = f.width
      ? `width:${typeof f.width === 'number' ? f.width + 'px' : f.width}`
      : 'width:100%'

    return h(
      NFormItem,
      {
        key: f.key,
        label: meta.showLabel === false ? '' : f.label,
        showLabel: meta.showLabel ?? true,
        style
      },
      () =>
        h(renderField, {
          field: f,
          modelValue: formModel[f.key],
          'onUpdate:modelValue': v => updateField(f, v),
          ...resolveFieldProps(f, exprCtx)
        })
    )
  }

  // Grid 布局
  if (meta.layout === 'grid') {
    return h(
      NGrid,
      {
        cols: meta.cols || 1,
        xGap: meta.gap ?? 4,
        yGap: meta.gap ?? 4
      },
      () =>
        list.map(f =>
          h(
            NGridItem,
            { key: f.key, span: f.span || 1 },
            () => renderItem(f)
          )
        )
    )
  }

  // 普通布局
  return list.map(renderItem)
}
