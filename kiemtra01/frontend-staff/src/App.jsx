import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Shirt,
  Smartphone,
  Tags,
  TrendingDown,
  TrendingUp,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const API_BASE = '/api/staff/api'

const defaultForm = {
  category: 'laptop',
  name: '',
  brand: '',
  price: '',
  stock: '',
  description: '',
  image_url: '',
  specs: '{"ram":"16GB"}',
}

const chartData = [
  { day: 'T2', revenue: 14 },
  { day: 'T3', revenue: 18 },
  { day: 'T4', revenue: 16 },
  { day: 'T5', revenue: 25 },
  { day: 'T6', revenue: 21 },
  { day: 'T7', revenue: 27 },
  { day: 'CN', revenue: 30 },
]

const navSections = [
  { group: 'Tong quan', items: [{ icon: LayoutDashboard, label: 'Dashboard' }, { icon: TrendingUp, label: 'Thong ke' }] },
  { group: 'San pham', items: [{ icon: Package, label: 'Laptop' }, { icon: Smartphone, label: 'Dien thoai' }, { icon: Shirt, label: 'Quan ao' }, { icon: Tags, label: 'Danh muc' }] },
  { group: 'Kinh doanh', items: [{ icon: ShoppingCart, label: 'Don hang', badge: '12' }, { icon: Users, label: 'Khach hang' }, { icon: Package, label: 'Hoa don' }] },
  { group: 'He thong', items: [{ icon: UserCog, label: 'Nhan vien' }, { icon: Settings, label: 'Cai dat' }] },
]

const categoryMeta = {
  laptop: { label: 'Laptop', badge: 'bg-blue-100 text-blue-700' },
  mobile: { label: 'Mobile', badge: 'bg-emerald-100 text-emerald-700' },
  clothes: { label: 'Clothes', badge: 'bg-amber-100 text-amber-700' },
}

function getCategoryLabel(value) {
  return categoryMeta[value]?.label || value
}

function getCategoryBadgeClass(value) {
  return categoryMeta[value]?.badge || 'bg-slate-100 text-slate-700'
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('staff_token') || '')
  const [loginForm, setLoginForm] = useState({ identifier: 'manager', password: 'password123', remember: true })
  const [form, setForm] = useState(defaultForm)
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mobileSidebar, setMobileSidebar] = useState(false)

  useEffect(() => {
    if (token) {
      void loadProducts()
    }
  }, [token])

  async function login(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginForm.identifier, password: loginForm.password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Dang nhap that bai')

      if (loginForm.remember) {
        localStorage.setItem('staff_token', data.access)
      }

      setToken(data.access)
      setNotice(`Xin chao ${data.user.full_name || data.user.username}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadProducts() {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/products/`, { headers: authHeaders(token) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Unable to load products')
      setProducts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function submitProduct(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        specs: JSON.parse(form.specs || '{}'),
      }
      const isEdit = Boolean(editing)
      const url = isEdit ? `${API_BASE}/products/${editing.category}/${editing.id}/` : `${API_BASE}/products/`
      const method = isEdit ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Unable to save product')
      setNotice(isEdit ? 'Cap nhat san pham thanh cong.' : 'Tao san pham thanh cong.')
      setForm(defaultForm)
      setEditing(null)
      await loadProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function startEdit(item) {
    setEditing(item)
    setForm({
      category: item.category,
      name: item.name,
      brand: item.brand,
      price: item.price,
      stock: item.stock,
      description: item.description,
      image_url: item.image_url,
      specs: JSON.stringify(item.specs || {}, null, 2),
    })
  }

  function logout() {
    localStorage.removeItem('staff_token')
    setToken('')
    setProducts([])
    setEditing(null)
    setError('')
    setNotice('')
  }

  const topProducts = useMemo(() => products.slice(0, 5), [products])

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-5">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 lg:col-span-2 lg:flex">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="absolute left-8 top-8 flex items-center gap-3">
            <ShoppingBag className="h-10 w-10 text-blue-400" />
            <span className="text-2xl font-bold text-white">Kiemtra01</span>
          </div>

          <div className="absolute bottom-32 left-8 right-8">
            <h1 className="text-4xl font-bold leading-tight text-white">Quan ly kinh doanh thong minh</h1>
            <p className="mt-4 text-lg text-slate-300">He thong quan ly ban hang laptop, dien thoai va quan ao hien dai</p>
          </div>
        </section>

        <section className="col-span-3 flex items-center justify-center bg-white px-8 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
              <ShoppingBag className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-slate-900">Kiemtra01</span>
            </div>

            <header>
              <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">Dang nhap</h2>
              <p className="mt-2 text-center text-slate-500">Nhap thong tin de tiep tuc</p>
            </header>

            <form className="mt-8 space-y-5" onSubmit={login}>
              <label className="block text-sm font-medium text-slate-700">
                Email hoac username
                <span className="relative mt-2 block">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginForm.identifier}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, identifier: e.target.value }))}
                    placeholder="name@company.com"
                    className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </span>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Mat khau
                <span className="relative mt-2 block">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Nhap mat khau"
                    className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 pr-11 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600" aria-label="Toggle password">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </span>
              </label>

              <div className="mt-1 flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    checked={loginForm.remember}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, remember: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-blue-500"
                  />
                  Ghi nho dang nhap
                </label>
                <button type="button" className="text-blue-500 hover:text-blue-600 hover:underline">
                  Quen mat khau?
                </button>
              </div>

              {error ? (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex h-12 w-full items-center justify-center rounded-lg bg-blue-500 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Dang xu ly...
                  </>
                ) : (
                  'Dang nhap'
                )}
              </button>
            </form>
          </div>
        </section>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed bottom-0 left-0 top-0 hidden w-64 border-r border-slate-800 bg-slate-900 text-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <ShoppingBag className="h-7 w-7 text-blue-400" />
          <span className="ml-2 text-lg font-bold">Kiemtra01</span>
          <span className="ml-auto rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300">Staff</span>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
          {navSections.map((section) => (
            <div key={section.group}>
              <p className="px-3 text-xs uppercase tracking-[0.2em] text-slate-500">{section.group}</p>
              <div className="mt-2 space-y-1">
                {section.items.map((item, index) => {
                  const Icon = item.icon
                  const active = section.group === 'Tong quan' && index === 0
                  return (
                    <button
                      key={item.label}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active ? 'bg-blue-500/10 text-blue-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.badge ? <span className="ml-auto rounded bg-blue-500 px-1.5 py-0.5 text-xs text-white">{item.badge}</span> : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-4">
          <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white">
            <LogOut className="h-4 w-4" /> Dang xuat
          </button>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebar((prev) => !prev)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden">
              {mobileSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <p className="text-sm text-slate-500">Dashboard / Tong quan</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input placeholder="Tim kiem..." className="h-9 w-64 rounded-lg bg-slate-100 pl-9 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><ChevronDown className="h-5 w-5" /></button>
            <button onClick={logout} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:hidden">Dang xuat</button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <section className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Calendar className="h-4 w-4" /> 7 ngay qua
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
                <Download className="h-4 w-4" /> Xuat bao cao
              </button>
            </div>
          </section>

          <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Tong doanh thu', value: '128.5M', change: '+12.5%', up: true, icon: TrendingUp, iconClass: 'bg-blue-100 text-blue-600' },
              { label: 'Don hang', value: '1,234', change: '+8.2%', up: true, icon: ShoppingCart, iconClass: 'bg-emerald-100 text-emerald-600' },
              { label: 'Khach hang', value: '456', change: '+23%', up: true, icon: Users, iconClass: 'bg-amber-100 text-amber-600' },
              { label: 'San pham', value: `${products.length}`, change: '+3', up: true, icon: Package, iconClass: 'bg-slate-200 text-slate-700' },
            ].map((card) => {
              const Icon = card.icon
              return (
                <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-slate-200/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{card.label}</p>
                      <p className="mt-1 text-3xl font-bold text-slate-900">{card.value}</p>
                      <p className={`mt-2 flex items-center gap-1 text-sm font-medium ${card.up ? 'text-emerald-500' : 'text-red-500'}`}>
                        {card.up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {card.change}
                      </p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </article>
              )
            })}
          </section>

          <section className="mb-8 grid gap-6 lg:grid-cols-3">
            <article className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Doanh thu</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="staffRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#staffRevenue)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">San pham ban chay</h2>
              <div className="mt-4 space-y-4">
                {topProducts.map((item) => (
                  <div key={`${item.category}-${item.id}`} className="flex items-center gap-3">
                    <img src={item.image_url} alt={item.name} className="h-12 w-12 rounded-lg bg-slate-100 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.brand}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">${item.price}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
            <article className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900">{editing ? 'Cap nhat san pham' : 'Them san pham moi'}</h2>
              <form onSubmit={submitProduct} className="mt-5 space-y-4">
                <select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="laptop">Laptop</option>
                  <option value="mobile">Mobile</option>
                  <option value="clothes">Clothes</option>
                </select>
                <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ten san pham" required />
                <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Thuong hieu" required />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Gia" required />
                  <input type="number" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Ton kho" required />
                </div>
                <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Image URL" />
                <textarea className="min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mo ta" required />
                <textarea className="min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10" value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} placeholder='{"ram":"16GB"}' />

                {notice ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p> : null}
                {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

                <div className="flex gap-3">
                  <button className="h-10 flex-1 rounded-lg bg-blue-500 px-4 text-sm font-semibold text-white hover:bg-blue-600">{loading ? 'Dang xu ly...' : editing ? 'Cap nhat' : 'Tao moi'}</button>
                  {editing ? (
                    <button type="button" onClick={() => { setEditing(null); setForm(defaultForm) }} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      Huy
                    </button>
                  ) : null}
                </div>
              </form>
            </article>

            <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Danh sach san pham</h2>
                <button onClick={loadProducts} className="text-sm font-medium text-blue-500 hover:text-blue-600">Tai lai</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Loai</th>
                      <th className="px-6 py-3">San pham</th>
                      <th className="px-6 py-3">Gia</th>
                      <th className="px-6 py-3">Kho</th>
                      <th className="px-6 py-3">Thao tac</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((item) => (
                      <tr key={`${item.category}-${item.id}`} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getCategoryBadgeClass(item.category)}`}>{getCategoryLabel(item.category)}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                        <td className="px-6 py-4">${item.price}</td>
                        <td className="px-6 py-4">{item.stock}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"><Eye className="h-4 w-4" /></button>
                            <button onClick={() => startEdit(item)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"><Settings className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  )
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}
