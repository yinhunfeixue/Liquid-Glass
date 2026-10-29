import { useEffect, useId, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react'
import { createDisplacementMap, resolveOptions, type GlassOverrides } from './options'

export interface LiquidGlassProps extends HTMLAttributes<HTMLDivElement>, GlassOverrides {
  /** 整体强度 0 ~ 1，默认 0.5；单独传入的专业参数优先 */
  intensity?: number | undefined
  /** 圆角（px），默认 24 */
  radius?: number | undefined
  /** 玻璃底色，默认 rgba(255, 255, 255, 0.08) */
  tint?: string | undefined
}

// SVG 滤镜作为 backdrop-filter 目前只有 Chromium 内核支持，其他浏览器退化为模糊玻璃
const supportsSvgBackdrop = () =>
  typeof navigator !== 'undefined' && /Chrome\//.test(navigator.userAgent)

export function LiquidGlass({
  intensity,
  refraction,
  aberration,
  bezel,
  blur,
  saturation,
  radius = 24,
  tint = 'rgba(255, 255, 255, 0.08)',
  style,
  children,
  ...rest
}: LiquidGlassProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [svgOk, setSvgOk] = useState(false)
  const id = `liquidrop-${useId().replace(/[^\w-]/g, '')}`

  const opts = resolveOptions(intensity, { refraction, aberration, bezel, blur, saturation })

  useEffect(() => {
    setSvgOk(supportsSvgBackdrop())
    const el = ref.current
    if (!el) return
    const measure = () => setSize({ width: el.offsetWidth, height: el.offsetHeight })
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { width, height } = size
  const ready = width > 0 && height > 0
  const useSvg = ready && svgOk
  const backdrop = useSvg
    ? `url(#${id}) saturate(${opts.saturation})`
    : `blur(${Math.max(4, opts.blur * 4)}px) saturate(${opts.saturation})`

  const rootStyle: CSSProperties = {
    borderRadius: radius,
    background: tint,
    backdropFilter: backdrop,
    WebkitBackdropFilter: backdrop,
    boxShadow: [
      'inset 0 0 0 1px rgba(255, 255, 255, 0.25)',
      'inset 2px 2px 1px -1px rgba(255, 255, 255, 0.7)',
      'inset -2px -2px 1px -1px rgba(255, 255, 255, 0.4)',
      '0 8px 24px rgba(0, 0, 0, 0.18)',
    ].join(', '),
    ...(children == null && { width: 160, height: 160 }),
    ...style,
  }

  // 三个通道使用不同位移量，形成色散
  const channels = [
    { scale: opts.refraction, matrix: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0' },
    { scale: opts.refraction + opts.aberration, matrix: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0' },
    { scale: opts.refraction + opts.aberration * 2, matrix: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0' },
  ]

  return (
    <div ref={ref} data-liquidrop="" style={rootStyle} {...rest}>
      {ready && (
        <svg aria-hidden width="0" height="0" style={{ position: 'absolute', overflow: 'hidden', pointerEvents: 'none' }}>
          <filter id={id} colorInterpolationFilters="sRGB">
            <feImage
              href={createDisplacementMap(width, height, radius, opts.bezel)}
              x="0"
              y="0"
              width={width}
              height={height}
              result="map"
            />
            {channels.map((c, n) => (
              <feDisplacementMap
                key={`d${n}`}
                in="SourceGraphic"
                in2="map"
                scale={c.scale}
                xChannelSelector="R"
                yChannelSelector="B"
                result={`d${n}`}
              />
            ))}
            {channels.map((c, n) => (
              <feColorMatrix key={`c${n}`} in={`d${n}`} type="matrix" values={c.matrix} result={`c${n}`} />
            ))}
            <feBlend in="c0" in2="c1" mode="screen" result="rg" />
            <feBlend in="rg" in2="c2" mode="screen" result="rgb" />
            <feGaussianBlur in="rgb" stdDeviation={opts.blur} />
          </filter>
        </svg>
      )}
      {children}
    </div>
  )
}
