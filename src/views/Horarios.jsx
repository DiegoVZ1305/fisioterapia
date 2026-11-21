import { Clock, RotateCcw } from "lucide-react"

import { Badge, Btn, Card, CardHead, Stat, claseInput } from "../components/ui"
import { CAMILLAS, DIAS_SEMANA, HORAS_POSIBLES, horasEntre, totalHorasSemana } from "../data"

export default function Horarios({ horarioSemanal, onCambiar, onReiniciar }) {
  const diasAbiertos = DIAS_SEMANA.filter((d) => horarioSemanal[d.id].abierto).length
  const horasSemana = totalHorasSemana(horarioSemanal)
  const cupoSemanal = horasSemana * CAMILLAS.length

  const cambiar = (diaId, cambios) => onCambiar(diaId, cambios)

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">
            Horarios de atención
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Definí a qué hora abre y cierra el centro cada día. La agenda sólo ofrece turnos
            dentro de este horario.
          </p>
        </div>
        <Btn variant="ghost" icon={RotateCcw} onClick={onReiniciar}>
          Restaurar
        </Btn>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat label="Días que abre" valor={`${diasAbiertos} de 7`} sub="Por semana" />
        <Stat label="Horas de atención" valor={horasSemana} sub="Sumando toda la semana" tono="teal" />
        <Stat
          label="Turnos posibles"
          valor={cupoSemanal}
          sub={`${horasSemana} horas x ${CAMILLAS.length} camillas`}
        />
      </div>

      <Card>
        <CardHead
          titulo="Horario por día"
          sub="Los cambios se aplican a la agenda al instante."
          right={
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
              <Clock size={15} /> Turnos de 1 hora
            </span>
          }
        />

        <ul className="divide-y divide-slate-100">
          {DIAS_SEMANA.map((d) => {
            const dia = horarioSemanal[d.id]
            const turnos = dia.abierto ? horasEntre(dia.apertura, dia.cierre).length : 0

            return (
              <li key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
                <div className="flex min-w-[150px] flex-1 items-center gap-3">
                  <Interruptor
                    activo={dia.abierto}
                    etiqueta={`${d.nombre}: ${dia.abierto ? "abierto" : "cerrado"}`}
                    onClick={() => cambiar(d.id, { abierto: !dia.abierto })}
                  />
                  <div className="min-w-0">
                    <p className="text-base font-medium text-ink-900">{d.nombre}</p>
                    <p className="text-sm text-slate-500">
                      {dia.abierto ? `${turnos} turnos por camilla` : "No se atiende"}
                    </p>
                  </div>
                </div>

                {dia.abierto ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-slate-500">
                      Abre
                      <select
                        value={dia.apertura}
                        aria-label={`Hora de apertura del ${d.nombre}`}
                        onChange={(e) => {
                          const apertura = e.target.value
                          const cierre = apertura >= dia.cierre ? siguienteHora(apertura) : dia.cierre
                          cambiar(d.id, { apertura, cierre })
                        }}
                        className={`${claseInput} w-auto`}
                      >
                        {HORAS_POSIBLES.slice(0, -1).map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex items-center gap-2 text-sm text-slate-500">
                      Cierra
                      <select
                        value={dia.cierre}
                        aria-label={`Hora de cierre del ${d.nombre}`}
                        onChange={(e) => cambiar(d.id, { cierre: e.target.value })}
                        className={`${claseInput} w-auto`}
                      >
                        {HORAS_POSIBLES.filter((h) => h > dia.apertura).map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : (
                  <Badge tono="gris">Cerrado</Badge>
                )}
              </li>
            )
          })}
        </ul>
      </Card>

      <Card>
        <CardHead titulo="Cómo queda la semana" />
        <div className="px-5 py-5">
          <ul className="space-y-2">
            {DIAS_SEMANA.map((d) => {
              const dia = horarioSemanal[d.id]
              return (
                <li key={d.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="w-24 shrink-0 text-slate-600">{d.nombre}</span>
                  <span className="flex-1 text-slate-400">
                    {dia.abierto ? (
                      <Barra apertura={dia.apertura} cierre={dia.cierre} />
                    ) : (
                      <span className="block h-2 rounded-full bg-slate-100" />
                    )}
                  </span>
                  <span className="w-28 shrink-0 text-right font-medium text-ink-900">
                    {dia.abierto ? `${dia.apertura} a ${dia.cierre}` : "Cerrado"}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="mt-4 text-sm text-slate-500">
            Si un turno ya reservado queda fuera del nuevo horario, igual se sigue viendo en la
            agenda: cambiar el horario no borra reservas.
          </p>
        </div>
      </Card>
    </div>
  )
}

const siguienteHora = (hora) => {
  const i = HORAS_POSIBLES.indexOf(hora)
  return HORAS_POSIBLES[Math.min(i + 1, HORAS_POSIBLES.length - 1)]
}

/* Franja proporcional del día (06:00 a 22:00) para ver la semana de un vistazo. */
function Barra({ apertura, cierre }) {
  const inicio = Number(HORAS_POSIBLES[0].slice(0, 2))
  const fin = Number(HORAS_POSIBLES[HORAS_POSIBLES.length - 1].slice(0, 2))
  const total = fin - inicio
  const desde = ((Number(apertura.slice(0, 2)) - inicio) / total) * 100
  const ancho = ((Number(cierre.slice(0, 2)) - Number(apertura.slice(0, 2))) / total) * 100

  return (
    <span className="relative block h-2 overflow-hidden rounded-full bg-slate-100">
      <span
        className="absolute inset-y-0 rounded-full bg-mana-500"
        style={{ left: `${desde}%`, width: `${ancho}%` }}
      />
    </span>
  )
}

function Interruptor({ activo, etiqueta, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition ${
        activo ? "bg-mana-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
          activo ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  )
}
