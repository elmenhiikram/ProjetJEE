<<<<<<< HEAD
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from "recharts"

// Interfaces pour les données du dashboard
interface Produit {
  id: number
  nom: string
  description?: string
  prix: number
  stock: number
  categorie?: { nom: string }
 nombreVentes?: number
  chiffreAffaires?: number
  marge?: number
  seuilAlerte?: number
  statut?: string
}

interface Client {
  nom: string
  nombreVentes?: number
  chiffreAffaires?: number
  id?: number
}

interface Categorie {
  nom: string
  nbProduits: number
  chiffreAffaires?: number
  ventes?: number
  pourcentageProduits?: number
}

interface MonthlyStat {
  mois: string
  ca: number
  ventes: number
  orders?: number
}

interface DashboardStats {
  totalProduits: number
  totalClients: number
  totalVentes: number
  chiffreAffaires: number
  prixMoyen: number
  totalCategories: number
  produitsFaibleStock: number
  produitsRupture?: number
  valeurStockTotal?: number
  top5Produits: Produit[]
  distributionCategories: Categorie[]
  dernieresVentes?: any[]
  alertes?: any[]
  nombreAlertes?: number
}

interface KPI {
  conversionRate: number
  averageOrderValue: number
  customerRetention: number
  npsScore: number
  growthRate: number
  profitMargin: number
}

interface Trend {
  period: string
  value: number
  change: number
}

interface PerformanceMetric {
  metric: string
  value: number
  target: number
  status: string
  progress: number
}

interface StockStats {
  totalStockValue: number
  averageStockAge: number
  turnoverRate: number
  stockOutCount: number
}

interface Alert {
  type: string
  produit: string
  stockActuel?: number
  seuil?: number
  ventes?: number
  priorite: string
  message: string
}

import {
  TrendingUp,
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  Star,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Loader,
  CheckCircle,
  XCircle,
  Activity,
  Award,
  Target,
  Database,
  LineChartIcon,
  TrendingDown,
  Zap,
  Bell,
  Search,
  Moon,
  Sun,
} from "lucide-react"

const API_BASE_URL = "http://localhost:9090"

type AnalysteDashboardProps = {
  onLogout?: () => void
}

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"]

const AnalysteDashboard: React.FC<AnalysteDashboardProps> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })
  const [timeRange, setTimeRange] = useState("last30days")

  // États pour les données
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | undefined>(undefined)
  const [kpiData, setKpiData] = useState<KPI | undefined>(undefined)
  const [topProducts, setTopProducts] = useState<Produit[]>([])
  const [bestClients, setBestClients] = useState<Client[]>([])
  const [categoriesData, setCategoriesData] = useState<Categorie[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Produit[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([])
  const [trends, setTrends] = useState<Trend[]>([])
  const [performance, setPerformance] = useState<PerformanceMetric[]>([])
  const [stockStats, setStockStats] = useState<StockStats | undefined>(undefined)
  const [alertes, setAlertes] = useState<Alert[]>([])
  const [scatterData, setScatterData] = useState<any[]>([])

  const loadAllData = async () => {
    setLoading(true)
    setErrorMessage("")
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/stats-globales`)
      if (res.ok) {
        const globalData = await res.json()

        setDashboardStats(globalData.statsBasiques)
        setKpiData(globalData.kpis)
        setMonthlyStats(globalData.evolutionCA)
        setCategoriesData(globalData.statsBasiques.distributionCategories)
        setStockStats(globalData.statsStock)
        setAlertes(globalData.alertes)
        setTrends(globalData.tendances)
        setPerformance(globalData.performances?.metrics || [])
        setBestClients(globalData.topClients || [])
        setTopProducts(globalData.topProduits || [])

        if (globalData.statsBasiques?.top5Produits) {
          const lowStock = globalData.statsBasiques.top5Produits.filter((p: Produit) => p.stock < 5)
          setLowStockProducts(lowStock)
          
          // Générer les données pour le scatter chart
          const scatter = globalData.statsBasiques.top5Produits.map((produit: Produit) => ({
            x: produit.stock,
            y: produit.nombreVentes || 0,
            name: produit.nom,
            ca: produit.chiffreAffaires || 0
          }))
          setScatterData(scatter)
        }

        setSuccessMessage("Données mises à jour")
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        throw new Error("Erreur API")
      }
    } catch (error) {
      console.error("Erreur chargement données:", error)
      setErrorMessage("Impossible de charger les données. Vérifiez la connexion API.")
    } finally {
      setLoading(false)
    }
  }

  const fetchFilteredData = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/dashboard/stats/filtre?dateDebut=${dateRange.start}&dateFin=${dateRange.end}`,
      )
      if (res.ok) {
        const data = await res.json()
        setDashboardStats((prev) => ({ ...(prev ?? ({} as DashboardStats)), ...data }))
        setSuccessMessage("Données filtrées avec succès")
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error) {
      setErrorMessage("Erreur lors du filtrage")
    } finally {
      setLoading(false)
    }
  }

  // Export des données
  const exportData = (format: string) => {
    const data = {
      dashboardStats,
      kpiData,
      topProducts,
      bestClients,
      categoriesData,
      monthlyStats,
      trends,
      performance,
      stockStats,
      alertes,
      exportDate: new Date().toISOString(),
    }

    if (format === "csv") {
      const csvContent = convertToCSV(data)
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dashboard-export-${new Date().getTime()}.csv`
      a.click()
    } else if (format === "json") {
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: "application/json" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dashboard-export-${new Date().getTime()}.json`
      a.click()
    } else if (format === "pdf") {
      const htmlContent = generatePDFContent(data)
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dashboard-export-${new Date().getTime()}.html`
      a.click()
    }

    setSuccessMessage(`Données exportées en ${format.toUpperCase()}`)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const convertToCSV = (obj: Record<string, any>) => {
    const header = Object.keys(obj).join(",")
    const values = Object.values(obj)
      .map((v) => (typeof v === "object" ? JSON.stringify(v) : v))
      .join(",")
    return `${header}\n${values}`
  }

  const generatePDFContent = (data: any): string => {
    return `
      <html>
        <head>
          <title>Dashboard Analytics Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            .section { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>Dashboard Analytics Export</h1>
          <p>Généré le: ${new Date().toLocaleString()}</p>
          <div class="section">
            <h2>Résumé des Statistiques</h2>
            <p>Total Produits: ${data.dashboardStats?.totalProduits || 0}</p>
            <p>Total Clients: ${data.dashboardStats?.totalClients || 0}</p>
            <p>Total Ventes: ${data.dashboardStats?.totalVentes || 0}</p>
            <p>Chiffre d'Affaires: $${data.dashboardStats?.chiffreAffaires?.toFixed(2) || "0.00"}</p>
          </div>
        </body>
      </html>
    `
  }

  const applyTimeFilter = () => {
    let startDate = new Date()
    let endDate = new Date()

    switch (timeRange) {
      case "today":
        startDate = new Date()
        endDate = new Date()
        break
      case "yesterday":
        startDate = new Date(new Date().setDate(new Date().getDate() - 1))
        endDate = new Date(new Date().setDate(new Date().getDate() - 1))
        break
      case "last7days":
        startDate = new Date(new Date().setDate(new Date().getDate() - 7))
        endDate = new Date()
        break
      case "last30days":
        startDate = new Date(new Date().setDate(new Date().getDate() - 30))
        endDate = new Date()
        break
      case "last90days":
        startDate = new Date(new Date().setDate(new Date().getDate() - 90))
        endDate = new Date()
        break
      case "thisMonth":
        startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        endDate = new Date()
        break
      case "lastMonth":
        startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
        endDate = new Date(new Date().getFullYear(), new Date().getMonth(), 0)
        break
      case "custom":
        startDate = new Date(dateRange.start)
        endDate = new Date(dateRange.end)
        break
    }

    setDateRange({
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    })

    fetchFilteredData()
  }

  useEffect(() => {
    loadAllData()
    const interval = setInterval(loadAllData, 30000)
    return () => clearInterval(interval)
  }, []) // Ajout du tableau de dépendances vide

  const menuItems = [
    { id: "overview", label: "Vue d'ensemble", icon: Home },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "products", label: "Produits", icon: Package },
    { id: "sales", label: "Ventes", icon: ShoppingCart },
    { id: "clients", label: "Clients", icon: Users },
    { id: "categories", label: "Catégories", icon: PieChart },
    { id: "reports", label: "Rapports", icon: Database },
  ]

  const styles = `
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
      50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.5); }
    }
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `

  const radarData = kpiData
    ? [
        { subject: "Conversion", A: kpiData.conversionRate * 10, fullMark: 100 },
        { subject: "Panier Moy.", A: (kpiData.averageOrderValue / 100) * 100, fullMark: 100 },
        { subject: "Rétention", A: kpiData.customerRetention, fullMark: 100 },
        { subject: "NPS", A: kpiData.npsScore * 10, fullMark: 100 },
        { subject: "Croissance", A: kpiData.growthRate * 3, fullMark: 100 },
        { subject: "Marge", A: kpiData.profitMargin * 2, fullMark: 100 },
      ]
    : []

  const pieData = categoriesData.map((cat, i) => ({
    name: cat.nom,
    value: cat.chiffreAffaires || cat.nbProduits,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }))

  // Utilisez scatterData du useState, déjà mis à jour dans loadAllData

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      <style>{styles}</style>

      {/* Fond fixe */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 -z-20" />
      <div className="fixed inset-0 opacity-20 -z-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Header amélioré */}
      <header className="relative z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo et titre */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl hover:bg-slate-800 transition-all"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-slate-950 bg-gradient-to-br from-blue-400 to-cyan-400 shadow-lg"
                  style={{ animation: "glow 2s ease-in-out infinite" }}
                >
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Dashboard Analyste
                  </h1>
                  <p className="text-xs text-slate-400 hidden sm:block">Analytics & Insights</p>
                </div>
              </div>
            </div>

            {/* Actions du header */}
            <div className="flex items-center gap-3">
              {/* Recherche */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none w-32 lg:w-48"
                />
              </div>

              {/* Filtres temps */}
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <Calendar className="w-4 h-4 text-slate-400" />
                <select
                  value={timeRange}
                  onChange={(e) => {
                    setTimeRange(e.target.value)
                    if (e.target.value !== "custom") {
                      setTimeout(() => applyTimeFilter(), 100)
                    }
                  }}
                  className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="yesterday">Hier</option>
                  <option value="last7days">7 derniers jours</option>
                  <option value="last30days">30 derniers jours</option>
                  <option value="last90days">90 derniers jours</option>
                  <option value="thisMonth">Ce mois</option>
                  <option value="lastMonth">Mois dernier</option>
                  <option value="custom">Période personnalisée</option>
                </select>
              </div>

              {timeRange === "custom" && (
                <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-xl border border-slate-700/50">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="bg-transparent text-sm text-white focus:outline-none"
                  />
                  <span className="text-slate-400">à</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="bg-transparent text-sm text-white focus:outline-none"
                  />
                  <button 
                    onClick={applyTimeFilter} 
                    className="p-1 hover:bg-blue-500/20 rounded-lg transition-all"
                    aria-label="Apply filter"
                  >
                    <Filter className="w-4 h-4 text-blue-400" />
                  </button>
                </div>
              )}

              {/* Notifications */}
              <button 
                className="relative p-2 rounded-xl hover:bg-slate-800 transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-slate-300" />
                {alertes.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {alertes.length > 9 ? '9+' : alertes.length}
                  </span>
                )}
              </button>

              {/* Mode sombre */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl hover:bg-slate-800 transition-all"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {/* Actualiser */}
              <button
                onClick={loadAllData}
                disabled={loading}
                className="p-2 rounded-xl hover:bg-blue-500/20 transition-all disabled:opacity-50"
                aria-label="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 text-blue-400 ${loading ? "animate-spin" : ""}`} />
              </button>

              {/* Paramètres */}
              <button 
                className="hidden md:block p-2 rounded-xl hover:bg-slate-800 transition-all"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-slate-300" />
              </button>

              {/* Déconnexion */}
              <button
                onClick={onLogout}
                className="p-2 rounded-xl hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-all"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Barre d'info sous le header */}
        <div className="px-4 sm:px-6 lg:px-8 py-2 bg-slate-900/40 border-t border-slate-800/50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-slate-400">
                Dernière mise à jour: <span className="text-white">{new Date().toLocaleString('fr-FR')}</span>
              </span>
              <span className="hidden md:inline text-slate-400">
                Période: <span className="text-white">{dateRange.start} - {dateRange.end}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {loading && (
                <span className="flex items-center gap-2 text-blue-400">
                  <Loader className="w-3 h-3 animate-spin" />
                  Chargement...
                </span>
              )}
              <span className="hidden sm:inline px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md font-medium">
                API Connectée
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages de notification */}
      {successMessage && (
        <div
          className="fixed top-32 right-4 z-50 bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-4 flex items-center gap-3 shadow-2xl backdrop-blur-xl"
          style={{ animation: "slide-in 0.3s ease-out" }}
        >
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-300 text-sm font-medium">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage("")}
            className="ml-2 p-1 rounded-lg hover:bg-emerald-500/20"
          >
            <X className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div
          className="fixed top-32 right-4 z-50 bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3 shadow-2xl backdrop-blur-xl"
          style={{ animation: "slide-in 0.3s ease-out" }}
        >
          <XCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300 text-sm font-medium">{errorMessage}</p>
          <button
            onClick={() => setErrorMessage("")}
            className="ml-2 p-1 rounded-lg hover:bg-red-500/20"
          >
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

      {/* Layout principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR améliorée */}
        <aside
          className={`
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/50
            transition-transform duration-300 overflow-y-auto
            lg:translate-x-0 lg:static lg:z-auto
            pt-[137px] lg:pt-0
            shadow-2xl
          `}
        >
          <nav className="p-4 space-y-2">
            <div className="mb-6 px-4 py-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30">
              <p className="text-xs text-slate-400 mb-1">Mode Analyste</p>
              <p className="text-sm font-bold text-white">Tableau de Bord</p>
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id)
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false)
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group ${
                    activeSection === item.id
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    activeSection === item.id ? "scale-110" : ""
                  }`} />
                  <span className="font-medium">{item.label}</span>
                  {activeSection === item.id && (
                    <ChevronRight className="w-4 h-4 ml-auto animate-pulse" />
                  )}
                </button>
              )
            })}

            {/* Info section */}
            <div className="mt-8 px-4 py-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Statistiques Rapides</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Alertes</span>
                  <span className="font-bold text-red-400">{alertes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Produits</span>
                  <span className="font-bold text-blue-400">{dashboardStats?.totalProduits || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Clients</span>
                  <span className="font-bold text-emerald-400">{dashboardStats?.totalClients || 0}</span>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Overlay pour mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {loading && !dashboardStats ? (
              <div className="flex flex-col justify-center items-center py-20">
                <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                <span className="text-slate-400 text-lg">Chargement des données API...</span>
                <p className="text-slate-500 text-sm mt-2">Veuillez patienter</p>
              </div>
            ) : !dashboardStats ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Connexion API requise</h2>
                <p className="text-slate-400 mb-4">Impossible de charger les données depuis l'API.</p>
                <button
                  onClick={loadAllData}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  <RefreshCw className="w-5 h-5 inline mr-2" />
                  Réessayer la connexion
                </button>
              </div>
            ) : (
              <>
                {/* VUE D'ENSEMBLE */}
                {activeSection === "overview" && (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-4xl font-black mb-2">Vue d'ensemble</h2>
                        <p className="text-slate-400">Analytique en temps réel • Données API</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => exportData("csv")}
                          className="px-4 py-2 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-sm font-medium flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          CSV
                        </button>
                        <button
                          onClick={() => exportData("json")}
                          className="px-4 py-2 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-sm font-medium flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          JSON
                        </button>
                      </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        {
                          label: "Chiffre d'Affaires",
                          value: `$${(dashboardStats?.chiffreAffaires || 0).toLocaleString()}`,
                          icon: DollarSign,
                          color: "from-emerald-600 to-teal-600",
                          change: kpiData?.growthRate,
                        },
                        {
                          label: "Total Ventes",
                          value: dashboardStats?.totalVentes || 0,
                          icon: ShoppingCart,
                          color: "from-blue-600 to-cyan-600",
                        },
                        {
                          label: "Total Clients",
                          value: dashboardStats?.totalClients || 0,
                          icon: Users,
                          color: "from-purple-600 to-pink-600",
                        },
                        {
                          label: "Produits",
                          value: dashboardStats?.totalProduits || 0,
                          icon: Package,
                          color: "from-amber-600 to-orange-600",
                        },
                      ].map((stat, i) => {
                        const Icon = stat.icon
                        return (
                          <div
                            key={i}
                            className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              {stat.change !== undefined && (
                                <span
                                  className={`text-xs font-semibold flex items-center gap-1 ${stat.change >= 0 ? "text-emerald-400" : "text-red-400"}`}
                                >
                                  {stat.change >= 0 ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3" />
                                  )}
                                  {stat.change.toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                          </div>
                        )
                      })}
                    </div>

                    {/* Évolution CA & Ventes - Correction */}
                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        Évolution CA & Ventes
                      </h3>
                      <ResponsiveContainer width="100%" height={320}>
                        <ComposedChart data={monthlyStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="mois" stroke="#94a3b8" fontSize={12} />
                          <YAxis
                            yAxisId="left"
                            stroke="#94a3b8"
                            fontSize={12}
                            label={{
                              value: "CA ($)",
                              angle: -90,
                              position: "insideLeft",
                              style: { fill: "#94a3b8", fontSize: 11 },
                            }}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#94a3b8"
                            fontSize={12}
                            label={{
                              value: "Ventes (nombre)",
                              angle: -90,
                              position: "insideRight",
                              style: { fill: "#94a3b8", fontSize: 11 },
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #475569",
                              borderRadius: "12px",
                            }}
                            labelStyle={{ color: "#f1f5f9" }}
                            formatter={(value: any, name?: string) => {
                              if (name === "CA") return [`$${Number(value).toLocaleString()}`, "Chiffre d'Affaires"]
                              if (name === "Ventes") return [value, "Nombre de ventes"]
                              return [value, name ?? ""]
                            }}
                          />
                          <Legend />
                          <Bar
                            yAxisId="left"
                            dataKey="ca"
                            name="CA"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="ventes"
                            name="Ventes"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ fill: "#10b981", r: 5 }}
                            activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 2 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                      <div className="mt-4 text-xs text-slate-400">
                        <p>Données mensuelles montrant la corrélation entre le chiffre d'affaires et le nombre de ventes.</p>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-400" />
                          Radar KPIs
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="#475569" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                            <Radar
                              name="Performance"
                              dataKey="A"
                              stroke="#3b82f6"
                              fill="#3b82f6"
                              fillOpacity={0.5}
                              strokeWidth={2}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #475569",
                                borderRadius: "12px",
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                          <PieChart className="w-5 h-5 text-purple-400" />
                          Répartition par Catégorie
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                          <RechartsPie>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }: { name?: string; percent?: number }) =>
                                `${name ?? ""} ${(percent !== undefined ? (percent * 100).toFixed(0) : "0")}%`
                              }
                              labelLine={{ stroke: "#64748b" }}
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #475569",
                                borderRadius: "12px",
                              }}
                            />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Alertes */}
                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        Alertes ({alertes.length})
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alertes.slice(0, 6).map((alerte, i) => (
                          <div
                            key={i}
                            className={`p-4 rounded-xl border ${
                              alerte.priorite === "HAUTE"
                                ? "border-red-500/30 bg-red-500/10"
                                : alerte.priorite === "MOYENNE"
                                  ? "border-amber-500/30 bg-amber-500/10"
                                  : "border-blue-500/30 bg-blue-500/10"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                {alerte.type}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded font-semibold ${
                                  alerte.priorite === "HAUTE"
                                    ? "bg-red-500/20 text-red-300"
                                    : alerte.priorite === "MOYENNE"
                                      ? "bg-amber-500/20 text-amber-300"
                                      : "bg-blue-500/20 text-blue-300"
                                }`}
                              >
                                {alerte.priorite}
                              </span>
                            </div>
                            <p className="text-sm text-white font-medium">{alerte.produit}</p>
                            <p className="text-xs text-slate-400 mt-1">{alerte.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ANALYTICS */}
                {activeSection === "analytics" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-black mb-2">Analytics Avancé</h2>
                      <p className="text-slate-400">Analyse approfondie des données</p>
                    </div>

                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <LineChartIcon className="w-5 h-5 text-cyan-400" />
                        Tendances Hebdomadaires
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trends}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #475569",
                              borderRadius: "12px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#06b6d4"
                            strokeWidth={3}
                            fill="url(#colorValue)"
                            name="Valeur ($)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-400" />
                        Corrélation Stock / Ventes
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis
                            type="number"
                            dataKey="x"
                            name="Stock"
                            stroke="#94a3b8"
                            fontSize={12}
                            label={{
                              value: "Stock (quantité)",
                              position: "insideBottom",
                              offset: -5,
                              style: { fill: "#94a3b8", fontSize: 11 },
                            }}
                          />
                          <YAxis
                            type="number"
                            dataKey="y"
                            name="Ventes"
                            stroke="#94a3b8"
                            fontSize={12}
                            label={{
                              value: "Ventes (nombre)",
                              angle: -90,
                              position: "insideLeft",
                              style: { fill: "#94a3b8", fontSize: 11 },
                            }}
                          />
                          <Tooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #475569",
                              borderRadius: "12px",
                            }}
                            formatter={(value: any, name?: string) => {
                              if (name === "Stock") return [value, "Stock (unités)"]
                              if (name === "Ventes") return [value, "Ventes (unités)"]
                              return [value, name ?? ""]
                            }}
                            labelFormatter={(label: any) => `Produit: ${label}`}
                          />
                          <Legend />
                          <Scatter name="Produits" data={scatterData} fill="#f59e0b">
                            {scatterData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Scatter>
                          <ReferenceLine
                            x={50}
                            stroke="#3b82f6"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                            label={{
                              value: "Stock idéal",
                              position: "top",
                              fill: "#3b82f6",
                              fontSize: 10,
                            }}
                          />
                          <ReferenceLine
                            y={5}
                            stroke="#10b981"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                            label={{
                              value: "Bonnes ventes",
                              position: "right",
                              fill: "#10b981",
                              fontSize: 10,
                            }}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                      <div className="mt-4 text-xs text-slate-400 flex flex-wrap gap-4">
                        {scatterData.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-emerald-400" />
                          Évolution CA & Ventes
                        </h3>
                        <ResponsiveContainer width="100%" height={320}>
                          <ComposedChart data={monthlyStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="mois" stroke="#94a3b8" fontSize={12} />
                            <YAxis
                              yAxisId="left"
                              stroke="#94a3b8"
                              fontSize={12}
                              label={{
                                value: "CA ($)",
                                angle: -90,
                                position: "insideLeft",
                                style: { fill: "#94a3b8", fontSize: 11 },
                              }}
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              stroke="#94a3b8"
                              fontSize={12}
                              label={{
                                value: "Ventes (nombre)",
                                angle: -90,
                                position: "insideRight",
                                style: { fill: "#94a3b8", fontSize: 11 },
                              }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #475569",
                                borderRadius: "12px",
                              }}
                              labelStyle={{ color: "#f1f5f9" }}
                              formatter={(value: any, name?: string) => {
                                if (name === "CA") return [`$${Number(value).toLocaleString()}`, "Chiffre d'Affaires"]
                                if (name === "Ventes") return [value, "Nombre de ventes"]
                                return [value, name ?? ""]
                              }}
                            />
                            <Legend />
                            <Bar
                              yAxisId="left"
                              dataKey="ca"
                              name="CA"
                              fill="#3b82f6"
                              radius={[4, 4, 0, 0]}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="ventes"
                              name="Ventes"
                              stroke="#10b981"
                              strokeWidth={3}
                              dot={{ fill: "#10b981", r: 5 }}
                              activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 2 }}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                        <div className="mt-4 text-xs text-slate-400">
                          <p>Données mensuelles montrant la corrélation entre le chiffre d'affaires et le nombre de ventes.</p>
                        </div>
                      </div>

                      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-400" />
                          Radar KPIs
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="#475569" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                            <Radar
                              name="Performance"
                              dataKey="A"
                              stroke="#3b82f6"
                              fill="#3b82f6"
                              fillOpacity={0.5}
                              strokeWidth={2}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #475569",
                                borderRadius: "12px",
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Alertes */}
                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        Alertes ({alertes.length})
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alertes.slice(0, 6).map((alerte, i) => (
                          <div
                            key={i}
                            className={`p-4 rounded-xl border ${
                              alerte.priorite === "HAUTE"
                                ? "border-red-500/30 bg-red-500/10"
                                : alerte.priorite === "MOYENNE"
                                  ? "border-amber-500/30 bg-amber-500/10"
                                  : "border-blue-500/30 bg-blue-500/10"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                {alerte.type}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded font-semibold ${
                                  alerte.priorite === "HAUTE"
                                    ? "bg-red-500/20 text-red-300"
                                    : alerte.priorite === "MOYENNE"
                                      ? "bg-amber-500/20 text-amber-300"
                                      : "bg-blue-500/20 text-blue-300"
                                }`}
                              >
                                {alerte.priorite}
                              </span>
                            </div>
                            <p className="text-sm text-white font-medium">{alerte.produit}</p>
                            <p className="text-xs text-slate-400 mt-1">{alerte.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ANALYTICS */}
                {activeSection === "analytics" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-black mb-2">Analytics Avancé</h2>
                      <p className="text-slate-400">Analyse approfondie des données</p>
                    </div>

                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <LineChartIcon className="w-5 h-5 text-cyan-400" />
                        Tendances Hebdomadaires
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trends}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #475569",
                              borderRadius: "12px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#06b6d4"
                            strokeWidth={3}
                            fill="url(#colorValue)"
                            name="Valeur ($)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-400" />
                        Corrélation Stock / Ventes
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis
                            type="number"
                            dataKey="x"
                            name="Stock"
                            stroke="#94a3b8"
                            fontSize={12}
                            label={{
                              value: "Stock (quantité)",
                              position: "insideBottom",
                              offset: -5,
                              style: { fill: "#94a3b8", fontSize: 11 },
                            }}
                          />
                          <YAxis
                            type="number"
                            dataKey="y"
                            name="Ventes"
                            stroke="#94a3b8"
                            fontSize={12}
                            label={{
                              value: "Ventes (nombre)",
                              angle: -90,
                              position: "insideLeft",
                              style: { fill: "#94a3b8", fontSize: 11 },
                            }}
                          />
                          <Tooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #475569",
                              borderRadius: "12px",
                            }}
                            formatter={(value: any, name?: string) => {
                              if (name === "Stock") return [value, "Stock (unités)"]
                              if (name === "Ventes") return [value, "Ventes (unités)"]
                              return [value, name ?? ""]
                            }}
                            labelFormatter={(label: any) => `Produit: ${label}`}
                          />
                          <Legend />
                          <Scatter name="Produits" data={scatterData} fill="#f59e0b">
                            {scatterData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Scatter>
                          <ReferenceLine
                            x={50}
                            stroke="#3b82f6"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                            label={{
                              value: "Stock idéal",
                              position: "top",
                              fill: "#3b82f6",
                              fontSize: 10,
                            }}
                          />
                          <ReferenceLine
                            y={5}
                            stroke="#10b981"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                            label={{
                              value: "Bonnes ventes",
                              position: "right",
                              fill: "#10b981",
                              fontSize: 10,
                            }}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                      <div className="mt-4 text-xs text-slate-400 flex flex-wrap gap-4">
                        {scatterData.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-emerald-400" />
                          Évolution CA & Ventes
                        </h3>
                        <ResponsiveContainer width="100%" height={320}>
                          <ComposedChart data={monthlyStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="mois" stroke="#94a3b8" fontSize={12} />
                            <YAxis
                              yAxisId="left"
                              stroke="#94a3b8"
                              fontSize={12}
                              label={{
                                value: "CA ($)",
                                angle: -90,
                                position: "insideLeft",
                                style: { fill: "#94a3b8", fontSize: 11 },
                              }}
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              stroke="#94a3b8"
                              fontSize={12}
                              label={{
                                value: "Ventes (nombre)",
                                angle: -90,
                                position: "insideRight",
                                style: { fill: "#94a3b8", fontSize: 11 },
                              }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #475569",
                                borderRadius: "12px",
                              }}
                              labelStyle={{ color: "#f1f5f9" }}
                              formatter={(value: any, name?: string) => {
                                if (name === "CA") return [`$${Number(value).toLocaleString()}`, "Chiffre d'Affaires"]
                                if (name === "Ventes") return [value, "Nombre de ventes"]
                                return [value, name ?? ""]
                              }}
                            />
                            <Legend />
                            <Bar
                              yAxisId="left"
                              dataKey="ca"
                              name="CA"
                              fill="#3b82f6"
                              radius={[4, 4, 0, 0]}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="ventes"
                              name="Ventes"
                              stroke="#10b981"
                              strokeWidth={3}
                              dot={{ fill: "#10b981", r: 5 }}
                              activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 2 }}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                        <div className="mt-4 text-xs text-slate-400">
                          <p>Données mensuelles montrant la corrélation entre le chiffre d'affaires et le nombre de ventes.</p>
                        </div>
                      </div>

                      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-400" />
                          Radar KPIs
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="#475569" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                            <Radar
                              name="Performance"
                              dataKey="A"
                              stroke="#3b82f6"
                              fill="#3b82f6"
                              fillOpacity={0.5}
                              strokeWidth={2}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #475569",
                                borderRadius: "12px",
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Alertes */}
                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        Alertes ({alertes.length})
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alertes.slice(0, 6).map((alerte, i) => (
                          <div
                            key={i}
                            className={`p-4 rounded-xl border ${
                              alerte.priorite === "HAUTE"
                                ? "border-red-500/30 bg-red-500/10"
                                : alerte.priorite === "MOYENNE"
                                  ? "border-amber-500/30 bg-amber-500/10"
                                  : "border-blue-500/30 bg-blue-500/10"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                {alerte.type}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded font-semibold ${
                                  alerte.priorite === "HAUTE"
                                    ? "bg-red-500/20 text-red-300"
                                    : alerte.priorite === "MOYENNE"
                                      ? "bg-amber-500/20 text-amber-300"
                                      : "bg-blue-500/20 text-blue-300"
                                }`}
                              >
                                {alerte.priorite}
                              </span>
                            </div>
                            <p className="text-sm text-white font-medium">{alerte.produit}</p>
                            <p className="text-xs text-slate-400 mt-1">{alerte.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* PRODUITS */}
                {activeSection === "products" && (
                  <div className="space-y-6">
                    <h2 className="text-3xl font-black mb-2">Analyse des Produits</h2>

                    {/* Stock faible */}
                    {lowStockProducts.length > 0 && (
                      <div className="bg-red-900/20 backdrop-blur-xl rounded-2xl border border-red-700/50 p-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          Alertes Stock Faible ({lowStockProducts.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {lowStockProducts.map((product, i) => (
                            <div key={i} className="bg-slate-800/40 rounded-xl p-4 border border-red-500/30">
                              <h4 className="font-semibold text-white">{product.nom}</h4>
                              <p className="text-red-300 text-sm">{product.stock} restants</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                      <h3 className="text-xl font-bold mb-6">Niveaux de Stock par Produit</h3>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={dashboardStats?.top5Produits || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis
                            dataKey="nom"
                            stroke="#94a3b8"
                            fontSize={10}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #475569",
                              borderRadius: "12px",
                            }}
                          />
                          <Legend />
                          <Bar dataKey="stock" name="Stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="nombreVentes" name="Ventes" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Table Produits */}
                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                      <div className="p-6 border-b border-slate-700/50">
                        <h3 className="text-xl font-bold">Liste des Produits</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-700/50">
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Produit</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Prix</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Stock</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Ventes</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">CA</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topProducts.map((product, i) => (
                              <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-800/40">
                                <td className="px-6 py-4 font-medium text-white">{product.nom}</td>
                                <td className="px-6 py-4 text-blue-400">${product.prix?.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-bold ${product.stock > 20 ? "bg-emerald-500/20 text-emerald-300" : product.stock > 5 ? "bg-amber-500/20 text-amber-300" : "bg-red-500/20 text-red-300"}`}
                                  >
                                    {product.stock}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-300">{product.nombreVentes || 0}</td>
                                <td className="px-6 py-4 text-emerald-400">
                                  ${product.chiffreAffaires?.toLocaleString() || "0"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* VENTES */}
                {activeSection === "sales" && (
                  <div className="space-y-6">
                    <h2 className="text-3xl font-black mb-2">Analytique des Ventes</h2>

                    <div className="grid lg:grid-cols-4 gap-4">
                      {[
                        { label: "Ventes totales", value: dashboardStats?.totalVentes || 0, color: "text-blue-400" },
                        {
                          label: "Chiffre d'affaires",
                          value: `$${(dashboardStats?.chiffreAffaires || 0).toLocaleString()}`,
                          color: "text-emerald-400",
                        },
                        {
                          label: "Panier moyen",
                          value: `$${kpiData?.averageOrderValue?.toFixed(2) || "0.00"}`,
                          color: "text-purple-400",
                        },
                        {
                          label: "Taux conversion",
                          value: `${kpiData?.conversionRate?.toFixed(1) || "0.0"}%`,
                          color: "text-amber-400",
                        },
                      ].map((stat, i) => (
                        <div
                          key={i}
                          className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5"
                        >
                          <p className="text-slate-400 text-sm">{stat.label}</p>
                          <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                      <h3 className="text-xl font-bold mb-6">Évolution Mensuelle des Ventes</h3>
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={monthlyStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="mois" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #475569",
                              borderRadius: "12px",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="ventes"
                            name="Ventes"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: "#3b82f6", r: 5 }}
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="orders"
                            name="Commandes"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ fill: "#10b981", r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Tendances */}
                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                      <h3 className="text-xl font-bold mb-6">Tendances par Période</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {trends.map((trend, i) => (
                          <div key={i} className="bg-slate-800/40 rounded-xl p-4 text-center">
                            <p className="text-slate-400 text-sm">{trend.period}</p>
                            <p className="text-xl font-bold text-white">${trend.value.toLocaleString()}</p>
                            <p
                              className={`text-xs font-semibold ${trend.change >= 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {trend.change >= 0 ? "↗" : "↘"} {Math.abs(trend.change)}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* CLIENTS */}
                {activeSection === "clients" && (
                  <div className="space-y-6">
                    <h2 className="text-3xl font-black mb-2">Analyse Clients</h2>

                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-lg font-bold mb-6">Top Clients par CA</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={bestClients.slice(0, 8)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                            <YAxis dataKey="nom" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #475569",
                                borderRadius: "12px",
                              }}
                            />
                            <Bar dataKey="chiffreAffaires" name="CA ($)" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Stats Clients */}
                      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-lg font-bold mb-6">Métriques Clients</h3>
                        <div className="space-y-4">
                          {[
                            {
                              label: "Clients totaux",
                              value: dashboardStats?.totalClients || 0,
                              icon: Users,
                              color: "from-blue-500 to-cyan-500",
                            },
                            {
                              label: "Taux rétention",
                              value: `${kpiData?.customerRetention?.toFixed(1) || "0.0"}%`,
                              icon: TrendingUp,
                              color: "from-emerald-500 to-teal-500",
                            },
                            {
                              label: "Score NPS",
                              value: `${kpiData?.npsScore?.toFixed(1) || "0.0"}/10`,
                              icon: Star,
                              color: "from-purple-500 to-pink-500",
                            },
                            {
                              label: "Panier moyen",
                              value: `$${kpiData?.averageOrderValue?.toFixed(2) || "0.00"}`,
                              icon: ShoppingCart,
                              color: "from-amber-500 to-orange-500",
                            },
                          ].map((stat, i) => {
                            const Icon = stat.icon
                            return (
                              <div key={i} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                                    <Icon className="w-5 h-5 text-white" />
                                  </div>
                                  <span className="text-slate-300">{stat.label}</span>
                                </div>
                                <span className="text-xl font-bold text-white">{stat.value}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Liste clients */}
                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                      <h3 className="text-lg font-bold mb-6">Détail Clients</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bestClients.map((client, i) => (
                          <div key={i} className="bg-slate-800/40 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                              <span className="text-lg font-bold text-white">{client.nom?.charAt(0) || "C"}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-white">{client.nom}</p>
                              <p className="text-xs text-slate-400">{client.nombreVentes || 0} achats</p>
                            </div>
                            <p className="text-lg font-bold text-emerald-400">
                              ${client.chiffreAffaires?.toLocaleString() || "0"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* CATÉGORIES */}
                {activeSection === "categories" && (
                  <div className="space-y-6">
                    <h2 className="text-3xl font-black mb-2">Analyse par Catégorie</h2>

                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-lg font-bold mb-6">Distribution CA par Catégorie</h3>
                        <ResponsiveContainer width="100%" height={350}>
                          <RechartsPie>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              outerRadius={120}
                              dataKey="value"
                              label={({ name, percent }: { name?: string; percent?: number }) =>
                                `${name ?? ""}: ${(percent !== undefined ? (percent * 100).toFixed(0) : "0")}%`
                              }
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #475569",
                                borderRadius: "12px",
                              }}
                            />
                            <Legend />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>

                      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                        <h3 className="text-lg font-bold mb-6">Performance par Catégorie</h3>
                        <ResponsiveContainer width="100%" height={350}>
                          <ComposedChart data={categoriesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                              dataKey="nom"
                              stroke="#94a3b8"
                              fontSize={11}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis
                              yAxisId="left"
                              stroke="#94a3b8"
                              fontSize={12}
                              label={{
                                value: "Nombre de produits",
                                angle: -90,
                                position: "insideLeft",
                                style: { fill: "#3b82f6", fontSize: 11 },
                              }}
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              stroke="#94a3b8"
                              fontSize={12}
                              label={{
                                value: "CA ($)",
                                angle: -90,
                                position: "insideRight",
                                style: { fill: "#10b981", fontSize: 11 },
                              }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #475569",
                                borderRadius: "12px",
                              }}
                              formatter={(value: any, name?: string) => {
                                if (name === "Produits") return [value, "Nombre de produits"]
                                if (name === "CA") return [`$${Number(value).toLocaleString()}`, "Chiffre d'affaires"]
                                return [value, name]
                              }}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="nbProduits" name="Produits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="chiffreAffaires"
                              name="CA"
                              stroke="#10b981"
                              strokeWidth={3}
                              dot={{ fill: "#10b981", r: 4 }}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                        <div className="mt-4 text-xs text-slate-400">
                          <p className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded bg-[#3b82f6]" />
                            <span>Nombre de produits par catégorie</span>
                          </p>
                          <p className="flex items-center gap-2 mt-1">
                            <span className="w-3 h-3 rounded bg-[#10b981]" />
                            <span>Chiffre d'affaires généré par catégorie</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Détail catégories */}
                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                      <h3 className="text-lg font-bold mb-6">Détail par Catégorie</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoriesData.map((cat, i) => (
                          <div key={i} className="bg-slate-800/40 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-4">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                              />
                              <h4 className="font-bold text-white text-lg">{cat.nom}</h4>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Produits</span>
                                <span className="text-white font-semibold">{cat.nbProduits}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">CA</span>
                                <span className="text-emerald-400 font-semibold">
                                  ${cat.chiffreAffaires?.toLocaleString() || "0"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Ventes</span>
                                <span className="text-blue-400 font-semibold">{cat.ventes || 0}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* RAPPORTS */}
                {activeSection === "reports" && (
                  <div className="space-y-6">
                    <h2 className="text-3xl font-black mb-2">Rapports et Exports</h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        {
                          title: "Rapport Mensuel",
                          desc: "Performance complète",
                          icon: Calendar,
                          color: "from-blue-600 to-cyan-600",
                        },
                        {
                          title: "Analyse Produits",
                          desc: "Top produits et stock",
                          icon: Package,
                          color: "from-emerald-600 to-teal-600",
                        },
                        {
                          title: "Analyse Clients",
                          desc: "Comportement et fidélité",
                          icon: Users,
                          color: "from-purple-600 to-pink-600",
                        },
                        {
                          title: "Rapport Financier",
                          desc: "CA, marges et profits",
                          icon: DollarSign,
                          color: "from-amber-600 to-orange-600",
                        },
                        {
                          title: "Analyse Catégories",
                          desc: "Performance par catégorie",
                          icon: PieChart,
                          color: "from-indigo-600 to-purple-600",
                        },
                        {
                          title: "Rapport Complet",
                          desc: "Toutes les données",
                          icon: Database,
                          color: "from-cyan-600 to-blue-600",
                        },
                      ].map((report, i) => {
                        const Icon = report.icon
                        return (
                          <div
                            key={i}
                            className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all"
                          >
                            <div className="flex flex-col items-center text-center">
                              <div className={`p-4 rounded-xl bg-gradient-to-br ${report.color} mb-4`}>
                                <Icon className="w-8 h-8 text-white" />
                              </div>
                              <h3 className="text-lg font-bold text-white mb-2">{report.title}</h3>
                              <p className="text-sm text-slate-400 mb-4">{report.desc}</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => exportData("csv")}
                                  className="px-4 py-2 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-sm font-medium"
                                >
                                  CSV
                                </button>
                                <button
                                  onClick={() => exportData("json")}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-sm font-medium"
                                >
                                  JSON
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AnalysteDashboard


=======
import StatCard from '../../components/charts/StatCard';

const AnalysteDashboard = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">📊 Dashboard Analyste</h1>
        <p className="text-gray-400 mt-2">Analyses et rapports détaillés</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Taux de Conversion"
          value="68.5%"
          icon={<span>📈</span>}
          color="blue"
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatCard
          title="Panier Moyen"
          value="145€"
          icon={<span>🛒</span>}
          color="green"
          trend={{ value: 3.1, isPositive: true }}
        />
        <StatCard
          title="Taux de Rétention"
          value="72%"
          icon={<span>🔄</span>}
          color="purple"
          trend={{ value: -2.3, isPositive: false }}
        />
        <StatCard
          title="ROI Moyen"
          value="285%"
          icon={<span>💹</span>}
          color="yellow"
          trend={{ value: 12.5, isPositive: true }}
        />
      </div>

      {/* Reports Section */}
      <div className="bg-slate-800 p-6 rounded-lg shadow border border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Rapports Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            📄 Rapport Mensuel
          </button>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
            📊 Analyse Produits
          </button>
          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
            👥 Comportement Clients
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysteDashboard;
>>>>>>> 8d1c0e206745bd8490f5602ea185a176817a96f0
