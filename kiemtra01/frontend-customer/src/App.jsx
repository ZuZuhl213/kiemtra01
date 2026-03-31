import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Calendar,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  Gift,
  Grid3X3,
  Heart,
  Laptop,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Package,
  Percent,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Shirt,
  Smartphone,
  Sparkles,
  Star,
  Tags,
  TrendingDown,
  TrendingUp,
  User,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const API = {
  customerLogin: '/api/customer/api/auth/login/',
  customerProducts: '/api/customer/api/products/',
  customerCart: '/api/customer/api/cart/',
  addToCart: '/api/customer/api/cart/items/',
  staffProducts: '/api/staff/api/products/',
}

const metricsData = [
  { day: 'T2', revenue: 12 },
  { day: 'T3', revenue: 18 },
  { day: 'T4', revenue: 15 },
  { day: 'T5', revenue: 22 },
  { day: 'T6', revenue: 26 },
  { day: 'T7', revenue: 21 },
  { day: 'CN', revenue: 29 },
]

const staffNav = [
  { group: 'Tong quan', items: [{ icon: LayoutDashboard, label: 'Dashboard' }, { icon: TrendingUp, label: 'Thong ke' }] },
  { group: 'San pham', items: [{ icon: Laptop, label: 'Laptop' }, { icon: Smartphone, label: 'Dien thoai' }, { icon: Shirt, label: 'Quan ao' }, { icon: Tags, label: 'Danh muc' }] },
  { group: 'Kinh doanh', items: [{ icon: ShoppingCart, label: 'Don hang', badge: '12' }, { icon: Users, label: 'Khach hang' }, { icon: Package, label: 'Hoa don' }] },
  { group: 'He thong', items: [{ icon: UserCog, label: 'Nhan vien' }, { icon: Settings, label: 'Cai dat' }] },
]

const fallbackProducts = [
  {
    id: 1,
    category: 'laptop',
    name: 'AeroBook Pro 14',
    brand: 'SkyTech',
    price: '1299.00',
    stock: 8,
    description: 'Slim productivity laptop.',
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
  },
  {
    id: 2,
    category: 'mobile',
    name: 'Nova X Pro',
    brand: 'Lumi',
    price: '899.00',
    stock: 22,
    description: 'Flagship phone with bright display.',
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
  },
  {
    id: 3,
    category: 'clothes',
    name: 'Urban Overshirt',
    brand: 'Northline',
    price: '79.00',
    stock: 18,
    description: 'Lightweight overshirt for daily city wear.',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
  },
]

const categoryMeta = {
  laptop: { label: 'Laptop', badge: 'bg-blue-100 text-blue-700' },
  mobile: { label: 'Dien thoai', badge: 'bg-emerald-100 text-emerald-700' },
  clothes: { label: 'Quan ao', badge: 'bg-amber-100 text-amber-700' },
}

function getCategoryLabel(value) {
  return categoryMeta[value]?.label || value
}

function getCategoryBadgeClass(value) {
  return categoryMeta[value]?.badge || 'bg-slate-100 text-slate-700'
}

function getClothesSpec(item, key) {
  return item?.specs?.[key] || ''
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token') || '')
  const [role, setRole] = useState(localStorage.getItem('role') || '')
  const [view, setView] = useState(localStorage.getItem('dashboard_path') || '/customer')
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '', remember: true })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [clothesMaterial, setClothesMaterial] = useState('all')
  const [clothesFit, setClothesFit] = useState('all')
  const [clothesPrice, setClothesPrice] = useState('all')
  const [cartCount, setCartCount] = useState(0)
  const [cartItems, setCartItems] = useState([])
  const [cartTotal, setCartTotal] = useState(0)
  const [currentCustomerView, setCurrentCustomerView] = useState('products')
  const [lastCompletedOrder, setLastCompletedOrder] = useState(null)
  const [notice, setNotice] = useState('')

  const [staffProducts, setStaffProducts] = useState([])
  const [mobileSidebar, setMobileSidebar] = useState(false)

  useEffect(() => {
    if (!token) return
    if (view === '/staff') {
      void loadStaffProducts()
    } else {
      void loadCustomerData()
    }
  }, [token, view])

  async function unifiedLogin(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch(API.customerLogin, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginForm.identifier, password: loginForm.password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Dang nhap that bai')

      if (loginForm.remember) {
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('role', data.role)
        localStorage.setItem('dashboard_path', data.dashboard_path)
      }

      setToken(data.access)
      setRole(data.role)
      setView(data.dashboard_path)
      setNotice(`Xin chao ${data.user?.full_name || data.user?.username || 'ban'}!`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadCustomerData() {
    try {
      const [productsRes, cartRes] = await Promise.all([
        fetch(`${API.customerProducts}?search=${encodeURIComponent(search)}`, { headers: authHeaders(token) }),
        fetch(API.customerCart, { headers: authHeaders(token) }),
      ])

      const productsData = await productsRes.json()
      const cartData = await cartRes.json()

      if (productsRes.ok) {
        const normalizedProducts = (Array.isArray(productsData) ? productsData : fallbackProducts).map((item) => ({
          ...item,
          category: item.category || item.source,
          source: item.source || item.category,
        }))
        setProducts(normalizedProducts)
      }
      if (cartRes.ok) {
        setCartItems(cartData.items || [])
        setCartTotal(cartData.total_amount || 0)
        setCartCount(cartData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0)
      }
      if (!productsRes.ok) {
        setProducts(
          fallbackProducts.map((item) => ({
            ...item,
            source: item.source || item.category,
            category: item.category || item.source,
          })),
        )
      }
    } catch {
      setProducts(
        fallbackProducts.map((item) => ({
          ...item,
          source: item.source || item.category,
          category: item.category || item.source,
        })),
      )
    }
  }

  async function loadStaffProducts() {
    try {
      const response = await fetch(API.staffProducts, { headers: authHeaders(token) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Khong tai duoc du lieu')
      setStaffProducts(Array.isArray(data) ? data : [])
    } catch {
      setStaffProducts([])
    }
  }

  async function addToCart(item) {
    setNotice('')
    try {
      const response = await fetch(API.addToCart, {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_source: item.source || item.category, product_id: item.id, quantity: 1 }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Them vao gio that bai')
      setCartItems(data.items || [])
      setCartTotal(data.total_amount || 0)
      setCartCount(data.items?.reduce((sum, cartItem) => sum + cartItem.quantity, 0) || 0)
      setNotice(`Da them ${item.name} vao gio hang`)
    } catch (err) {
      setError(err.message)
    }
  }

  async function removeFromCart(cartItemId) {
    setError('')
    try {
      const response = await fetch(`${API.customerCart}items/${cartItemId}/`, {
        method: 'DELETE',
        headers: authHeaders(token),
      })
      if (!response.ok) throw new Error('Xoa san pham that bai')
      const data = await response.json()
      setCartItems(data.items || [])
      setCartTotal(data.total_amount || 0)
      setCartCount(data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0)
      setNotice('Da xoa san pham khoi gio hang')
    } catch (err) {
      setError(err.message)
    }
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('role')
    localStorage.removeItem('dashboard_path')
    setToken('')
    setRole('')
    setView('/customer')
    setProducts([])
    setStaffProducts([])
    setCartCount(0)
    setCartItems([])
    setCartTotal(0)
    setCurrentCustomerView('products')
    setLastCompletedOrder(null)
    setError('')
    setNotice('')
  }

  function completeCheckout() {
    if (!cartItems.length) return

    const completedOrder = {
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: Number(cartTotal).toFixed(2),
      completedAt: new Date().toLocaleString('vi-VN'),
    }

    setLastCompletedOrder(completedOrder)
    setCartItems([])
    setCartTotal(0)
    setCartCount(0)
    setNotice('Dat hang thanh cong. Don hang cua ban da hoan thanh.')
    setCurrentCustomerView('checkout-success')
  }

  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => category === 'all' || item.category === category)
      .filter((item) => {
        if ((item.category !== 'clothes' && item.source !== 'clothes') || category === 'mobile' || category === 'laptop') {
          return true
        }

        const material = getClothesSpec(item, 'material')
        const fit = getClothesSpec(item, 'fit')
        const price = Number(item.price)

        const materialMatch = clothesMaterial === 'all' || material === clothesMaterial
        const fitMatch = clothesFit === 'all' || fit === clothesFit
        const priceMatch =
          clothesPrice === 'all' ||
          (clothesPrice === 'under-60' && price < 60) ||
          (clothesPrice === '60-100' && price >= 60 && price <= 100) ||
          (clothesPrice === 'over-100' && price > 100)

        return materialMatch && fitMatch && priceMatch
      })
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.brand.toLowerCase().includes(search.toLowerCase()))
  }, [products, category, search, clothesFit, clothesMaterial, clothesPrice])

  const clothesHighlights = useMemo(() => {
    const source = products.length ? products : fallbackProducts
    return source.filter((item) => item.category === 'clothes' || item.source === 'clothes').slice(0, 3)
  }, [products])

  const clothesFilterOptions = useMemo(() => {
    const source = products.length ? products : fallbackProducts
    const clothesItems = source.filter((item) => item.category === 'clothes' || item.source === 'clothes')
    return {
      materials: [...new Set(clothesItems.map((item) => getClothesSpec(item, 'material')).filter(Boolean))],
      fits: [...new Set(clothesItems.map((item) => getClothesSpec(item, 'fit')).filter(Boolean))],
    }
  }, [products])

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

            <form className="mt-8 space-y-5" onSubmit={unifiedLogin}>
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

              {error && (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

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

            <footer className="mt-8 text-center text-sm text-slate-500">
              Chua co tai khoan? <span className="text-blue-500">Lien he quan tri vien</span>
            </footer>
          </div>
        </section>
      </main>
    )
  }

  if (view === '/staff' || role === 'staff') {
    return (
      <div className="min-h-screen bg-slate-50">
        <aside className="fixed bottom-0 left-0 top-0 hidden w-64 border-r border-slate-800 bg-slate-900 text-white lg:flex lg:flex-col">
          <div className="flex h-16 items-center border-b border-slate-800 px-6">
            <ShoppingBag className="h-7 w-7 text-blue-400" />
            <span className="ml-2 text-lg font-bold">Kiemtra01</span>
            <span className="ml-auto rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300">Staff</span>
          </div>
          <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
            {staffNav.map((section) => (
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
            <button onClick={logout} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:hidden">Dang xuat</button>
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
                { label: 'San pham', value: `${staffProducts.length || 89}`, change: '-1.1%', up: false, icon: Package, iconClass: 'bg-slate-200 text-slate-700' },
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
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Doanh thu</h2>
                  <div className="flex gap-2 text-sm">
                    <button className="rounded-full bg-blue-500 px-3 py-1 text-white">7 ngay</button>
                    <button className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">30 ngay</button>
                    <button className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">12 thang</button>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metricsData}>
                      <defs>
                        <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#fillRevenue)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">San pham ban chay</h2>
                <div className="mt-4 space-y-4">
                  {(staffProducts.length ? staffProducts : fallbackProducts).slice(0, 4).map((item) => (
                    <div key={`${item.category}-${item.id}`} className="flex items-center gap-3">
                      <img src={item.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120'} alt={item.name} className="h-12 w-12 rounded-lg bg-slate-100 object-cover" />
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

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Danh sach san pham</h2>
                <button className="text-sm font-medium text-blue-500 hover:text-blue-600">Xem tat ca</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Ma</th>
                      <th className="px-6 py-3">San pham</th>
                      <th className="px-6 py-3">Loai</th>
                      <th className="px-6 py-3">Gia</th>
                      <th className="px-6 py-3">Thao tac</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(staffProducts.length ? staffProducts : fallbackProducts).slice(0, 8).map((item) => (
                      <tr key={`${item.category}-${item.id}`} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                        <td className="px-6 py-4">#{item.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getCategoryBadgeClass(item.category)}`}>
                            {getCategoryLabel(item.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4">${item.price}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"><Eye className="h-4 w-4" /></button>
                            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"><Settings className="h-4 w-4" /></button>
                            <button className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-500"><X className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 h-16 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-blue-500" />
            <span className="text-lg font-bold">Kiemtra01</span>
          </div>

          <div className="relative mx-8 hidden max-w-xl flex-1 rounded-full bg-slate-100 transition-all duration-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 md:flex">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tim kiem laptop, dien thoai, quan ao..."
              className="h-10 w-full border-0 bg-transparent pl-11 pr-4 text-sm focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1">
            <button className="rounded-full p-2 transition-colors hover:bg-slate-100 md:hidden"><Search className="h-5 w-5 text-slate-600" /></button>
            <button className="relative rounded-full p-2 transition-colors hover:bg-slate-100"><Bell className="h-5 w-5 text-slate-600" /><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" /></button>
            <button onClick={() => setCurrentCustomerView(currentCustomerView === 'products' ? 'cart' : 'products')} className="relative rounded-full p-2 transition-colors hover:bg-slate-100">
              <ShoppingCart className="h-5 w-5 text-slate-600" />
              {cartCount > 0 ? <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-500 px-1 text-xs font-medium text-white">{cartCount}</span> : null}
            </button>
            <button className="ml-2 flex items-center gap-2 rounded-full p-1.5 transition-colors hover:bg-slate-100">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">{(role || 'c').slice(0, 1).toUpperCase()}</span>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
            </button>
            <button onClick={logout} className="ml-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Dang xuat</button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300">
              <Sparkles className="h-4 w-4" /> Moi ra mat
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white lg:text-5xl">Kham pha cong nghe moi nhat</h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300">Laptop, dien thoai va quan ao chinh hang, gia tot nhat thi truong. Giao hang nhanh, bao hanh uy tin.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button onClick={() => setCategory('all')} className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:bg-blue-600">
                Xem san pham <ArrowRight className="h-5 w-5" />
              </button>
              <button onClick={() => setCategory('clothes')} className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-white/20">
                Mua quan ao <Shirt className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative mx-auto max-w-sm rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <img src={filteredProducts[0]?.image_url || fallbackProducts[0].image_url} alt="featured" className="aspect-square w-full rounded-2xl object-cover" />
            </div>
          </div>
        </div>
      </section>

      {currentCustomerView === 'products' ? (
        <>
      <section className="border-b border-slate-200 py-8">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8">
          {[
            { key: 'all', label: 'Tat ca', icon: Grid3X3 },
            { key: 'laptop', label: 'Laptop', icon: Laptop },
            { key: 'mobile', label: 'Dien thoai', icon: Smartphone },
            { key: 'clothes', label: 'Quan ao', icon: Shirt },
            { key: 'sale', label: 'Khuyen mai', icon: Percent, badge: 'Hot' },
          ].map((tab) => {
            const Icon = tab.icon
            const active = category === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setCategory(tab.key === 'sale' ? 'all' : tab.key)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.badge ? <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] text-white">{tab.badge}</span> : null}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {clothesHighlights.length ? (
        <section className="border-b border-amber-100 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-amber-700">
                  <Shirt className="h-4 w-4" /> Bo suu tap Quan ao
                </span>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">Chon nhanh cac mau do mac hang ngay</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">Quan ao da duoc dua vao catalog chung, ban co the xem, tim kiem va them vao gio hang nhu laptop va dien thoai.</p>
              </div>
              <button onClick={() => setCategory('clothes')} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
                Xem tat ca Quan ao <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {clothesHighlights.map((item) => (
                <article key={`highlight-${item.id}`} className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-sm backdrop-blur">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img src={item.image_url || fallbackProducts[2].image_url} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getCategoryBadgeClass('clothes')}`}>Quan ao</span>
                      <span className="text-xs text-slate-500">{item.brand}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900">{item.name}</h3>
                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-slate-900">${item.price}</p>
                        <p className="text-xs text-slate-500">Con lai {item.stock} san pham</p>
                      </div>
                      <button onClick={() => addToCart(item)} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600">
                        <ShoppingCart className="h-4 w-4" /> Them gio
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {(category === 'clothes' || category === 'all') && clothesHighlights.length ? (
        <section className="border-b border-slate-200 bg-white py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Filter Quan ao</h3>
                <p className="text-sm text-slate-500">Loc nhanh theo chat lieu, form dang va muc gia.</p>
              </div>
              <button
                onClick={() => {
                  setClothesMaterial('all')
                  setClothesFit('all')
                  setClothesPrice('all')
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Xoa filter
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Chat lieu</span>
                <select value={clothesMaterial} onChange={(e) => setClothesMaterial(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-200/50">
                  <option value="all">Tat ca chat lieu</option>
                  {clothesFilterOptions.materials.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Form dang</span>
                <select value={clothesFit} onChange={(e) => setClothesFit(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-200/50">
                  <option value="all">Tat ca form</option>
                  {clothesFilterOptions.fits.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Khoang gia</span>
                <select value={clothesPrice} onChange={(e) => setClothesPrice(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-200/50">
                  <option value="all">Tat ca muc gia</option>
                  <option value="under-60">Duoi $60</option>
                  <option value="60-100">$60 - $100</option>
                  <option value="over-100">Tren $100</option>
                </select>
              </label>
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">San pham noi bat</h2>
            <button className="flex items-center gap-1 text-sm font-medium text-blue-500 hover:text-blue-600">Xem tat ca <ArrowRight className="h-4 w-4" /></button>
          </div>

          {notice ? <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}
          {error ? <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {(filteredProducts.length ? filteredProducts : fallbackProducts).map((item, index) => (
              <article key={`${item.category}-${item.id}-${index}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50">
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img src={item.image_url || fallbackProducts[0].image_url} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute left-3 top-3 flex flex-col gap-2">
                    <span className="rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white">-20%</span>
                    <span className="rounded-md bg-emerald-500 px-2 py-1 text-xs font-semibold text-white">Moi</span>
                  </div>
                  <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md transition-all hover:scale-110 hover:bg-white">
                      <Heart className="h-4 w-4 text-slate-600" />
                    </button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <button onClick={() => addToCart(item)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-blue-500 hover:text-white">
                      <ShoppingCart className="h-4 w-4" /> Them vao gio
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{getCategoryLabel(item.category)}</p>
                  <h3 className="mt-1 min-h-[40px] text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600">{item.name}</h3>
                  <div className="mt-2 flex items-center gap-1">
                    <div className="flex gap-0.5">
                      {new Array(5).fill(0).map((_, starIndex) => (
                        <Star key={starIndex} className={`h-3.5 w-3.5 ${starIndex < 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <span className="ml-1 text-xs text-slate-500">(128)</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <p className="text-lg font-bold text-slate-900">${item.price}</p>
                    <p className="text-sm text-slate-400 line-through">${(Number(item.price) * 1.2).toFixed(0)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
        </>
      ) : currentCustomerView === 'cart' ? (
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center gap-2">
              <ShoppingCart className="h-8 w-8 text-blue-500" />
              <h2 className="text-3xl font-bold text-slate-900">Gio hang cua ban</h2>
            </div>

            {notice ? <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}
            {error ? <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            {cartItems.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-lg font-medium text-slate-900">Gio hang trong</h3>
                <p className="mt-2 text-sm text-slate-500">Ban chua them san pham nao vao gio hang</p>
                <button onClick={() => setCurrentCustomerView('products')} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
                  <ArrowRight className="h-4 w-4 -rotate-180" /> Tiep tuc mua hang
                </button>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                  {cartItems.map((item) => (
                    <article key={`${item.product_source}-${item.product_id}`} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
                      <img src={item.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120'} alt={item.product_name} className="h-24 w-24 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{item.product_name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{getCategoryLabel(item.product_source)}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-lg font-bold text-slate-900">${Number(item.price).toFixed(2)}</span>
                          <span className="text-sm text-slate-500">x {item.quantity}</span>
                          <span className="text-lg font-semibold text-blue-500">${Number(item.line_total).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button onClick={() => removeFromCart(item.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="h-fit rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900">Tong cong</h3>
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tien hang</span>
                      <span className="font-medium text-slate-900">${Number(cartTotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Phi van chuyen</span>
                      <span className="font-medium text-slate-900">$0.00</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3 flex justify-between">
                      <span className="font-semibold text-slate-900">Tong cong</span>
                      <span className="text-lg font-bold text-blue-500">${Number(cartTotal).toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={completeCheckout} className="mt-6 w-full rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600">
                    Thanh toan
                  </button>
                  <button onClick={() => setCurrentCustomerView('products')} className="mt-3 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                    Tiep tuc mua hang
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <ShoppingBag className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-slate-900">Hoan thanh don hang</h2>
              <p className="mt-3 text-slate-600">Cam on ban da mua sam. Don hang quan ao va san pham trong gio da duoc ghi nhan thanh cong.</p>

              {lastCompletedOrder ? (
                <div className="mx-auto mt-8 grid max-w-xl gap-4 rounded-2xl bg-slate-50 p-5 text-left md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">So luong</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{lastCompletedOrder.itemCount}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Tong tien</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">${lastCompletedOrder.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Thoi gian</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{lastCompletedOrder.completedAt}</p>
                  </div>
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button onClick={() => setCurrentCustomerView('products')} className="rounded-lg bg-blue-500 px-5 py-3 font-medium text-white transition-colors hover:bg-blue-600">
                  Tiep tuc mua hang
                </button>
                <button onClick={() => setCurrentCustomerView('cart')} className="rounded-lg border border-slate-200 px-5 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50">
                  Xem gio hang
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="mt-16 bg-slate-900 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <FooterColumn title="Ve chung toi" links={['Gioi thieu', 'Tuyen dung', 'Lien he']} />
            <FooterColumn title="Ho tro" links={['Huong dan mua hang', 'Chinh sach bao hanh', 'Doi tra hang']} />
            <FooterColumn title="Theo doi" links={['Facebook', 'Instagram', 'Youtube']} />
            <div>
              <h4 className="text-sm font-semibold text-white">Lien he</h4>
              <p className="mt-3 text-sm text-slate-400">Hotline: 1900 xxxx</p>
              <p className="text-sm text-slate-400">Email: support@kiemtra01.com</p>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-400">2026 Kiemtra01. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-slate-400">
        {links.map((link) => (
          <li key={link}>{link}</li>
        ))}
      </ul>
    </div>
  )
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}
