# Liquidrop

[简体中文](./README.md) | English

An iOS-style liquid glass component for React, built on SVG filters: edge refraction, chromatic aberration and glass highlights.

> The SVG refraction filter (`backdrop-filter: url()`) currently only works in Chromium-based browsers. Other browsers fall back to a frosted blur.

## Install

```bash
npm i liquidrop
```

## Usage

```jsx
import { LiquidGlass } from 'liquidrop'

<LiquidGlass />

<LiquidGlass>{children}</LiquidGlass>
```

Tune a single intensity (0 to 1, default 0.5):

```jsx
<LiquidGlass intensity={0.8}>{children}</LiquidGlass>
```

For fine control, pass advanced props. They override the values derived from `intensity`:

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

| Prop | Description | Default |
| --- | --- | --- |
| `intensity` | Overall strength, 0 to 1 | `0.5` |
| `refraction` | Edge displacement in px, negative flips direction | derived |
| `aberration` | Chromatic offset in px | derived |
| `bezel` | Refracting rim width as a fraction of the short side, 0 to 0.5 | derived |
| `blur` | Blur in px | derived |
| `saturation` | Saturation multiplier | derived |
| `radius` | Border radius in px | `24` |
| `tint` | Glass background color | `rgba(255, 255, 255, 0.08)` |

Other props (`className`, `style`, events, etc.) are passed to the root `div`.

Interactive demo: open `demo/index.html` after building it with `pnpm demo`.
