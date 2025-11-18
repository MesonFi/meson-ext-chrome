# 技术设计：统一与精简颜色配置

本文档定义了新的项目颜色调色板、旧颜色到新颜色的映射，以及在 `tailwind.config.js` 和相关 CSS 中的更新方案。

---

## 1. 新的颜色调色板

| 名称            | 十六进制色值 | 用途说明                 |
| --------------- | ------------ | ------------------------ |
| white           | #FFFFFF      | 页面背景、卡片背景       |
| black           | #000000      | 文本主要颜色             |
| primary         | #25C696      | 主要按钮、交互高亮色     |
| primary-hover   | #1BE2BB      | 主要按钮悬停状态         |
| secondary       | #6F9483      | 次要文字、图标           |
| color-strong     | #25372E      | 强调文本                 |
| color-regular    | #75807B      | 常规文本                 |
| color-muted      | #BDC7C3      | 次要提示文字             |
| border          | #DDF3EA      | 边框、分割线             |
| surface         | #F2F9F7      | 卡片与模块背景           |
| disabled        | #DFEBE7      | 禁用状态背景             |
| success         | #11C58F      | 成功提示、状态           |
| warning         | #FFC700      | 警告提示、状态           |
| error           | #FD5050      | 错误提示、状态           |

---

## 2. 旧颜色到新颜色映射

| 旧颜色名                   | 旧色值                         | 新颜色名        |
| -------------------------- | ------------------------------ | --------------- |
| background / card          | `hsl(var(--background))` 用白色 | white           |
| foreground                 | `hsl(var(--foreground))` 用黑色 | black           |
| primaryColor               | `#25C696`                      | primary         |
| primaryColorHover          | `#1BE2BB`                      | primary-hover   |
| textColor1                 | `#25372E`                      | text-strong     |
| textColor2                 | `#6F9483`                      | secondary       |
| textColor3                 | `#BDC7C3`                      | text-muted      |
| textColor4                 | `#75807B`                      | text-regular    |
| borderColor                | `#DDF3EA`                      | border          |
| disableColor               | `#DFEBE7`                      | disabled        |
| card                       | `#F2F9F7`                      | surface         |
| active                     | `#11C58F`                      | success         |
| warning                    | `#FFC700`                      | warning         |
| error                      | `#FD5050`                      | error           |
| errorHover                 | `hsl(var(--error-hover))` 用 `#FD5050` | error    |
| errorActive                | `hsl(var(--error-active))` 用 `#FD5050` | error    |

---

## 3. 更新方案

1. **更新 `tailwind.config.js`**  
   - 在 `theme.extend.colors` 下定义如上「新颜色调色板」，移除所有旧颜色项（`primaryColor*`、`textColor*`、`card`、`borderColor` 等）。  
   - 确保在 `plugins` 中保留 `tailwindcss-animate`。

2. **更新 CSS 变量**  
   - 在 `src/style.css` 和 `src/app/styles.css` 中，将 `:root` 与 `.dark` 中的旧 `--*` 变量替换为对应的新变量或直接使用十六进制值。  
   - 移除不再使用的 `--primary-color-linear*`、`--secondary-bg` 等。

3. **使用新颜色类**  
   - 在组件类名中，用 `bg-primary`、`text-color-strong`、`border-border` 等替代原有 `bg-primaryColor`、`text-textColor1`、`border-borderColor` 等。  
   - 如需悬停或激活状态，使用 `hover:bg-primary-hover` 或 `active:text-success`。

4. **回归测试**  
   - 执行 `yarn build` 并逐页检查 Popup、Sidepanel、X402 流程及各组件显示是否正常。  
   - 重点验证按钮、文本、边框、卡片、提示等 UI 颜色是否符合预期。


## 生成文档

在 `docs/design.md` 里描述新的颜色体系