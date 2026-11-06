import { courseCapacity } from '../data/dashboard.js'
import './DashboardPage.css'

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
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Program</th>
                <th scope="col">Code</th>
                <th scope="col">Enrolled</th>
                <th scope="col">Capacity</th>
                <th scope="col">Seats left</th>
              </tr>
            </thead>
            <tbody>
              {courseCapacity.map((c) => (
                <tr key={c.code}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.code}</td>
                  <td>{c.enrolled}</td>
                  <td>{c.capacity}</td>
                  <td>{c.capacity - c.enrolled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default CoursesPage
