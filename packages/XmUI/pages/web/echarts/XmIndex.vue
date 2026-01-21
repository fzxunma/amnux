<script setup>
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import { echarts } from 'echarts'

const props = defineProps({
    option: {
        type: Object,
        required: true
    }
})

const chartRef = ref(null)
let chartInstance = null
let ro = null
function tryInit() {
    if (!chartRef.value) return
    const { clientWidth, clientHeight } = chartRef.value
    if (!clientWidth || !clientHeight) return

    if (!chartInstance) {
        chartInstance = echarts.init(chartRef.value)
    }
    chartInstance.setOption(props.option)
}

onMounted(() => {
    ro = new ResizeObserver(() => {
        tryInit()
        chartInstance?.resize()
    })
    ro.observe(chartRef.value)
})

onBeforeUnmount(() => {
    ro?.disconnect()
    chartInstance?.dispose()
})

watch(
    () => props.option,
    (val) => {
        chartInstance?.setOption(val, true)
    }
)
</script>

<template>
<div ref="chartRef" class="w-full h-full min-h-0"></div>
</template>
