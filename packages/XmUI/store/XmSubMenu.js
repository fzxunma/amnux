import { h } from "vue";
import XmSvgIcon from "/components/icon/XmSvgIcon.vue";

function renderIcon(icon) {
  return () => h(XmSvgIcon, { name: icon });
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
      {
        label: "客户群列表",
        key: "user-group-list",
        icon: renderIcon("people-circle"),
      },
      {
        label: "客户群详情",
        key: "user-group-detail",
        icon: renderIcon("information-circle"),
      },
    ],
  },
];


const menuUserOptions = [
  {
    label: "客户管理",
    key: "user-management",
    icon: renderIcon("person"),
    children: [
      {
        label: "客户列表",
        key: "people-list",
        icon: renderIcon("person-circle"),
      },
      { label: "客户详情", key: "user-detail", icon: renderIcon("man") },
    ],
  },
];

export const menuOptionsMap = {
  user: menuUserOptions,
  group: menuGroupOptions,
};

export const menuOptions = [
  { label: "客户", key: "user", icon: renderIcon("person") },
  { label: "客户群", key: "group", icon: renderIcon("people-sharp") }
];

export const menuRightOptions = [
  {
    "label": "菜单",
    "key": "system-menu",
    "icon": renderIcon("menu-sharp"),
    "action": {
      type: "XmDrawer",
      page: "menu",
    },
  },
  {
    "label": "菜单1",
    "key": "user-management",
    "icon": renderIcon("bar-chart"),
     "action": {
      type: "XmDailog",
      page: "menu",
    },
  }
];
