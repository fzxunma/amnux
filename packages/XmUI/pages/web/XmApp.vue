<template>
  <div class="container">
    <h1>{{ msg }} ({{ time }})</h1>
    <XmLogin />
    <XmV/>
    <n-message-provider><router-view /></n-message-provider>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import XmLogin from "/views/login/XmLogin.vue";
import XmV from "/components/login/XmLogin.vue";
const msg = "Hello Xunma!";
const time = ref(new Date().toLocaleTimeString());

onMounted(() => {
  setInterval(() => {
    time.value = new Date().toLocaleTimeString();
  }, 1000);
});
</script>