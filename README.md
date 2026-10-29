# Liquidrop

简体中文 | [English](./README.en.md)

基于 SVG 滤镜的 React 液态玻璃组件，实现类似 iOS 的边缘折射、色散与玻璃高光效果。

> SVG 折射滤镜（`backdrop-filter: url()`）目前仅 Chromium 内核浏览器支持，其他浏览器会自动退化为模糊玻璃。

## 安装

```bash
npm i liquidrop
```

## 用法

```jsx
import { LiquidGlass } from 'liquidrop'

<LiquidGlass />

<LiquidGlass>{children}</LiquidGlass>
```

只调一个强度（0 ~ 1，默认 0.5）：

```jsx
<LiquidGlass intensity={0.8}>{children}</LiquidGlass>
```

需要精细控制时，传入专业参数，会覆盖由强度推导出的对应值：

```jsx
<LiquidGlass
  refraction={120}
  aberration={6}
  bezel={0.3}
  blur={0.5}
  saturation={1.4}
  radius={999}
  tint="rgba(255, 255, 255, 0.05)"
  style={{ width: 200, height: 200 }}
/>
```

| 参数 | 说明 | 默认 |
| --- | --- | --- |
| `intensity` | 整体强度 0 ~ 1 | `0.5` |
| `refraction` | 边缘折射位移（px），负值反向 | 由强度推导 |
| `aberration` | 色散偏移（px） | 由强度推导 |
| `bezel` | 折射边框宽度，占短边比例 0 ~ 0.5 | 由强度推导 |
| `blur` | 模糊（px） | 由强度推导 |
| `saturation` | 饱和度倍数 | 由强度推导 |
| `radius` | 圆角（px） | `24` |
| `tint` | 玻璃底色 | `rgba(255, 255, 255, 0.08)` |

其余属性（`className`、`style`、事件等）透传到根 `div`。

在线调参演示：构建后打开 `demo/index.html`（`pnpm demo`）。
