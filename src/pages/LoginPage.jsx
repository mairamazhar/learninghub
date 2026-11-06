import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout.jsx'
import FormField from '../components/ui/FormField.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { DEMO_ADMIN } from '../constants/demoAdmin.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from ?? '/dashboard'

  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to={redirectTo} replace />

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address.'
    if (!form.password) next.password = 'Password is required.'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length) return

    setSubmitting(true)
    try {
      await login(form)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to the university admin portal."
      footer={<>New staff member? <Link to="/register">Create an account</Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && <div className="auth-form__alert" role="alert">{formError}</div>}

        <FormField
          id="email" label="Email" type="email" icon="mail"
          autoComplete="email" placeholder="you@university.edu"
          value={form.email} onChange={update('email')} error={errors.email}
        />
        <FormField
          id="password" label="Password" type="password" icon="lock"
          autoComplete="current-password" placeholder="Enter your password"
          value={form.password} onChange={update('password')} error={errors.password}
        />

        <div className="auth-form__row">
          <label className="auth-form__check">
            <input type="checkbox" checked={form.remember} onChange={update('remember')} />
            Remember me
          </label>
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="demo-box">
        <strong>Demo admin account</strong>
        Email: <code>{DEMO_ADMIN.email}</code><br />
        Password: <code>{DEMO_ADMIN.password}</code>
        <br />
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, email: DEMO_ADMIN.email, password: DEMO_ADMIN.password }))}
        >
          Fill credentials
        </button>
      </div>
    </AuthLayout>
  )
}

export default LoginPage
