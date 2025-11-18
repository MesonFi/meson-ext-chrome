# SVG 图标管理

## 目录结构
```
assets/icons/
├── README.md          # 使用说明
├── home.svg          # 示例图标
├── settings.svg      # 示例图标
└── ...               # 其他图标
```

## 使用方法

### 方法 1: 使用 Icon 组件 + SVG 内容
```tsx
import Icon from '~/components/Icon'

<Icon size={24} className="text-primary">
  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
</Icon>
```

### 方法 2: 直接导入 SVG 文件（推荐）
```tsx
// 在组件中导入
import HomeIcon from '@assets/icons/home.svg'

// 使用
<img src={HomeIcon} alt="home" className="w-6 h-6" />
```

### 方法 3: 内联 SVG 组件
创建独立的图标组件：
```tsx
// src/components/Icons/HomeIcon.tsx
export const HomeIcon = ({ className, size = 24 }: { className?: string, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
)
```

## 图标命名规范
- 使用小写字母和连字符：`icon-name.svg`
- 语义化命名：`arrow-left.svg`, `user-circle.svg`
- 避免使用缩写

## 图标优化
1. 使用 SVGO 优化 SVG 文件
2. 移除不必要的属性和注释
3. 设置合适的 viewBox
4. 使用 currentColor 以支持颜色定制

## 图标来源
- [Heroicons](https://heroicons.com/)
- [Lucide Icons](https://lucide.dev/)
- [Tabler Icons](https://tabler-icons.io/)
