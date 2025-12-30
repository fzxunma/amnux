<template>
    <h1 class="text-3xl font-bold underline">
        login
    </h1>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const search = computed({
    get() {
        return route.query.search ?? ''
    },
    set(search) {
        router.replace('/pages/home')
    },
})
onMounted(() => {
    router.replace('/pages/home')
})
console.log("login")
</script>
