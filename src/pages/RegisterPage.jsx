import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout.jsx'
import FormField from '../components/ui/FormField.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Enter your full name.'
    if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address.'
    if (form.password.length < 8) next.password = 'Use at least 8 characters.'
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      next.password = 'Include at least one letter and one number.'
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match.'
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
      await register(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setFormError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register as university staff to access the admin portal."
      footer={<>Already have an account? <Link to="/login">Sign in</Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && <div className="auth-form__alert" role="alert">{formError}</div>}

        <FormField id="name" label="Full name" icon="user" autoComplete="name"
          placeholder="Jane Doe" value={form.name} onChange={update('name')} error={errors.name} />
        <FormField id="email" label="Work email" type="email" icon="mail" autoComplete="email"
          placeholder="you@university.edu" value={form.email} onChange={update('email')} error={errors.email} />
        <FormField id="password" label="Password" type="password" icon="lock" autoComplete="new-password"
          placeholder="At least 8 characters" hint="Minimum 8 characters, with a letter and a number."
          value={form.password} onChange={update('password')} error={errors.password} />
        <FormField id="confirm" label="Confirm password" type="password" icon="lock" autoComplete="new-password"
          placeholder="Re-enter your password" value={form.confirm} onChange={update('confirm')} error={errors.confirm} />

        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
