<script setup>
import { ref, onMounted } from 'vue';
import { NTabs, NTabPane, NButton, NSpace, useMessage, NPopconfirm } from 'naive-ui';

// 1. 导入 Store (用于保存后通知更新，以及获取 rawDefaults)
import { useMenuDataStore } from '/store/XmMenuData.js';

// 2. 导入子组件和工具
import XmMenuTableTab from './XmMenuTableTab.vue';
import XmMenuSubTab from './XmMenuSubTab.vue';
import { transformToEditable, useCodeGenerator } from '/store/XmMenuEditData';
import { useXmMeta } from '/composables/useXmMeta.js';

const message = useMessage();
const { generateAndCopy } = useCodeGenerator();
const menuStore = useMenuDataStore();

// ================= 后端配置 =================
const CONFIG_ID = 'sys_menu_config_v1';
const {
  saveMetaData,
  loadMetaData,
  xmMetaDataCurrent
} = useXmMeta('SystemMenuConfig', 'metaData');

// ================= 状态 =================
const activeTab = ref('main');
const mainMenus = ref([]);
const rightMenus = ref([]);
const subMenuMap = ref({});
const generatedCode = ref('');

/**
 * 加载纯本地默认值
 */
const loadLocalDefaults = () => {
  // 从 Store 中解构出原始默认值 (纯 JSON 格式)
  const { main, right, sub } = menuStore.rawDefaults;

  mainMenus.value = transformToEditable(main);
  rightMenus.value = transformToEditable(right);
  subMenuMap.value = transformToEditable(sub);

  message.info('已加载本地默认配置');
}

/**
 * 初始化数据 (编辑器核心逻辑)
 */
const initData = async () => {
  try {
    await loadMetaData(CONFIG_ID);
    const entity = xmMetaDataCurrent.value || {};
    const serverData = entity.content;

    // 获取默认值备用
    const { main: defMain, right: defRight, sub: defSub } = menuStore.rawDefaults;

    if (serverData) {
      console.log("📝 编辑器：发现远程配置，正在合并...");

      // 1. 主菜单：远程有值用远程，否则用默认
      const rawMain = (serverData.main && serverData.main.length > 0)
        ? serverData.main
        : defMain;
      mainMenus.value = transformToEditable(rawMain);

      // 2. 右侧菜单：远程有值用远程，否则用默认
      const rawRight = (serverData.right && serverData.right.length > 0)
        ? serverData.right
        : defRight;
      rightMenus.value = transformToEditable(rawRight);

      // 3. 子菜单：远程有 key 用远程，否则用默认
      // 注意：serverData.sub 可能是空对象 {}
      const hasRemoteSub = serverData.sub && Object.keys(serverData.sub).length > 0;
      const rawSub = hasRemoteSub ? serverData.sub : defSub;
      subMenuMap.value = transformToEditable(rawSub);

    } else {
      console.log("📝 编辑器：远程无配置，加载默认");
      loadLocalDefaults();
    }
  } catch (e) {
    console.warn("编辑器加载异常:", e);
    loadLocalDefaults();
  }
};

const isSaving = ref(false);
const handleSave = async () => {
  if (isSaving.value) return;
  isSaving.value = true;
  const contentPayload = {
    main: mainMenus.value,
    right: rightMenus.value,
    sub: subMenuMap.value,
    updatedAt: new Date().toISOString()
  };

  const entity = {
    id: CONFIG_ID,
    title: 'SysMenuConfig',
    content: contentPayload
  };

  try {
    await saveMetaData(CONFIG_ID, entity);
    await menuStore.initMenuData();
    //message.success('保存成功并已更新菜单');
  } catch (e) {
    console.error(e);
    message.error('保存失败: ' + e.message);
  } finally {
    isSaving.value = false;
  }
};

const handleGenerate = () => {
  const code = generateAndCopy(mainMenus.value, rightMenus.value, subMenuMap.value, message);
  generatedCode.value = code;
};

onMounted(() => {
  initData();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <NTabs v-model:value="activeTab" type="line" animated class="flex-1 h-0">
      <!-- <template #suffix>
        <NSpace size="small" align="center" style="padding-bottom: 2px;">
          <NPopconfirm @positive-click="loadLocalDefaults">
            <template #trigger>
              <NButton size="tiny" tertiary type="warning">重置默认</NButton>
            </template>
确定要丢弃修改并恢复默认吗？
</NPopconfirm>

<NButton type="primary" size="tiny" @click="handleSave">
  保存并应用
</NButton>

<NButton type="success" secondary size="tiny" @click="handleGenerate">
  复制JSON
</NButton>
</NSpace>
</template> -->

      <NTabPane name="main" tab="一级侧栏">
        <XmMenuTableTab title="" :data-list="mainMenus" @trigger-save="handleSave" />
      </NTabPane>

      <NTabPane name="sub" tab="子菜单配置">
        <XmMenuSubTab :main-menus="mainMenus" :sub-menu-map="subMenuMap" @trigger-save="handleSave" />
      </NTabPane>

      <NTabPane name="right" tab="右侧栏">
        <XmMenuTableTab title="" :data-list="rightMenus" @trigger-save="handleSave" />
      </NTabPane>

    </NTabs>
  </div>
</template>

<style scoped>
:deep(.n-tabs-pane-wrapper) {
  height: 100%;
}

:deep(.n-tabs-nav-scroll-wrapper) {
  align-items: center;
}
</style>
