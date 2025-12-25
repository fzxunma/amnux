// /composables/useXmMeta.js
import { ref, readonly, computed, onMounted, watch, reactive } from "vue";
import { XmMeta } from "/store/XmMeta.js";
import { XmMeta2Tree } from "/utils/XmMeta2Tree.js";

export function useXmMeta(LIST_KEY) {
  const ROOT_KEY = XmMeta.normalizeKeyPath(LIST_KEY);
  const rootKeyStr = ROOT_KEY.join("/");

  // ==================== 状态 ====================
  const listIds = ref([]);                  // ID 数组
  const fullListData = ref({});             // 完整列表对象 {id: entity}
  const treeData = ref([]);                 // 树结构（naive-ui tree 需要）
  const currentEntity = ref({ id: 0 });      // 当前选中的实体
  const loading = ref(false);               // 列表加载中
  const entityLoading = ref(false);         // 实体加载中

  // 美化显示名称
  const typeName = computed(() => {
    const map = {
      XmWorkflows: "工作流",
      XmForms: "表单",
      XmTemplates: "模板",
      XmMetaType: "元数据类型",
      XmStep: "步骤",
    };
    const raw = ROOT_KEY[ROOT_KEY.length - 1] || "";
    if (map[raw]) return map[raw];
    return raw.replace(/^Xm/, "").replace(/([A-Z])/g, " $1").trim();
  });
  const reloadMetaDataList = async () => {
    if (loading.value) return;
    loading.value = true;
    try {
      let requestKeyPath = ROOT_KEY;
      if (requestKeyPath.length === 0) {
        requestKeyPath = ["xm"];
      }
      // ⭐ 关键：改为 list 操作
      const data = await XmMeta.fetchList(requestKeyPath);
      fullListData.value = data; // {id1: obj1, id2: obj2}
      listIds.value = Object.keys(data);

      treeData.value = XmMeta2Tree.buildTreeNodes(data)
        .sort((a, b) => a.label.localeCompare(b.label));
    } catch (err) {
      console.error("加载列表失败:", err);
      fullListData.value = {};
      listIds.value = [];
      treeData.value = [];
    } finally {
      loading.value = false;
    }
  };
  // ==================== 加载单个实体 ====================
  const loadMetaData = async (id) => {
    if (!id) return;
    if (entityLoading.value) return;

    const keyPath = [...ROOT_KEY, id];
    entityLoading.value = true;
    try {
      const data = await XmMeta.fetchEntity(keyPath);
      currentEntity.value = { ...data, id }; // 确保 id 在对象上
    } catch (err) {
      console.error(`[${XmMeta.getKeyStr(keyPath)}] 加载实体失败:`, err);
      currentEntity.value = { id: 0 };
    } finally {
      entityLoading.value = false;
    }
  };

  // ==================== 保存完整实体 ====================
  const saveMetaData = async (id, content) => {
    const keyPath = [...ROOT_KEY, id];
    await XmMeta.saveEntity(keyPath, content);
    await reloadMetaDataList();

    if (currentEntity.value.id === id) {
      currentEntity.value = { ...content, id };
    }
  };

  // ==================== 局部更新字段 ====================
  const updateFieldMetaData = async (id, path, value) => {
    const keyPath = [...ROOT_KEY, id];
    await XmMeta.updateField(keyPath, path, value);

    // 乐观更新当前实体
    if (currentEntity.value.id === id) {
      const parts = path.split("/");
      let obj = currentEntity.value;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        obj[key] = obj[key] || {};
        obj = obj[key];
      }
      obj[parts[parts.length - 1]] = value;
    }

    // 如果字段影响排序/显示，建议刷新列表
    await reloadMetaDataList();
  };

  // ==================== 删除实体 ====================
  const deleteMetaData = async (id) => {
    const keyPath = [...ROOT_KEY, id];
    await XmMeta.deleteEntity(keyPath);
    await reloadMetaDataList();

    if (currentEntity.value.id === id) {
      currentEntity.value = { id: 0 };
    }
  };

  // ==================== 新增表单 ====================
  // ==================== 新增表单 ====================
  const xmMetaDataForm = ref({
    metaDataId: "",
    metaDataTitle: "",
    metaDataContent: "",
  });

  const xmMetaDataRules = {
    metaDataId: [
      { required: true, message: "请输入 ID", trigger: "blur" },
      {
        validator: (_, value) => {
          if (!value.trim()) return new Error("ID 不能为空");
          if (/[\\]/.test(value)) return new Error("ID 不能包含反斜杠 \\");
          if (/[\0\n\r]/.test(value)) return new Error("ID 不能包含控制字符");

          const segments = value.split("/").filter(Boolean);
          for (const seg of segments) {
            if (!/^[a-zA-Z0-9._-]+$/.test(seg)) {
              return new Error(`"${seg}" 只能包含字母、数字、下划线、短横线和点号`);
            }
          }
          return true;
        },
        trigger: "blur",
      },
    ],
  };

  const addFormMetaData = () => {
    const submitting = ref(false);

    const submit = async () => {
      if (submitting.value) return;
      submitting.value = true;

      try {
        const inputId = xmMetaDataForm.value.metaDataId.trim();
        if (!inputId) throw new Error("请输入 ID");

        // 拆分成多段： "user/user" → ["user", "user"]
        const idSegments = inputId.split("/").map(s => s.trim()).filter(Boolean);

        // 客户端校验每段（与后端完全一致）
        for (const seg of idSegments) {
          if (!/^[a-zA-Z0-9._-]+$/.test(seg)) {
            throw new Error(`目录段 "${seg}" 只能包含字母、数字、下划线、短横线和点号`);
          }
        }

        if (idSegments.length === 0) throw new Error("ID 无效");

        // ⭐ 关键：多段拼接，不要 join
        const fullKeyPath = ["xm", ...ROOT_KEY, ...idSegments];

        const newEntity = {
          id: idSegments[idSegments.length - 1],
          title: xmMetaDataForm.value.metaDataTitle.trim() || idSegments[idSegments.length - 1],
          content: xmMetaDataForm.value.metaDataContent.trim(),
        };

        await XmMeta.saveEntity(fullKeyPath, newEntity);

        await reloadMetaDataList();

        // 重置表单
        xmMetaDataForm.value.metaDataId = "";
        xmMetaDataForm.value.metaDataTitle = "";
        xmMetaDataForm.value.metaDataContent = "";

      } catch (err) {
        console.error("新增失败:", err);
        throw err;
      } finally {
        submitting.value = false;
      }
    };

    return {
      submitting: readonly(submitting),
      submit,
    };
  };

  // ==================== 自动加载 ====================
  onMounted(() => {
    reloadMetaDataList();
  });

  // ==================== 返回 ====================
  return {
    // 数据
    xmMetaDataList: readonly(listIds),
    xmMetaTreeData: readonly(treeData),
    xmMetaDataCurrent: currentEntity,
    fullListData,          // <-- 加上这一行
    typeName,

    // 状态
    loading: readonly(loading),
    entityLoading: readonly(entityLoading),

    // 方法
    reloadMetaDataList,
    loadMetaData,
    saveMetaData,
    updateFieldMetaData,
    deleteMetaData,

    // 新增相关
    xmMetaDataForm,
    xmMetaDataRules,
    addFormMetaData,
  };
}

// 保留原来的辅助函数（如果其他地方还在用）
export function useWorkflowWithSteps() {
  const workflows = useXmMeta("XmWorkflows");
  const steps = useXmMeta("XmSteps"); // 注意原代码是 XmSetps → 应该是 XmSteps

  return { workflows, steps };
}

export function useLoadMetaData(metaMap) {
  const metas = {};
  for (const [name, key] of Object.entries(metaMap)) {
    metas[name] = useXmMeta(key);
  }
  return metas; // 不用 reactive
}

// findFirstTreeNode、useLoadMetaDataLink 等其他工具函数可保持不变或稍作调整