/* Primitivos de interfaz. Escala simple: text-sm cuerpo, text-base/lg títulos. */

import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

export function Card({ className = "", children, ...rest }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function CardHead({ titulo, sub, right }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <h3 className="text-base font-semibold text-ink-900">{titulo}</h3>
        {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  )
}

const TONOS = {
  teal: "bg-mana-50 text-mana-700",
  verde: "bg-emerald-50 text-emerald-700",
  ambar: "bg-amber-50 text-amber-700",
  rojo: "bg-rose-50 text-rose-700",
  gris: "bg-slate-100 text-slate-600",
}

export function Badge({ tono = "gris", children }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${TONOS[tono]}`}>
      {children}
    </span>
  )
}

const ESTILOS_BTN = {
  primary: "bg-mana-500 text-white hover:bg-mana-600",
  dark: "bg-ink-900 text-white hover:bg-ink-800",
  ghost: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
  soft: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  quiet: "text-slate-500 hover:text-ink-900",
}

export function Btn({ variant = "ghost", icon: Icon, className = "", children, ...rest }) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${ESTILOS_BTN[variant]} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}

export function Stat({ label, valor, sub, tono = "ink" }) {
  return (
    <Card className="px-5 py-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${tono === "teal" ? "text-mana-600" : "text-ink-900"}`}>
        {valor}
      </p>
      {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
    </Card>
  )
}

export function Progress({ value, className = "", barra = "bg-mana-500" }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <div
        className={`h-full rounded-full ${barra} transition-[width] duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function Avatar({ iniciales, size = 40, tono = "bg-mana-50 text-mana-700" }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${tono}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {iniciales}
    </span>
  )
}

export function Campo({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  )
}

export const claseInput =
  "w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-mana-400 focus:ring-2 focus:ring-mana-100"

export function Vacio({ children }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-400">
      {children}
    </p>
  )
}

/* Ventana flotante. Cierra con Escape o tocando el fondo, y bloquea el scroll de atrás.
   En teléfono se ancla abajo (hoja) y en pantallas grandes queda centrada.

   Va en un portal sobre <body> a propósito: cualquier ancestro con `transform` —como la
   animación de entrada de las vistas— se vuelve el bloque contenedor de un `position: fixed`
   y dejaría la ventana al final de la página en vez de sobre la pantalla. */
export function Modal({ titulo, sub, onCerrar, children, pie }) {
  useEffect(() => {
    const alTeclear = (e) => e.key === "Escape" && onCerrar()
    document.addEventListener("keydown", alTeclear)
    const previo = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", alTeclear)
      document.body.style.overflow = previo
    }
  }, [onCerrar])

  if (typeof document === "undefined") return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white sm:max-w-lg sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink-900">{titulo}</h2>
            {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
          </div>
          <button
            onClick={onCerrar}
            aria-label="Cerrar ventana"
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-ink-900"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {pie && <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">{pie}</div>}
      </div>
    </div>,
    document.body,
  )
}

/* QR decorativo determinista: la misma semilla dibuja siempre el mismo patrón.
   No codifica información real — es una maqueta. */
function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function QR({ seed = "mana", size = 180, color = "#0d1a21", bg = "#ffffff" }) {
  const n = 21
  const cell = size / n
  const semilla = hash(seed)
  const rnd = (i) => ((Math.imul(semilla ^ (i * 2654435761), 2246822519) >>> 0) % 1000) / 1000
  const esFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)

  const celdas = []
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (esFinder(r, c)) continue
      if (rnd(r * n + c) > 0.52) celdas.push([r, c])
    }
  }

  const Finder = ({ x, y }) => (
    <g transform={`translate(${x * cell} ${y * cell})`}>
      <rect width={cell * 7} height={cell * 7} rx={cell} fill={color} />
      <rect x={cell} y={cell} width={cell * 5} height={cell * 5} rx={cell * 0.7} fill={bg} />
      <rect x={cell * 2} y={cell * 2} width={cell * 3} height={cell * 3} rx={cell * 0.5} fill={color} />
    </g>
  )

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Código QR de ejemplo">
      <rect width={size} height={size} fill={bg} />
      {celdas.map(([r, c]) => (
        <rect
          key={`${r}-${c}`}
          x={c * cell + cell * 0.1}
          y={r * cell + cell * 0.1}
          width={cell * 0.8}
          height={cell * 0.8}
          rx={cell * 0.2}
          fill={color}
        />
      ))}
      <Finder x={0} y={0} />
      <Finder x={n - 7} y={0} />
      <Finder x={0} y={n - 7} />
    </svg>
  )
}

export const bs = (n) => `Bs. ${n.toLocaleString("es-BO")}`
