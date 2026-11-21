import { Fragment, useEffect, useMemo, useState } from "react"
import { CalendarDays, Check, ChevronLeft, ChevronRight, CreditCard, Plus, UserRound } from "lucide-react"

import { Avatar, Badge, Btn, Campo, Card, CardHead, Modal, Stat, Vacio, bs, claseInput } from "../components/ui"
import {
  CAMILLAS,
  DIAS_SEMANA,
  FISIOTERAPEUTAS,
  HOY,
  PACIENTES,
  SERVICIOS,
  diaDeFecha,
  formatoFecha,
  formatoFechaCorta,
  getFisio,
  getPaciente,
  getServicio,
  horasAbiertas,
  horasVisibles,
} from "../data"

const ESTADO = {
  pendiente: { tono: "ambar", texto: "Pendiente" },
  atendido: { tono: "teal", texto: "Atendido" },
  pagado: { tono: "verde", texto: "Pagado" },
}

const sumarDias = (iso, dias) => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + dias)
  const dd = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${dd(d.getMonth() + 1)}-${dd(d.getDate())}`
}

export default function Agenda({
  citas,
  onAtender,
  onCobrar,
  onAgendar,
  onVerPaciente,
  reservarPara,
  onReservaAbierta,
  horarioSemanal,
  onIrAHorarios,
}) {
  const [fecha, setFecha] = useState(HOY)
  const [fisioFiltro, setFisioFiltro] = useState("todos")
  const [nueva, setNueva] = useState(null)

  const delDia = useMemo(
    () =>
      citas
        .filter((c) => c.fecha === fecha)
        .filter((c) => fisioFiltro === "todos" || c.fisioId === fisioFiltro)
        .sort((a, b) => a.hora.localeCompare(b.hora) || a.camilla - b.camilla),
    [citas, fecha, fisioFiltro],
  )

  const porCobrar = delDia.filter((c) => c.estado === "atendido")
  const montoPorCobrar = porCobrar.reduce((a, c) => a + getServicio(c.servicioId).precio, 0)
  const pendientes = delDia.filter((c) => c.estado === "pendiente").length

  // Horarios en los que se puede reservar ese día, según la configuración del centro.
  const abiertas = (f) => horasAbiertas(f, horarioSemanal)

  // Lo que muestra la grilla del día: suma los turnos que quedaron fuera del horario actual.
  const horasDelDia = useMemo(
    () => horasVisibles(fecha, horarioSemanal, citas),
    [fecha, horarioSemanal, citas],
  )
  const cerrado = abiertas(fecha).length === 0

  const libre = (f, hora, camilla) =>
    !citas.some((c) => c.fecha === f && c.hora === hora && c.camilla === camilla)

  // Primer espacio disponible del día, para no abrir la ventana sobre un horario ya tomado.
  const primerLibre = (f) => {
    for (const hora of abiertas(f)) {
      for (const c of CAMILLAS) if (libre(f, hora, c.id)) return { hora, camilla: c.id }
    }
    return null
  }

  const abrirNueva = (camilla, hora, pacienteId = PACIENTES[0].id) => {
    const espacio = camilla && hora ? { camilla, hora } : primerLibre(fecha)
    setNueva({
      fecha,
      hora: espacio?.hora ?? null,
      camilla: espacio?.camilla ?? CAMILLAS[0].id,
      pacienteId,
      fisioId: getPaciente(pacienteId).fisioId,
      servicioId: "s1",
    })
  }

  // Al elegir otro paciente, se propone su fisioterapeuta habitual.
  const elegirPaciente = (pacienteId) =>
    setNueva((n) => ({ ...n, pacienteId, fisioId: getPaciente(pacienteId).fisioId }))

  // Al cambiar de día, si el espacio elegido quedó ocupado se mueve al primero disponible.
  const cambiarFechaReserva = (nuevaFecha) =>
    setNueva((n) => {
      if (libre(nuevaFecha, n.hora, n.camilla)) return { ...n, fecha: nuevaFecha }
      const espacio = primerLibre(nuevaFecha)
      return espacio ? { ...n, fecha: nuevaFecha, ...espacio } : { ...n, fecha: nuevaFecha }
    })

  // Reserva pedida desde la ficha de un paciente.
  useEffect(() => {
    if (!reservarPara) return
    abrirNueva(null, null, reservarPara.pacienteId)
    onReservaAbierta()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservarPara])

  // Con la grilla no se puede elegir un espacio tomado: esto cubre el día cerrado o lleno.
  const diaReservaCerrado = !!nueva && abiertas(nueva.fecha).length === 0
  const sinEspacio = !!nueva && !nueva.hora
  const puedeReservar = !!nueva && !!nueva.hora && libre(nueva.fecha, nueva.hora, nueva.camilla)

  const confirmarNueva = () => {
    onAgendar({ ...nueva, id: `c-${Date.now()}`, estado: "pendiente" })
    setFecha(nueva.fecha)
    setNueva(null)
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">Agenda</h1>
          <p className="mt-1 text-sm text-slate-500">Reservas por fecha, hora y camilla.</p>
        </div>
        <Btn variant="primary" icon={Plus} onClick={() => abrirNueva()}>
          Nueva reserva
        </Btn>
      </div>

      {/* Selector de fecha */}
      <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFecha((f) => sumarDias(f, -1))}
            aria-label="Día anterior"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setFecha((f) => sumarDias(f, 1))}
            aria-label="Día siguiente"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <CalendarDays size={16} className="shrink-0 text-slate-400" />
          <p className="min-w-0 truncate text-sm font-medium text-ink-900 first-letter:uppercase">
            <span className="sm:hidden">{formatoFechaCorta(fecha)}</span>
            <span className="hidden sm:inline">{formatoFecha(fecha)}</span>
            {fecha === HOY && <span className="ml-2 font-normal text-mana-600">· hoy</span>}
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <input
            type="date"
            value={fecha}
            onChange={(e) => e.target.value && setFecha(e.target.value)}
            aria-label="Elegir fecha"
            className={`${claseInput} flex-1 sm:w-auto sm:flex-none`}
          />
          {fecha !== HOY && (
            <Btn variant="soft" onClick={() => setFecha(HOY)}>
              Hoy
            </Btn>
          )}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat label="Reservas del día" valor={delDia.length} sub={`${pendientes} por atender`} />
        <Stat
          label="Por cobrar"
          valor={porCobrar.length}
          sub={montoPorCobrar ? `${bs(montoPorCobrar)} pendientes` : "Todo cobrado"}
          tono="teal"
        />
        <Stat label="Camillas" valor={CAMILLAS.length} sub="Disponibles en el centro" />
      </div>

      {/* Filtro por fisioterapeuta */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500">Fisioterapeuta:</span>
        <div className="flex flex-wrap gap-1.5">
          <Chip activo={fisioFiltro === "todos"} onClick={() => setFisioFiltro("todos")}>
            Todos
          </Chip>
          {FISIOTERAPEUTAS.map((f) => (
            <Chip key={f.id} activo={fisioFiltro === f.id} onClick={() => setFisioFiltro(f.id)}>
              {f.nombre}
            </Chip>
          ))}
        </div>
      </div>

      {cerrado && (
        <Card className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 px-5 py-4">
          <p className="text-sm text-amber-900">
            El centro no atiende los{" "}
            <span className="lowercase">{DIAS_SEMANA.find((d) => d.id === diaDeFecha(fecha)).nombre}</span>.
            {delDia.length > 0 && " Las reservas que ves quedaron de un horario anterior."}
          </p>
          <Btn variant="ghost" onClick={onIrAHorarios}>
            Cambiar horario
          </Btn>
        </Card>
      )}

      {/* Teléfono: lista simple ordenada por hora */}
      <div className="space-y-3 lg:hidden">
        {delDia.length === 0 ? (
          <Vacio>No hay reservas para este día. Tocá «Nueva reserva» para agendar la primera.</Vacio>
        ) : (
          delDia.map((cita) => (
            <TarjetaCita
              key={cita.id}
              cita={cita}
              onAtender={onAtender}
              onCobrar={onCobrar}
              onVerPaciente={onVerPaciente}
              mostrarHora
            />
          ))
        )}
      </div>

      {/* Tablet y escritorio: grilla de horas por camilla */}
      <Card className="hidden lg:block">
        <CardHead titulo="Horarios por camilla" sub="Tocá un espacio libre para reservar en ese horario." />
        <div className="p-5">
          {horasDelDia.length === 0 ? (
            <Vacio>El centro no atiende este día, así que no hay horarios para mostrar.</Vacio>
          ) : (
          <div className="grid grid-cols-[64px_repeat(3,1fr)] gap-3">
            <div />
            {CAMILLAS.map((c) => (
              <p key={c.id} className="pb-1 text-sm font-semibold text-ink-900">
                {c.nombre}
              </p>
            ))}

            {horasDelDia.map((hora) => (
              <FilaHorario
                key={hora}
                hora={hora}
                reservable={abiertas(fecha).includes(hora)}
                citas={delDia}
                onAtender={onAtender}
                onCobrar={onCobrar}
                onVerPaciente={onVerPaciente}
                onReservar={abrirNueva}
              />
            ))}
          </div>
          )}
        </div>
      </Card>

      {nueva && (
        <Modal
          titulo="Nueva reserva"
          sub="Elegí el día, tocá un espacio libre y asigná quién atiende."
          onCerrar={() => setNueva(null)}
          pie={
            <>
              <Btn variant="quiet" onClick={() => setNueva(null)}>
                Cancelar
              </Btn>
              <Btn variant="primary" onClick={confirmarNueva} disabled={!puedeReservar}>
                Reservar turno
              </Btn>
            </>
          }
        >
          <div className="space-y-4">
            <Campo label="Fecha">
              <input
                type="date"
                value={nueva.fecha}
                onChange={(e) => e.target.value && cambiarFechaReserva(e.target.value)}
                className={claseInput}
              />
            </Campo>

            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-600">Horario y camilla</p>
              <SelectorEspacio
                fecha={nueva.fecha}
                horas={abiertas(nueva.fecha)}
                citas={citas}
                hora={nueva.hora}
                camilla={nueva.camilla}
                onElegir={(hora, camilla) => setNueva({ ...nueva, hora, camilla })}
              />
            </div>

            <Campo label="Paciente">
              <select
                value={nueva.pacienteId}
                onChange={(e) => elegirPaciente(e.target.value)}
                className={claseInput}
              >
                {PACIENTES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Atiende">
              <select
                value={nueva.fisioId}
                onChange={(e) => setNueva({ ...nueva, fisioId: e.target.value })}
                className={claseInput}
              >
                {FISIOTERAPEUTAS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombre}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Servicio">
              <select
                value={nueva.servicioId}
                onChange={(e) => setNueva({ ...nueva, servicioId: e.target.value })}
                className={claseInput}
              >
                {SERVICIOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} — {bs(s.precio)}
                  </option>
                ))}
              </select>
            </Campo>

            {diaReservaCerrado || sinEspacio ? (
              <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {diaReservaCerrado
                  ? "El centro no atiende ese día. Elegí otra fecha o cambiá el horario en la pestaña Horarios."
                  : "Ese día no queda ningún espacio libre. Probá con otra fecha."}
              </p>
            ) : (
              <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {getPaciente(nueva.pacienteId).nombre} · {formatoFecha(nueva.fecha)} a las {nueva.hora} ·{" "}
                Camilla {nueva.camilla} · atiende {getFisio(nueva.fisioId).nombre}
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

/* Grilla de disponibilidad del día: filas de horario, columnas de camilla.
   Elegir una celda fija la hora y la camilla de una sola vez, y los espacios ya tomados
   quedan deshabilitados, así no se puede reservar encima de otro turno. */
function SelectorEspacio({ fecha, horas, citas, hora, camilla, onElegir }) {
  const tomadoPor = (h, c) =>
    citas.find((x) => x.fecha === fecha && x.hora === h && x.camilla === c)

  if (horas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-400">
        El centro está cerrado ese día.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="grid grid-cols-[46px_repeat(3,1fr)] gap-px bg-slate-200">
        <div className="bg-slate-50" />
        {CAMILLAS.map((c) => (
          <p key={c.id} className="bg-slate-50 px-1 py-2 text-center text-xs font-medium text-slate-600">
            {c.nombre}
          </p>
        ))}

        {horas.map((h) => (
          <Fragment key={h}>
            <p className="grid place-items-center bg-slate-50 text-xs text-slate-500">{h}</p>
            {CAMILLAS.map((c) => {
              const tomado = tomadoPor(h, c.id)
              const elegido = hora === h && camilla === c.id
              const paciente = tomado && getPaciente(tomado.pacienteId)

              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={!!tomado}
                  aria-pressed={elegido}
                  aria-label={`${h}, ${c.nombre}, ${tomado ? `ocupada por ${paciente.nombre}` : "libre"}`}
                  title={tomado ? `Ocupada por ${paciente.nombre}` : `Reservar ${h} en ${c.nombre}`}
                  onClick={() => onElegir(h, c.id)}
                  className={`px-1 py-2 text-xs font-medium transition ${
                    tomado
                      ? "cursor-not-allowed bg-slate-50 text-slate-400"
                      : elegido
                        ? "cursor-pointer bg-mana-500 text-white"
                        : "cursor-pointer bg-white text-mana-700 hover:bg-mana-50"
                  }`}
                >
                  {tomado ? "Ocupada" : elegido ? "Elegida" : "Libre"}
                </button>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

function Chip({ activo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        activo ? "bg-mana-50 text-mana-700" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  )
}

function FilaHorario({ hora, reservable, citas, onAtender, onCobrar, onVerPaciente, onReservar }) {
  return (
    <>
      <div className="pt-3 text-sm text-slate-400">{hora}</div>
      {CAMILLAS.map((camilla) => {
        const cita = citas.find((c) => c.hora === hora && c.camilla === camilla.id)
        if (!cita) {
          // Fuera del horario de atención el espacio existe pero no se puede reservar.
          if (!reservable) {
            return (
              <p
                key={camilla.id}
                className="grid min-h-[92px] place-items-center rounded-lg bg-slate-50 text-sm text-slate-300"
              >
                Fuera de horario
              </p>
            )
          }
          return (
            <button
              key={camilla.id}
              onClick={() => onReservar(camilla.id, hora)}
              className="min-h-[92px] cursor-pointer rounded-lg border border-dashed border-slate-200 text-sm text-slate-300 transition hover:border-mana-300 hover:bg-mana-50/50 hover:text-mana-600"
            >
              + Reservar
            </button>
          )
        }
        return (
          <TarjetaCita
            key={camilla.id}
            cita={cita}
            onAtender={onAtender}
            onCobrar={onCobrar}
            onVerPaciente={onVerPaciente}
          />
        )
      })}
    </>
  )
}

function TarjetaCita({ cita, onAtender, onCobrar, onVerPaciente, mostrarHora = false }) {
  const paciente = getPaciente(cita.pacienteId)
  const servicio = getServicio(cita.servicioId)
  const fisio = getFisio(cita.fisioId)
  const estado = ESTADO[cita.estado]

  return (
    <div className="flex min-h-[92px] flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar iniciales={paciente.iniciales} size={34} tono="bg-slate-100 text-slate-600" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">{paciente.nombre}</p>
            <p className="truncate text-sm text-slate-500">
              {mostrarHora && <span className="font-medium text-ink-900">{cita.hora} · </span>}
              Atiende {fisio.nombre}
            </p>
          </div>
        </div>
        <Badge tono={estado.tono}>{estado.texto}</Badge>
      </div>

      <p className="truncate text-sm text-slate-500">
        {mostrarHora && `Camilla ${cita.camilla} · `}
        {servicio.nombre}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        {cita.estado === "pendiente" && (
          <Btn variant="soft" icon={Check} className="px-3 py-1.5 text-sm" onClick={() => onAtender(cita.id)}>
            Atender
          </Btn>
        )}
        {cita.estado === "atendido" && (
          <Btn variant="primary" icon={CreditCard} className="px-3 py-1.5 text-sm" onClick={() => onCobrar(cita)}>
            Cobrar {bs(servicio.precio)}
          </Btn>
        )}
        {cita.estado === "pagado" && (
          <span className="text-sm text-slate-400">Cobrado {bs(servicio.precio)}</span>
        )}
        <Btn
          variant="quiet"
          icon={UserRound}
          className="px-2 py-1.5 text-sm"
          onClick={() => onVerPaciente(paciente.id)}
        >
          Ficha
        </Btn>
      </div>
    </div>
  )
}
