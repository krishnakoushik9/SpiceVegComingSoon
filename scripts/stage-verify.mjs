#!/usr/bin/env node
// Stages apps/web/out/verify/* as the root of dist/verify so the Next-built
// verify route can be deployed to the spiceveg-verify Pages project (which
// serves verify.spiceveg.in at the apex). Asset paths in the export are
// absolute (/_next/...), so we copy _next + the fallback image alongside.
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const src = resolve(root, 'apps/web/out')
const dst = resolve(root, 'dist/verify')

if (!existsSync(resolve(src, 'verify/index.html'))) {
  console.error('apps/web/out/verify/index.html not found — run `pnpm build` first.')
  process.exit(1)
}

rmSync(dst, { recursive: true, force: true })
mkdirSync(dst, { recursive: true })

cpSync(resolve(src, 'verify/index.html'), resolve(dst, 'index.html'))
cpSync(resolve(src, '_next'), resolve(dst, '_next'), { recursive: true })
if (existsSync(resolve(src, '404.html'))) {
  cpSync(resolve(src, '404.html'), resolve(dst, '404.html'))
}
const fallback = resolve(root, 'apps/web/public/practices.jpg')
if (existsSync(fallback)) cpSync(fallback, resolve(dst, 'practices.jpg'))

writeFileSync(resolve(dst, '_redirects'), '/* /index.html 200\n')

console.log(`staged → ${dst}`)
