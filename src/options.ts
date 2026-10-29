/** 专业参数，均可单独覆盖由 intensity 推导出的值 */
export interface GlassOptions {
  /** 折射强度，边缘最大位移 ≈ 边框宽度 × refraction，随元素尺寸自动缩放；负值反向 */
  refraction: number
  /** 色散，RGB 三通道位移的相对差值，0 ~ 0.5 */
  aberration: number
  /** 折射边框宽度，占短边的比例，0 ~ 0.5 */
  bezel: number
  /** 折射后的模糊（px） */
  blur: number
  /** 饱和度倍数，1 为原色 */
  saturation: number
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** 由单一强度（0 ~ 1）推导全部参数，再用 overrides 覆盖 */
export type GlassOverrides = { [K in keyof GlassOptions]?: GlassOptions[K] | undefined }

export function resolveOptions(intensity = 0.5, overrides: GlassOverrides = {}): GlassOptions {
  const i = clamp(intensity, 0, 1)
  const base: GlassOptions = {
    refraction: Math.round((0.4 + 1.2 * i) * 100) / 100,
    aberration: Math.round(0.15 * i * 100) / 100,
    bezel: Math.round((0.08 + 0.17 * i) * 100) / 100,
    // 保留一点基础模糊，避免中间区域完全透明
    blur: Math.round((0.6 + 2.4 * i) * 10) / 10,
    saturation: Math.round((1 + 0.6 * i) * 100) / 100,
  }
  const merged = { ...base }
  for (const key of Object.keys(base) as (keyof GlassOptions)[]) {
    const v = overrides[key]
    if (typeof v === 'number' && Number.isFinite(v)) merged[key] = v
  }
  merged.bezel = clamp(merged.bezel, 0, 0.5)
  merged.aberration = clamp(merged.aberration, 0, 0.5)
  merged.blur = Math.max(0, merged.blur)
  merged.saturation = Math.max(0, merged.saturation)
  return merged
}

/**
 * 生成位移贴图（SVG data URL）。
 * R 通道控制水平位移、B 通道控制垂直位移，中间 50% 灰为不位移区域，
 * 只有圆角矩形外圈（bezel）产生折射。
 */
export function createDisplacementMap(width: number, height: number, radius: number, bezel: number): string {
  const b = Math.min(width, height) * clamp(bezel, 0, 0.5)
  const innerW = Math.max(0, width - 2 * b)
  const innerH = Math.max(0, height - 2 * b)
  const rx = Math.max(0, Math.min(radius - b, innerW / 2, innerH / 2))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
    + `<defs>`
    + `<linearGradient id="r" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient>`
    + `<linearGradient id="b" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#00f"/></linearGradient>`
    + `<filter id="s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${b / 2}"/></filter>`
    + `</defs>`
    + `<rect width="${width}" height="${height}" fill="url(#r)"/>`
    + `<rect width="${width}" height="${height}" fill="url(#b)" style="mix-blend-mode:screen"/>`
    + `<rect x="${b}" y="${b}" width="${innerW}" height="${innerH}" rx="${rx}" fill="#808080" filter="url(#s)"/>`
    + `</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
