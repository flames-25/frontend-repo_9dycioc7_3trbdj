import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Card({ title, value, suffix }) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold text-gray-900 mt-1">
        {value}{suffix || ''}
      </div>
    </div>
  )
}

function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/dashboard`).then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  const cards = data?.cards || { totalLeads: 0, totalDeals: 0, revenue: 0, conversionRate: 0 }
  const pipeline = data?.pipeline || []
  const activities = data?.recentActivities || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Leads" value={cards.totalLeads} />
        <Card title="Deals" value={cards.totalDeals} />
        <Card title="Revenue" value={cards.revenue} suffix="$" />
        <Card title="Conversion" value={cards.conversionRate} suffix="%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="font-medium text-gray-900 mb-3">Pipeline by Stage</div>
          <div className="space-y-2">
            {pipeline.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <span className="text-gray-700">{s.stage}</span>
                <span className="text-gray-900 font-semibold">{s.count}</span>
              </div>
            ))}
            {!pipeline.length && <div className="text-sm text-gray-500">No data yet</div>}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="font-medium text-gray-900 mb-3">Recent activity</div>
          <div className="divide-y">
            {activities.map((a, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between">
                <div>
                  <div className="text-gray-900">{a.subject}</div>
                  <div className="text-xs text-gray-500">{a.type}</div>
                </div>
                <div className="text-xs text-gray-400">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</div>
              </div>
            ))}
            {!activities.length && <div className="text-sm text-gray-500 py-6">No recent activity</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

function LeadRow({ lead, onStatus }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-2 text-sm text-gray-900">{lead.name}</td>
      <td className="px-3 py-2 text-sm text-gray-500">{lead.email || '-'}</td>
      <td className="px-3 py-2 text-sm">
        <span className="px-2 py-1 rounded-full text-xs capitalize bg-gray-100 text-gray-700">{lead.status}</span>
      </td>
      <td className="px-3 py-2 text-sm text-right">
        <button onClick={() => onStatus(lead, 'qualified')} className="text-blue-600 hover:underline mr-2">Qualify</button>
        <button onClick={() => onStatus(lead, 'lost')} className="text-red-600 hover:underline">Lose</button>
      </td>
    </tr>
  )
}

function Leads() {
  const [leads, setLeads] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const load = () => fetch(`${API}/api/leads`).then(r => r.json()).then(setLeads)
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    await fetch(`${API}/api/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email }) })
    setName(''); setEmail(''); load()
  }

  const updateStatus = async (lead, status) => {
    await fetch(`${API}/api/leads/${lead._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    load()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="flex gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Lead name" className="flex-1 border rounded-lg px-3 py-2" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="flex-1 border rounded-lg px-3 py-2" />
        <button className="bg-blue-600 text-white px-4 rounded-lg">Add</button>
      </form>

      <div className="bg-white rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map(l => <LeadRow key={l._id} lead={l} onStatus={updateStatus} />)}
          </tbody>
        </table>
        {!leads.length && <div className="text-sm text-gray-500 p-4">No leads yet</div>}
      </div>
    </div>
  )
}

function Deals() {
  const [deals, setDeals] = useState([])
  const [title, setTitle] = useState('')
  const [value, setValue] = useState('')

  const load = () => fetch(`${API}/api/deals`).then(r => r.json()).then(setDeals)
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    await fetch(`${API}/api/deals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, value: parseFloat(value || '0') }) })
    setTitle(''); setValue(''); load()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="flex gap-2">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Deal title" className="flex-1 border rounded-lg px-3 py-2" />
        <input value={value} onChange={e=>setValue(e.target.value)} placeholder="Value" className="w-40 border rounded-lg px-3 py-2" />
        <button className="bg-blue-600 text-white px-4 rounded-lg">Add</button>
      </form>

      <div className="bg-white rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Stage</th>
              <th className="px-3 py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {deals.map(d => (
              <tr key={d._id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm text-gray-900">{d.title}</td>
                <td className="px-3 py-2 text-sm"><span className="px-2 py-1 rounded-full text-xs bg-gray-100">{d.stage}</span></td>
                <td className="px-3 py-2 text-sm">${d.value || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!deals.length && <div className="text-sm text-gray-500 p-4">No deals yet</div>}
      </div>
    </div>
  )
}

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [type, setType] = useState('follow-up')

  const load = () => fetch(`${API}/api/tasks`).then(r => r.json()).then(setTasks)
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    await fetch(`${API}/api/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, type }) })
    setTitle(''); load()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="flex gap-2">
        <select value={type} onChange={e=>setType(e.target.value)} className="border rounded-lg px-3 py-2">
          <option value="call">Call</option>
          <option value="meeting">Meeting</option>
          <option value="follow-up">Follow-up</option>
          <option value="email">Email</option>
        </select>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task title" className="flex-1 border rounded-lg px-3 py-2" />
        <button className="bg-blue-600 text-white px-4 rounded-lg">Add</button>
      </form>

      <div className="bg-white rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Completed</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm">{t.type}</td>
                <td className="px-3 py-2 text-sm">{t.title}</td>
                <td className="px-3 py-2 text-sm">{t.completed ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!tasks.length && <div className="text-sm text-gray-500 p-4">No tasks yet</div>}
      </div>
    </div>
  )
}

function Nav({ current, setCurrent }) {
  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'leads', label: 'Leads' },
    { key: 'deals', label: 'Deals' },
    { key: 'tasks', label: 'Tasks' },
  ]
  return (
    <div className="flex gap-2">
      {tabs.map(t => (
        <button key={t.key} onClick={() => setCurrent(t.key)}
          className={`px-3 py-2 rounded-lg text-sm ${current === t.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

function App() {
  const [current, setCurrent] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">Sales CRM</div>
          <Nav current={current} setCurrent={setCurrent} />
        </div>

        {current === 'dashboard' && <Dashboard />}
        {current === 'leads' && <Leads />}
        {current === 'deals' && <Deals />}
        {current === 'tasks' && <Tasks />}
      </div>
    </div>
  )
}

export default App
