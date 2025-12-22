// XmFormRenderer.js
import {
  reactive,
  watch,
  provide,
  h
} from 'vue'

import XmFieldRenderer from './XmFieldRenderer.js'
import { createExprContext } from './XmExpr.js'

export default {
  name: 'XmFormRenderer',

  props: {
    meta: Object,
    modelValue: Object
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const formModel = reactive({})

    // 初始化字段
    props.meta.fields.forEach(field => {
      formModel[field.key] =
        props.modelValue?.[field.key] ??
        field.default ??
        null
    })

    // Expr 上下文
    const exprCtx = createExprContext(formModel)

    provide('xmFormCtx', {
      formModel,
      exprCtx
    })

    watch(
      formModel,
      v => emit('update:modelValue', { ...v }),
      { deep: true }
    )

    return () =>
      h(
        'div',
        {
          class: [
            'xm-form',
            `layout-${props.meta.layout || 'vertical'}`
          ]
        },
        props.meta.fields.map(field =>
          h(XmFieldRenderer, {
            key: field.key,
            field,
            modelValue: formModel[field.key],
            'onUpdate:modelValue': v => {
              formModel[field.key] = v
            }
          })
        )
      )
  }
}
