# Liquidrop

简体中文 | [English](./README.en.md)

## 简介

基于 SVG 滤镜的 React 液态玻璃组件，效果类似 iOS：边缘折射、色散、轻微模糊和玻璃高光。可用于悬浮层，也可用于导航栏、卡片、按钮、输入框等普通元素。

折射效果需要 Chromium 内核浏览器（Chrome、Edge），其他浏览器显示为模糊玻璃。

## 用法

```bash
npm i liquidrop
```

```jsx
import { LiquidGlass } from 'liquidrop'

<LiquidGlass />

<LiquidGlass>{children}</LiquidGlass>
```

只设置强度（0 ~ 1，默认 0.5），其余参数由强度计算：

```jsx
<LiquidGlass intensity={0.8}>{children}</LiquidGlass>
```

设置专业参数，会覆盖由强度计算出的对应值：

```jsx
<LiquidGlass refraction={1.2} aberration={0.05} bezel={0.4} blur={0.5} saturation={1.4} />
```

用 `as` 渲染为任意元素，`ref` 指向该元素，其余属性原样透传：

```jsx
<LiquidGlass as="button" type="button" radius={999} onClick={onClick}>按钮</LiquidGlass>
```

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `intensity` | 强度，0 ~ 1 | `0.5` |
| `refraction` | 折射强度，随元素尺寸缩放，负值反向 | 由强度计算 |
| `aberration` | 色散，0 ~ 0.5 | 由强度计算 |
| `bezel` | 折射边框宽度，占短边比例，0 ~ 0.5 | 由强度计算 |
| `blur` | 模糊（px） | 由强度计算 |
| `saturation` | 饱和度倍数 | 由强度计算 |
| `radius` | 圆角（px） | `24` |
| `tint` | 玻璃底色 | `rgba(255, 255, 255, 0.08)` |
| `as` | 渲染的元素或组件 | `'div'` |
