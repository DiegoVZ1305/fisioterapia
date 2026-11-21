import { useEffect, useMemo, useState } from "react"
import { CalendarDays, CalendarPlus, Phone, Search, Share2 } from "lucide-react"

import { Avatar, Badge, Btn, Card, CardHead, Progress, QR, Vacio, claseInput } from "../components/ui"
import {
  PACIENTES,
  formatoFecha,
  formatoFechaCorta,
  getFisio,
  getPaciente,
  getServicio,
  proximaVisita,
  visitasPasadas,
} from "../data"

export default function Pacientes({ pacienteId, setPacienteId, citas = [], onAgendar }) {
  const [busqueda, setBusqueda] = useState("")
  const paciente = getPaciente(pacienteId) ?? PACIENTES[0]
  const [hechos, setHechos] = useState(() => paciente.ejercicios.map((e) => e.hecho))

  // Al cambiar de paciente, la rutina vuelve a su estado guardado.
  useEffect(() => {
    setHechos(paciente.ejercicios.map((e) => e.hecho))
  }, [paciente])

  const encontrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return PACIENTES
    return PACIENTES.filter((p) =>
      [p.nombre, p.ci, p.tel, p.diagnostico, p.zona].join(" ").toLowerCase().includes(q),
    )
  }, [busqueda])

  const proxima = proximaVisita(citas, paciente.id)
  const pasadas = visitasPasadas(citas, paciente.id)
  const avance = Math.round((paciente.sesion / paciente.totalSesiones) * 100)
  const completados = hechos.filter(Boolean).length

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">Pacientes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Buscá un paciente para ver su próxima visita y su tratamiento.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* Buscador y listado */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, CI, teléfono o lesión"
              aria-label="Buscar paciente"
              className={`${claseInput} cursor-text pl-9`}
            />
          </div>

          {encontrados.length === 0 ? (
            <Vacio>Ningún paciente coincide con «{busqueda}».</Vacio>
          ) : (
            <div className="space-y-2">
              {encontrados.map((p) => {
                const activo = p.id === paciente.id
                const prox = proximaVisita(citas, p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => setPacienteId(p.id)}
                    aria-current={activo ? "true" : undefined}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition ${
                      activo
                        ? "border-mana-400 bg-mana-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <Avatar
                      iniciales={p.iniciales}
                      size={36}
                      tono={activo ? "bg-mana-100 text-mana-700" : "bg-slate-100 text-slate-600"}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink-900">{p.nombre}</span>
                      <span className="block truncate text-sm text-slate-500">{p.diagnostico}</span>
                      <span className="mt-0.5 block truncate text-xs text-slate-400">
                        {prox ? `Próxima: ${formatoFechaCorta(prox.fecha)} · ${prox.hora}` : "Sin próxima visita"}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Ficha del paciente */}
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar iniciales={paciente.iniciales} size={48} />
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-ink-900">{paciente.nombre}</p>
                  <p className="truncate text-sm text-slate-500">
                    {paciente.edad} años · CI {paciente.ci}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                    <Phone size={13} /> {paciente.tel}
                  </p>
                </div>
              </div>
              <Badge tono={paciente.sesion >= paciente.totalSesiones ? "verde" : "teal"}>
                {paciente.sesion >= paciente.totalSesiones ? "Plan terminado" : "En tratamiento"}
              </Badge>
            </div>
          </Card>

          {/* Próxima visita */}
          <Card>
            <CardHead
              titulo="Próxima visita"
              right={
                onAgendar && (
                  <Btn variant="ghost" icon={CalendarPlus} onClick={() => onAgendar(paciente.id)}>
                    Agendar
                  </Btn>
                )
              }
            />
            <div className="px-5 py-5">
              {proxima ? (
                <div className="flex flex-wrap items-center gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mana-50 text-mana-600">
                    <CalendarDays size={22} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-ink-900 first-letter:uppercase">
                      {formatoFecha(proxima.fecha)} · {proxima.hora}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Camilla {proxima.camilla} · atiende {getFisio(proxima.fisioId).nombre} ·{" "}
                      {getServicio(proxima.servicioId).nombre}
                    </p>
                  </div>
                </div>
              ) : (
                <Vacio>No tiene una próxima visita agendada.</Vacio>
              )}
            </div>
          </Card>

          {/* Qué se le está tratando */}
          <Card>
            <CardHead titulo="Qué se le está tratando" sub={`Desde el ${formatoFecha(paciente.inicio)}`} />
            <div className="space-y-5 px-5 py-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Dato label="Diagnóstico" valor={paciente.diagnostico} />
                <Dato label="Zona del cuerpo" valor={paciente.zona} />
                <Dato label="Fisioterapeuta a cargo" valor={getFisio(paciente.fisioId).nombre} />
                <Dato label="Visitas registradas" valor={`${pasadas.length} realizadas`} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Motivo de consulta</p>
                <p className="mt-1 text-sm text-ink-900">{paciente.motivo}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Tratamientos que recibe</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {paciente.tratamientos.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg bg-mana-50 px-3 py-1.5 text-sm font-medium text-mana-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-slate-500">Avance del plan</span>
                  <span className="font-semibold text-ink-900">
                    Sesión {paciente.sesion} de {paciente.totalSesiones}
                  </span>
                </div>
                <Progress value={avance} className="mt-2" />
                <p className="mt-2 text-sm text-slate-500">
                  Le quedan {Math.max(0, paciente.totalSesiones - paciente.sesion)} sesiones del plan
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Cómo va</p>
                <p className="mt-1 text-sm text-ink-900">{paciente.evolucion}</p>
              </div>
            </div>
          </Card>

          {/* Historial */}
          <Card>
            <CardHead titulo="Visitas anteriores" sub={`${pasadas.length} sesiones ya realizadas`} />
            <div className="px-5 py-5">
              {pasadas.length === 0 ? (
                <Vacio>Todavía no tiene visitas registradas.</Vacio>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {pasadas.map((v) => (
                    <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink-900 first-letter:uppercase">
                          {formatoFechaCorta(v.fecha)} · {v.hora}
                        </p>
                        <p className="truncate text-sm text-slate-500">
                          {getServicio(v.servicioId).nombre} · {getFisio(v.fisioId).nombre} · Camilla{" "}
                          {v.camilla}
                        </p>
                      </div>
                      <Badge tono="verde">Pagada</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* Ejercicios y carnet */}
          <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
            <Card>
              <CardHead
                titulo="Ejercicios en casa"
                sub="Lo que el paciente marca desde su celular"
                right={
                  <Badge tono={completados === hechos.length ? "verde" : "teal"}>
                    {completados} de {hechos.length}
                  </Badge>
                }
              />
              <div className="space-y-2 px-5 py-5">
                {paciente.ejercicios.map((e, i) => (
                  <button
                    key={e.nombre}
                    onClick={() => setHechos((h) => h.map((v, j) => (j === i ? !v : v)))}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-4 text-left transition ${
                      hechos[i] ? "border-emerald-200 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-sm font-bold ${
                        hechos[i] ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white"
                      }`}
                    >
                      {hechos[i] ? "✓" : ""}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-base font-medium ${
                          hechos[i] ? "text-emerald-900 line-through" : "text-ink-900"
                        }`}
                      >
                        {e.nombre}
                      </span>
                      <span className="block text-sm text-slate-500">{e.dosis}</span>
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="bg-ink-900 px-5 py-4 text-center text-white">
                <p className="text-base font-semibold">Carnet del paciente</p>
                <p className="mt-0.5 text-sm text-slate-400">Lo que ve en su celular</p>
              </div>
              <div className="flex flex-col items-center gap-2 px-5 py-5">
                <QR seed={`carnet-${paciente.id}`} size={170} />
                <p className="text-center text-sm text-slate-500">Lo muestra en recepción al llegar</p>
              </div>
              <div className="border-t border-slate-100 px-5 py-4">
                <Btn variant="primary" icon={Share2} className="w-full">
                  Enviar por WhatsApp
                </Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dato({ label, valor }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-0.5 text-base font-medium text-ink-900">{valor}</p>
    </div>
  )
}
