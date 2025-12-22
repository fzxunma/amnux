export function useXmMessage(fn, successText) {
  return async (...args) => {
    try {
      window.$loadingBar.start();
      await fn(...args);
      window.$loadingBar.finish();
      window.$message.success(successText);
    } catch (e) {
      window.$message.error(e.message || "操作失败");
      throw e;
    }
  };
}
