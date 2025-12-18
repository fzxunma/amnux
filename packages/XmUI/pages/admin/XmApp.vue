<template>
  <div class="container">
    <h1>{{ msg }} ({{ time }})</h1>
    <p>计数: {{ count }}</p>
    <button @click="count++">+1</button>
    <p>修改这个文件试士试d维持vv吧fsd HMR！</p>
  </div>
</template>

<script setup> 
import { ref, onMounted } from "vue";

const msg  = "Hello BSDFS夫撒旦发第三方撒旦发射点射点sdfsdf随风倒Fun + Vue 3!";
const count = ref(0);
const time = ref(new Date().toLocaleTimeString());

onMounted(() => {
  setInterval(() => {
    time.value = new Date().toLocaleTimeString();
  }, 1000);
});
</script>

<style scoped>
.container {
  text-align: center;
  padding: 2rem;
  font-family: system-ui;
}
h1 { color: #42b983; }
button {
  padding: 0.5rem 1rem;
  font-size: 1.2rem;
  margin: 1rem;
}
</style>