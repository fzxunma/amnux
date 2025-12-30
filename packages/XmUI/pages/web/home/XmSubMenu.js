import { h } from "vue"
import XmSvgIcon from '/components/icon/XmSvgIcon.vue'

function renderIcon(icon) {
    return () => h(XmSvgIcon, { name: icon })
}
/* ========================
 * 菜单数据
 * ======================== */
const menuGroupOptions = [
    {
        label: "客户群管理",
        key: "group-user-management",
        icon: renderIcon("person"),
        children: [
            { label: "客户群列表", key: "user-group-list", icon: renderIcon("people-circle") },
            { label: "客户群详情", key: "user-group-detail", icon: renderIcon("information-circle") },
        ],
    }
]

const menuOrderOptions = [
    { label: "订单管理", key: "order-management", icon: renderIcon("cart") }
]

const menuUserOptions = [
    {
        label: "客户管理",
        key: "user-management",
        icon: renderIcon("person"),
        children: [
            { label: "客户列表", key: "people-list", icon: renderIcon("person-circle") },
            { label: "客户详情", key: "user-detail", icon: renderIcon("man") },
        ],
    }
]

export const menuOptionsMap = {
    user: menuUserOptions,
    order: menuOrderOptions,
    group: menuGroupOptions,
}



export const menuOptions = [
  { label: '订单', key: 'order', icon: renderIcon('bag-handle-sharp') },
  { label: '客户', key: 'user', icon: renderIcon('person') },
  { label: '客户群', key: 'group', icon: renderIcon('people-sharp') }
]

export const menuRightOptions  = [
    {
        "label": "数据分析",
        "key": "user-management",
        "icon": renderIcon("bar-chart"),
    },
    {
        "label": "工具",
        "key": "user-group-management",
        "icon": renderIcon("calculator-sharp"),
    },
    {
        "label": "日历",
        "key": "message",
        "icon": renderIcon("calendar"),
    },
    {
        "label": "订单",
        "key": "order",
        "icon": renderIcon("cart"),
    },
    {
        "label": "流程",
        "key": "data-dashboard",
        "icon": renderIcon("time"),
    },
    {
        "label": "设置",
        "key": "data-construct",
        "icon": renderIcon("construct"),
    }
]