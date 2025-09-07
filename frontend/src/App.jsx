import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'

function Layout({ children }) {
  const authed = window.localStorage.getItem('hm_authed') === '1'
  return (
    <div className="container">
      <header className="row space-between" style={{marginBottom:20}}>
        <h1 className="h1">HabitMind</h1>
        <nav className="row" style={{gap:12}}>
          <Link to="/">Dashboard</Link>
          {!authed && <Link to="/login">Login</Link>}
          {!authed && <Link to="/register">Register</Link>}
        </nav>
      </header>
      {children}
    </div>
  )
}

function RequireAuth({ children }) {
  const location = useLocation()
  const isAuthed = window.localStorage.getItem('hm_authed') === '1'
  if (!isAuthed) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RequireAuth><Dashboard/></RequireAuth>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
