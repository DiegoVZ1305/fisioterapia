#!/usr/bin/env node
/**
 * Auditoría de interfaz — MANA REHAB
 *
 * Revisa src/ y reporta lo que se escapa del sistema de diseño o rompe accesibilidad básica:
 *   1. Colores hex fuera de la paleta aprobada
 *   2. Elementos <button> sin cursor-pointer
 *   3. Botones de solo icono sin etiqueta accesible
 *   4. onClick sobre div/span (no recibe foco ni teclado)
 *   5. setInterval / setTimeout dentro de useEffect sin limpieza
 *   6. alert() / confirm() / prompt() (bloquean el flujo y la automatización)
 *   7. console.log olvidado
 *
 * Uso:  node .claude/skills/diseno-ui/scripts/audit-ui.mjs [carpeta]
 * Sale con código 1 si hay hallazgos, para poder encadenarlo en un check.
 */

import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative, resolve } from "node:path"

const RAIZ = resolve(process.argv[2] ?? "src")
const PROYECTO = resolve(".")

/* Paleta aprobada: tokens de marca + semáforo clínico + series de gráficos + utilidades */
const HEX_PERMITIDOS = new Set(
  [
    // marca mana-50..700
    "#effcfd", "#d3f5f9", "#ade9f1", "#74d8e6", "#33bed3", "#17a2ba", "#16829c", "#1a6880",
    // neutros ink-700..900
    "#243843", "#15262f", "#0d1a21",
    // superficies y grises utilitarios (fondo, scrollbar, ejes y grilla de gráficos)
    "#f6f8f9", "#ffffff", "#fff", "#e2e8f0", "#eef2f4", "#d3dee2", "#94a3b8",
    // series de gráficos validadas
    "#eb6834", "#1baf7a", "#eda100",
  ].map((h) => h.toLowerCase()),
)

const hallazgos = []

function archivos(dir) {
  const salida = []
  for (const nombre of readdirSync(dir)) {
    if (nombre === "node_modules" || nombre.startsWith(".")) continue
    const ruta = join(dir, nombre)
    if (statSync(ruta).isDirectory()) salida.push(...archivos(ruta))
    else if (/\.(jsx?|css)$/.test(nombre)) salida.push(ruta)
  }
  return salida
}

function anotar(ruta, linea, regla, mensaje, fragmento) {
  hallazgos.push({
    archivo: relative(PROYECTO, ruta).replace(/\\/g, "/"),
    linea,
    regla,
    mensaje,
    fragmento: fragmento.trim().slice(0, 100),
  })
}

/* Devuelve el texto de la etiqueta de apertura que empieza en `inicio`. */
function etiquetaDesde(texto, inicio) {
  let profundidad = 0
  for (let i = inicio; i < texto.length; i++) {
    const c = texto[i]
    if (c === "{") profundidad++
    else if (c === "}") profundidad--
    else if (c === ">" && profundidad === 0) return texto.slice(inicio, i + 1)
  }
  return texto.slice(inicio, inicio + 600)
}

const lineaDe = (texto, indice) => texto.slice(0, indice).split("\n").length

function revisar(ruta) {
  const texto = readFileSync(ruta, "utf8")
  const lineas = texto.split("\n")
  const esCSS = ruta.endsWith(".css")

  /* 1. Colores fuera de paleta (sólo tokens hex completos: #rgb, #rgba, #rrggbb, #rrggbbaa) */
  for (const m of texto.matchAll(/#[0-9a-fA-F]{3,8}(?![\w-])/g)) {
    const hex = m[0].toLowerCase()
    if (![4, 5, 7, 9].includes(hex.length)) continue // "#2024-098" y similares no son colores
    if (HEX_PERMITIDOS.has(hex)) continue
    const n = lineaDe(texto, m.index)
    const contexto = lineas[n - 1] ?? ""
    // rgba() y colores dentro de @theme son definiciones de token, no uso suelto
    if (esCSS && /--color-/.test(contexto)) continue
    anotar(ruta, n, "paleta", `Color ${hex} fuera del sistema de diseño`, contexto)
  }

  if (esCSS) return

  /* 2–4. Elementos interactivos */
  for (const m of texto.matchAll(/<(button|div|span|a)\b/g)) {
    const etiqueta = etiquetaDesde(texto, m.index)
    const n = lineaDe(texto, m.index)
    const tipo = m[1]

    if (tipo === "button") {
      // un botón genérico (reenvía {...rest} o compone clases desde variables) se audita en su
      // definición, no en cada uso: ahí el texto y las clases llegan por props
      const esGenerico = /\{\.\.\.\w+\}/.test(etiqueta) || /className=\{`[^`]*\$\{/.test(etiqueta)

      if (!esGenerico && !/cursor-pointer/.test(etiqueta) && /className=/.test(etiqueta)) {
        anotar(ruta, n, "cursor", "<button> sin cursor-pointer", etiqueta)
      }

      // solo icono: entre apertura y cierre no hay texto literal ni expresión {…} que pueda serlo
      const cierre = texto.indexOf("</button>", m.index)
      if (cierre !== -1 && !esGenerico) {
        const interior = texto.slice(m.index + etiqueta.length, cierre)
        // fuera de las etiquetas, para que `size={13}` de un icono no cuente como contenido
        const fueraDeTags = interior.replace(/<[^>]*>/g, "")
        const textoLiteral = fueraDeTags.replace(/\{[^}]*\}/g, "").trim()
        const tieneExpresion = /\{/.test(fueraDeTags)
        const tieneIcono = /<[A-Z]\w*[\s/>]|<svg/.test(interior)
        if (!textoLiteral && !tieneExpresion && tieneIcono && !/aria-label|title=/.test(etiqueta)) {
          anotar(ruta, n, "a11y", "Botón de solo icono sin aria-label", etiqueta)
        }
      }
    } else if (tipo !== "a" && /\bonClick=/.test(etiqueta)) {
      anotar(ruta, n, "a11y", `<${tipo}> con onClick: usá <button> para que reciba foco`, etiqueta)
    }
  }

  /* 5. Timers sin limpieza */
  for (const m of texto.matchAll(/useEffect\(\s*\(\)\s*=>\s*\{/g)) {
    const inicio = m.index
    let profundidad = 0
    let fin = texto.length
    for (let i = texto.indexOf("{", inicio); i < texto.length; i++) {
      if (texto[i] === "{") profundidad++
      else if (texto[i] === "}" && --profundidad === 0) {
        fin = i
        break
      }
    }
    const cuerpo = texto.slice(inicio, fin)
    const usaTimer = /set(Interval|Timeout)\(/.test(cuerpo)
    const limpia = /clear(Interval|Timeout)\(/.test(cuerpo)
    if (usaTimer && !limpia) {
      anotar(ruta, lineaDe(texto, inicio), "timer", "useEffect con timer sin limpieza en el return", cuerpo)
    }
  }

  /* 6. Diálogos nativos */
  for (const m of texto.matchAll(/(?<![.\w])(alert|confirm|prompt)\s*\(/g)) {
    anotar(ruta, lineaDe(texto, m.index), "dialogo", `${m[1]}() bloquea el flujo: usá confirmación inline`, m[0])
  }

  /* 7. console.log */
  for (const m of texto.matchAll(/console\.log\(/g)) {
    anotar(ruta, lineaDe(texto, m.index), "limpieza", "console.log olvidado", m[0])
  }
}

for (const ruta of archivos(RAIZ)) revisar(ruta)

const ETIQUETA = {
  paleta: "Paleta",
  cursor: "Cursor",
  a11y: "Accesibilidad",
  timer: "Timers",
  dialogo: "Diálogos",
  limpieza: "Limpieza",
}

if (!hallazgos.length) {
  console.log(`✓ Auditoría de interfaz sin hallazgos en ${relative(PROYECTO, RAIZ) || "src"}/`)
  process.exit(0)
}

const porRegla = {}
for (const h of hallazgos) (porRegla[h.regla] ??= []).push(h)

console.log(`\nAuditoría de interfaz — ${hallazgos.length} hallazgo(s)\n`)
for (const [regla, lista] of Object.entries(porRegla)) {
  console.log(`${ETIQUETA[regla] ?? regla} (${lista.length})`)
  for (const h of lista) {
    console.log(`  ${h.archivo}:${h.linea}  ${h.mensaje}`)
    console.log(`      ${h.fragmento.replace(/\s+/g, " ")}`)
  }
  console.log("")
}
process.exit(1)
