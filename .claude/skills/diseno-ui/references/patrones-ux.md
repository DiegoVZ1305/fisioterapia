# Patrones de UX — panel clínico

## Anatomía de una vista

Las cuatro vistas siguen la misma secuencia, y conviene que la siguiente también:

1. **Encabezado**: título `text-2xl`, una línea de descripción, y a la derecha el control
   principal de la vista (selector de día, de periodo, de paciente, o el total recaudado).
2. **Fila de indicadores**: 3–4 `Stat` con la foto del momento. Opcional, pero si la vista
   tiene números que resumen, van acá y no mezclados en el contenido.
3. **Bloque protagonista**: lo que la persona vino a hacer (la grilla de turnos, el formulario
   de cobro, el pase del carnet).
4. **Bloques de apoyo** al costado, en `lg:grid-cols-[1.4fr_1fr]` o similar.

El encabezado responde "dónde estoy", los indicadores "cómo vamos", el protagonista "qué hago
ahora". Si una vista nueva no encaja en esa secuencia, probablemente son dos vistas.

## Navegación

Una sola barra arriba, con las cuatro pestañas, la marca a la izquierda y el usuario a la
derecha. Tener además una barra lateral con los mismos destinos era redundante y se eliminó: si
agregás un módulo, va a `NAV` en `App.jsx`.

La vista activa se marca con `bg-mana-50 text-mana-700`; el resto en gris. Nada de subrayados,
flechas ni migas de pan: con cinco destinos no hacen falta. En teléfono las etiquetas se ocultan
y quedan sólo los iconos, por eso cada botón lleva `aria-label`.

## Jerarquía de la información

La regla práctica: **si alguien mira la pantalla un segundo y medio, ¿se lleva el dato
correcto?** Acá ese dato suele ser un nombre de paciente, una hora o un monto.

- Un solo elemento protagonista por pantalla. Dos compiten.
- Cifra primero, contexto debajo en `text-sm text-slate-500`.
- El estado va arriba a la derecha del bloque, en `Badge`, siempre con palabra.
- Si todo parece importante, nada lo es: bajá a gris lo que sea contexto.

## Estados de un bloque con datos

Cubrí los cuatro. El vacío y el de error son los que se olvidan y los que más se ven en uso real.

| Estado | Cómo se resuelve acá |
|---|---|
| Con datos | El patrón normal |
| Vacío | El helper `Vacio` con una frase útil, no "sin resultados". Ej.: "Todavía no se registró ningún cobro hoy." |
| Cargando | Bloques `animate-pulse bg-slate-100` con la forma del contenido final, no un spinner centrado |
| Error | Texto `text-rose-600` con qué pasó y un botón `ghost` para reintentar |

El estado vacío es una oportunidad de guiar: decí qué hacer ("Agendá el primer turno del día"),
no sólo que no hay nada.

## Acciones y confirmación

- **Una acción primaria por bloque.** Si hay dos botones teal en la misma tarjeta, uno está mal.
- **Lo destructivo se nombra.** "Cancelar turno" o "Anular cobro" van en variante secundaria y,
  si no se pueden deshacer, piden confirmación inline (un bloque que aparece debajo con la
  consecuencia escrita y dos botones), nunca `confirm()`.
- **Feedback inmediato y visible.** Después de guardar, mostrá el cambio en la interfaz
  (el badge pasa a "Pagado", el total del día sube, aparece el aviso de cobro registrado). Sin feedback, la persona vuelve
  a apretar.
- **Nada bloquea el flujo.** Sin modales a pantalla completa para tareas de 5 segundos.

## Microcopy

- Imperativo y corto: "Atender", "Agendar turno", "Registrar cobro de Bs. 180".
- Decí la consecuencia, no la mecánica: "Enviar a su WhatsApp", no "Compartir".
- Los rótulos de dato son nombres, no frases: "Turnos del día", "Pendientes de cobro".
- Nunca abrevies un nombre clínico de forma ambigua; preferí "Manguito rotador (hombro der.)".
- Sin signos de exclamación ni tono alegre. El contexto es clínico.

## Accesibilidad — lo mínimo innegociable

- Cualquier cosa clicable es `<button>` (o `<a>` si navega). Un `div` con `onClick` no recibe
  foco ni teclado; la auditoría lo marca.
- Botón de solo icono → `aria-label` con el verbo y el objeto ("Día siguiente", "Cerrar ventana").
- Ojo con el texto que se oculta por CSS: en la barra de navegación las etiquetas pasan a
  `hidden sm:inline`, así que en teléfono el botón queda sin nombre accesible. Por eso los
  botones de la navegación llevan `aria-label` además del texto visible. La auditoría estática no
  detecta esto —el texto está en el markup—, sí lo detecta el script de responsividad.
- El foco se ve: no quites el outline sin reemplazarlo por `focus:ring-2 focus:ring-mana-100`.
- Texto sobre color: `text-slate-500` es el gris más claro admisible para texto sobre blanco.
  `text-slate-400` queda sólo para metadatos de una palabra.
- Estado nunca por color solo: color + palabra, o color + icono.
- `svg` decorativo con `aria-hidden="true"`; `svg` informativo con `role="img"` y `aria-label`.
- Imágenes con `alt` descriptivo, o `alt=""` si son decorativas.

## Responsive

El panel vive en escritorio, pero se abre en tablet en el área de camillas. El contenido va en
`max-w-6xl`, así que el ancho ya está acotado; lo que falla es el interior:

- Barra de acciones: `flex flex-wrap gap-2` siempre — sin eso, los botones se desbordan.
- Hijos de un contenedor con truncado: `min-w-0` (sin esto, `truncate` no funciona dentro de
  flex).
- Grillas: `grid gap-4 sm:grid-cols-2 xl:grid-cols-4`, de una columna hacia arriba.
- La barra de navegación usa `flex-wrap`: en pantallas angostas las pestañas bajan de línea en
  vez de desbordarse.
- La grilla de turnos es ancha por naturaleza: va en `overflow-x-auto` con `min-w-[760px]`
  adentro, para que scrollee sola sin estirar la página.
- Cero scroll horizontal a 1280 px. Una tabla ancha va en un contenedor con
  `overflow-x-auto`, no estirando la página.

## Flujo de demostración

El recorrido que se le muestra al cliente tiene que seguir funcionando después de cualquier
cambio:

1. **Agenda** → se abre en la fecha de hoy; las flechas y el calendario cambian de día.
2. **Agenda** → "Atender" en un turno pendiente lo pasa a atendido.
3. **Agenda** → "Cobrar" lleva a Cobros con el paciente y el servicio ya cargados.
4. **Cobros** → registrar el pago suma el movimiento, actualiza el total del día y deja la cita
   como pagada en la agenda.
5. **Reportes** → la caja del día refleja ese cobro.
6. **Agenda** → "Nueva reserva" abre la ventana flotante: se elige el día y después el espacio
   en una grilla de horarios por camilla, donde lo ocupado está deshabilitado y lo libre se toca
   para elegirlo. Al confirmar, el turno aparece en la agenda.
7. **Pacientes** → el buscador filtra por nombre, CI, teléfono o lesión; la ficha muestra la
   próxima visita, qué se le está tratando, el historial de visitas, los ejercicios y el carnet.
8. **Pacientes → Agendar** abre la agenda con la ventana de reserva cargada con ese paciente, y
   **un turno → "Ficha"** hace el camino inverso.
9. **Horarios** → cambiar el cierre de un día recorta al instante los turnos que ofrece la
   agenda; apagar un día la deja cerrada, con aviso y acceso directo para corregir el horario.

Si tu cambio corta uno de esos pasos, no está terminado.
