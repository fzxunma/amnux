<!-- PwdLoginStatic.vue -->
<script setup>
import { ref } from 'vue'
import { NCard, NInput, NButton, NCheckbox } from 'naive-ui'

const model = ref({ userName: '', password: '' })
</script>

<template>
    <div class="flex h-screen items-center justify-center bg-[#f0f0ff]">
        <div class="absolute inset-0 bg-cover bg-center"
            :style="{ backgroundImage: `url(${new URL('/bg.png', import.meta.url).href})` }" />

        <!-- 卡片：360px 宽，圆角 12px，内边距 20px 24px -->
        <div class="w-[360px] z-10">
            <n-card :bordered="false" class="rounded-[12px] bg-white shadow-lg" style="padding: 20px 24px">
                <!-- 头部 -->
                <header class="flex items-center justify-between mb-[18px]">
                    <div class="flex items-center gap-[10px]">
                        <div class="w-[36px] h-[36px] rounded-[10px]"
                            style="background: linear-gradient(135deg, #7b7cff, #5b5cf6)" />
                        <h1 class="text-[18px] font-semibold text-[#5b5cf6]">Soybean 管理系统</h1>
                    </div>
                    <div class="flex flex-col text-[12px] text-[#333] leading-none text-center">
                        <span>A</span><span>文</span>
                    </div>
                </header>

                <!-- 表单区 gap 14px -->
                <div class="flex flex-col gap-[14px]">
                    <div class="text-[14px] font-medium text-[#5b5cf6]">密码登录</div>

                    <!-- 输入框：高 36px，圆角 6px -->
                    <n-input v-model:value="model.userName" placeholder="请输入用户名" class="!h-[36px] rounded-[6px]" />
                    <n-input v-model:value="model.password" type="password" show-password-on="click" placeholder="请输入密码"
                        class="!h-[36px] rounded-[6px]" />

                    <!-- 记住我 / 忘记密码 -->
                    <div class="flex items-center justify-between text-[12px]">
                        <n-checkbox size="small">记住我</n-checkbox>
                        <span class="text-[#5b5cf6] cursor-pointer">
                            <RouterLink to="../modules/Register">忘记密码？</RouterLink>

                        </span>
                    </div>

                    <!-- 确认按钮：图片蓝色 #6c6ff5，高 40px，圆角 20px -->
                    <n-button type="primary" block class="h-[40px] rounded-[20px]"
                        style="background:#6c6ff5;border-color:#6c6ff5">
                        确认
                    </n-button>

                    <!-- 验证码登录 / 注册账号：12px 灰色文字按钮 -->
                    <div class="flex gap-[12px] text-[12px]">
                        <!-- 验证码登录按钮 -->
                        <RouterLink to="../modules/ResetPwd" class="flex-1">
                            <n-button block class="w-full h-[32px] px-0
             border border-[#dcdcdc] text-[#666]
             hover:border-[#1677ff] hover:text-[#1677ff]
             transition-colors">
                                验证码登录
                            </n-button>
                        </RouterLink>

                        <!-- 注册账号按钮 -->
                        <RouterLink to="../modules/PwdLogin" class="flex-1">
                            <n-button block class="w-full h-[32px] px-0
             border border-[#dcdcdc] text-[#666]
             hover:border-[#1677ff] hover:text-[#1677ff]
             transition-colors">
                                注册账号
                            </n-button>
                        </RouterLink>
                    </div>




                    <!-- 分割线：12px 灰字 -->
                    <n-divider dashed class="!my-[4px]">
                        <div class="text-[12px] text-[#999] text-center">
                            其他账号登录
                        </div>
                    </n-divider>


                    <!-- 底部标签：12px，蓝色圆角按钮，背景 #6c6ff5，圆角 999px -->
                    <div class="flex justify-between text-[12px]">
                        <n-button size="small" class="px-[8px] py-[6px] rounded-full"
                            style="background:#6c6ff5;border-color:#6c6ff5;color:#fff">
                            超级管理员
                        </n-button>
                        <n-button size="small" class="px-[8px] py-[6px] rounded-full"
                            style="background:#6c6ff5;border-color:#6c6ff5;color:#fff">
                            管理员
                        </n-button>
                        <n-button size="small" class="px-[8px] py-[6px] rounded-full"
                            style="background:#6c6ff5;border-color:#6c6ff5;color:#fff">
                            普通用户
                        </n-button>
                    </div>
                </div>
            </n-card>
        </div>
    </div>
</template>