import { courseCapacity } from '../data/dashboard.js'
import DataTable from '../components/ui/DataTable.jsx'
import './DashboardPage.css'

const rows = courseCapacity.map((c) => ({ ...c, seatsLeft: c.capacity - c.enrolled }))

const columns = [
  { key: 'name', label: 'Program', sortable: true, render: (r) => <strong>{r.name}</strong> },
  { key: 'code', label: 'Code', sortable: true },
  { key: 'enrolled', label: 'Enrolled', sortable: true, numeric: true },
  { key: 'capacity', label: 'Capacity', sortable: true, numeric: true },
  {
    key: 'seatsLeft',
    label: 'Seats left',
    sortable: true,
    numeric: true,
    render: (r) => (r.seatsLeft <= 20 ? <span className="pill pill--review">{r.seatsLeft} left</span> : r.seatsLeft),
  },
]

function CoursesPage() {
  return (
    <div className="dash">
      <header className="dash__head">
        <div>
          <h1>Courses</h1>
          <p>Programs, enrolment and remaining capacity.</p>
        </div>
      </header>

      <section className="card" aria-label="Courses">
        <DataTable columns={columns} rows={rows} rowKey="code" caption="Courses and capacity" initialSort={{ key: 'name', dir: 'asc' }} />
      </section>
    </div>
  )
}

export default CoursesPage
