import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { students } from '../data/students.js'
import { courseCapacity, enrollmentTrend, pendingApplications } from '../data/dashboard.js'
import { STATUS_META } from '../constants/status.js'
import './DashboardPage.css'

const nf = new Intl.NumberFormat('en-US')

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

/* ---------- KPI card ---------- */
function StatCard({ label, value, delta, deltaLabel, icon, tone }) {
  const up = delta >= 0
  return (
    <article className="kpi">
      <div className={`kpi__icon kpi__icon--${tone}`}><Icon name={icon} /></div>
      <div className="kpi__body">
        <p className="kpi__label">{label}</p>
        <p className="kpi__value">{value}</p>
        {delta != null && (
          <p className={`kpi__delta ${up ? 'is-up' : 'is-down'}`}>
            <span aria-hidden="true">{up ? '▲' : '▼'}</span> {Math.abs(delta)}%{' '}
            <span className="kpi__delta-label">{deltaLabel}</span>
          </p>
        )}
      </div>
    </article>
  )
}

/* ---------- Line chart (SVG, no dependency) ---------- */
function TrendChart({ data }) {
  const W = 640, H = 260
  const pad = { t: 16, r: 16, b: 28, l: 44 }
  const max = Math.ceil(Math.max(...data.map((d) => d.applied)) / 100) * 100
  const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / (data.length - 1)
  const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b)
  const line = (key) => data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d[key])}`).join(' ')
  const area = `${line('enrolled')} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t))
  const last = data[data.length - 1]

  return (
    <figure className="trend">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Monthly applications and enrolments for the year. December: ${last.applied} applied, ${last.enrolled} enrolled.`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="trend__grid" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="trend__tick">{t}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={d.month} x={x(i)} y={H - 8} textAnchor="middle" className="trend__tick">{d.month}</text>
        ))}
        <path d={area} className="trend__area" />
        <path d={line('applied')} className="trend__line trend__line--applied" />
        <path d={line('enrolled')} className="trend__line trend__line--enrolled" />
        {data.map((d, i) => (
          <circle key={d.month} cx={x(i)} cy={y(d.enrolled)} r="3.5" className="trend__dot">
            <title>{`${d.month}: ${d.enrolled} enrolled, ${d.applied} applied`}</title>
          </circle>
        ))}
      </svg>
      <figcaption className="legend">
        <span><i className="legend__swatch legend__swatch--enrolled" /> Enrolled</span>
        <span><i className="legend__swatch legend__swatch--applied" /> Applications</span>
      </figcaption>
    </figure>
  )
}

/* ---------- Donut chart ---------- */
function StatusDonut({ items, total }) {
  const R = 52, C = 2 * Math.PI * R
  const segments = items.map((s, i) => ({
    ...s,
    len: (s.count / total) * C,
    offset: items.slice(0, i).reduce((sum, p) => sum + (p.count / total) * C, 0),
  }))
  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" role="img" aria-label={`Student status: ${items.map((s) => `${s.label} ${s.count}`).join(', ')}`}>
        <circle cx="70" cy="70" r={R} className="donut__track" />
        {segments.map((s) => (
          <circle
            key={s.key}
            cx="70" cy="70" r={R}
            stroke={s.color}
            strokeDasharray={`${s.len} ${C - s.len}`}
            strokeDashoffset={-s.offset}
            className="donut__seg"
          />
        ))}
        <text x="70" y="68" textAnchor="middle" className="donut__num">{total}</text>
        <text x="70" y="86" textAnchor="middle" className="donut__cap">students</text>
      </svg>
      <ul className="donut__legend">
        {items.map((s) => (
          <li key={s.key}>
            <i style={{ background: s.color }} /> {s.label}
            <strong>{s.count}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DashboardPage() {
  const { user } = useAuth()

  const live = useMemo(() => {
    const total = students.length
    const byStatus = Object.entries(STATUS_META).map(([key, meta]) => ({
      key,
      ...meta,
      count: students.filter((s) => s.status === key).length,
    }))
    const avgGpa = students.reduce((sum, s) => sum + s.gpa, 0) / total
    const topStudents = students.toSorted((a, b) => b.gpa - a.gpa).slice(0, 4)
    return { total, byStatus, avgGpa, topStudents }
  }, [])

  const enrolledThisYear = enrollmentTrend.reduce((s, m) => s + m.enrolled, 0)
  const [prev, curr] = enrollmentTrend.slice(-2)
  const enrolDelta = Math.round(((curr.enrolled - prev.enrolled) / prev.enrolled) * 100)
  const appDelta = Math.round(((curr.applied - prev.applied) / prev.applied) * 100)
  const seats = courseCapacity.reduce((s, c) => s + c.capacity, 0)
  const filled = courseCapacity.reduce((s, c) => s + c.enrolled, 0)

  return (
    <div className="dash">
      <header className="dash__head">
        <div>
          <h1>{getGreeting()}, {user.name.split(' ')[0]}</h1>
          <p>Here is what's happening with admissions and enrolment today.</p>
        </div>
        <Link to="/students" className="btn btn--primary">View all students</Link>
      </header>

      <section className="dash__kpis" aria-label="Key metrics">
        <StatCard label="Total enrolled (year)" value={nf.format(enrolledThisYear)} delta={enrolDelta} deltaLabel="vs last month" icon="students" tone="indigo" />
        <StatCard label="Applications (Dec)" value={nf.format(curr.applied)} delta={appDelta} deltaLabel="vs last month" icon="mail" tone="amber" />
        <StatCard label="Seat utilisation" value={`${Math.round((filled / seats) * 100)}%`} icon="courses" tone="green" delta={null} />
        <StatCard label="Avg. GPA (directory)" value={live.avgGpa.toFixed(2)} icon="trending" tone="blue" delta={null} />
      </section>

      <div className="dash__grid">
        <section className="card card--wide" aria-labelledby="trend-h">
          <header className="card__head">
            <h2 id="trend-h">Enrolment trend</h2>
            <span className="card__meta">Last 12 months</span>
          </header>
          <TrendChart data={enrollmentTrend} />
        </section>

        <section className="card" aria-labelledby="status-h">
          <header className="card__head"><h2 id="status-h">Student status</h2></header>
          <StatusDonut items={live.byStatus} total={live.total} />
        </section>

        <section className="card" aria-labelledby="cap-h">
          <header className="card__head">
            <h2 id="cap-h">Course capacity</h2>
            <span className="card__meta">Top 6 · {nf.format(filled)} / {nf.format(seats)} seats overall</span>
          </header>
          <ul className="bars">
            {courseCapacity.toSorted((a, b) => b.enrolled - a.enrolled).slice(0, 6).map((c) => {
              const pct = Math.round((c.enrolled / c.capacity) * 100)
              return (
                <li key={c.code}>
                  <div className="bars__row">
                    <span>{c.name}</span>
                    <span>{c.enrolled}/{c.capacity} · <strong>{pct}%</strong></span>
                  </div>
                  <div
                    className={`bars__track ${pct >= 90 ? 'is-full' : ''}`}
                    role="progressbar" aria-label={`${c.name} capacity`}
                    aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
                  >
                    <span style={{ width: `${pct}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="card card--wide" aria-labelledby="apps-h">
          <header className="card__head">
            <h2 id="apps-h">Pending applications</h2>
            <span className="card__meta">{pendingApplications.length} awaiting action</span>
          </header>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th scope="col">Applicant</th><th scope="col">Program</th><th scope="col">Received</th><th scope="col">Status</th></tr>
              </thead>
              <tbody>
                {pendingApplications.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.name}</strong><small>{a.id}</small></td>
                    <td>{a.program}</td>
                    <td>{a.date}</td>
                    <td><span className={`pill pill--${a.status}`}>{a.status === 'new' ? 'New' : 'In review'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card" aria-labelledby="top-h">
          <header className="card__head"><h2 id="top-h">Top performers</h2></header>
          <ol className="top">
            {live.topStudents.map((s) => (
              <li key={s.id}>
                <span className="top__name"><strong>{s.name}</strong><small>{s.course}</small></span>
                <span className="top__gpa">{s.gpa.toFixed(1)}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}

export default DashboardPage
