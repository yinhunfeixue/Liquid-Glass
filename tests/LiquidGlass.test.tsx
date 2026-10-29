import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { createDisplacementMap, LiquidGlass, resolveOptions } from '../src'

// jsdom 没有布局，手动给元素一个尺寸
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 200 })
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => 100 })
})

afterEach(cleanup)

describe('resolveOptions', () => {
  test('由强度推导参数，强度越大效果越强', () => {
    const low = resolveOptions(0.1)
    const high = resolveOptions(0.9)
    expect(high.refraction).toBeGreaterThan(low.refraction)
    expect(high.aberration).toBeGreaterThan(low.aberration)
    expect(high.bezel).toBeGreaterThan(low.bezel)
    expect(high.blur).toBeGreaterThan(low.blur)
    expect(high.saturation).toBeGreaterThan(low.saturation)
  })

  test('默认强度为 0.5，超出范围会被限制', () => {
    expect(resolveOptions()).toEqual(resolveOptions(0.5))
    expect(resolveOptions(5)).toEqual(resolveOptions(1))
    expect(resolveOptions(-1)).toEqual(resolveOptions(0))
  })

  test('专业参数优先于强度推导值，undefined 不覆盖', () => {
    const opts = resolveOptions(0.5, { refraction: -80, blur: 3, aberration: undefined })
    expect(opts.refraction).toBe(-80)
    expect(opts.blur).toBe(3)
    expect(opts.aberration).toBe(resolveOptions(0.5).aberration)
  })

  test('非法值会被修正', () => {
    const opts = resolveOptions(0.5, { bezel: 2, blur: -1, saturation: -1 })
    expect(opts.bezel).toBe(0.5)
    expect(opts.blur).toBe(0)
    expect(opts.saturation).toBe(0)
  })
})

describe('createDisplacementMap', () => {
  test('生成对应尺寸的 SVG data URL', () => {
    const url = createDisplacementMap(200, 100, 20, 0.2)
    expect(url.startsWith('data:image/svg+xml,')).toBe(true)
    const svg = decodeURIComponent(url.slice('data:image/svg+xml,'.length))
    expect(svg).toContain('width="200"')
    expect(svg).toContain('height="100"')
    // 边框 = 短边 100 * 0.2 = 20
    expect(svg).toContain('x="20" y="20" width="160" height="60"')
  })
})

describe('<LiquidGlass />', () => {
  test('无 children 时使用默认尺寸', () => {
    const { container } = render(<LiquidGlass />)
    const root = container.firstElementChild as HTMLElement
    expect(root.style.width).toBe('160px')
    expect(root.style.height).toBe('160px')
    expect(root.style.borderRadius).toBe('24px')
  })

  test('渲染 children 并透传属性', () => {
    const { getByText, container } = render(
      <LiquidGlass className="my-glass" style={{ width: 300 }}>
        <span>hello</span>
      </LiquidGlass>,
    )
    const root = container.firstElementChild as HTMLElement
    expect(getByText('hello')).toBeTruthy()
    expect(root.className).toBe('my-glass')
    expect(root.style.width).toBe('300px')
  })

  test('生成 SVG 滤镜，id 合法且参数生效', () => {
    const { container } = render(<LiquidGlass refraction={66} aberration={4} blur={2} />)
    const filter = container.querySelector('filter')!
    expect(filter.id).toMatch(/^liquidrop-[\w-]+$/)
    const scales = [...container.querySelectorAll('feDisplacementMap')].map(n => n.getAttribute('scale'))
    expect(scales).toEqual(['66', '70', '74'])
    expect(container.querySelector('feGaussianBlur')!.getAttribute('stdDeviation')).toBe('2')
    expect(container.querySelector('feImage')!.getAttribute('width')).toBe('200')
  })

  test('多个实例的滤镜 id 不重复', () => {
    const { container } = render(
      <>
        <LiquidGlass />
        <LiquidGlass />
      </>,
    )
    const ids = [...container.querySelectorAll('filter')].map(f => f.id)
    expect(new Set(ids).size).toBe(2)
  })
})
