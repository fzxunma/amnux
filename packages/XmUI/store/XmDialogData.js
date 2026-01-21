import { defineStore } from "pinia";
import { ref } from "vue";

export const useDialogData = defineStore("XmDialogData", () => {
  const dialogShow = ref(false);
  const dialogTitle = ref("提示");
  const dialogPage = ref("");
  const dialogWidth = ref("600px"); // 增加宽度控制

  /**
   * 打开弹窗
   * @param {string} title 标题
   * @param {string} page 页面路径 (对应 pages/web/{path}/XmIndex.vue)
   * @param {string} width 可选，宽度，默认 600px
   */
  const show = (title, page, width = "600px") => {
    dialogShow.value = true;
    dialogTitle.value = title;
    dialogPage.value = page;
    dialogWidth.value = width;
  };

  const close = () => {
    dialogShow.value = false;
    // 这里可选：关闭后清空 page，防止下次打开闪烁，但为了动画流畅通常不清空
  };

  return { show, close, dialogShow, dialogTitle, dialogPage, dialogWidth };
});
