import Icon from '../ui/Icon.jsx'
import './AuthLayout.css'

const YEAR = new Date().getFullYear()

/** Split-screen shell shared by Login and Register: brand panel + form panel. */
function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth__brand">
        <div className="auth__logo">
          <Icon name="cap" size={28} /> <span>Northfield University</span>
        </div>
        <div className="auth__pitch">
          <h2>Admissions &amp; registration, in one place.</h2>
          <p>Manage student enrolment, courses and academic records from a single secure admin portal.</p>
          <ul>
            <li><Icon name="check" size={18} /> Real-time enrolment insights</li>
            <li><Icon name="check" size={18} /> Student records &amp; status tracking</li>
            <li><Icon name="check" size={18} /> Course capacity management</li>
          </ul>
        </div>
        <small>© {YEAR} Northfield University</small>
      </aside>

      <main className="auth__panel">
        <div className="auth__card">
          <div className="auth__logo auth__logo--mobile">
            <Icon name="cap" size={24} /> <span>Northfield University</span>
          </div>
          <h1>{title}</h1>
          <p className="auth__subtitle">{subtitle}</p>
          {children}
          <p className="auth__footer">{footer}</p>
        </div>
      </main>
    </div>
  )
}

export default AuthLayout
