// XmFormDataMode.js
import { ref, computed } from 'vue'

export function useXmDataMode(meta, props) {
  const mode = ref('form') // form / table
  const dataList = ref(props.data || [])

  const currentData = computed(() => {
    if (mode.value === 'form') return meta.data
    return dataList.value
  })

  function switchMode(m) {
    mode.value = m
  }

  return {
    mode,
    switchMode,
    currentData,
    dataList
  }
}
