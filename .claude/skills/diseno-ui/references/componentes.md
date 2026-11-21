# Catálogo de componentes — `src/components/ui.jsx`

Pocos primitivos en un solo archivo, a propósito: se leen de una pasada y evitan la carpeta con
treinta archivos de un componente cada uno. Si el archivo pasa de ~300 líneas, recién ahí
conviene partirlo por familia.

## Primitivos

### `Card({ className, children, ...rest })`
Contenedor base: blanco, `rounded-xl`, borde `slate-200`, sin sombra. Todo bloque de contenido
empieza acá. El `className` se concatena: `<Card className="px-5 py-4">`.

### `CardHead({ titulo, sub, right })`
Cabecera de tarjeta con divisor inferior. `right` acepta botones, badges o un grupo. Usala
siempre en vez de armar la cabecera a mano — es lo que mantiene alineadas las cuatro vistas.

### `Badge({ tono, children })`
Píldora de estado. `tono`: `teal | verde | ambar | rojo | gris`. **Siempre con texto**.

### `Btn({ variant, icon, ...props })`

| `variant` | Uso |
|---|---|
| `primary` | La acción principal del bloque, una sola |
| `dark` | Confirmación fuerte o acción sobre fondo claro que debe destacar sin ser primaria |
| `ghost` | Secundaria — la más frecuente |
| `soft` | Terciaria dentro de un grupo |
| `quiet` | Cancelar, acciones de bajo peso |

Ya trae `cursor-pointer`, estado `disabled` y transición. Para achicarlo en una tarjeta
apretada: `className="px-2.5 py-1.5 text-xs"`. Botón de solo icono → `aria-label`.

### `Stat({ label, valor, sub, tono })`
Tarjeta de indicador: rótulo, cifra `text-3xl` y una línea de contexto. `tono="teal"` pinta la
cifra con el acento — usalo en **uno solo** por fila, el que resume el bloque.

### `Progress({ value, barra, className })`
Barra 0–100. Sobre fondo oscuro: `className="bg-white/10" barra="bg-mana-400"`.

### `Avatar({ iniciales, size, tono })`
Círculo con iniciales; la tipografía escala con `size`. Sobre oscuro:
`tono="bg-mana-400/20 text-mana-200"`.

### `Campo({ label, children })` + `claseInput`
Par estándar de formulario: `Campo` pone la etiqueta y el espaciado, `claseInput` es la clase
compartida de `input` y `select` (incluye foco con anillo `mana-100`). Usalos juntos para que
todos los formularios se vean iguales.

### `Modal({ titulo, sub, onCerrar, children, pie })`
Ventana flotante para formularios cortos (por ejemplo, reservar un turno). Cierra con Escape, con
la X o tocando el fondo, y bloquea el scroll de atrás. En teléfono se ancla abajo como hoja y en
pantallas grandes queda centrada.

Se monta con `createPortal` sobre `<body>` **a propósito**: cualquier ancestro con `transform`
—como la animación `.fade-up` de las vistas— se vuelve el bloque contenedor de un
`position: fixed`, y la ventana terminaría al final de la página en vez de sobre la pantalla. Si
creás otro elemento flotante, usá `Modal` o repetí el portal.

El `pie` recibe los botones: cancelar en `quiet`, confirmar en `primary`.

### `Vacio({ children })`
Caja punteada con el mensaje de "no hay nada todavía". Escribí algo útil, no "sin resultados".

### `QR({ seed, size, color, bg })`
QR decorativo determinista: la misma `seed` dibuja siempre el mismo patrón. **No codifica
información real.** Si alguna vez tiene que escanearse de verdad, hay que cambiarlo por una
librería real y decirlo explícitamente.

### `bs(n)`
Formatea bolivianos: `bs(1500)` → `"Bs. 1.500"`. Todo monto de la interfaz pasa por acá.

## Cómo extender sin romper la consistencia

1. **Primero una prop, no un componente nuevo.** Si necesitás una `Card` con cabecera pegajosa,
   agregale una prop antes de crear `StickyCard`.
2. **Un primitivo nuevo se gana su lugar a la tercera repetición.** Dos usos parecidos todavía
   pueden ser copia; tres ya son un patrón.
3. **Firma en español, consistente**: `titulo`, `sub`, `valor`, `tono`, `label`. Mezclar
   `title`/`titulo` en el mismo archivo es ruido.
4. **Sin librerías de componentes.** En tiempo de ejecución el proyecto depende sólo de
   `lucide-react` y `recharts` (`playwright-core` es herramienta de verificación, no se
   empaqueta). Antes de sumar una dependencia, verificá si se resuelve con 30 líneas de SVG o
   CSS, como ya se hizo con el QR.
5. **El componente no decide el dato.** Recibe props; los datos salen de `src/data.js` o del
   estado de `App.jsx`.

## Dónde vive el estado

`App.jsx` guarda lo compartido y lo baja por props:

| Estado | Para qué |
|---|---|
| `citas` | Turnos del día; cambian al atender, cobrar o agendar |
| `transacciones` | Cobros registrados; los leen Cobros y Reportes |
| `pacienteId` | Paciente abierto en la ficha |
| `porCobrar` | Cita que viaja de la agenda al formulario de cobro |
| `reservarPara` | Paciente que viaja de la ficha a la ventana de reserva (lleva un sello de tiempo para que la ventana no se reabra sola al volver a la agenda) |
| `horarioSemanal` | Horario de atención por día; la agenda deriva de él los turnos que ofrece |

Los manejadores (`atender`, `irACobrar`, `registrarPago`, `agendarCita`, `verPaciente`,
`reservarParaPaciente`) también
viven ahí, así que las vistas no se conocen entre sí. Todo lo demás —formularios, pestañas,
filtros— es estado local de la vista. Mientras el árbol tenga dos niveles, props directas se
leen mejor que un contexto.
