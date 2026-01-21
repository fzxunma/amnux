<script setup>
import { useDialogData } from '/store/XmDialogData';

const dialogStore = useDialogData();

// 打开一个用户编辑弹窗，宽度设为 800px
const handleEdit = () => {
    dialogStore.show("编辑用户", "user/edit", "800px");
};

// 打开一个简单的详情弹窗，使用默认宽度
const handleDetail = () => {
    dialogStore.show("查看详情", "user/detail");
};
</script>
<template>
    <n-button @click="handleEdit">edit</n-button>
    <n-button @click="handleDetail">detail</n-button>
</template>
