import { ref, h } from 'vue'
import { NSteps, NStep, NButton } from 'naive-ui'

export function renderStep({
  groupNames,
  groupMap,
  renderFields,
  onSubmit,
  emit
}) {
  const activeStep = ref(0)

  const current = groupNames[activeStep.value]

  return h('div', {}, [
    h(
      NSteps,
      { current: activeStep.value },
      () => groupNames.map(g => h(NStep, { title: g }))
    ),
    renderFields(groupMap.get(current)),
    h('div', { class: 'flex justify-center gap-2 mt-4' }, [
      activeStep.value > 0 &&
        h(NButton, {
          onClick: () => {
            activeStep.value--
            emit('stepChange', activeStep.value)
          }
        }, () => '上一步'),
      activeStep.value < groupNames.length - 1
        ? h(NButton, {
            type: 'primary',
            onClick: () => {
              activeStep.value++
              emit('stepChange', activeStep.value)
            }
          }, () => '下一步')
        : h(NButton, {
            type: 'success',
            onClick: onSubmit
          }, () => '提交')
    ])
  ])
}
