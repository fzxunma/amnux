// XmBreadcrumbRenderer.js
import { h } from 'vue'

export default {
  name: 'XmBreadcrumbRenderer',
  props: {
    meta: Object,
    ctx: Object
  },

  setup(props) {
    return () =>
      h(
        'div',
        { class: 'xm-breadcrumb' },
        props.ctx.path.map((node, idx) =>
          h(
            'span',
            {
              class: 'xm-breadcrumb-item',
              onClick: () => props.ctx.jumpTo(idx)
            },
            node.label
          )
        )
      )
  }
}
