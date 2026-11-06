import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DEMO_ADMIN } from '../constants/demoAdmin.js'

/**
 * DEMO-ONLY auth. Users live in localStorage and passwords are stored in
 * plain text. Replace with a real backend (hashed passwords, httpOnly
 * session cookie / JWT) before shipping anything.
 */
const USERS_KEY = 'uni_users'
const SESSION_KEY = 'uni_session'


const AuthContext = createContext(null)

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable (private mode / quota): session just won't persist */
  }
}

const getUsers = () => {
  const users = readJSON(USERS_KEY, [])
  return users.some((u) => u.email === DEMO_ADMIN.email) ? users : [DEMO_ADMIN, ...users]
}

const toSession = ({ name, email, role }) => ({ name, email, role })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJSON(SESSION_KEY, null))

  const login = useCallback(async ({ email, password, remember }) => {
    const found = getUsers().find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password,
    )
    if (!found) throw new Error('Incorrect email or password.')
    const session = toSession(found)
    setUser(session)
    if (remember) writeJSON(SESSION_KEY, session)
    else localStorage.removeItem(SESSION_KEY)
    return session
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    const normalized = email.trim().toLowerCase()
    const users = getUsers()
    if (users.some((u) => u.email === normalized)) {
      throw new Error('An account with this email already exists.')
    }
    const created = { name: name.trim(), email: normalized, password, role: 'Staff' }
    writeJSON(USERS_KEY, [...users, created])
    const session = toSession(created)
    setUser(session)
    writeJSON(SESSION_KEY, session)
    return session
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
