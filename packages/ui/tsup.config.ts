import {defineConfig} from 'tsup'

export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    format: ['esm'],
    external: ['react'],
  }
})
