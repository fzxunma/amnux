// XmInterpreterShell.js
import { h } from 'vue'

export default {
  name: 'XmInterpreterShell',

  inheritAttrs: false,

  props: {
    /**
     * 渲染函数
     * () => VNode | VNode[]
     */
    render: {
      type: Function,
      required: true
    },

    /**
     * 可选：容器标签
     */
    as: {
      type: String,
      default: 'div'
    }
  },

  setup(props, { attrs }) {
    console.log( props.as,attrs.class,attrs.style);
    return () =>
      h(
        props.as,
        {
          class: [attrs.class],
          style: attrs.style,
          ...attrs
        },
        props.render()
      )
  }
}
