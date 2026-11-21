# Sistema de diseño — MANA REHAB

Los tokens viven en `src/index.css` dentro de `@theme`; Tailwind v4 los expone como clases
(`bg-mana-500`, `text-ink-900`, `bg-canvas`). **Si un color no está acá, no va en la interfaz.**
Si de verdad falta uno, agregalo al `@theme` con nombre semántico y sumalo a la lista
`HEX_PERMITIDOS` del script de auditoría, para que las dos fuentes no se contradigan.

## Paleta

### Marca — `mana-*`

| Token | Hex | Para qué |
|---|---|---|
| `mana-50` | `#effcfd` | Fondo de pestaña activa, chip seleccionado, bloque suave |
| `mana-100` | `#d3f5f9` | Anillo de foco (`focus:ring-mana-100`) |
| `mana-200` | `#ade9f1` | Texto de acento sobre fondo oscuro |
| `mana-300` | `#74d8e6` | Borde de hover, acento secundario |
| `mana-400` | `#33bed3` | Borde activo, barra de progreso sobre oscuro, logo |
| `mana-500` | `#17a2ba` | **Acción principal** y serie 1 de gráficos |
| `mana-600` | `#16829c` | Hover del primario, texto de acento sobre blanco |
| `mana-700` | `#1a6880` | Texto sobre fondos claros de marca |

### Neutros oscuros — `ink-*`

| Token | Hex | Para qué |
|---|---|---|
| `ink-700` | `#243843` | Bordes internos sobre oscuro |
| `ink-800` | `#15262f` | Texto base del `body`, hover de botón oscuro |
| `ink-900` | `#0d1a21` | Títulos y cifras; fondo del pase digital del carnet |

### Superficies y grises

- `bg-canvas` (`#f6f8f9`) — fondo de la aplicación. Nunca blanco puro.
- `bg-white` — tarjetas; `bg-slate-50` — bloques internos dentro de una tarjeta.
- `border-slate-200` — borde de tarjeta; `border-slate-100` — divisor interno.
- Texto: `text-ink-900` (titular), `text-slate-600` (cuerpo), `text-slate-500` (secundario),
  `text-slate-400` (metadato).
- Grises de gráficos (sólo ahí): `#eef2f4` grilla, `#94a3b8` ticks, `#e2e8f0` eje y bordes de
  tooltip. `#d3dee2` es la barra de scroll.

### Estados

Usá siempre el helper `Badge` en vez de recrear las clases:

| Estado | `tono` | Significado |
|---|---|---|
| Pagado, completado | `verde` | emerald-50 / emerald-700 |
| En curso, atendido, destacado | `teal` | mana-50 / mana-700 |
| Pendiente, por cobrar | `ambar` | amber-50 / amber-700 |
| Problema | `rojo` | rose-50 / rose-700 |
| Neutro | `gris` | slate-100 / slate-600 |

### Paleta de gráficos (validada)

Cuatro ranuras en orden fijo, para cualquier serie categórica:

| Ranura | Hex | Uso actual |
|---|---|---|
| 1 | `#17a2ba` | Ingresos / Honorarios del equipo |
| 2 | `#eb6834` | Gastos / Insumos y vendajes |
| 3 | `#1baf7a` | Mantenimiento de equipos |
| 4 | `#eda100` | Alquiler y servicios |

Pasó validación de daltonismo (ΔE ≥ 8 entre pares adyacentes) y de banda de luminosidad sobre
superficie clara. Reglas que la acompañan:

- El color sigue a la **entidad**, no a su posición: filtrar series no debe repintar al resto.
- Con 2 o más series, leyenda siempre presente.
- Estos tonos quedan bajo 3:1 contra el blanco, así que los valores tienen que estar escritos
  (etiqueta con monto y %, o vista de tabla alternativa — el gráfico de reportes tiene ambas).
- Nunca eje Y doble. Dos magnitudes distintas = dos gráficos.

## Tipografía

Base del documento: **15 px**. Una escala corta, con clases estándar de Tailwind — **no uses
tamaños arbitrarios entre corchetes**, que es justamente lo que se eliminó al simplificar:

| Rol | Clase |
|---|---|
| Título de vista | `text-2xl font-semibold tracking-tight text-ink-900` |
| Título de tarjeta | `text-base font-semibold text-ink-900` |
| Cifra grande (`Stat`) | `text-3xl font-semibold` |
| Cifra mediana | `text-2xl font-semibold` |
| Cuerpo y la mayoría de los controles | `text-sm` |
| Metadato, badges, acciones chicas | `text-xs` |

Pesos: `font-semibold` para títulos y cifras, `font-medium` para énfasis y botones, normal para
el resto. Sin `uppercase`, sin `tracking` ancho, sin negritas decorativas. Cifras que cambian en
vivo o se alinean en columna: `tabular-nums`.

## Espaciado, radios y sombras

- Entre bloques de una vista: `space-y-6`. Entre tarjetas de una grilla: `gap-4`/`gap-5`.
- Tarjeta: cabecera `px-5 py-4` (la pone `CardHead`, con divisor `border-slate-100`), cuerpo
  `px-5 py-5`.
- Bloque interno: `rounded-lg bg-slate-50 p-3`/`p-4`.
- Radios: `rounded-md` badges, `rounded-lg` controles y bloques internos, `rounded-xl` tarjetas,
  `rounded-full` avatares y barras de progreso.
- **Sin sombras**, salvo la mínima del segmento activo en un grupo de pestañas (`shadow-sm`).
- Ancho máximo de contenido: `max-w-6xl` centrado, con `px-5`.

## Iconografía

`lucide-react`, `size={16}` en línea con texto y `size={16}`–`20` en botones de icono. Un icono
nunca comunica solo: va con texto, o con `aria-label` si el botón es de solo icono.

## Movimiento

Mínimo. `.fade-up` al cambiar de vista, `transition` en hover de botones y
`transition-[width] duration-500` en las barras de progreso. Nada más: es una herramienta de
trabajo, no una landing.
