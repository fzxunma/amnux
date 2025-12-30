// XmFormGroups.js
import { computed, ref, h } from 'vue'
import { NTabs, NTabPane, NSteps, NStep, NButton } from 'naive-ui'

export function useXmFormGroups({
  meta,
  fields,
  renderFields,
  submit,
  stepChange
}) {
  const groupMap = computed(() => {
    const map = new Map()
    fields.forEach(f => {
      const g = f.group || '_default'
      if (!map.has(g)) map.set(g, [])
      map.get(g).push(f)
    })
    return map
  })

  const activeTab = ref('')
  const activeStep = ref(0)

  function render() {
    const names = [...groupMap.value.keys()]
    const mode = meta.groupType || 'default'

    /* -------- tab -------- */
    if (mode === 'tab') {
      if (!activeTab.value) activeTab.value = names[0]

      return h(
        NTabs,
        {
          value: activeTab.value,
          'onUpdate:value': v => (activeTab.value = v)
        },
        () =>
          names.map(g =>
            h(
              NTabPane,
              { name: g },
              {
                tab: () => g,
                default: () => [
                  renderFields(groupMap.value.get(g)),
                  h(
                    'div',
                    { class: 'flex justify-center mt-4' },
                    [
                      h(
                        NButton,
                        {
                          type: 'primary',
                          onClick: () =>
                            submit(
                              Object.fromEntries(
                                groupMap.value
                                  .get(g)
                                  .map(f => [f.key, meta.data[f.key]])
                              )
                            )
                        },
                        () => '提交'
                      )
                    ]
                  )
                ]
              }
            )
          )
      )
    }

    /* -------- step -------- */
    if (mode === 'step') {
      const current = names[activeStep.value]

      return [
        h(
          NSteps,
          { current: activeStep.value },
          () => names.map(g => h(NStep, { title: g }))
        ),
        renderFields(groupMap.value.get(current)),
        h('div', { class: 'flex justify-center gap-2 mt-4' }, [
          activeStep.value > 0 &&
            h(NButton, {
              onClick: () => {
                activeStep.value--
                stepChange(activeStep.value)
              }
            }, () => '上一步'),
          activeStep.value < names.length - 1
            ? h(NButton, {
                type: 'primary',
                onClick: () => {
                  activeStep.value++
                  stepChange(activeStep.value)
                }
              }, () => '下一步')
            : h(NButton, {
                type: 'success',
                onClick: () => submit({ ...meta.data })
              }, () => '提交')
        ])
      ]
    }

    /* -------- default -------- */
    return names.map(g => renderFields(groupMap.value.get(g)))
  }

  return {
    render
  }
}
