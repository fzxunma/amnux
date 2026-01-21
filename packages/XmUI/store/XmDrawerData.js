import { defineStore } from "pinia";
import { ref } from "vue";

export const useDrawerData = defineStore("XmDrawerData", () => {
  const drawerShow = ref(false);
  const drawerTitle = ref("标题");
  const drawerPage = ref("page");
  const show = (title, page) => {
    drawerShow.value = true;
    drawerTitle.value = title;
    drawerPage.value = page;
  };

  return { show, drawerShow, drawerTitle, drawerPage };
});
