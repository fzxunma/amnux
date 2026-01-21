// XmCardListRenderer.js
import { h, computed, toRaw } from 'vue'
import { NCard } from 'naive-ui'
import { createGroupMap, getGroupNames } from './XmFormUtils.js'

export default {
  name: 'XmCardListRenderer',
  props: {
    meta: { type: Object, default: () => ({ fields: [] }) },
    modelValue: { type: Array, default: () => [] },
    showDefaultGroupTitle: { type: Boolean, default: true }
  },
  setup(props) {
    const fields = computed(() => props.meta.fields || [])
    const groupMap = computed(() => createGroupMap(fields.value))
    const groupNames = computed(() => getGroupNames(groupMap.value))

    return () => {
      // 断开 props.modelValue 响应式引用
      const records = props.modelValue.map(r => ({ ...toRaw(r) }))

      const nodes = records.flatMap(record =>
        groupNames.value.map(group => {
          const fieldsInGroup = groupMap.value[group] || []
          if (!fieldsInGroup.length) return null

          const cardTitle =
            group !== '_default' ? group : (props.showDefaultGroupTitle ? '默认分组' : null)

          return h(NCard, { title: cardTitle, class: 'mb-4' }, () =>
            fieldsInGroup.map(f =>
              h('div', {}, record[f.key] != null ? String(record[f.key]) : '')
            )
          )
        }).filter(Boolean)
      )

      return h('div', {}, nodes)
    }
  }
}
