import { useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Btn, Card, CardHead, Progress, Stat, bs } from "../components/ui"
import { FINANZAS, GASTOS } from "../data"

const PERIODOS = ["Semanal", "Mensual", "Anual"]
const mesActual = new Date().toLocaleDateString("es-BO", { month: "long", year: "numeric" })
const COLOR_INGRESOS = "#17a2ba"
const COLOR_GASTOS = "#eb6834"

export default function Reportes({ transacciones }) {
  const [periodo, setPeriodo] = useState("Mensual")
  const [tabla, setTabla] = useState(false)

  const f = FINANZAS[periodo]
  const neto = f.ingresos - f.gastos
  const margen = Math.round((neto / f.ingresos) * 100)
  const cumplimiento = Math.round((f.ingresos / f.meta) * 100)
  const cobradoHoy = transacciones.reduce((a, t) => a + t.monto, 0)

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">Reportes y gastos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingresos, gastos y resultado del centro · <span className="first-letter:uppercase">{mesActual}</span>.
          </p>
        </div>
        <div className="flex rounded-lg bg-slate-100 p-1">
          {PERIODOS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`cursor-pointer rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
                periodo === p ? "bg-white text-ink-900 shadow-sm" : "text-slate-500 hover:text-ink-900"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <Stat label="Ingresos" valor={bs(f.ingresos)} sub={`${cumplimiento}% de la meta`} />
        <Stat label="Gastos" valor={bs(f.gastos)} sub={`${Math.round((f.gastos / f.ingresos) * 100)}% de los ingresos`} />
        <Stat label="Ganancia" valor={bs(neto)} sub={`Margen del ${margen}%`} tono="teal" />
        <Stat label="Sesiones" valor={f.sesiones} sub={`${bs(Math.round(f.ingresos / f.sesiones))} por sesión`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHead
            titulo="Ingresos y gastos"
            sub={periodo === "Semanal" ? "Por día" : periodo === "Mensual" ? "Por semana" : "Por mes"}
            right={
              <div className="flex items-center gap-3">
                <Leyenda color={COLOR_INGRESOS} label="Ingresos" />
                <Leyenda color={COLOR_GASTOS} label="Gastos" />
                <Btn variant="ghost" className="px-2.5 py-1.5 text-xs" onClick={() => setTabla((t) => !t)}>
                  {tabla ? "Ver gráfico" : "Ver tabla"}
                </Btn>
              </div>
            }
          />
          <div className="px-5 py-5">
            {tabla ? (
              <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-2 font-medium">Periodo</th>
                    <th className="pb-2 text-right font-medium">Ingresos</th>
                    <th className="pb-2 text-right font-medium">Gastos</th>
                    <th className="pb-2 text-right font-medium">Ganancia</th>
                  </tr>
                </thead>
                <tbody>
                  {f.barras.map((b) => (
                    <tr key={b.name} className="border-b border-slate-100">
                      <td className="py-2.5 font-medium text-ink-900">{b.name}</td>
                      <td className="py-2.5 text-right tabular-nums">{b.ingresos.toLocaleString("es-BO")}</td>
                      <td className="py-2.5 text-right tabular-nums">{b.gastos.toLocaleString("es-BO")}</td>
                      <td className="py-2.5 text-right font-medium tabular-nums text-emerald-700">
                        {(b.ingresos - b.gastos).toLocaleString("es-BO")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={f.barras} barGap={2} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#eef2f4" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={52}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      tickFormatter={(v) => `${v / 1000}k`}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(23,162,186,.06)" }}
                      contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}
                      formatter={(v, n) => [bs(v), n === "ingresos" ? "Ingresos" : "Gastos"]}
                    />
                    <Bar dataKey="ingresos" fill={COLOR_INGRESOS} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="gastos" fill={COLOR_GASTOS} radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHead titulo="En qué se van los gastos" sub={`Total ${bs(f.gastos)}`} />
            <div className="space-y-4 px-5 py-5">
              {GASTOS.map((g) => (
                <div key={g.name}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-slate-600">{g.name}</span>
                    <span className="font-medium text-ink-900">
                      {g.pct}% · {bs(Math.round((f.gastos * g.pct) / 100))}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${g.pct}%`, background: g.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHead titulo="Caja de hoy" sub={`${transacciones.length} cobros registrados`} />
            <div className="px-5 py-5">
              <p className="text-3xl font-semibold text-ink-900">{bs(cobradoHoy)}</p>
              <p className="mt-1 text-sm text-slate-500">
                Se actualiza con cada cobro que registrás en la pestaña Cobros.
              </p>
              <div className="mt-4">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-slate-500">Meta del periodo</span>
                  <span className="font-medium text-ink-900">{cumplimiento}%</span>
                </div>
                <Progress value={cumplimiento} className="mt-2" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Leyenda({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  )
}
