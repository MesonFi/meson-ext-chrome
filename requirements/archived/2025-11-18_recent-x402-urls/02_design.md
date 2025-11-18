# 技术设计

## 一、存储方案  
- 使用 `chrome.storage.local` 存储最近使用的 x402 URL 列表，键名：`x402_recent_urls`。  
- 数据结构：  
  ```ts
  type RecentUrl = {
    url: string
    timestamp: number
  }
  ```  
- 列表最大长度：5 条，超过时删除最早的记录。

## 二、工具函数  
在 `src/lib/storage/recentUrls.ts`（新文件）中实现：
```ts
import { get, set } from './index'
const KEY = 'x402_recent_urls'
const MAX = 5

export async function loadRecentUrls(): Promise<RecentUrl[]> {
  const list = (await get<RecentUrl[]>(KEY)) ?? []
  return list.sort((a, b) => b.timestamp - a.timestamp)
}

export async function saveRecentUrl(url: string): Promise<void> {
  const list = (await loadRecentUrls()).filter(item => item.url !== url)
  list.unshift({ url, timestamp: Date.now() })
  await set(KEY, list.slice(0, MAX))
}
```

## 三、组件改动  

### 1. 加载历史记录  
- 在 `X402URL` 组件中，Drawer 打开或组件挂载时调用 `loadRecentUrls()` 并将结果保存在组件状态 `recentUrls: string[]`。

### 2. 展示列表  
- 在输入框下方新增一块 UI：
  ```tsx
  {recentUrls.length > 0 && (
    <div className="mt-2 text-sm">
      <div className="mb-1 font-medium">最近使用：</div>
      <ul className="space-y-1">
        {recentUrls.map(url => (
          <li key={url}>
            <button
              className="text-textColor2 hover:text-primaryColorHover truncate w-full text-left"
              onClick={() => selectRecent(url)}
            >
              {url}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )}
  ```

### 3. 点击历史条目  
- `selectRecent(url: string)`：
  1. 调用 `setUrl(url)` 填充输入框。  
  2. 实时校验调用 `validateURL(url)` 并更新 `error` 状态。

### 4. 保存新记录  
- 在 `handleConfirm` 成功分支（确认并获取到 402 响应后），调用 `saveRecentUrl(url)`。

## 四、样式与体验  
- 列表项样式与输入框后缀按钮一致，支持 hover 高亮与文字截断。  
- 保持响应式布局与可访问性，列表标题“最近使用”与现有 UI 风格统一。

## 五、后续可扩展  
- 暴露最大条数配置项。  
- 增加清空历史记录操作按钮。
