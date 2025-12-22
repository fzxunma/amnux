// XmListRenderer.js
import { h } from 'vue'
import { resolveExpr } from './XmExpr.js'

export default {
  name: 'XmListRenderer',

  props: {
    meta: Object,
    data: Array,
    ctx: Object
  },

  setup(props) {
    const fields = props.meta.fields.filter(
      f => f.showInList !== false
    )

    return () =>
      h(
        'div',
        { class: 'xm-list' },
        props.data.map(row =>
          h(
            'div',
            { class: 'xm-list-item' },
            fields.map(field => {
              const visible = resolveExpr(
                field.visible,
                { ...props.ctx, model: row }
              )
              if (!visible) return null

              const value = row[field.key]

              const content = field.renderCell
                ? field.renderCell({
                    value,
                    row,
                    ctx: props.ctx
                  })
                : String(value ?? '')

              return h('div', { class: 'xm-list-field' }, [
                h('label', {}, field.label),
                h('span', {}, content)
              ])
            })
          )
        )
      )
  }
}
