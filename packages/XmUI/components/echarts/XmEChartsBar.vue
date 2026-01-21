<script setup>
import { ref } from 'vue'
import XmECharts from './XmECharts.vue'

const option = ref({
  tooltip: {},
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      type: 'bar',
      data: [120, 200, 150, 80, 70]
    }
  ]
})
</script>

<template>
  <div class="h-80">
    <XmECharts :option="option" />
  </div>
</template>