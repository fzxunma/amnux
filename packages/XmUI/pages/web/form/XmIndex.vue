<script setup>
import { ref } from 'vue'
import XmMetaView from '/render/XmMetaView.js'
import {userFormMeta} from './XmFormMate.js'

const model = ref({})
</script>

<template>
    <XmMetaView />
    <pre>{{ userFormMeta }}</pre>
</template>