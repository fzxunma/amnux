<script setup>
import { NInput } from "naive-ui";

const props = defineProps();

const emit = defineEmits(["update:script"]);

function update(code) {
  emit("update:script", { lang: "dsl", code });
}
</script>

<template>
  <NInput
    type="textarea"
    :value="script?.code"
    placeholder="DSL 脚本，如： needHr = days > 3"
    @update:value="update"
  />
</template>
