import { defineComponent, h, computed } from 'vue'
import { XmLayoutComponentMap, XmLayoutRegistryInstance } from './XmLayoutMap'

export default defineComponent({
    name: 'XmLayoutRenderer',

    props: {
        layoutId: {
            type: String,
            required: true
        },
        slotsMap: { type: Object, default: () => ({}) } // { header: fn, footer: fn, sider: fn }
    },

    setup(props) {
        // 根据 layoutId 获取 meta
        const layoutMeta = computed(() => {
            const meta = XmLayoutRegistryInstance.get(props.layoutId)
            if (!meta) console.warn(`Layout meta not found for id: ${props.layoutId}`)
            return meta
        })

        function renderNode(node) {
            if (!node || node.show === false) return null

            const comp = XmLayoutComponentMap[node.type]
            if (!comp) return null

            const childSlots = {}

            // 递归渲染子节点
            if (Array.isArray(node.children) && node.children.length) {
                childSlots.default = () =>
                    node.children.map(renderNode).filter(Boolean)
            }

            // slotsMap 覆盖任意层级节点
            const slotFn = props.slotsMap[node.type] || node.slots?.default
            if (slotFn) {
                childSlots.default = () => {
                    const result = typeof slotFn === 'function' ? slotFn() : slotFn
                    return typeof result === 'string' ? h('div', result) : result
                }
            }

            return h(comp, node.props || {}, childSlots)
        }


        return () => {
            if (!layoutMeta.value) return null
            return renderNode(layoutMeta.value)
        }
    }
})
