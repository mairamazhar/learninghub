import { useMemo, useState } from 'react'
import StudentCard from '../components/StudentCard.jsx'
import Combobox from '../components/Combobox.jsx'
import { students } from '../data/students.js'
import { STATUS_META } from '../constants/status.js'
import './StudentsPage.css'

const SORT_OPTIONS = {
  name: { label: 'Name (A–Z)', compare: (a, b) => a.name.localeCompare(b.name) },
  gpa: { label: 'GPA (high → low)', compare: (a, b) => b.gpa - a.gpa },
  attendance: { label: 'Attendance (high → low)', compare: (a, b) => b.attendance - a.attendance },
}

const courses = ['All', ...new Set(students.map((s) => s.course))]

// Options for the status combobox, with how many students have each status
const statusOptions = [
  { value: 'all', label: 'All statuses', count: students.length },
  ...Object.entries(STATUS_META).map(([value, { label, color }]) => ({
    value,
    label,
    color,
    count: students.filter((s) => s.status === value).length,
  })),
]

function StudentsPage() {
  const [query, setQuery] = useState('')
  const [course, setCourse] = useState('All')
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [favorites, setFavorites] = useState(() => new Set())
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [selected, setSelected] = useState(null)

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Derived list: never stored in state, recomputed only when inputs change
  const visibleStudents = useMemo(() => {
    const q = query.trim().toLowerCase()
    return students
      .filter((s) => course === 'All' || s.course === course)
      .filter((s) => status === 'all' || s.status === status)
      .filter((s) => !onlyFavorites || favorites.has(s.id))
      .filter(
        (s) =>
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.skills.some((skill) => skill.toLowerCase().includes(q)),
      )
      .toSorted(SORT_OPTIONS[sortBy].compare)
  }, [query, course, status, sortBy, onlyFavorites, favorites])

  const stats = useMemo(() => {
    const total = students.length
    const avg = (key) => students.reduce((sum, s) => sum + s[key], 0) / total
    return {
      total,
      active: students.filter((s) => s.status === 'active').length,
      avgGpa: avg('gpa').toFixed(2),
      avgAttendance: Math.round(avg('attendance')),
    }
  }, [])

  const resetFilters = () => {
    setQuery('')
    setCourse('All')
    setStatus('all')
    setOnlyFavorites(false)
  }

  return (
    <main className="students-page">
      <header className="students-page__hero">
        <p className="students-page__eyebrow">Learning Hub</p>
        <h1>Student Directory</h1>
        <p className="students-page__subtitle">
          Browse enrolled students, track their progress and star the ones you're mentoring.
        </p>
      </header>

      <section className="students-page__stats" aria-label="Summary">
        <div><strong>{stats.total}</strong><span>Students</span></div>
        <div><strong>{stats.active}</strong><span>Active</span></div>
        <div><strong>{stats.avgGpa}</strong><span>Avg. GPA</span></div>
        <div><strong>{stats.avgAttendance}%</strong><span>Avg. attendance</span></div>
      </section>

      <section className="students-page__toolbar" aria-label="Filters">
        <input
          type="search"
          className="field field--search"
          placeholder="Search by name, roll no. or skill…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search students"
        />

        <div className="chips" role="group" aria-label="Filter by course">
          {courses.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${course === c ? 'is-active' : ''}`}
              aria-pressed={course === c}
              onClick={() => setCourse(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="students-page__controls">
          <label className="toggle">
            <input
              type="checkbox"
              checked={onlyFavorites}
              onChange={(e) => setOnlyFavorites(e.target.checked)}
            />
            Favourites only ({favorites.size})
          </label>

          <div className="students-page__selects">
            <Combobox
              label="Status"
              options={statusOptions}
              value={status}
              onChange={setStatus}
              clearValue="all"
              placeholder="Type a status…"
              emptyText="No matching status"
            />

            <select
              className="field"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort students"
            >
              {Object.entries(SORT_OPTIONS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <p className="students-page__count" aria-live="polite">
        Showing {visibleStudents.length} of {students.length} students
      </p>

      {visibleStudents.length > 0 ? (
        <section className="students-page__grid">
          {visibleStudents.map((student) => (
            <StudentCard
              key={student.id}
              {...student}
              isFavorite={favorites.has(student.id)}
              onToggleFavorite={() => toggleFavorite(student.id)}
              onViewProfile={() => setSelected(student)}
            />
          ))}
        </section>
      ) : (
        <div className="students-page__empty">
          <p>No students match your filters.</p>
          <button type="button" className="btn btn--ghost" onClick={resetFilters}>
            Clear filters
          </button>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="profile-title">{selected.name}</h2>
            <p className="modal__sub">{selected.rollNo} · {selected.course}</p>
            <ul className="modal__list">
              <li><span>Email</span>{selected.email}</li>
              <li><span>Semester</span>{selected.semester}</li>
              <li><span>GPA</span>{selected.gpa.toFixed(1)}</li>
              <li><span>Attendance</span>{selected.attendance}%</li>
              <li><span>Skills</span>{selected.skills.join(', ')}</li>
            </ul>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setSelected(null)}
              autoFocus
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default StudentsPage
