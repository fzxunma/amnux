<script setup>
import { ref,computed } from 'vue'
import {
    NButton, NList, NListItem, NForm, NFormItem, NInput, NSelect, NSwitch, NDivider
} from 'naive-ui'
import { VueDraggable } from 'vue-draggable-plus'
import XmLowCodeUI from '/render/XmLowCodeUI.js'
import { types, categoryTypes, DatePickerTypes, uploadTypes } from '/store/XmMetaDefault'

const props = defineProps({
    meta: { type: Object, required: true },
    editMode: { type: Boolean, default: true },
    currentGroupType: { type: String, default: 'tab' }
})

// 接收父组件传递的逻辑方法
const emit = defineEmits(['add-field', 'remove-field'])

// 使用 defineModel 或 inject 也可以，这里为了解耦简单使用 props 传递 reactive 对象
// 注意：selectedField 需要双向绑定，或者由父组件管理，这里我们假设父组件传进来 ref
const selectedField = defineModel('selectedField')

function addOption() {
    if (!selectedField.value) return
    if (!selectedField.value.options) selectedField.value.options = []
    selectedField.value.options.push({ label: '', value: '' })
}

function removeOption(idx) {
    if (!selectedField.value?.options) return
    selectedField.value.options.splice(idx, 1)
}

</script>

<template>
    <!-- 编辑模式 -->
    <div v-if="editMode" class="flex gap-4 h-[600px]">
        <!-- 左侧：字段列表 -->
        <div class="w-1/4 border rounded flex flex-col">
            <div class="p-2 border-b ">
                <NButton block dashed @click="$emit('add-field')">
                    + 添加字段
                </NButton>
            </div>
            <div class="flex-1 overflow-auto p-2">
                <NList hoverable clickable>
                    <VueDraggable v-model="meta.fields" item-key="key" :animation="150" handle=".drag-handle">
                        <NListItem v-for="(element, index) in meta.fields" :key="element.key"
                            @click="selectedField = element" class="cursor-pointer" :class="{ 'selected-field': selectedField === element   }">

                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-2">
                                    <span class="drag-handle cursor-move opacity-50">☰</span>
                                    <span class="truncate">{{ element.label || '未命名' }}</span>
                                </div>
                                <NButton size="tiny" text type="error" @click.stop="$emit('remove-field', index)">
                                    ×</NButton>
                            </div>
                        </NListItem>
                    </VueDraggable>
                </NList>
            </div>
        </div>

        <!-- 右侧：属性编辑 -->
        <div class="flex-1 border rounded p-4 overflow-auto ">
            <template v-if="selectedField">
                <NForm label-placement="top" size="small">
                    <div class="grid grid-cols-2 gap-4">
                        <NFormItem label="字段 Label">
                            <NInput v-model:value="selectedField.label" />
                        </NFormItem>
                        <NFormItem label="绑定 Key">
                            <NInput v-model:value="selectedField.key" />
                        </NFormItem>
                        <NFormItem label="组件类型">
                            <NSelect v-model:value="selectedField.type" :options="types" />
                        </NFormItem>
                        <NFormItem label="分组">
                            <NInput v-model:value="selectedField.group" />
                        </NFormItem>
                        <NFormItem label="是否必填">
                            <NSwitch v-model:value="selectedField.required" @update:value="val => {
                                if (val && !selectedField.validateTrigger) selectedField.validateTrigger = 'both'
                            }">
                                <template #checked>必填</template>
                                <template #unchecked>不必填</template>
                            </NSwitch>
                        </NFormItem>
                        <NFormItem label="是否显示">
                            <NSwitch v-model:value="selectedField.show" />
                        </NFormItem>
                    </div>

                    <NFormItem v-if="currentGroupType === 'table'" label="是否分页">
                        <NSwitch v-model:value="meta.enablePagination" />
                    </NFormItem>

                    <NDivider v-if="['category', 'DatePicker', 'upload'].includes(selectedField.type)" />

                    <!-- 类型特定配置 -->
                    <NFormItem v-if="selectedField.type === 'category'" label="选择器模式">
                        <NSelect v-model:value="selectedField.categoryType" :options="categoryTypes" />
                    </NFormItem>
                    <NFormItem v-if="selectedField.type === 'DatePicker'" label="日期模式">
                        <NSelect v-model:value="selectedField.DatePickerTypes" :options="DatePickerTypes" />
                    </NFormItem>
                    <NFormItem v-if="selectedField.type === 'upload'" label="上传模式">
                        <NSelect v-model:value="selectedField.uploadTypes" :options="uploadTypes" />
                    </NFormItem>

                    <!-- 选项配置 -->
                    <template v-if="['category', 'transfer', 'thing'].includes(selectedField.type)">
                        <NDivider>固定选项配置</NDivider>
                        <div class="space-y-2">
                            <div v-for="(opt, idx) in selectedField.options || []" :key="idx"
                                class="flex gap-2 items-center">
                                <NInput v-model:value="opt.label" placeholder="名" />
                                <NInput v-model:value="opt.value" placeholder="值" />
                                <NButton size="small" type="error" ghost @click="removeOption(idx)">-</NButton>
                            </div>
                            <NButton dashed size="small" @click="addOption">+ 添加选项</NButton>
                        </div>
                    </template>
                </NForm>
            </template>
            <div v-else class="h-full flex items-center justify-center text-gray-400">
                请在左侧选择一个字段进行编辑
            </div>
        </div>
    </div>

    <!-- 预览模式 -->
    <div v-else class="border rounded p-4 bg-white min-h-[300px]">
        <XmLowCodeUI :meta="meta" :model-value="meta.data || {}" />
    </div>
</template>
<style scoped>
.selected-field {
  color: var(--primary-color);
  font-weight: 600;                 /* 可選：加粗更明顯 */
  background-color: rgba(24, 144, 255, 0.08); /* 可選：淺藍底 */
  transition: all 0.3s var(--cubic-bezier-ease-in-out);
}
</style>