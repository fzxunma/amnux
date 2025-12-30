// XmCardListRenderer.js
import { h, computed } from 'vue'
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
    console.log('XmCardListRenderer props.modelValue:', props.modelValue)
    return () => h('div', {},
      props.modelValue.flatMap(record =>
        groupNames.value.map(g => {
          const fieldsInGroup = groupMap.value[g] || []
          if (!fieldsInGroup.length) return null
          const cardTitle = g !== '_default' ? g : (props.showDefaultGroupTitle ? '默认分组' : null)
          return h(NCard, { title: cardTitle, class: 'mb-4' }, () =>
            fieldsInGroup.map(f => h('div', {}, record[f.key]))
          )
        }).filter(Boolean)
      )
    )
  }
}
