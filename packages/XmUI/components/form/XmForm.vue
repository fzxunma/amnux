<script setup>
import { createViewAdapter } from '/render/XmViewAdapter.js'
import renderMeta from '/render/XmMetaRenderer.js'
import XmBreadcrumbRenderer from '/render/XmBreadcrumbRenderer.js'
import { xmMeta } from './xm-meta'

const view = createViewAdapter(xmMeta)

view.list = [
  { username: 'tom', role: 'admin', enable: true },
  { username: 'jack', role: 'user', enable: false }
]
</script>

<template>
  <div class="app-root">
    <XmBreadcrumbRenderer :ctx="view" />
    <!-- Meta Renderer 作为函数调用 -->
    <component :is="() => renderMeta(view.current, view)" />
  </div>
</template>