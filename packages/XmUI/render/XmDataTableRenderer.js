// XmDataTableRenderer.js
import { h, computed } from 'vue'
import { NDataTable } from 'naive-ui'
import { createGroupMap, getGroupNames } from './XmFormUtils.js'

export default {
    name: 'XmDataTableRenderer',
    props: {
        meta: { type: Object, default: () => ({ fields: [], data: [] }) },
        modelValue: { type: Array, default: () => [] }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        // metaFields
        const metaFields = computed(() => props.meta.fields || [])

        // 分组映射（用对象代替 Map）
        const groupMap = computed(() => createGroupMap(metaFields.value))
        const groupNames = computed(() => getGroupNames(groupMap.value))

        return () => {
            const nodes = []

            groupNames.value.forEach(g => {
                const fieldsInGroup = groupMap.value[g] || []
                if (!fieldsInGroup.length) return

                // 分组标题
                if (g !== '_default') {
                    nodes.push(h('div', { class: 'font-bold my-2' }, g))
                }

                // 当前分组的列
                const columns = fieldsInGroup.map(f => ({
                    title: f.label,
                    key: f.key,
                    render: f.render ? row => f.render(row[f.key], row) : undefined
                }))

                nodes.push(
                    h(NDataTable, {
                        columns,
                        data: props.modelValue,
                        singleLine: false
                    })
                )
            })

            return h('div', nodes)
        }
    }
}
