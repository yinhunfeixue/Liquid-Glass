import { defineConfig } from 'tsdown'

export default defineConfig({
  platform: 'neutral',
  dts: true,
  // 同时生成 main / module / types，兼容旧版 TypeScript 与打包工具
  exports: { legacy: true },
})
