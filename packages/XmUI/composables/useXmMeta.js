// /composables/useXmMeta.js
import { computed, onMounted, ref } from "vue";
import { XmMeta } from "/store/XmMeta.js";
import { XmMeta2Tree } from "/utils/XmMeta2Tree.js";
export function useXmMeta(LIST_KEY) {
  // 列表 ID 数组（用于简单列表或计数）
  const ROOT_KEY = XmMeta.normalizeListKey(LIST_KEY);
  const xmMetaDataList = XmMeta.ensure(ROOT_KEY);

  // 树数据（naive-ui n-tree 需要数组结构）
  const xmMetaTreeData = ref([]);

  // 当前编辑的单个实体
  const xmMetaDataCurrent = ref({ id: 0 });

  // 美化类型名称：XmWorkflows → 工作流，pages → 页面
  const _formatTypeName = (type) => {
    const nameMap = {
      XmWorkflows: "工作流",
      XmForms: "表单",
      XmTemplates: "模板",
      XmMetaType: "元数据类型",
      XmStep: "步骤",
      // 可继续扩展
    };

    if (nameMap[type]) return nameMap[type];

    return type
      .replace(/^Xm/, "")
      .replace(/([A-Z])/g, " $1")
      .trim();
  };

  // 重新加载列表 + 构建树
  const reloadMetaDataList = async () => {
    try {
      await XmMeta.load(ROOT_KEY);

      const fullData = XmMeta.getCachedFullList(ROOT_KEY);

      console.log("完整数据（用于构建树）:", fullData);

      const treeArray = XmMeta2Tree.buildTreeNodes(fullData)
        .sort((a, b) => a.label.localeCompare(b.label));

      xmMetaTreeData.value = treeArray;
    } catch (err) {
      console.error("reloadMetaDataList 失败:", err);
      xmMetaTreeData.value = [];
    }
  };

  // 加载单个实体
  const loadMetaData = async (id) => {
    const keyPath = [...ROOT_KEY, id];
    const entityRef = XmMeta.ensureEntity(keyPath);
    await XmMeta.loadEntity(keyPath);
    xmMetaDataCurrent.value = entityRef.value;
  };

  // 保存完整实体
  const saveMetaData = async (id, content) => {
    const keyPath = [...ROOT_KEY, id];
    await XmMeta.saveEntity(keyPath, content);
    await reloadMetaDataList();
  };

  // 局部更新字段
  const updateFieldMetaData = async (id, path, value) => {
    const keyPath = [...ROOT_KEY, id];
    console.log("更新字段:", keyPath, path, value);
    await XmMeta.updateEntityField(keyPath, path, value);

    if (xmMetaDataCurrent.value.id === id) {
      const parts = path.split("/");
      let cur = xmMetaDataCurrent.value;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      cur[parts.at(-1)] = value;
    }
  };

  // 删除实体
  const deleteMetaData = async (id) => {
    const keyPath = [...ROOT_KEY, id];
    console.log(keyPath);
    await XmMeta.deleteEntity(keyPath);
    await reloadMetaDataList();

    if (xmMetaDataCurrent.value.id === id) {
      xmMetaDataCurrent.value = { id: 0 };
    }
  };

  // 新增表单
  const xmMetaDataForm = ref({
    metaDataId: "",
    metaDataTitle: "",
  });

  const xmMetaDataRules = {
    metaDataId: [
      { required: true, message: "请输入 ID", trigger: "blur" },
      { min: 4, max: 100, message: "长度在 1 到 100 个字符", trigger: "blur" },
      {
        validator: (_rule, value) => {
          // 允许 / 作为目录分隔符，但禁止 \ 和其他危险字符
          if (/[\\]/.test(value)) {
            return new Error("ID 不能包含反斜杠 \\");
          }
          if (/[\0\n\r]/.test(value)) {
            return new Error("ID 不能包含控制字符");
          }
          // 可选：限制每段目录名格式
          const segments = value.split("/");
          for (const seg of segments) {
            if (!/^[a-zA-Z0-9_-]+$/.test(seg)) {
              return new Error(
                `目录段 "${seg}" 只能包含字母、数字、下划线和短横线`,
              );
            }
          }
          return true;
        },
        trigger: "blur",
      },
    ],
  };

  const addFormMetaData = () => {
    const loading = ref(false);

    const submit = async () => {
      const inputId = xmMetaDataForm.value.metaDataId.trim();
      const title = xmMetaDataForm.value.metaDataTitle.trim() ||
        inputId.split("/").pop();

      if (!inputId) throw new Error("请输入 ID");

      // 拆分输入的路径（如 "pages/XmClonePageWorkflow11" → ["pages", "XmClonePageWorkflow11"]）
      const idSegments = inputId.split("/").filter((seg) => seg); // 过滤空段

      if (idSegments.length === 0) throw new Error("ID 无效");

      // 最终 keyPath = ROOT_KEY + idSegments
      const keyPath = [...ROOT_KEY, ...idSegments];

      const finalId = idSegments[idSegments.length - 1]; // 最后一级作为 id
      const content = {
        id: finalId, // 保留完整路径作为 id（方便显示和复制）
        title,
        content: "",
        // 其他默认字段
      };

      loading.value = true;
      try {
        await XmMeta.saveEntity(keyPath, content);
        await reloadMetaDataList();
        xmMetaDataForm.value = { metaDataId: "", metaDataTitle: "" };
      } catch (err) {
        console.error("新增失败:", err);
      } finally {
        loading.value = false;
      }
    };

    return {
      loading: computed(() => loading.value),
      submit,
    };
  };

  onMounted(() => {
    reloadMetaDataList();
  });

  return {
    xmMetaDataList,
    xmMetaTreeData,
    xmMetaDataCurrent,
    xmMetaDataForm,
    xmMetaDataRules,
    reloadMetaDataList,
    loadMetaData,
    saveMetaData,
    updateFieldMetaData,
    deleteMetaData,
    addFormMetaData,
  };
}
