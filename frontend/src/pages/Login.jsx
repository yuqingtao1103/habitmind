import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useToast } from '../ui/Toast.jsx'

export default function Login() {
  const nav = useNavigate()
  const loc = useLocation()
  const toast = useToast()
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('Passw0rd!')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.me({ silent: true }).then(() => {
      window.localStorage.setItem('hm_authed','1')
      nav('/', { replace:true })
    }).catch(() => window.localStorage.removeItem('hm_authed'))
  }, [])

  async function onSubmit(e){
    e.preventDefault()
    if(!email || !password){ toast.push('error','Email & password required'); return }
    setBusy(true)
    try{
      await api.login(email, password)
      await api.me()
      window.localStorage.setItem('hm_authed','1')
      toast.push('ok','Welcome back!')
      const to = loc.state?.from?.pathname || '/'
      nav(to, { replace:true })
    }catch(e){ /* 错误会被 ToastProvider 自动提示 */ }
    finally{ setBusy(false) }
  }

  return (
    <div>
      <h2 className="h2">Login</h2>
      <form onSubmit={onSubmit} className="grid" style={{maxWidth:360}}>
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button className="btn btn-primary" disabled={busy}>{busy ? <span className="spinner"/> : 'Login'}</button>
      </form>
      <p className="muted" style={{marginTop:8}}>New here? <Link to="/register">Create an account</Link></p>
    </div>
  )
}
