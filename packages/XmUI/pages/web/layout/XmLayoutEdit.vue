<script setup>
import { ref, computed } from 'vue'

import XmFormRenderer from '/render/XmFormRenderer.js'
import XmLayoutRenderer from '/render/XmLayoutRenderer.js'

import { XmLayoutEditFormMeta } from '/render/XmLayoutEditFormMeta'
import { XmLayout3_h_scs_f_base, createLayoutMeta } from '/render/XmLayoutMap.js'

// 表单模型（由 XmFormRenderer 维护）
const formModel = ref({})

// 根据表单模型 → 动态生成 Layout Meta
const layoutMeta = computed(() => {
  if (!formModel.value) return null

  const overrideProps = {
    XmLayoutHeader: {
      style: { height: formModel.value.headerHeight + 'px' }
    },
    XmLayoutSiderLeft: {
      width: formModel.value.leftSiderWidth
    },
    XmLayoutSiderRight: {
      width: formModel.value.rightSiderWidth
    },
    XmLayoutContent: {
      contentStyle: { padding: formModel.value.contentPadding + 'px' }
    },
    XmLayoutFooter: {
      style: { height: formModel.value.footerHeight + 'px' }
    }
  }

  const overrideSlots = {
    XmLayoutHeader: () => formModel.value.headerTitle,
    XmLayoutSiderLeft: () => formModel.value.leftSiderTitle,
    XmLayoutSiderRight: () => formModel.value.rightSiderTitle,
    XmLayoutFooter: () => formModel.value.footerTitle
  }

  return createLayoutMeta(
    XmLayout3_h_scs_f_base,
    overrideProps,
    overrideSlots
  )
})
function handleSubmit(data) {
  console.log('提交表单:', data)
}

function handleCancel() {
  console.log('提交表单:', data)
}

function handleReset() {
  console.log('已重置')
}

</script>

<template>
  <div>
    <XmFormRenderer :meta="XmLayoutEditFormMeta" v-model="formModel" @submit="handleSubmit" @cancel="handleCancel"
      @reset="handleReset" />
    <XmLayoutRenderer v-if="layoutMeta" :layoutId="layoutMeta.id" :slotsMap="layoutMeta.slotsMap" />
  </div>
</template>
