import { useEffect, useState } from "react"
import { Check, CreditCard } from "lucide-react"

import { Avatar, Badge, Btn, Campo, Card, CardHead, QR, Vacio, bs, claseInput } from "../components/ui"
import { MEDIOS_PAGO, PACIENTES, SERVICIOS, getPaciente, getServicio } from "../data"

export default function Cobros({ transacciones, porCobrar, onLimpiar, onPagar }) {
  const [pacienteId, setPacienteId] = useState(porCobrar?.pacienteId ?? "p1")
  const [servicioId, setServicioId] = useState(porCobrar?.servicioId ?? "s1")
  const [medio, setMedio] = useState("QR")
  const [confirmado, setConfirmado] = useState(false)
  const [citaId, setCitaId] = useState(porCobrar?.citaId ?? null)

  // Cuando llega un cobro desde la agenda, el formulario se precarga con esa cita.
  useEffect(() => {
    if (!porCobrar) return
    setPacienteId(porCobrar.pacienteId)
    setServicioId(porCobrar.servicioId)
    setCitaId(porCobrar.citaId)
    setConfirmado(false)
  }, [porCobrar])

  const paciente = getPaciente(pacienteId)
  const servicio = getServicio(servicioId)
  const totalHoy = transacciones.reduce((a, t) => a + t.monto, 0)

  const cobrar = () => {
    onPagar({
      citaId,
      pacienteId,
      servicioId,
      monto: servicio.precio,
      medio,
    })
    setConfirmado(true)
  }

  const nuevoCobro = () => {
    setConfirmado(false)
    setCitaId(null)
    onLimpiar()
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">Cobros</h1>
          <p className="mt-1 text-sm text-slate-500">Cobro por QR, efectivo o tarjeta al terminar la sesión.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Recaudado hoy</p>
          <p className="text-2xl font-semibold text-ink-900">{bs(totalHoy)}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHead
            titulo="Nuevo cobro"
            sub={citaId ? "Datos traídos desde la agenda" : "Elegí paciente y servicio"}
            right={citaId && <Badge tono="teal">Desde agenda</Badge>}
          />

          <div className="space-y-5 px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Paciente">
                <select
                  value={pacienteId}
                  onChange={(e) => {
                    setPacienteId(e.target.value)
                    setCitaId(null)
                    setConfirmado(false)
                  }}
                  className={claseInput}
                >
                  {PACIENTES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} — CI {p.ci}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Servicio">
                <select
                  value={servicioId}
                  onChange={(e) => {
                    setServicioId(e.target.value)
                    setCitaId(null)
                    setConfirmado(false)
                  }}
                  className={claseInput}
                >
                  {SERVICIOS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} — {bs(s.precio)}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <Avatar iniciales={paciente.iniciales} size={38} tono="bg-slate-200 text-slate-600" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900">{paciente.nombre}</p>
                <p className="truncate text-sm text-slate-500">{paciente.diagnostico}</p>
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-600">Forma de pago</p>
              <div className="grid grid-cols-3 gap-2">
                {MEDIOS_PAGO.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMedio(m)
                      setConfirmado(false)
                    }}
                    className={`cursor-pointer rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                      medio === m
                        ? "border-mana-400 bg-mana-50 text-mana-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-slate-500">{servicio.detalle}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-base font-medium text-ink-900">Total a cobrar</span>
                <span className="text-3xl font-semibold text-ink-900">{bs(servicio.precio)}</span>
              </div>
            </div>

            {medio === "QR" && !confirmado && (
              <div className="flex flex-col items-center gap-3 rounded-lg bg-slate-50 py-6">
                <QR seed={`${pacienteId}-${servicioId}`} size={168} />
                <p className="text-sm text-slate-500">El paciente escanea con su app bancaria</p>
              </div>
            )}

            {confirmado ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-emerald-50 px-4 py-4">
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                  <Check size={18} /> Pago de {bs(servicio.precio)} registrado con {medio.toLowerCase()}
                </p>
                <Btn variant="ghost" onClick={nuevoCobro}>
                  Hacer otro cobro
                </Btn>
              </div>
            ) : (
              <Btn variant="primary" icon={CreditCard} className="w-full py-3" onClick={cobrar}>
                Registrar cobro de {bs(servicio.precio)}
              </Btn>
            )}
          </div>
        </Card>

        <Card className="h-fit">
          <CardHead titulo="Cobros de hoy" sub={`${transacciones.length} movimientos`} />
          <div className="divide-y divide-slate-100">
            {transacciones.length === 0 && (
              <div className="p-5">
                <Vacio>Todavía no se registró ningún cobro hoy.</Vacio>
              </div>
            )}
            {transacciones.map((t) => {
              const p = getPaciente(t.pacienteId)
              const s = getServicio(t.servicioId)
              return (
                <div key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{p.nombre}</p>
                    <p className="truncate text-xs text-slate-500">
                      {s.nombre} · {t.medio} · {t.hora}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-ink-900">{bs(t.monto)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <span className="text-sm text-slate-500">Total</span>
            <span className="text-base font-semibold text-ink-900">{bs(totalHoy)}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
