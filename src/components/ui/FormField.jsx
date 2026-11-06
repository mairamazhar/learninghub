import { useState } from 'react'
import Icon from './Icon.jsx'

/** Labelled input with optional leading icon, inline error and (for passwords) a show/hide toggle. */
function FormField({ id, label, icon, error, hint, type = 'text', ...inputProps }) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className={`form-field__control ${error ? 'has-error' : ''}`}>
        {icon && <Icon name={icon} size={18} className="form-field__icon" />}
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className="form-field__toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
          >
            <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="form-field__error" role="alert">{error}</p>
      ) : (
        hint && <p id={`${id}-hint`} className="form-field__hint">{hint}</p>
      )}
    </div>
  )
}

export default FormField
