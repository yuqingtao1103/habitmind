import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { on } from '../lib/events'

const Ctx = createContext({ push:()=>{} })

export function ToastProvider({ children }) {
  const [list, setList] = useState([])

  const push = useCallback((type, text) => {
    const id = Math.random().toString(36).slice(2)
    setList(v => [...v, { id, type, text }])
    setTimeout(() => setList(v => v.filter(x => x.id !== id)), 3000)
  }, [])

  // 自动监听 API 错误
  useEffect(() => on('api-error', (e) => {
    const msg = e?.message || 'Request failed'
    push('error', msg)
  }), [push])

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="toast-wrap">
        {list.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.text}</div>)}
      </div>
    </Ctx.Provider>
  )
}

export function useToast(){ return useContext(Ctx) }
