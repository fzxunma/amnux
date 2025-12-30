// XmCardRenderer.js
import { h, computed } from 'vue'
import { NCard, NGrid, NGridItem } from 'naive-ui'
import { createExprContext } from './XmExpr.js'
import { renderFields } from './XmFieldRenderer.js'
import { resolveFieldProps, createGroupMap, getGroupNames } from './XmFormUtils.js'

export default {
  name: 'XmCardRenderer',
  props: {
    meta: { type: Object, default: () => ({ fields: [] }) },
    modelValue: { type: Object, default: () => ({}) },
    showDefaultGroupTitle: { type: Boolean, default: false }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const fields = computed(() => props.meta.fields || [])
    const groupMap = computed(() => createGroupMap(fields.value))
    const groupNames = computed(() => getGroupNames(groupMap.value))
    const exprCtx = createExprContext(props.modelValue)

    return () => {
      const nodes = []

      groupNames.value.forEach(g => {
        const fieldsInGroup = groupMap.value[g] || []
        if (!fieldsInGroup.length) return

        const cardTitle = g !== '_default' ? g : (props.showDefaultGroupTitle ? '默认分组' : null)

        const cardNode = h(NCard, { title: cardTitle, class: 'mb-4' }, () =>
          h(NGrid, { xGap: 16, yGap: 16 }, () =>
            fieldsInGroup.map(f =>
              h(NGridItem, { span: f.span || 12 }, () =>
                renderFields({
                  list: [f],
                  meta: props.meta,
                  formModel: props.modelValue,
                  exprCtx,
                  updateField: (key, val) => emit('update:modelValue', { ...props.modelValue, [key]: val }),
                  resolveFieldProps,
                  readonly: f.editable === false
                })
              )
            )
          )
        )

        nodes.push(cardNode)
      })

      return nodes
    }
  }
}
