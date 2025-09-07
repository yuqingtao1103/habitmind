import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useToast } from '../ui/Toast.jsx'

export default function Register() {
  const nav = useNavigate()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e){
    e.preventDefault()
    if(!email || !password){ toast.push('error','Email & password required'); return }
    setBusy(true)
    try{
      await api.signup(email, password)
      await api.me()
      window.localStorage.setItem('hm_authed','1')
      toast.push('ok','Account created!')
      nav('/', { replace:true })
    }catch(e){ /* 错误由全局 toast 处理 */ }
    finally{ setBusy(false) }
  }

  return (
    <div>
      <h2 className="h2">Register</h2>
      <form onSubmit={onSubmit} className="grid" style={{maxWidth:360}}>
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button className="btn btn-primary" disabled={busy}>{busy ? <span className="spinner"/> : 'Create account'}</button>
      </form>
      <p className="muted" style={{marginTop:8}}>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  )
}
