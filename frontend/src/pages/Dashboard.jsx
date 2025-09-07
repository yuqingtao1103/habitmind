import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { WeekBar, StreakLine } from '../components/Charts'
import { useToast } from '../ui/Toast.jsx'

export default function Dashboard() {
  const nav = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [habits, setHabits] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(10)
  const [form, setForm] = useState({ title:'', description:'', frequency:'daily' })
  const [selected, setSelected] = useState(null)
  const [weekMap, setWeekMap] = useState({})
  const [weeklyStats, setWeeklyStats] = useState(null)
  const [streak, setStreak] = useState(null)
  const [busyId, setBusyId] = useState(null) // 操作中的 habitId

  async function ensureAuth() {
    try { await api.me(); window.localStorage.setItem('hm_authed','1') }
    catch { window.localStorage.removeItem('hm_authed'); nav('/login',{replace:true}) }
  }

  async function load() {
    setLoading(true)
    try {
      await ensureAuth()
      const res = await api.listHabits(page, limit)
      setHabits(res.items); setTotal(res.total)
      const [wk, st] = await Promise.all([api.weeklyStats(), api.streakStats()])
      setWeeklyStats(wk); setStreak(st)
      const entries = await Promise.all(res.items.map(h => api.getWeek(h._id).then(x => [h._id, x.items])))
      setWeekMap(Object.fromEntries(entries))
    } finally { setLoading(false) }
  }

  useEffect(()=>{ load() },[page])

  const pages = Math.max(1, Math.ceil(total/limit))

  async function onCreate(e){
    e.preventDefault()
    if(!form.title.trim()){ toast.push('error','Title is required'); return }
    await api.createHabit(form)
    toast.push('ok','Habit created')
    setForm({ title:'', description:'', frequency:'daily' })
    load()
  }

  async function onUpdate(e){
    e.preventDefault()
    if(!selected) return
    await api.updateHabit(selected._id, form)
    toast.push('ok','Habit updated')
    setSelected(null); setForm({ title:'', description:'', frequency:'daily' })
    load()
  }

  async function onDelete(id){
    if(!confirm('Delete this habit?')) return
    setBusyId(id)
    try{ await api.deleteHabit(id); toast.push('ok','Habit deleted'); load() }
    finally{ setBusyId(null) }
  }

  async function onToggleToday(id){
    setBusyId(id)
    try{ await api.toggleRecord(id); load() }
    finally{ setBusyId(null) }
  }

  return (
    <div>
      <div className="row space-between">
        <h2 className="h2">Dashboard</h2>
        <div className="toolbar">
          <button className="btn" onClick={()=>load()} disabled={loading}>{loading ? <span className="spinner"/> : 'Refresh'}</button>
          <button className="btn" onClick={async()=>{ await api.logout(); window.localStorage.removeItem('hm_authed'); nav('/login',{replace:true}) }}>Logout</button>
        </div>
      </div>

      {/* 创建/编辑表单 */}
      <div className="card" style={{margin:'12px 0'}}>
        <form onSubmit={selected ? onUpdate : onCreate} className="grid" style={{gridTemplateColumns:'1fr 1fr 160px', gap:8}}>
          <input className="input" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
          <input className="input" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
          <div className="row" style={{gap:8}}>
            <select value={form.frequency} onChange={e=>setForm({...form, frequency:e.target.value})} className="input" style={{flex:1}}>
              <option value="daily">daily</option>
              <option value="weekly">weekly</option>
              <option value="custom">custom</option>
            </select>
            <button className="btn btn-primary">{selected ? 'Update' : 'Create'}</button>
            {selected && <button type="button" className="btn" onClick={()=>{ setSelected(null); setForm({title:'',description:'',frequency:'daily'})}}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* 列表 */}
      <div className="grid">
        {habits.map(h=>(
          <div key={h._id} className="card">
            <div className="row space-between">
              <div>
                <div style={{fontWeight:600}}>{h.title} <span className="badge">{h.frequency}</span></div>
                <div className="muted">{h.description || '—'}</div>
              </div>
              <div className="row" style={{gap:8}}>
                <button className="btn" onClick={()=>{ setSelected(h); setForm({title:h.title, description:h.description||'', frequency:h.frequency})}}>Edit</button>
                <button className="btn btn-danger" disabled={busyId===h._id} onClick={()=>onDelete(h._id)}>{busyId===h._id ? <span className="spinner"/> : 'Delete'}</button>
                <button className="btn btn-primary" disabled={busyId===h._id} onClick={()=>onToggleToday(h._id)}>{busyId===h._id ? <span className="spinner"/> : 'Toggle Today'}</button>
              </div>
            </div>

            {weekMap[h._id] && (
              <div style={{marginTop:8, maxWidth:420}}>
                <small className="muted">Last 7 days</small>
                <WeekBar items={weekMap[h._id]} />
              </div>
            )}
          </div>
        ))}
        {!loading && habits.length===0 && <div className="muted">No habits yet. Create one above.</div>}
      </div>

      {/* 分页 */}
      <div className="row" style={{gap:8, marginTop:16}}>
        <button className="btn" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
        <div className="muted">{page} / {pages}</div>
        <button className="btn" disabled={(page*limit)>=total} onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>

      {/* 统计 */}
      <div className="grid grid-2" style={{marginTop:24}}>
        <div className="card">
          <div className="h2">Weekly Stats</div>
          <pre className="muted" style={{whiteSpace:'pre-wrap'}}>{weeklyStats ? JSON.stringify(weeklyStats,null,2) : '...'}</pre>
        </div>
        <div className="card">
          <div className="h2">Streak</div>
          <div style={{maxWidth:420}}>{streak && <StreakLine current={streak.current} longest={streak.longest} />}</div>
        </div>
      </div>
    </div>
  )
}
