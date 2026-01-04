<script setup>
import { NLayout } from 'naive-ui'
import XmSubIndex from './XmSubIndex.vue'
import XmSubRight from './XmSubRight.vue'
import XmSubSider from './XmSubSider.vue'
</script>
<template>
    <NLayout bordered has-sider>
        <XmSubSider />
        <XmSubIndex />
        <XmSubRight />
    </NLayout>
</template>
