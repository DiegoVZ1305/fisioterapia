import { useState } from "react"
import { CalendarDays, Clock, CreditCard, LineChart, User, Users } from "lucide-react"

import { CITAS, HORARIO_INICIAL, TRANSACCIONES } from "./data"

import Agenda from "./views/Agenda"
import Cobros from "./views/Cobros"
import Pacientes from "./views/Pacientes"
import Reportes from "./views/Reportes"
import Horarios from "./views/Horarios"

const NAV = [
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "pacientes", label: "Pacientes", icon: Users },
  { id: "cobros", label: "Cobros", icon: CreditCard },
  { id: "reportes", label: "Reportes", icon: LineChart },
  { id: "horarios", label: "Horarios", icon: Clock },
]

export default function App() {
  const [vista, setVista] = useState("agenda")
  const [citas, setCitas] = useState(CITAS)
  const [transacciones, setTransacciones] = useState(TRANSACCIONES)
  const [pacienteId, setPacienteId] = useState("p1")
  const [porCobrar, setPorCobrar] = useState(null)
  const [reservarPara, setReservarPara] = useState(null)
  const [horarioSemanal, setHorarioSemanal] = useState(HORARIO_INICIAL)

  const atender = (citaId) =>
    setCitas((cs) => cs.map((c) => (c.id === citaId ? { ...c, estado: "atendido" } : c)))

  const irACobrar = (cita) => {
    setPorCobrar({ citaId: cita.id, pacienteId: cita.pacienteId, servicioId: cita.servicioId })
    setVista("cobros")
  }

  const registrarPago = ({ citaId, pacienteId: pid, servicioId, monto, medio }) => {
    const ahora = new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", hour12: false })
    setTransacciones((ts) => [
      { id: `t${ts.length + 1}-${Date.now()}`, pacienteId: pid, servicioId, monto, medio, hora: ahora },
      ...ts,
    ])
    if (citaId) setCitas((cs) => cs.map((c) => (c.id === citaId ? { ...c, estado: "pagado" } : c)))
    setPorCobrar(null)
  }

  const agendarCita = (cita) => setCitas((cs) => [...cs, cita])

  const verPaciente = (pid) => {
    setPacienteId(pid)
    setVista("pacientes")
  }

  const cambiarHorario = (diaId, cambios) =>
    setHorarioSemanal((h) => ({ ...h, [diaId]: { ...h[diaId], ...cambios } }))

  /* Desde la ficha del paciente: abre la agenda con la ventana de reserva ya cargada.
     El sello evita que la ventana se reabra sola si vuelven a esta vista. */
  const reservarParaPaciente = (pid) => {
    setReservarPara({ pacienteId: pid, sello: Date.now() })
    setVista("agenda")
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-5">
          <p className="shrink-0 text-base font-semibold tracking-tight text-ink-900">
            Mana <span className="text-mana-500">Rehab</span>
          </p>

          <nav className="-mx-1 flex flex-1 items-center gap-1 overflow-x-auto px-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setVista(n.id)}
                aria-label={n.label}
                aria-current={vista === n.id ? "page" : undefined}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  vista === n.id
                    ? "bg-mana-50 text-mana-700"
                    : "text-slate-500 hover:bg-slate-100 hover:text-ink-900"
                }`}
              >
                <n.icon size={16} />
                <span className="hidden sm:inline">{n.label}</span>
              </button>
            ))}
          </nav>

          <button
            aria-label="Cuenta del usuario"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-ink-900"
          >
            <User size={18} />
          </button>
        </div>
      </header>

      <main key={vista} className="fade-up mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-7">
        {vista === "agenda" && (
          <Agenda
            citas={citas}
            onAtender={atender}
            onCobrar={irACobrar}
            onAgendar={agendarCita}
            onVerPaciente={verPaciente}
            reservarPara={reservarPara}
            onReservaAbierta={() => setReservarPara(null)}
            horarioSemanal={horarioSemanal}
            onIrAHorarios={() => setVista("horarios")}
          />
        )}
        {vista === "pacientes" && (
          <Pacientes
            pacienteId={pacienteId}
            setPacienteId={setPacienteId}
            citas={citas}
            onAgendar={reservarParaPaciente}
          />
        )}
        {vista === "cobros" && (
          <Cobros
            transacciones={transacciones}
            porCobrar={porCobrar}
            onLimpiar={() => setPorCobrar(null)}
            onPagar={registrarPago}
          />
        )}
        {vista === "reportes" && <Reportes transacciones={transacciones} />}
        {vista === "horarios" && (
          <Horarios
            horarioSemanal={horarioSemanal}
            onCambiar={cambiarHorario}
            onReiniciar={() => setHorarioSemanal(HORARIO_INICIAL)}
          />
        )}
      </main>
    </div>
  )
}
