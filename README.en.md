# Liquidrop

[简体中文](./README.md) | English | [Live Demo](https://yinhunfeixue.github.io/Liquid-Glass/)

## Introduction

An iOS-style liquid glass component for React, built on SVG filters: edge refraction, chromatic aberration, a light blur and glass highlights. Use it on floating layers or on regular elements such as navbars, cards, buttons and inputs.

Refraction requires a Chromium-based browser (Chrome, Edge). Other browsers show a frosted blur instead.

## Usage

```bash
npm i liquidrop
```

```jsx
import { LiquidGlass } from 'liquidrop'

<LiquidGlass />

<LiquidGlass>{children}</LiquidGlass>
```

Set only the intensity (0 to 1, default 0.5). All other values are derived from it:

```jsx
<LiquidGlass intensity={0.8}>{children}</LiquidGlass>
```

Advanced props override the derived values:

```jsx
<LiquidGlass refraction={1.2} aberration={0.05} bezel={0.4} blur={0.5} saturation={1.4} />
```

Use `as` to render any element. `ref` points to that element, and other props are passed through:

```jsx
<LiquidGlass as="button" type="button" radius={999} onClick={onClick}>Button</LiquidGlass>
```

| Prop | Description | Default |
| --- | --- | --- |
| `intensity` | Strength, 0 to 1 | `0.5` |
| `refraction` | Refraction strength, scales with element size, negative flips direction | derived |
| `aberration` | Chromatic aberration, 0 to 0.5 | derived |
| `bezel` | Refracting rim width as a fraction of the short side, 0 to 0.5 | derived |
| `blur` | Blur in px | derived |
| `saturation` | Saturation multiplier | derived |
| `radius` | Border radius in px | `24` |
| `tint` | Glass background color | `rgba(255, 255, 255, 0.08)` |
| `as` | Element or component to render | `'div'` |
