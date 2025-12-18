<script setup>
import { NButton, NInput } from "naive-ui";

const props = defineProps();
const emit = defineEmits(["update:cases"]);

function add() {
  emit("update:cases", [...(props.cases || []), { when: "", to: "" }]);
}
</script>

<template>
  <div v-for="(c, i) in cases" :key="i" style="margin-bottom: 6px">
    <NInput v-model:value="c.when" placeholder="条件，如 needHr == true" />
    <NInput v-model:value="c.to" placeholder="跳转节点 ID" />
  </div>

  <NButton size="tiny" @click="add">新增条件</NButton>
</template>
