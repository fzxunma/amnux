// XmTreeRenderer.js
import { h } from 'vue'

export default {
  name: 'XmTreeRenderer',
  props: {
    meta: Object,
    ctx: Object
  },

  setup(props) {
    const renderNode = node =>
      h(
        'div',
        {
          class: 'xm-tree-node',
          onClick: () => {
            props.ctx.selectPath(node)
          }
        },
        [
          h('span', node.label),
          node.children?.map(renderNode)
        ]
      )

    return () =>
      h(
        'div',
        { class: 'xm-tree' },
        renderNode(props.meta)
      )
  }
}
