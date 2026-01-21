好，这里给你 **「Panel 布局真值表（最终版 · 可固化版）」**。
这不是解释文，是**工程规范表**，可以直接当你 layout 系统的“宪法”。

---

# 🧠 Panel 布局真值表（最终版）

> **目标**
>
> * 默认行为 = 永远合理
> * 显式模式 = 永远可控
> * 三层职责绝不越界

---

## 一、三层职责（先记住这张表）

| 层级     | 名称          | 负责什么                | ❌ 绝对不能写                  |
| ------ | ----------- | ------------------- | ------------------------ |
| **L1** | Axis 层      | width / height 语义   | display / flex-direction |
| **L2** | Item 层      | flex / grid item 行为 | width=100%（除非副轴）         |
| **L3** | Container 层 | display / 布局上下文     | flex（子项尺寸）               |

口诀：

> **Axis 决定“想不想撑”
> Item 决定“怎么撑”
> Container 决定“用什么布局”**

---

## 二、Panel 类型定义

| panel.type | 角色                          |
| ---------- | --------------------------- |
| `row`      | Flex Container（主轴 = width）  |
| `column`   | Flex Container（主轴 = height） |
| `grid`     | Grid Container              |
| `leaf`     | Layout Item（永不定义 display）   |

---

## 三、默认尺寸语义（‼️ 未设置 mode）

### ✅ **这是你现在最关键的点**

| Panel      | width 默认 | height 默认 | 说明           |
| ---------- | -------- | --------- | ------------ |
| **row**    | fill     | fill      | 布局容器必须占位     |
| **column** | fill     | fill      | 同上           |
| **grid**   | fill     | fill      | Grid 必须有物理尺寸 |
| **leaf**   | auto     | auto      | 内容决定大小       |

👉 **默认规则：**

```js
semantic = isContainer ? 'fill' : 'auto'
```

---

## 四、显式模式（widthMode / heightMode）

### 模式全集

| mode    | 含义                |
| ------- | ----------------- |
| `auto`  | 内容决定              |
| `fixed` | 使用 width / height |
| `fill`  | 撑满父容器             |

---

## 五、Flex 布局真值表（核心）

### 🔵 Row（主轴 = width）

#### width（主轴）

| mode  | 写什么                        | 写在哪        |
| ----- | -------------------------- | ---------- |
| auto  | `flex: 0 0 auto`           | **Item 层** |
| fixed | `flex: 0 0 auto` + `width` | Axis       |
| fill  | `flex: 1 1 0%`             | **Item 层** |

#### height（副轴）

| mode  | 写什么            | 写在哪  |
| ----- | -------------- | ---- |
| auto  | ❌ 不写           | —    |
| fixed | `height`       | Axis |
| fill  | `height: 100%` | Item |

---

### 🟢 Column（主轴 = height）

#### height（主轴）

| mode  | 写什么                         | 写在哪  |
| ----- | --------------------------- | ---- |
| auto  | `flex: 0 0 auto`            | Item |
| fixed | `flex: 0 0 auto` + `height` | Axis |
| fill  | `flex: 1 1 0%`              | Item |

#### width（副轴）

| mode  | 写什么                                   | 写在哪  |
| ----- | ------------------------------------- | ---- |
| auto  | ❌ 不写                                  | —    |
| fixed | `width`                               | Axis |
| fill  | `width: 100%` + `align-self: stretch` | Item |

---

## 六、Grid 布局真值表

> Grid **没有主轴 / 副轴**，只处理轨道

### width

| mode           | grid 行为                    |
| -------------- | -------------------------- |
| auto           | `grid-auto-columns: auto`  |
| fixed          | `grid-auto-columns: width` |
| fill / default | `grid-auto-columns: 1fr`   |

### height

| mode           | grid 行为                  |
| -------------- | ------------------------ |
| auto           | `grid-auto-rows: auto`   |
| fixed          | `grid-auto-rows: height` |
| fill / default | `grid-auto-rows: 1fr`    |

📌 **grid 的 fill = 1fr，不是 100%**

---

## 七、Container 层唯一允许写的东西（‼️红线）

### row / column / grid **只能写这些**

```js
style.display
style.flexDirection   // flex only
style.width = '100%'  // 仅 container
style.height = '100%'
style.gap
```

### ❌ Container 绝对不能写

```js
style.flex        // 子项尺寸
style.alignSelf
style.gridAuto*
```

---

## 八、Leaf 规则（非常重要）

### leaf = 永远是 Item

| 行为             | 是否允许         |
| -------------- | ------------ |
| display        | ❌ 禁止         |
| flex-direction | ❌            |
| width:100%     | ❌（除非副轴 fill） |
| flex           | ✅（主轴 fill）   |
| min/max        | ✅            |

口诀：

> **leaf 不定义布局，只响应布局**

---

## 九、默认 fill 生效的必要条件（你刚才踩的坑）

要让 **“默认 fill”** 生效，必须：

1. 父是 container（row / column / grid）
2. 父有 **物理尺寸**（100%）
3. 子是 item（leaf）
4. flex 写在 **item**

你之前失败的原因：

> **第 4 条被 applyLayout 覆盖掉了**

---

## 十、最终代码结构（推荐固化）

```txt
usePanelData
 ├─ applyAxis        // 语义
 ├─ applyFlex        // item 行为
 ├─ applyGrid        // grid 轨道
 └─ applyLayout      // container ONLY
```

---

## ✅ 你现在这套一旦按这张表走

你将获得：

* ✅ 默认就 fill
* ✅ auto 不塌
* ✅ grid / flex 可共存
* ✅ resize / drag / snap 可直接加

---

如果你愿意，下一步我可以直接：

* 把这张真值表 **映射成代码断言**
* 或给你一个 `assertPanelStyle(panel)`
  👉 运行时直接发现越权写 style 的地方

这一步能把这个系统变成**不会回归的级别**。
