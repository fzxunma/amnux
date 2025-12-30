// XmFormRenderer.js
import { h, computed, provide } from 'vue'
import { NForm } from 'naive-ui'

import { createExprContext } from './XmExpr.js'
import { renderFields } from './XmFormFields.js'
import { useXmFormState } from './XmFormState.js'
import { useXmFormGroups } from './XmFormGroups.js'
import { renderXmFormActions } from './XmFormActions.js'
import { createGroupMap, getGroupNames, resolveFieldProps } from './XmFormUtils.js'

export default {
  name: 'XmFormRenderer',
  props: {
    meta: { type: Object, default: () => ({ fields: [], showActions: true, showGroupTitle: true }) },
    modelValue: { type: Object, default: () => ({}) }
  },
  emits: ['update:modelValue','submit','reset','cancel','stepChange','autoSave'],

  setup(props, { emit }) {
    const fields = computed(() => props.meta.fields || [])

    // ========== form 状态 ==========
    const { formModel, init, updateField } = useXmFormState(props, emit)
    init(fields.value)

    const exprCtx = createExprContext(formModel)
    provide('xmFormCtx', { formModel, exprCtx })

    // ========== 分组 ==========
    const groupMap = computed(() => createGroupMap(fields.value))
    const groupNames = computed(() => getGroupNames(groupMap.value))

    // ========== useXmFormGroups (Tab/Step 模式) ==========
    const groups = useXmFormGroups({
      meta: props.meta,
      fields: fields.value,
      renderFields: list => renderFields({ list, meta: props.meta, formModel, exprCtx, updateField, resolveFieldProps }),
      submit: data => emit('submit', data),
      stepChange: v => emit('stepChange', v)
    })

    // ========== 渲染入口 ==========
    return () => {
      const type = props.meta.groupType || 'default'
      const showGroupTitle = props.meta.showGroupTitle !== false

      // Tab / Step 模式
      if (type === 'tab' || type === 'step') {
        return h(NForm, { model: formModel, showLabel: props.meta.showLabel, inline: props.meta.inline }, () => [
          groups.render(),
          props.meta.showActions ? renderXmFormActions(props.meta, () => init(fields.value), emit) : null
        ])
      }

      // Default / Card 模式 → 按组渲染
      return h(NForm, { model: formModel, showLabel: props.meta.showLabel, inline: props.meta.inline }, () => {
        const nodes = []

        groupNames.value.forEach(g => {
          const fieldsInGroup = groupMap.value[g] || []
          if (!fieldsInGroup.length) return

          const groupNode = h('div', { class: 'mb-4 border rounded p-4' }, [
            (showGroupTitle && (g !== '_default' || showGroupTitle)) ? h('div', { class: 'font-bold mb-2' }, g) : null,
            renderFields({ list: fieldsInGroup, meta: props.meta, formModel, exprCtx, updateField, resolveFieldProps })
          ])
          nodes.push(groupNode)
        })

        const actionsNode = props.meta.showActions ? renderXmFormActions(props.meta, () => init(fields.value), emit) : null
        if (actionsNode) nodes.push(actionsNode)

        return nodes
      })
    }
  }
}
