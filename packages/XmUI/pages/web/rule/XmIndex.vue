<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import {
    NLayout,
    NLayoutSider,
    NLayoutContent,
    NTree,
    NForm,
    NFormItem,
    NInput,
    NButton,
    useMessage
} from "naive-ui";

import { useLoadMetaData } from "/composables/useXmMeta.js";
import { XmMetaRules } from "/store/XmMetaRules.js";
import { buildFormItems } from "/utils/XmRuleFormBuilder.js";
import { buildRelationTree } from "/utils/XmRuleTreeBuilder.js";
import { validateByRules } from "/utils/XmRuleValidator.js";

const message = useMessage();

// =================== 加载元数据 ===================
const metas = useLoadMetaData({
    workflows: "XmWorkflows",
    steps: "XmSteps"
});

// 选中 workflow
const selectedWorkflowId = ref(null);

// 自动选中第一个 workflow
watch(
    () => metas.workflows?.xmMetaTreeData?.value,
    (tree) => {
        if (!tree || !tree.length) return;
        // 确保 key = workflow id
        if (!selectedWorkflowId.value) selectedWorkflowId.value = tree[0].key;
    },
    { immediate: true }
);

// 当前 Workflow 对象
const currentWorkflow = computed(() => {
    const workflows = metas.workflows;
    if (!workflows) return null;

    const map = workflows.fullListData?.value;

    if (!map) return null;

    const id = selectedWorkflowId.value;
    if (!id) return null;
    console.log("workflows map:", map[id]);
    return map[id] || null;
});

// =================== 表单生成 ===================
//const workflowRule = XmMetaRules.XmWorkflows;
const formModel = reactive({ title: "", steps: [] });

// watch 选中 workflow，更新表单
watch(
    currentWorkflow,
    (wf) => {
        if (!wf) {
            formModel.title = "";
            formModel.steps = [];
            return;
        }
        formModel.title = wf.title || "";
        formModel.steps = wf.steps || [];
    },
    { immediate: true }
);

// 构建表单项
const formItems = computed(() =>
    buildFormItems(
        XmMetaRules.XmWorkflows,
        formModel,
        {
            relationTrees: {
                XmSteps: stepsTreeData.value
            }
        }
    )
);

// =================== Tree 数据 ===================
const stepsTreeData = computed(() => {
    if (!currentWorkflow.value) return [];
    const stepsMeta = metas.steps || { xmMetaTreeData: { value: [] } };
    return buildRelationTree(currentWorkflow.value, "steps", stepsMeta);
});

// =================== 方法 ===================

// 选择 workflow
function handleSelect(keys) {
    if (keys && keys.length > 0) {
        selectedWorkflowId.value = keys[0];
    }
}

// 保存 workflow
async function saveWorkflow() {
    if (!currentWorkflow.value) return;

    try {
        validateByRules(formModel, XmMetaRules.XmWorkflows);

        const updated = {
            ...currentWorkflow.value,
            title: formModel.title,
            steps: [...formModel.steps]
        };

        await metas.workflows.saveMetaData(updated.id, updated);

        message.success("保存成功");
    } catch (err) {
        message.error(err.message || "保存失败");
    }
}

// 新增 workflow
async function addWorkflow() {
    if (!metas.workflows) return;
    const id = `workflow_${Date.now()}`;
    const newEntity = { id, title: "新流程", steps: [] };
    await metas.workflows.saveMetaData(id, newEntity);
    selectedWorkflowId.value = id;
    message.success("新增成功");
}

// 删除 workflow
async function deleteWorkflow() {
    if (!currentWorkflow.value) return;
    await metas.workflows.deleteMetaData(currentWorkflow.value.id);
    selectedWorkflowId.value = null;
    message.success("删除成功");
}


</script>

<template>
    <n-layout style="height: 100vh;">
        <n-layout-header bordered
            style="height: 64px; padding: 24px; text-align: center; font-size: large; font-weight: bold;">
            Xunma Meta Data System
        </n-layout-header>
        <n-layout has-sider position="absolute" style="top: 64px; bottom: 64px" bordered>
            <n-layout-sider bordered width="250px">
                <div style="margin: 8px 0">
                    <n-button @click="addWorkflow" size="small">新增流程</n-button>
                    <n-button @click="deleteWorkflow" size="small" style="margin-left: 4px">删除流程</n-button>
                </div>

                <n-tree v-if="metas.workflows?.xmMetaTreeData?.value?.length"
                    :data="metas.workflows.xmMetaTreeData.value" block-line default-expand-all selectable
                    :selected-keys="selectedWorkflowId ? [selectedWorkflowId] : []"
                    :default-expanded-keys="selectedWorkflowId ? [selectedWorkflowId] : []"
                    @update:selected-keys="handleSelect" />

            </n-layout-sider>

            <n-layout-content style="padding: 16px">
                <div v-if="currentWorkflow">
                    <n-form label-placement="left" label-width="120px">
                        <n-form-item v-for="item in formItems" :key="item.key" :label="item.label">
                            <component :is="item.render" />
                        </n-form-item>
                    </n-form>

                    <div v-if="stepsTreeData.length" style="margin-top: 16px">
                        <strong>包含步骤</strong>
                        <n-tree :data="stepsTreeData" block-line selectable default-expand-all />
                    </div>

                    <n-button type="primary" @click="saveWorkflow" style="margin-top: 16px">保存流程</n-button>
                </div>

                <div v-else>
                    <p>请选择左侧流程</p>
                </div>
            </n-layout-content>
        </n-layout>
        <n-layout-footer position="absolute" style="height: 64px; padding: 24px" bordered>
            寻码 - Xunma
        </n-layout-footer>
    </n-layout>
</template>

<style scoped></style>
