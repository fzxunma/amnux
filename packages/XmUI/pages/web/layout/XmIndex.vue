<script setup>
import { h, ref, computed } from "vue"
import XmLayoutRenderer from '/render/XmLayoutRenderer.js'
import { XmLayoutRegistryInstance } from '/render/XmLayoutMap.js'
import { useCounterStore } from '/store/counter.js'

const counter = useCounterStore()
const currentSlide = ref(0)

const hDiv = () =>
  h(
    "div",
    {
      class: "mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer",
      onClick: counter.increment
    },
    `Count: ${counter.count}`
  )

const layoutList = computed(() => XmLayoutRegistryInstance.getAll())
const isVisible = (index) => index === currentSlide.value
</script>

<template>
  <n-carousel :current-index="currentSlide" @update:current-index="val => currentSlide = val" effect="card" show-arrow
    draggable style="height: 240px" prev-slide-style="transform: translateX(-150%) translateZ(-800px);"
    next-slide-style="transform: translateX(50%) translateZ(-800px);">
    <n-carousel-item v-for="(layout, index) in layoutList" :key="layout.id" :style="{ width: '60%' }"
      class="bg-gray-100 ">
      <div class="text-center">{{ layout.title + '[' + layout.id + ']' }}</div>
      <XmLayoutRenderer :layoutId="layout.id" :slotsMap="{
        XmLayoutHeader: hDiv,
        XmLayoutFooter: hDiv
      }" />
    </n-carousel-item>
  </n-carousel>

  <div class="mt-4 text-center">
    当前 slide: {{ currentSlide + 1 }} / {{ layoutList.length }}
  </div>
</template>
