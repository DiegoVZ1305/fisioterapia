# MANA REHAB — Prototipo de panel clínico (React)

Prototipo funcional de un sistema de gestión para un centro de fisioterapia: agenda de camillas,
cobros con QR, ficha de pacientes con su carnet digital, reportes de ingresos y gastos, y
configuración del horario de atención. Pensado como muestra
para el cliente: diseño simple y los cuatro módulos conectados entre sí.

Todos los datos son ficticios y viven en `src/data.js` (no hay backend).

## Ejecutar

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # build de producción en dist/
```

## Stack

- React 19 + Vite
- Tailwind CSS v4 (plugin `@tailwindcss/vite`, tokens de marca en `src/index.css`)
- `lucide-react` (iconos) y `recharts` (gráfico de barras)
- SVG propio para el QR decorativo (es una maqueta: no codifica información real)

## Módulos

| Vista | Archivo | Qué hace |
|---|---|---|
| Agenda | `src/views/Agenda.jsx` | Reservas por fecha, hora y camilla; atender, cobrar y agendar |
| Pacientes | `src/views/Pacientes.jsx` | Buscador, próxima visita, tratamiento en curso, historial, ejercicios y carnet QR |
| Cobros | `src/views/Cobros.jsx` | Cobro con QR, efectivo o tarjeta; lista y total del día |
| Reportes | `src/views/Reportes.jsx` | Ingresos, gastos, ganancia, distribución y caja del día |
| Horarios | `src/views/Horarios.jsx` | Horario de atención por día de la semana, con lo que abre y cierra el centro |

## Recorrido de demostración

1. **Agenda** → se abre en la fecha de hoy; las flechas y el calendario cambian de día.
2. **Agenda** → "Atender" marca un turno pendiente como atendido.
3. **Agenda** → "Cobrar" abre Cobros con el paciente y el servicio ya cargados.
4. **Cobros** → registrar el pago suma el movimiento, actualiza el total y deja la cita en "Pagado".
5. **Reportes** → la caja del día refleja ese cobro.
6. **Agenda** → "Nueva reserva" abre una ventana flotante: se elige el día y el espacio en una
   grilla de horarios por camilla (lo ocupado no se puede seleccionar), más paciente, quién
   atiende y servicio.
7. **Pacientes** → buscá por nombre, CI, teléfono o lesión; la ficha muestra la próxima visita,
   qué se le está tratando, el historial de visitas, los ejercicios y el carnet QR.
8. **Pacientes → "Agendar"** abre la reserva ya cargada con ese paciente; desde un turno,
   **"Ficha"** hace el camino inverso.
9. **Horarios** → cambiá a qué hora cierra cada día (por ejemplo, sábados hasta las 13:00) y la
   agenda ofrece sólo esos turnos. Apagá un día y queda cerrado.

Las fechas de ejemplo se calculan relativas al día en que se abre la app, así que la demo
siempre tiene turnos de hoy, de ayer y de mañana.

El estado compartido (`citas`, `transacciones`, paciente activo) vive en `src/App.jsx`; los datos
de ejemplo, en `src/data.js`.

## Skill de diseño (`/diseno-ui`)

El proyecto incluye una skill en `.claude/skills/diseno-ui/` que carga el sistema de diseño, los
patrones de UX y las reglas de optimización cada vez que se trabaja en la interfaz. Se activa
sola al pedir cambios de UI, o a mano con `/diseno-ui`.

Auditoría de interfaz (paleta, accesibilidad, timers sin limpiar, `console.log` olvidados):

```bash
node .claude/skills/diseno-ui/scripts/audit-ui.mjs
```

Verificación de responsividad en teléfono, tablet y escritorio (usa el Chrome instalado; deja
capturas y falla si hay desborde horizontal o errores de JS):

```bash
npm run build && npx vite preview --port 4173 --strictPort &
node .claude/skills/diseno-ui/scripts/responsive.mjs ./capturas
```

## Nota de diseño de gráficos

La paleta de los gráficos (`#17a2ba` ingresos, `#eb6834` gastos, más `#1baf7a` y `#eda100` en la
distribución de gastos) fue validada para daltonismo y contraste; las series llevan leyenda y
valores escritos, y el gráfico de barras tiene vista de tabla alternativa.
