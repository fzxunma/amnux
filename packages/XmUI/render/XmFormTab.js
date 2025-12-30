import { ref, h } from 'vue'
import { NTabs, NTabPane, NButton } from 'naive-ui'

export function renderTab({
  groupNames,
  groupMap,
  renderFields,
  formModel,
  emit
}) {
  const activeTab = ref(groupNames[0])

  return h(
    NTabs,
    {
      value: activeTab.value,
      'onUpdate:value': v => (activeTab.value = v)
    },
    () =>
      groupNames.map(g =>
        h(
          NTabPane,
          { name: g },
          {
            tab: () => g,
            default: () => [
              renderFields(groupMap.get(g)),
              h(
                'div',
                { class: 'flex justify-center mt-4' },
                [
                  h(NButton, {
                    type: 'primary',
                    onClick: () =>
                      emit(
                        'submit',
                        Object.fromEntries(
                          groupMap.get(g).map(f => [
                            f.key,
                            formModel[f.key]
                          ])
                        )
                      )
                  }, () => '提交')
                ]
              )
            ]
          }
        )
      )
  )
}
