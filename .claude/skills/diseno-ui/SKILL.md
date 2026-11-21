---
name: diseno-ui
description: Sistema de diseño, patrones de UX y reglas de optimización del panel clínico MANA REHAB (React 19 + Vite + Tailwind v4). Úsala siempre que se trabaje en la interfaz de este proyecto -- crear o modificar una vista, pantalla, card, tabla, formulario o gráfico; elegir colores, tipografía, espaciado o iconos; ajustar responsive, estados vacíos, carga o error; revisar accesibilidad; o refactorizar, limpiar y optimizar componentes React. Aplícala incluso cuando el pedido suene puramente funcional ("agregá un filtro", "que se vea el total", "arreglá esta pantalla"), porque cualquier cambio visible debe salir consistente con el resto del panel.
---

# Diseño UI/UX y optimización — MANA REHAB

Panel de demostración para un centro de fisioterapia. Lo usan recepcionistas y fisioterapeutas
**de pie, apurados, entre paciente y paciente**, y hoy sirve además como muestra para el cliente.
Eso fija dos criterios: se entiende sin explicación, y nada importante queda escondido detrás de
un clic de más.

**La consigna vigente es simplicidad.** Si dudás entre dos opciones, elegí la que tenga menos
elementos, menos tamaños de letra y menos colores. Lo que ya está en pantalla es la referencia:
cualquier cosa nueva tiene que parecer parte del mismo producto.

## Alcance actual

Cinco módulos, una sola barra de navegación arriba (sin barra lateral — tener dos era
redundante):

| Vista | Archivo | Qué hace |
|---|---|---|
| Agenda | `src/views/Agenda.jsx` | Reservas por fecha, hora y camilla; atender, cobrar, agendar |
| Pacientes | `src/views/Pacientes.jsx` | Buscador, próxima visita, tratamiento en curso, historial, ejercicios y carnet QR |
| Cobros | `src/views/Cobros.jsx` | Cobro con QR, efectivo o tarjeta; lista de cobros del día |
| Reportes | `src/views/Reportes.jsx` | Ingresos, gastos, ganancia y caja del día |
| Horarios | `src/views/Horarios.jsx` | Horario de atención por día de la semana; condiciona los turnos de la agenda |

El estado compartido vive en `App.jsx` (`citas`, `transacciones`, `pacienteId`, `porCobrar`,
`reservarPara`, `horarioSemanal`) y baja por props. Las vistas no se hablan entre sí: lo hacen a través de esos
manejadores.

El carnet QR ya no es una pestaña: vive dentro de la ficha del paciente, que es donde alguien
lo necesita. Las vistas se cruzan por paciente —"Ficha" desde un turno, "Agendar" desde la
ficha—, y esos saltos son parte de la demo.

## Orden de trabajo

1. **Reusar antes que crear.** Primitivos en `src/components/ui.jsx`: `Card`, `CardHead`,
   `Badge`, `Btn`, `Stat`, `Progress`, `Avatar`, `Campo`, `claseInput`, `Vacio`, `QR`, `bs()`,
   `Modal`. Si algo se parece en un 80%, extendé el primitivo con una prop en vez de duplicar
   markup.
2. **Decidir jerarquía antes que color**: qué dato es el titular, qué es contexto, qué es acción.
   → `references/patrones-ux.md`
3. **Usar tokens y la escala tipográfica**, nunca valores sueltos. → `references/sistema-de-diseno.md`
4. **Cubrir los estados**: con datos, vacío (`Vacio`), y —si alguna vez hay red— cargando y error.
5. **Auditar**:
   ```bash
   node .claude/skills/diseno-ui/scripts/audit-ui.mjs
   ```
6. **Compilar y hacer humo**: `npm run build`, y el render SSR de todas las vistas que está en
   `references/optimizacion.md` (el build no ejecuta los componentes, el humo sí).
7. **Si tocaste layout, verificar en los tres tamaños** con capturas reales:
   ```bash
   npm run build && npx vite preview --port 4173 --strictPort &
   node .claude/skills/diseno-ui/scripts/responsive.mjs <carpeta-de-capturas>
   ```
   Detecta desbordes horizontales, errores de JS y ventanas flotantes fuera de pantalla. Después
   **mirá las capturas**: el script no ve que dos etiquetas se pisen.

## Lo que define la identidad visual

- **Claro y aireado.** Fondo `bg-canvas`, tarjetas blancas con borde `border-slate-200`,
  `rounded-xl`, **sin sombras**. La separación la hacen el borde y el espacio.
- **Una escala tipográfica corta**: `text-sm` para casi todo, `text-base` para títulos de
  tarjeta, `text-2xl` para el título de vista, `text-3xl` para la cifra grande de un `Stat`.
  Nada de tamaños en píxeles sueltos ni de versalitas: se eliminaron a propósito.
- **Un solo acento.** `mana-500` para la acción principal y los datos destacados; el resto es
  gris. Un botón primario por bloque.
- **El oscuro es un objeto, no un estilo.** El único bloque `ink-900` es el pase digital del
  carnet, porque representa algo distinto: la tarjeta que ve el paciente en su celular. No uses
  fondo oscuro para decorar.
- **Badges para estado, siempre con palabra.** `pendiente` → ámbar, `atendido` → teal,
  `pagado` → verde. El color nunca comunica solo.
- **Español de Bolivia.** Montos con `bs()` (`Bs. 1.500`), horas en 24 h, "camilla",
  "fisioterapeuta", "paciente". Sin inglés en la interfaz.

## Reglas que evitan los errores típicos

- **Una sola navegación.** Si agregás un módulo, va a la barra superior de `App.jsx`. No
  reintroduzcas una barra lateral ni un segundo menú con los mismos destinos.
- **Las camillas son espacios, no personas.** En la grilla sólo se lee "Camilla 1"; quién
  atiende se elige en cada reserva y se muestra en la tarjeta del turno.
- **Toda reserva tiene fecha y hora.** Nada de un "día de hoy" implícito: `fecha` es una fecha
  real (`AAAA-MM-DD`) y la agenda filtra por ella. El horario y la camilla se eligen en la
  grilla de disponibilidad de la ventana (`SelectorEspacio`), no en dos listas sueltas: ver qué
  está libre es justamente el trabajo de quien reserva, y así no se puede pisar otro turno.
- **Una ventana flotante va en `Modal`**, que se monta en un portal sobre `<body>`. Un
  `position: fixed` dentro de la vista queda atrapado por el `transform` de la animación de
  entrada y aparece al final de la página.
- **Un color de marca no es un color de dato.** Para gráficos usá la paleta validada de
  `references/sistema-de-diseno.md`; no pintes varias series con tonos de teal.
- **Acción destructiva ≠ acción primaria.** Cancelar un turno o anular un cobro va en variante
  secundaria y con confirmación inline que nombre la consecuencia.
- **Nada de `alert()`, `confirm()` ni `prompt()`**: bloquean el flujo y la automatización.
- **Los datos viven en `src/data.js`.** Nombres, precios, horarios y textos de demo van ahí.
- **Todo es ficticio y debe parecerlo**: pacientes de ejemplo, montos redondos, CI inventados.
  El QR de `ui.jsx` es decorativo y no codifica nada; si alguna vez tiene que escanearse de
  verdad, hay que cambiarlo por una librería real y decirlo.
- **Los horarios disponibles salen de la configuración, nunca de una lista fija.** Usá
  `horasAbiertas(fecha, horarioSemanal)` para lo que se puede reservar y
  `horasVisibles(fecha, horarioSemanal, citas)` para lo que se muestra en la agenda: la segunda
  suma los turnos que quedaron fuera del horario actual, porque cambiar el horario no puede
  esconder —ni borrar— una reserva que ya existe. Lo que está fuera de rango se ve, pero no se
  puede reservar.
- **Lo que se ve en la ficha sale de los datos, no está escrito a mano.** La próxima visita y
  el historial se derivan de `citas` con `proximaVisita()` y `visitasPasadas()` de `data.js`; si
  agregás un dato del tratamiento, va al objeto del paciente.
- **Que siga siendo demostrable.** Cada vista tiene que poder mostrarse sola y el recorrido
  agenda → ficha → cobro → reporte tiene que seguir funcionando después de tu cambio.

## Archivos de referencia

| Archivo | Cuándo leerlo |
|---|---|
| `references/sistema-de-diseno.md` | Colores, tokens, tipografía, espaciado, iconos, paleta de gráficos |
| `references/componentes.md` | Firma y uso de cada primitivo, y cómo extenderlos |
| `references/patrones-ux.md` | Layout de vista, jerarquía, estados, feedback, accesibilidad, microcopy |
| `references/optimizacion.md` | Rendimiento React/Vite, limpieza y verificación (incluye el humo SSR) |

## Cómo presentar el trabajo terminado

Decí qué vistas tocaste, qué patrón reusaste, qué estados cubriste y qué verificación corriste
(auditoría, build, humo). Si tomaste una decisión de diseño que se aparta de lo pedido, decila
en una línea con el motivo en vez de esconderla.
