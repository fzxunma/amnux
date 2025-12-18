<script setup>
import { computed } from 'vue'

const props = defineProps({
    node: {
        type: Object,
        required: true
    },
    nodes: {
        type: Array,
        required: true
    }
})

const emit = defineEmits(['update-next'])

/** 防御式访问，杜绝 undefined */
const currentNode = computed(() => props.node ?? null)

/** 下拉选项 */
const nextOptions = computed(() =>
    props.nodes
        .filter(n => n.id !== currentNode.value?.id)
        .map(n => ({
            label: `${n.id} (${n.type})`,
            value: n.id
        }))
)
</script>

<template>
    <div v-if="currentNode">
        <n-card>
            <n-form label-width="100">
                <n-form-item label="ID">
                    <n-input :value="node.id" disabled />
                </n-form-item>

                <n-form-item label="类型">
                    <n-input :value="node.type" disabled />
                </n-form-item>

                <template v-if="node.type === 'task'">
                    <n-form-item label="角色">
                        <n-input v-model:value="node.role" placeholder="审批角色" />
                    </n-form-item>
                </template>

                <template v-if="node.type === 'script'">
                    <n-form-item label="脚本">
                        <n-input type="textarea" v-model:value="node.script" placeholder="JS / DSL" />
                    </n-form-item>
                </template>

                <template v-if="node.type === 'gateway'">
                    <n-form-item label="条件分支">
                        <div v-for="(v, k) in node.cases" :key="k" style="margin-bottom:4px">
                            <n-input v-model:value="node.cases[k]" :placeholder="'条件 ' + k" />
                        </div>
                        <n-button @click="addCase">添加分支</n-button>
                    </n-form-item>
                </template>

                <template v-if="node.type !== 'end'">
                    <n-form-item label="下一节点">
                        <n-select :options="nodes.filter(n => n.id !== node.id).map(n => ({ label: n.id, value: n.id }))"
                            v-model:value="node.next" />
                    </n-form-item>
                </template>

                <n-button @click="$emit('update')">保存</n-button>
            </n-form>
        </n-card>
    </div>

    <n-empty v-else description="未选择节点" />

</template>
