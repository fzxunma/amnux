<script setup>
import { computed, ref, onMounted } from 'vue';
import { NConfigProvider, darkTheme } from 'naive-ui';
import { createTextVNode, defineComponent } from 'vue';
import { useDialog, useLoadingBar, useMessage, useNotification } from 'naive-ui';

defineOptions({
  name: 'XmApp'
});
const msg = "Hello Xunma!";
const time = ref(new Date().toLocaleTimeString());

onMounted(() => {
  setInterval(() => {
    time.value = new Date().toLocaleTimeString();
  }, 1000);
});

const watermarkProps = computed(() => {
  return {
    content: msg + ' ' + time.value,
    cross: true,
    fullscreen: true,
    fontSize: 16,
    lineHeight: 16,
    width: 384,
    height: 384,
    xOffset: 12,
    yOffset: 60,
    rotate: -15,
    zIndex: 9999
  };
});
// :theme="naiveDarkTheme"
// :theme-overrides="themeStore.naiveTheme"
// :locale="naiveLocale"
// :date-locale="naiveDateLocale"

const ContextHolder = defineComponent({
  name: 'ContextHolder',
  setup() {
    function register() {
      window.$loadingBar = useLoadingBar();
      window.$dialog = useDialog();
      window.$message = useMessage();
      window.$notification = useNotification();
    }

    register();

    return () => createTextVNode();
  }
});
</script>


<template>
  <NConfigProvider class="h-full">
    <NLoadingBarProvider>
      <NDialogProvider>
        <NNotificationProvider>
          <NMessageProvider>
            <ContextHolder />
            <RouterView class="bg-layout" />
            <!-- <NWatermark v-bind="watermarkProps" /> -->
          </NMessageProvider>
        </NNotificationProvider>
      </NDialogProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
</template>

<style scoped></style>
