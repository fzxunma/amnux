// XmFormActions.js
import { h } from 'vue'
import { NButton } from 'naive-ui'

export function renderXmFormActions(meta, init, emit) {
  if (!meta.showActions || !meta.actions?.length) return null

  return h(
    'div',
    { class: 'flex justify-center gap-2 mt-4' },
    meta.actions.map(a =>
      h(
        NButton,
        {
          type: a.type || 'default',
          onClick: () => {
            if (a.key === 'reset') {
              init()
              emit('reset')
            } else if (a.key === 'cancel') {
              emit('cancel')
            } else {
              emit('submit', { ...meta.data })
            }
          }
        },
        () => a.label
      )
    )
  )
}
