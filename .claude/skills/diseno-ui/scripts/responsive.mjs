#!/usr/bin/env node
/**
 * Verificación de responsividad — MANA REHAB
 *
 * Abre la app en teléfono, tablet y escritorio; en cada vista comprueba que no haya
 * desborde horizontal ni errores de JavaScript, y guarda una captura de pantalla completa.
 * También abre la ventana flotante de nueva reserva y verifica que quede dentro de la pantalla
 * (un ancestro con `transform` la puede empujar al final de la página).
 *
 * Requiere Chrome instalado y `playwright-core` (ya está en devDependencies).
 *
 * Uso — hay que servir la app antes, porque el script sólo navega:
 *   npm run build
 *   npx vite preview --port 4173 --strictPort &
 *   node .claude/skills/diseno-ui/scripts/responsive.mjs <carpeta-de-capturas>
 *
 * Importante: ejecutalo desde la raíz del proyecto (si no, Node no resuelve playwright-core).
 * Sale con código 1 si encuentra problemas.
 */

import { chromium } from "playwright-core"

const BASE = process.env.BASE_URL ?? "http://localhost:4173"
const DIR = process.argv[2]
const CHROME =
  process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe"

const VIEWPORTS = [
  { nombre: "movil", width: 390, height: 844 },
  { nombre: "tablet", width: 820, height: 1180 },
  { nombre: "escritorio", width: 1440, height: 900 },
]

if (!DIR) {
  console.error("Falta la carpeta de salida: node responsive.mjs <carpeta-de-capturas>")
  process.exit(1)
}

const navegador = await chromium.launch({ executablePath: CHROME, headless: true })
const problemas = []

for (const vp of VIEWPORTS) {
  const ctx = await navegador.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await ctx.newPage()
  const errores = []
  page.on("pageerror", (e) => errores.push(String(e)))
  await page.goto(BASE, { waitUntil: "networkidle" })

  // Las vistas se leen de la barra de navegación, así el script no queda desactualizado
  // cuando se agrega o se renombra un módulo.
  const vistas = await page.locator("header nav button").evaluateAll((bs) =>
    bs.map((b) => b.getAttribute("aria-label")).filter(Boolean),
  )
  if (!vistas.length) {
    problemas.push(`${vp.nombre}: no se encontró ninguna pestaña en la navegación`)
    await ctx.close()
    continue
  }

  for (const vista of vistas) {
    await page.getByRole("button", { name: vista, exact: true }).click()
    await page.waitForTimeout(300)

    const desborde = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    if (desborde > 1) problemas.push(`${vp.nombre} · ${vista}: desborde horizontal de ${desborde}px`)

    await page.screenshot({
      path: `${DIR}/${vp.nombre}-${vista.replace(/\s+/g, "-").toLowerCase()}.png`,
      fullPage: true,
    })
  }

  await page.getByRole("button", { name: "Agenda", exact: true }).click()
  await page.getByRole("button", { name: "Nueva reserva" }).click()
  await page.waitForTimeout(350)
  const caja = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]')
    if (!d) return null
    const r = d.getBoundingClientRect()
    return { top: r.top, bottom: r.bottom, alto: window.innerHeight }
  })
  if (!caja) problemas.push(`${vp.nombre}: la ventana flotante no se abrió`)
  else if (caja.bottom > caja.alto + 1 || caja.top < 0)
    problemas.push(`${vp.nombre}: ventana flotante fuera de pantalla ${JSON.stringify(caja)}`)
  await page.screenshot({ path: `${DIR}/${vp.nombre}-modal.png` })
  await page.keyboard.press("Escape")

  if (errores.length) problemas.push(`${vp.nombre}: errores JS → ${errores.join(" | ")}`)
  await ctx.close()
}

await navegador.close()

if (problemas.length) {
  console.log(`Problemas encontrados (${problemas.length}):\n` + problemas.join("\n"))
  process.exit(1)
}
console.log(`✓ Sin desbordes ni errores de JS en ${VIEWPORTS.length} tamaños · capturas en ${DIR}`)
