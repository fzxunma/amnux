<script setup>
import { h, ref } from 'vue'
import {
    NLayout,
    NLayoutSider,
    NLayoutContent,
    NMenu,
    NInput,
    NDataTable,
} from 'naive-ui'
import { NIcon } from "naive-ui";
import XmSvgIcon from '/components/icon/XmSvgIcon.vue'  // 你的 SVG 图标组件

const collapsed = ref(false)
const activeKey = ref('process')

const menuOptions = [
    { label: '进程', key: 'process', icon: renderIcon('apps-outline') },
    { label: '性能', key: 'performance', icon: renderIcon('trending-up-outline') },
    { label: '用户', key: 'users', icon: renderIcon('people-outline') },
    { label: '服务', key: 'services', icon: renderIcon('cog-outline') },
]

function renderIcon(icon) {
    return () => h(NIcon, null, { default: () => h(XmSvgIcon, { name: icon }) });
}
</script>

<template>
    <n-layout has-sider class="h-screen">
        <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240" show-trigger
            @collapse="collapsed = true" @expand="collapsed = false">
            <!-- 标题区 -->
            <div class="sider-header flex items-center justify-center gap-2 p-4">
                <XmSvgIcon name="stats-chart-outline" />
                <span v-if="!collapsed">任务管理器</span>
            </div>
            <n-menu :options="menuOptions" :collapsed-width="64" :collapsed-icon-size="22" />
        </n-layout-sider>

        <n-layout-content class="content">
            <n-layout has-sider class="h-screen">
                <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240" show-trigger
                    @collapse="collapsed = true" @expand="collapsed = false">
                    <n-menu :options="menuOptions" :collapsed-width="64" :collapsed-icon-size="22" />
                </n-layout-sider>
                <n-layout-content class="content">
                    <n-layout has-sider class="h-screen" sider-placement="right">
                        <n-layout-content class="content">
                            <div class="flex-between">
                                <h2>{{ activeKey }}</h2>
                                <n-input placeholder="搜索" style="width: 200px" />
                            </div>
                            <n-data-table :columns="columns" :data="processes" />

                        </n-layout-content>
                        <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240" show-trigger
                            @collapse="collapsed = true" @expand="collapsed = false">
                            <n-menu :options="menuOptions" :collapsed-width="64" :collapsed-icon-size="22" />
                        </n-layout-sider>
                    </n-layout>
                </n-layout-content>
            </n-layout>
        </n-layout-content>
    </n-layout>
</template>
