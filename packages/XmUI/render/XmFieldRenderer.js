// XmFieldRenderer.js
import {
  computed,
  inject,
  h
} from 'vue'

import { XmFormFieldMap } from './XmFormFieldMap.js'
import { resolveExpr } from './XmExpr.js'

export default {
  name: 'XmFieldRenderer',

  props: {
    field: Object,
    modelValue: null
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const formCtx = inject('xmFormCtx')

    const Comp = computed(() => {
      return XmFormFieldMap[props.field.type]
    })

    const visible = computed(() => {
      return resolveExpr(props.field.visible, formCtx.exprCtx)
    })

    const disabled = computed(() => {
      return resolveExpr(props.field.disabled, formCtx.exprCtx)
    })

    return () => {
      if (!visible.value) return null

      return h(
        'div',
        { class: 'xm-field' },
        [
          h(Comp.value, {
            ...props.field.props,
            disabled: disabled.value,
            value: props.modelValue,
            'onUpdate:value': v =>
              emit('update:modelValue', v)
          })
        ]
      )
    }
  }
}
