import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
} from 'react'
import { createPortal } from 'react-dom'
import { createDisplacementMap, resolveOptions, type GlassOverrides } from './options'

export interface GlassProps extends GlassOverrides {
  /** 整体强度 0 ~ 1，默认 0.5；单独传入的专业参数优先 */
  intensity?: number | undefined
  /** 圆角（px），默认 24 */
  radius?: number | undefined
  /** 玻璃底色，默认 rgba(255, 255, 255, 0.08) */
  tint?: string | undefined
}

/** `as` 指定渲染的元素或组件，默认 div，其余属性按该元素的类型透传 */
export type LiquidGlassProps<T extends ElementType = 'div'> = GlassProps & { as?: T }
  & Omit<ComponentPropsWithRef<T>, keyof GlassProps | 'as'>

// SVG 滤镜作为 backdrop-filter 目前只有 Chromium 内核支持，其他浏览器退化为模糊玻璃
const supportsSvgBackdrop = () =>
  typeof navigator !== 'undefined' && /Chrome\//.test(navigator.userAgent)

function LiquidGlassImpl(
  {
    as: Tag = 'div',
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
  }: LiquidGlassProps<ElementType>,
  ref: ForwardedRef<HTMLElement>,
) {
  const elRef = useRef<HTMLElement | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [svgOk, setSvgOk] = useState(false)
  const id = `liquid-glass2-${useId().replace(/[^\w-]/g, '')}`

  const opts = resolveOptions(intensity, { refraction, aberration, bezel, blur, saturation })

  const setRef = useCallback((el: HTMLElement | null) => {
    elRef.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) ref.current = el
  }, [ref])

  useEffect(() => {
    setSvgOk(supportsSvgBackdrop())
    const el = elRef.current
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
  const backdrop = ready && svgOk
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
    // 空的 div 没有尺寸，给一个默认大小
    ...(Tag === 'div' && children == null && { width: 160, height: 160 }),
    ...style,
  }

  // 位移量按边框宽度换算，小按钮和大卡片的折射比例一致；三个通道位移略有差异形成色散
  const scale = Math.min(width, height) * opts.bezel * opts.refraction * 2
  const round = (v: number) => Math.round(v * 10) / 10
  const channels = [
    { scale: round(scale), matrix: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0' },
    { scale: round(scale * (1 + opts.aberration)), matrix: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0' },
    { scale: round(scale * (1 + opts.aberration * 2)), matrix: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0' },
  ]

  // 滤镜挂到 body 上，不往目标元素里插子节点，因此 button / input / li 等任意元素都能用
  const filter = (
    <svg aria-hidden width="0" height="0" style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
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
  )

  return (
    <>
      <Tag ref={setRef} data-liquid-glass2="" style={rootStyle} {...rest}>
        {children}
      </Tag>
      {ready && createPortal(filter, document.body)}
    </>
  )
}

export const LiquidGlass = forwardRef(LiquidGlassImpl) as <T extends ElementType = 'div'>(
  props: LiquidGlassProps<T>,
) => ReactElement | null
