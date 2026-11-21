# Optimización y limpieza de código

El objetivo acá no es exprimir milisegundos: es que el código siga siendo legible dentro de seis
meses y que la interfaz no se trabe mientras alguien atiende a un paciente. Optimizá cuando hay
un síntoma real o una regla barata de cumplir, no por reflejo.

## Rendimiento que sí importa en este panel

### Intervalos y timers
Son la fuente número uno de fugas acá: el panel tiene cronómetro de sesión, reloj de TV y
contador de expiración del QR.

```jsx
useEffect(() => {
  const t = setInterval(() => setRestante((s) => (s > 0 ? s - 1 : 0)), 1000)
  return () => clearInterval(t)
}, [])
```

Puntos finos: actualizá con función (`s => s - 1`) para no depender del valor anterior en las
dependencias; frená en cero; y si el intervalo sólo tiene sentido en un estado (el QR esperando
pago), cortalo al salir de ese estado.

### Re-render por segundo
Un cronómetro re-renderiza su vista entera cada segundo. Mientras la vista sea liviana, está
bien. Si una vista se vuelve pesada (tablas largas, varios gráficos), aislá el contador en su
propio componente para que el tick no arrastre al resto. Esa es la solución correcta, antes que
sembrar `memo`.

### `useMemo` / `useCallback`
Usalos cuando hay un cálculo real sobre una lista o una dependencia que entra a un `useEffect`.
Envolver una función de dos líneas en `useCallback` agrega ruido y no acelera nada.

### Listas
`key` estable y única — el id del dato, nunca el índice si la lista se reordena o filtra. Si una
lista puede repetir el mismo elemento (como las camillas de la pantalla de TV, donde el paciente
llamado también aparece en su camilla), componé la clave: `` key={`${p.id}-${i}`} ``.

### Gráficos
`recharts` es la parte más pesada del bundle. Reglas:
- Un `ResponsiveContainer` por gráfico, con altura fija en el contenedor padre (si el padre no
  tiene altura, el gráfico colapsa a 0).
- No pongas un gráfico dentro de algo que re-renderiza cada segundo.
- Si el bundle molesta, cargá la vista de reportes con `lazy()` + `Suspense` — es el único
  módulo que justifica la división hoy.

## Limpieza de código

- **Borrá lo que no se usa**: imports, props, estados y clases muertas. Es la optimización con
  mejor relación costo/beneficio.
- **Extraé cuando se repite tres veces**, no antes. Dos bloques parecidos suelen divergir.
- **Un componente por idea.** Si una función de vista pasa de ~250 líneas, bajá los subbloques a
  componentes locales en el mismo archivo (como `CamillaActiva`, `CamillaLibre`,
  `CamillaReservada` en `Recepcion.jsx`): quedan juntos pero legibles.
- **Nada de lógica en el JSX.** Los cálculos van arriba, en constantes con nombre; el JSX
  describe la forma.
- **Clases largas**: agrupalas en el orden layout → espaciado → tipografía → color → estado. No
  hace falta ser dogmático, pero mantené el mismo orden que el resto del archivo.
- **Mapas de estilo fuera del componente** (`const ESTILO = {...}` a nivel de módulo), para que
  no se recreen en cada render y se lean de un vistazo.

## Verificación antes de dar algo por terminado

1. **Auditoría de interfaz** — paleta, accesibilidad y elementos interactivos:
   ```bash
   node .claude/skills/diseno-ui/scripts/audit-ui.mjs
   ```
2. **Build** — detecta imports rotos y errores de sintaxis:
   ```bash
   npm run build
   ```
3. **Humo de todas las vistas** — el build no ejecuta los componentes, así que un error de
   render (un `undefined.algo`) pasa igual. Este truco los encuentra sin navegador: creá un
   archivo temporal que renderice cada vista con cada paciente y compilalo como SSR.

   ```jsx
   // src/__smoke.jsx (temporal)
   import { renderToString } from "react-dom/server"
   import { PACIENTES } from "./data"
   import Recepcion from "./views/Recepcion"
   // ...importá el resto de las vistas

   const vistas = { Recepcion /* , ... */ }
   const noop = () => {}
   let fallos = 0
   for (const [nombre, V] of Object.entries(vistas)) {
     for (const p of PACIENTES) {
       try {
         renderToString(
           <V paciente={p} pacienteId={p.id} setPacienteId={noop} irA={noop}
              llamado={p.id} setLlamado={noop} volver={noop} lateral={null} />,
         )
       } catch (e) {
         fallos++
         console.log("FALLO", nombre, p.id, e.message)
       }
     }
   }
   console.log(fallos ? `${fallos} fallos` : "Todas las vistas renderizan OK")
   ```

   ```bash
   npx vite build --ssr src/__smoke.jsx --outDir .ssr-smoke && node .ssr-smoke/__smoke.js
   rm -rf .ssr-smoke src/__smoke.jsx
   ```

   El directorio de salida tiene que quedar **dentro del proyecto**, si no Node no resuelve
   `react-dom`. Borrá los temporales al terminar.

4. **Mirarlo** — `npm run dev` y revisar en el navegador. La auditoría valida color y semántica,
   no detecta que dos etiquetas se pisan o que una grilla se desborda. Si no podés abrir el
   navegador, decilo en vez de dar por verificado lo visual.

## Lo que no hay que hacer

- No agregues dependencias para algo que se resuelve con SVG o CSS (el QR, el goniómetro y el
  mapa corporal son SVG propios justamente por eso).
- No introduzcas un gestor de estado global mientras el árbol tenga dos niveles.
- No conviertas el proyecto a TypeScript "de paso" dentro de otra tarea; es una migración y se
  decide aparte.
- No dejes `console.log` de depuración en el código entregado.
- No reportes como verificado lo que no corriste.
