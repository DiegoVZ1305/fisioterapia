/* Datos de demostración. Todo es ficticio. */

export const CLINICA = {
  nombre: "MANA REHAB",
  lema: "Centro de fisioterapia y rehabilitación deportiva",
  ciudad: "La Paz · Bolivia",
}

/* Las fechas se calculan relativas a hoy para que la demo siempre tenga turnos del día. */
const fechaISO = (desplazamiento = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + desplazamiento)
  const dosDigitos = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`
}

export const HOY = fechaISO(0)
export const AYER = fechaISO(-1)
export const MANANA = fechaISO(1)

export const formatoFecha = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("es-BO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

export const formatoFechaCorta = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("es-BO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })

/* Las camillas son sólo espacios físicos: quién atiende se define en cada reserva. */
export const CAMILLAS = [
  { id: 1, nombre: "Camilla 1" },
  { id: 2, nombre: "Camilla 2" },
  { id: 3, nombre: "Camilla 3" },
]

export const FISIOTERAPEUTAS = [
  { id: "f1", nombre: "Lic. Joaquín", iniciales: "JQ" },
  { id: "f2", nombre: "Lic. Sebastián", iniciales: "SB" },
  { id: "f3", nombre: "Lic. Samuel", iniciales: "SM" },
]

export const SERVICIOS = [
  { id: "s1", nombre: "Sesión de fisioterapia", detalle: "60 min · terapia manual y electroterapia", precio: 180 },
  { id: "s2", nombre: "Paquete 5 sesiones", detalle: "Ahorro de Bs. 100 · incluye evaluación", precio: 800 },
  { id: "s3", nombre: "Plan completo 10 sesiones", detalle: "Incluye crioterapia y botas de compresión", precio: 1500 },
]

export const PACIENTES = [
  {
    id: "p1",
    nombre: "Cristhian Perez",
    iniciales: "CP",
    edad: 35,
    ci: "6841920 LPZ",
    tel: "+591 71589244",
    fisioId: "f1",
    diagnostico: "Tendinitis de hombro derecho",
    zona: "Hombro derecho",
    motivo: "Dolor al levantar el brazo desde hace 2 meses, por sobrecarga jugando vóley",
    inicio: fechaISO(-24),
    sesion: 4,
    totalSesiones: 10,
    tratamientos: ["Terapia manual", "Electroterapia", "Ejercicio terapéutico", "Crioterapia"],
    evolucion: "Mejora notoria: ya levanta el brazo sin dolor hasta la altura del hombro.",
    ejercicios: [
      { nombre: "Sentadilla isométrica en pared", dosis: "4 series x 45 segundos", hecho: true },
      { nombre: "Rotación externa de hombro con banda", dosis: "3 series x 15 repeticiones", hecho: true },
      { nombre: "Elevaciones frontales suaves", dosis: "3 series x 10 repeticiones", hecho: false },
    ],
  },
  {
    id: "p2",
    nombre: "Roberto Morales",
    iniciales: "RM",
    edad: 38,
    ci: "4920114 LPZ",
    tel: "+591 73412908",
    fisioId: "f3",
    diagnostico: "Lesión de manguito rotador",
    zona: "Hombro derecho",
    motivo: "Dolor nocturno y limitación para trabajar con los brazos en alto",
    inicio: fechaISO(-31),
    sesion: 5,
    totalSesiones: 10,
    tratamientos: ["Terapia manual", "Ultrasonido", "Ejercicio terapéutico"],
    evolucion: "Duerme mejor. Todavía le molesta al abrir la puerta del auto.",
    ejercicios: [
      { nombre: "Pendulares de Codman", dosis: "3 series x 30 segundos", hecho: true },
      { nombre: "Remo bajo con banda elástica", dosis: "3 series x 12 repeticiones", hecho: false },
    ],
  },
  {
    id: "p3",
    nombre: "Sofía Graziani",
    iniciales: "SG",
    edad: 19,
    ci: "9118044 LPZ",
    tel: "+591 79104321",
    fisioId: "f2",
    diagnostico: "Pinzamiento de hombro izquierdo",
    zona: "Hombro izquierdo",
    motivo: "Molestia en el entrenamiento de natación, estilo crol",
    inicio: fechaISO(-12),
    sesion: 2,
    totalSesiones: 6,
    tratamientos: ["Crioterapia", "Movilización articular", "Educación de carga"],
    evolucion: "Fase inicial. Se le pidió suspender el trabajo con brazos sobre la cabeza.",
    ejercicios: [
      { nombre: "Deslizamiento en pared", dosis: "3 series x 10 repeticiones", hecho: false },
      { nombre: "Estiramiento de pectoral en marco", dosis: "3 series x 30 segundos", hecho: true },
    ],
  },
  {
    id: "p4",
    nombre: "Cristhian Pinto",
    iniciales: "CP",
    edad: 31,
    ci: "7721002 LPZ",
    tel: "+591 77721002",
    fisioId: "f2",
    diagnostico: "Rehabilitación de rodilla derecha",
    zona: "Rodilla derecha",
    motivo: "Recuperación después de una lesión de ligamento por running",
    inicio: fechaISO(-45),
    sesion: 6,
    totalSesiones: 12,
    tratamientos: ["Ejercicio terapéutico", "Fortalecimiento progresivo", "Reeducación de la marcha"],
    evolucion: "Ya corre 15 minutos sin dolor. Se avanza a trote en pendiente.",
    ejercicios: [{ nombre: "Carrera progresiva en tapiz", dosis: "15 minutos a 8 km/h", hecho: true }],
  },
  {
    id: "p5",
    nombre: "Mariela Quiroga",
    iniciales: "MQ",
    edad: 44,
    ci: "3310947 LPZ",
    tel: "+591 70551188",
    fisioId: "f1",
    diagnostico: "Lumbalgia mecánica",
    zona: "Zona lumbar",
    motivo: "Dolor de espalda baja por muchas horas sentada en la oficina",
    inicio: fechaISO(-18),
    sesion: 3,
    totalSesiones: 8,
    tratamientos: ["Terapia manual", "Masoterapia", "Higiene postural"],
    evolucion: "Bajó el dolor matinal. Se trabaja la postura en el puesto de trabajo.",
    ejercicios: [{ nombre: "Movilidad lumbar en cuadrupedia", dosis: "2 series x 10 repeticiones", hecho: false }],
  },
]

export const HORARIOS = ["08:00", "09:00", "10:00", "11:00", "15:00", "16:00", "17:00", "18:00"]

/* Horas que se pueden elegir como apertura o cierre en la configuración. */
export const HORAS_POSIBLES = Array.from(
  { length: 17 },
  (_, i) => `${String(i + 6).padStart(2, "0")}:00`,
)

/* Días en el orden en que los lee una persona, no en el orden de getDay(). */
export const DIAS_SEMANA = [
  { id: 1, nombre: "Lunes" },
  { id: 2, nombre: "Martes" },
  { id: 3, nombre: "Miércoles" },
  { id: 4, nombre: "Jueves" },
  { id: 5, nombre: "Viernes" },
  { id: 6, nombre: "Sábado" },
  { id: 0, nombre: "Domingo" },
]

/* Horario de atención del centro, configurable desde la pestaña Horarios.
   Las claves son el día de la semana de JavaScript (0 = domingo). */
export const HORARIO_INICIAL = {
  1: { abierto: true, apertura: "08:00", cierre: "19:00" },
  2: { abierto: true, apertura: "08:00", cierre: "19:00" },
  3: { abierto: true, apertura: "08:00", cierre: "19:00" },
  4: { abierto: true, apertura: "08:00", cierre: "19:00" },
  5: { abierto: true, apertura: "08:00", cierre: "18:00" },
  6: { abierto: true, apertura: "09:00", cierre: "13:00" },
  0: { abierto: false, apertura: "09:00", cierre: "12:00" },
}

export const diaDeFecha = (iso) => new Date(`${iso}T00:00:00`).getDay()

/* Turnos de una hora entre la apertura y el cierre: el último empieza una hora antes de cerrar. */
export const horasEntre = (apertura, cierre) => {
  const horas = []
  for (let h = Number(apertura.slice(0, 2)); h < Number(cierre.slice(0, 2)); h++) {
    horas.push(`${String(h).padStart(2, "0")}:00`)
  }
  return horas
}

/* Horarios en los que se puede reservar ese día, según la configuración. */
export const horasAbiertas = (fecha, horarioSemanal) => {
  const dia = horarioSemanal[diaDeFecha(fecha)]
  return dia?.abierto ? horasEntre(dia.apertura, dia.cierre) : []
}

/* Lo que se muestra en la agenda: los horarios de atención más los de turnos ya reservados
   fuera de ese rango, para que un cambio de horario nunca esconda una reserva existente. */
export const horasVisibles = (fecha, horarioSemanal, citas) => {
  const delDia = citas.filter((c) => c.fecha === fecha).map((c) => c.hora)
  return [...new Set([...horasAbiertas(fecha, horarioSemanal), ...delDia])].sort()
}

export const totalHorasSemana = (horarioSemanal) =>
  DIAS_SEMANA.reduce((total, d) => {
    const dia = horarioSemanal[d.id]
    return dia?.abierto ? total + horasEntre(dia.apertura, dia.cierre).length : total
  }, 0)

/* Visitas ya realizadas, generadas a partir de las sesiones que lleva cada paciente, para que
   el historial de la ficha coincida con el contador "sesión X de Y". Cada paciente usa su
   propia hora y camilla, así dos visitas nunca caen en el mismo lugar a la misma hora. */
const sinDomingo = (desplazamiento) => {
  let d = desplazamiento
  while (new Date(`${fechaISO(d)}T00:00:00`).getDay() === 0) d -= 1
  return d
}

const VISITAS_PREVIAS = PACIENTES.flatMap((p, idx) =>
  Array.from({ length: Math.max(0, Math.min(p.sesion - 1, 4)) }, (_, i) => ({
    id: `h-${p.id}-${i}`,
    fecha: fechaISO(sinDomingo(-((i + 1) * 3 + idx + 1))),
    hora: HORARIOS[idx],
    camilla: (idx % CAMILLAS.length) + 1,
    pacienteId: p.id,
    fisioId: p.fisioId,
    servicioId: "s1",
    estado: "pagado",
  })),
)

/* Estados de una reserva: pendiente → atendido → pagado */
const AGENDA_FIJA = [
  { id: "c1", fecha: AYER, hora: "18:00", camilla: 1, pacienteId: "p5", fisioId: "f1", servicioId: "s1", estado: "pagado" },
  { id: "c2", fecha: AYER, hora: "11:00", camilla: 2, pacienteId: "p4", fisioId: "f2", servicioId: "s1", estado: "pagado" },

  { id: "c3", fecha: HOY, hora: "09:00", camilla: 1, pacienteId: "p1", fisioId: "f1", servicioId: "s1", estado: "pagado" },
  { id: "c4", fecha: HOY, hora: "09:00", camilla: 3, pacienteId: "p5", fisioId: "f1", servicioId: "s1", estado: "pagado" },
  { id: "c5", fecha: HOY, hora: "10:00", camilla: 2, pacienteId: "p3", fisioId: "f2", servicioId: "s1", estado: "atendido" },
  { id: "c6", fecha: HOY, hora: "11:00", camilla: 1, pacienteId: "p2", fisioId: "f3", servicioId: "s2", estado: "atendido" },
  { id: "c7", fecha: HOY, hora: "15:00", camilla: 1, pacienteId: "p1", fisioId: "f1", servicioId: "s1", estado: "pendiente" },
  { id: "c8", fecha: HOY, hora: "16:00", camilla: 2, pacienteId: "p4", fisioId: "f2", servicioId: "s1", estado: "pendiente" },
  { id: "c9", fecha: HOY, hora: "16:00", camilla: 3, pacienteId: "p2", fisioId: "f3", servicioId: "s1", estado: "pendiente" },
  { id: "c10", fecha: HOY, hora: "17:00", camilla: 1, pacienteId: "p5", fisioId: "f1", servicioId: "s1", estado: "pendiente" },

  { id: "c11", fecha: MANANA, hora: "09:00", camilla: 2, pacienteId: "p3", fisioId: "f2", servicioId: "s1", estado: "pendiente" },
  { id: "c12", fecha: MANANA, hora: "10:00", camilla: 1, pacienteId: "p1", fisioId: "f1", servicioId: "s1", estado: "pendiente" },
]

export const CITAS = [...VISITAS_PREVIAS, ...AGENDA_FIJA]

export const TRANSACCIONES = [
  { id: "t1", pacienteId: "p1", servicioId: "s1", monto: 180, hora: "09:52", medio: "QR" },
  { id: "t2", pacienteId: "p5", servicioId: "s1", monto: 180, hora: "10:05", medio: "Efectivo" },
]

export const MEDIOS_PAGO = ["QR", "Efectivo", "Tarjeta"]

export const FINANZAS = {
  Semanal: {
    ingresos: 5800,
    gastos: 2150,
    sesiones: 32,
    meta: 5500,
    barras: [
      { name: "Lun", ingresos: 1200, gastos: 420 },
      { name: "Mar", ingresos: 980, gastos: 380 },
      { name: "Mié", ingresos: 1340, gastos: 500 },
      { name: "Jue", ingresos: 1100, gastos: 410 },
      { name: "Vie", ingresos: 1180, gastos: 440 },
    ],
  },
  Mensual: {
    ingresos: 24850,
    gastos: 9420,
    sesiones: 142,
    meta: 22000,
    barras: [
      { name: "Sem 1", ingresos: 5300, gastos: 2000 },
      { name: "Sem 2", ingresos: 6100, gastos: 2350 },
      { name: "Sem 3", ingresos: 6300, gastos: 2500 },
      { name: "Sem 4", ingresos: 5600, gastos: 2280 },
      { name: "Sem 5", ingresos: 1550, gastos: 290 },
    ],
  },
  Anual: {
    ingresos: 268400,
    gastos: 104800,
    sesiones: 1612,
    meta: 240000,
    barras: [
      { name: "Jul", ingresos: 21400, gastos: 8600 },
      { name: "Ago", ingresos: 23800, gastos: 9100 },
      { name: "Sep", ingresos: 22600, gastos: 8900 },
      { name: "Oct", ingresos: 24850, gastos: 9420 },
      { name: "Nov", ingresos: 19300, gastos: 7800 },
    ],
  },
}

/* Paleta de gráficos validada para daltonismo y contraste (ver skill diseno-ui) */
export const GASTOS = [
  { name: "Honorarios del equipo", pct: 40, color: "#17a2ba" },
  { name: "Insumos y vendajes", pct: 28, color: "#eb6834" },
  { name: "Mantenimiento de equipos", pct: 18, color: "#1baf7a" },
  { name: "Alquiler y servicios", pct: 14, color: "#eda100" },
]

export const getPaciente = (id) => PACIENTES.find((p) => p.id === id)
export const getServicio = (id) => SERVICIOS.find((s) => s.id === id)
export const getFisio = (id) => FISIOTERAPEUTAS.find((f) => f.id === id)
export const getCamilla = (id) => CAMILLAS.find((c) => c.id === id)

/* Próxima visita de un paciente: la reserva futura más cercana que todavía no se cobró. */
export const proximaVisita = (citas, pacienteId) =>
  citas
    .filter((c) => c.pacienteId === pacienteId && c.fecha >= HOY && c.estado !== "pagado")
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))[0]

/* Visitas ya hechas, de la más reciente a la más antigua. */
export const visitasPasadas = (citas, pacienteId) =>
  citas
    .filter((c) => c.pacienteId === pacienteId && (c.fecha < HOY || c.estado === "pagado"))
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora))
