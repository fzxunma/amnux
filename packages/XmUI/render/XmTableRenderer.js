// XmTableRenderer.js
import { h } from 'vue'
import { resolveExpr } from './XmExpr.js'

export default {
  name: 'XmTableRenderer',

  props: {
    meta: Object,     // form meta
    data: Array,      // rows
    ctx: Object       // view / expr context
  },

  setup(props) {
    const columns = props.meta.fields.filter(
      f => f.showInTable !== false
    )

    return () =>
      h('table', { class: 'xm-table' }, [
        // thead
        h(
          'thead',
          {},
          h(
            'tr',
            {},
            columns.map(col =>
              h('th', {}, col.label)
            )
          )
        ),

        // tbody
        h(
          'tbody',
          {},
          props.data.map(row =>
            h(
              'tr',
              {},
              columns.map(col => {
                const visible = resolveExpr(
                  col.visible,
                  { ...props.ctx, model: row }
                )
                if (!visible) return h('td')

                const value = row[col.key]

                const content = col.renderCell
                  ? col.renderCell({
                      value,
                      row,
                      ctx: props.ctx
                    })
                  : String(value ?? '')

                return h('td', {}, content)
              })
            )
          )
        )
      ])
  }
}
