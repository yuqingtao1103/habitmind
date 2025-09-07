import { emit } from '../lib/events'

const BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, { method='GET', headers={}, body, silent=false } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type':'application/json', ...headers },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined
  })
  const text = await res.text()
  let data; try{ data = text ? JSON.parse(text) : {} }catch{ data = { raw:text } }

  if(!res.ok){
    const msg = data?.error || `HTTP ${res.status}`
    if (!silent) emit('api-error', { path, status: res.status, message: msg, data })
    const err = new Error(msg); err.status = res.status; err.data = data; throw err
  }
  return data
}

export const api = {
  signup:(email,password)=>request('/api/auth/signup',{method:'POST',body:{email,password}}),
  login:(email,password)=>request('/api/auth/login',{method:'POST',body:{email,password}}),
  me:(opts)=>request('/api/auth/me', opts),
  refresh:()=>request('/api/auth/refresh',{method:'POST'}),
  logout:()=>request('/api/auth/logout',{method:'POST'}),

  listHabits:(p=1,l=10)=>request(`/api/habits?page=${p}&limit=${l}`),
  createHabit:(payload)=>request('/api/habits',{method:'POST',body:payload}),
  updateHabit:(id,payload)=>request(`/api/habits/${id}`,{method:'PUT',body:payload}),
  deleteHabit:(id)=>request(`/api/habits/${id}`,{method:'DELETE'}),

  toggleRecord:(habitId,body={})=>request(`/api/records/${habitId}`,{method:'POST',body}),
  getWeek:(habitId)=>request(`/api/records?habitId=${habitId}&range=week`),
  weeklyStats:()=>request('/api/stats/weekly'),
  streakStats:()=>request('/api/stats/streak'),
}
