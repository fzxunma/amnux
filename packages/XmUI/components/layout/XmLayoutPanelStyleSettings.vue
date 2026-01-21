<script setup>
import { defineProps } from 'vue'
import { NForm, NFormItem, NSwitch } from 'naive-ui'

const props = defineProps({
    meta: { type: Object, required: true }
})
</script>

<template>
    <NForm label-placement="left" label-width="auto">
        <NFormItem label="分组样式">
            <NSwitch v-model:value="meta.vertical">
                <template #checked>有竖线</template>
                <template #unchecked>无竖线</template>
            </NSwitch>
            <NSwitch v-model:value="meta.border">
                <template #checked>有边框</template>
                <template #unchecked>无边框</template>
            </NSwitch>
        </NFormItem>
    </NForm>
</template>
