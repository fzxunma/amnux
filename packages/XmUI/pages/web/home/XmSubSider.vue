<script setup>
import { h, computed } from 'vue'
import {
    NLayout,
    NLayoutSider,
    NLayoutHeader,
    NLayoutContent,
    NLayoutFooter,
    NMenu,
    NButton
} from 'naive-ui'
import XmSvgIcon from '/components/icon/XmSvgIcon.vue'
import { menuOptions } from "./XmSubMenu"
import XmSvgIconify from '/components/icon/XmSvgIconify.vue'
import { useMenuDataStore } from '/store/XmMenuData.js'

const menuDataStore = useMenuDataStore()

/* ========================
 * 折叠（来自 store）
 * ======================== */
const collapsed = computed({
    get: () => menuDataStore.menuCollapsed,
    set: (val) => menuDataStore.setMenuCollapsed(val)
})

/* ========================
 * 一级菜单选中
 * ======================== */
const activeKey = computed({
    get: () => menuDataStore.menuKey,
    set: (key) => menuDataStore.setMenuKey(key)
})


/* ========================
 * 折叠按钮 icon
 * ======================== */
const icon = computed(() =>
    collapsed.value
        ? 'line-md:menu-fold-right'
        : 'line-md:menu-fold-left'
)

const siderWidth = 160
</script>

<template>
    <NLayoutSider bordered collapse-mode="width" :collapsed-width="64" :width="siderWidth" :collapsed="collapsed"
        :native-scrollbar="false">
        <NLayout class="h-screen">
            <NLayoutHeader  position="absolute" class="h-12 p-4">
                <div class="flex justify-between items-center gap-2">
                  <div class="flex items-center justify-center gap-2 ">
                        <XmSvgIcon name="stats-chart-outline" />
                        <span v-if="!collapsed">xunma</span>
                    </div>
                    <NButton text @click="collapsed = !collapsed">
                        <XmSvgIconify :name="icon" />
                    </NButton>
                </div>
            </NLayoutHeader>

            <NLayoutContent style="top:48px;bottom:48px" position="absolute">
                <NMenu :options="menuOptions" v-model:value="activeKey" :collapsed-width="64" />
            </NLayoutContent>

            <NLayoutFooter position="absolute" class="h-12 p-4">
                <div class="flex items-center justify-between gap-2">
                    <div v-if="!collapsed">© 2025 xunma</div>
                    <n-button text @click="collapsed = !collapsed">
                        <XmSvgIconify :name="icon" />
                    </n-button>
                </div>
            </NLayoutFooter>
        </NLayout>
    </NLayoutSider>
</template>
