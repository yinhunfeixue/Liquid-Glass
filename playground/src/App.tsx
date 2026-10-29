import { useRef, useState, type PointerEvent } from 'react'
import { LiquidGlass, resolveOptions, type GlassOptions } from 'liquid-glass2'

interface Config {
  mode: 'intensity' | 'pro'
  intensity: number
  pro: GlassOptions
  radius: number
  width: number
  height: number
  tint: number
}

const base = (intensity: number): Config => ({
  mode: 'intensity',
  intensity,
  pro: resolveOptions(intensity),
  radius: 32,
  width: 320,
  height: 200,
  tint: 0.08,
})

const presets: { name: string, config: Config }[] = [
  { name: '轻盈', config: base(0.25) },
  { name: '标准', config: base(0.5) },
  { name: '强烈', config: base(0.9) },
  {
    name: '水滴',
    config: {
      ...base(0.5),
      mode: 'pro',
      pro: { refraction: 1.2, aberration: 0.05, bezel: 0.4, blur: 0.5, saturation: 1.4 },
      radius: 999,
      width: 200,
      height: 200,
      tint: 0.02,
    },
  },
  {
    name: '胶囊',
    config: { ...base(0.6), radius: 999, width: 360, height: 96 },
  },
  {
    name: '磨砂',
    config: {
      ...base(0.5),
      mode: 'pro',
      pro: { refraction: 0.8, aberration: 0.02, bezel: 0.12, blur: 5, saturation: 1.8 },
      tint: 0.18,
    },
  },
]

const proFields: { key: keyof GlassOptions, label: string, min: number, max: number, step: number }[] = [
  { key: 'refraction', label: '折射 refraction', min: -3, max: 3, step: 0.05 },
  { key: 'aberration', label: '色散 aberration', min: 0, max: 0.5, step: 0.01 },
  { key: 'bezel', label: '边框 bezel', min: 0, max: 0.5, step: 0.01 },
  { key: 'blur', label: '模糊 blur', min: 0, max: 10, step: 0.1 },
  { key: 'saturation', label: '饱和度 saturation', min: 0, max: 3, step: 0.05 },
]

function Slider(props: { label: string, value: number, min: number, max: number, step: number, disabled?: boolean, onChange: (v: number) => void }) {
  return (
    <label className={`field${props.disabled ? ' disabled' : ''}`}>
      <span>{props.label}</span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        disabled={props.disabled}
        onChange={e => props.onChange(Number(e.target.value))}
      />
      <output>{props.value}</output>
    </label>
  )
}

function toCode(c: Config) {
  const props: string[] = []
  if (c.mode === 'intensity') props.push(`intensity={${c.intensity}}`)
  else for (const f of proFields) props.push(`${f.key}={${c.pro[f.key]}}`)
  props.push(`radius={${c.radius}}`, `tint="rgba(255, 255, 255, ${c.tint})"`)
  props.push(`style={{ width: ${c.width}, height: ${c.height} }}`)
  return `<LiquidGlass\n  ${props.join('\n  ')}\n>\n  {children}\n</LiquidGlass>`
}

export function App() {
  const [c, setC] = useState<Config>(presets[1]!.config)
  const [active, setActive] = useState('标准')
  const [pos, setPos] = useState({ x: 120, y: 160 })
  const drag = useRef<{ dx: number, dy: number } | null>(null)

  const update = (patch: Partial<Config>) => {
    setActive('')
    setC(prev => ({ ...prev, ...patch }))
  }
  const derived = resolveOptions(c.intensity)
  const shown = c.mode === 'intensity' ? derived : c.pro
  const glassProps = c.mode === 'intensity' ? { intensity: c.intensity } : c.pro
  const flowProps = { ...glassProps, radius: Math.min(c.radius, 32), tint: `rgba(255, 255, 255, ${c.tint})` }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y }
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current) setPos({ x: e.clientX - drag.current.dx, y: e.clientY - drag.current.dy })
  }

  return (
    <div className="page">
      <div className="scene">
        {/* 悬浮元素：可拖动的玻璃 */}
        <div className="stage">
          <h1 className="bg-title">Liquid Glass</h1>
          <p className="bg-text">
            The quick brown fox jumps over the lazy dog. 敏捷的棕色狐狸跳过了懒狗。
            Liquid glass bends the light around its edges — drag the glass around to see it.
          </p>
          <div className="bg-stripes" />
          <div className="bg-dots" />

          <LiquidGlass
            {...glassProps}
            radius={c.radius}
            tint={`rgba(255, 255, 255, ${c.tint})`}
            className="glass"
            style={{ width: c.width, height: c.height, left: pos.x, top: pos.y }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => (drag.current = null)}
          >
            <span className="glass-label">拖动我 · Drag me</span>
          </LiquidGlass>

          <LiquidGlass className="toolbar" radius={999} intensity={0.6}>
            <button type="button">◀</button>
            <button type="button">▶</button>
            <button type="button">♥</button>
          </LiquidGlass>
        </div>

        {/* 普通文档流中的元素：nav / article / button / input，使用右侧面板的参数 */}
        <section className="flow">
          <LiquidGlass as="nav" className="flow-nav" {...flowProps}>
            <strong>liquid-glass2</strong>
            <a href="#home">首页</a>
            <a href="#docs">文档</a>
            <a href="#about">关于</a>
          </LiquidGlass>

          <h2 className="flow-title">在普通元素上使用</h2>
          <div className="flow-grid">
            {(['article', 'section', 'aside'] as const).map(tag => (
              <LiquidGlass key={tag} as={tag} className="flow-card" {...flowProps}>
                <h3>{`<${tag}>`}</h3>
                <p>普通文档流里的块级元素，宽度自适应，内容撑开高度。</p>
              </LiquidGlass>
            ))}
          </div>

          <div className="flow-row">
            <LiquidGlass as="button" type="button" className="flow-button" {...flowProps} radius={999}>
              按钮 button
            </LiquidGlass>
            <LiquidGlass as="input" className="flow-input" placeholder="输入框 input" {...flowProps} radius={999} />
            <LiquidGlass as="span" className="flow-tag" {...flowProps} radius={999}>
              行内 span
            </LiquidGlass>
          </div>
        </section>
      </div>

      <aside className="panel">
        <h2>liquid-glass2</h2>
        <section>
          <h3>推荐效果</h3>
          <div className="presets">
            {presets.map(p => (
              <button
                type="button"
                key={p.name}
                className={active === p.name ? 'on' : ''}
                onClick={() => {
                  setC(p.config)
                  setActive(p.name)
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>参数模式</h3>
          <div className="tabs">
            <button type="button" className={c.mode === 'intensity' ? 'on' : ''} onClick={() => update({ mode: 'intensity' })}>
              单一强度
            </button>
            <button type="button" className={c.mode === 'pro' ? 'on' : ''} onClick={() => update({ mode: 'pro', pro: shown })}>
              专业参数
            </button>
          </div>
          <Slider
            label="强度 intensity"
            value={c.intensity}
            min={0}
            max={1}
            step={0.01}
            disabled={c.mode === 'pro'}
            onChange={intensity => update({ intensity })}
          />
          {proFields.map(f => (
            <Slider
              key={f.key}
              label={f.label}
              value={shown[f.key]}
              min={f.min}
              max={f.max}
              step={f.step}
              disabled={c.mode === 'intensity'}
              onChange={v => update({ pro: { ...c.pro, [f.key]: v } })}
            />
          ))}
        </section>

        <section>
          <h3>外观</h3>
          <Slider label="圆角 radius" value={c.radius} min={0} max={999} step={1} onChange={radius => update({ radius })} />
          <Slider label="宽 width" value={c.width} min={60} max={600} step={1} onChange={width => update({ width })} />
          <Slider label="高 height" value={c.height} min={40} max={400} step={1} onChange={height => update({ height })} />
          <Slider label="底色 tint" value={c.tint} min={0} max={0.6} step={0.01} onChange={tint => update({ tint })} />
        </section>

        <section>
          <h3>代码</h3>
          <pre>{toCode(c)}</pre>
        </section>
        <p className="note">SVG 折射滤镜需要 Chromium 内核浏览器（Chrome / Edge），其他浏览器显示为模糊玻璃。</p>
      </aside>
    </div>
  )
}
