import { useState, useEffect } from 'react';
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
} from 'recharts';
import StatCard from '../../components/charts/StatCard';
import axiosInstance from '../../api/axiosConfig';

// Interfaces
interface Produit {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  stock: number;
  categorie?: { nom: string };
  nombreVentes?: number;
  chiffreAffaires?: number;
  marge?: number;
  seuilAlerte?: number;
  statut?: string;
}

interface Client {
  nom: string;
  nombreVentes?: number;
  chiffreAffaires?: number;
  id?: number;
}

interface Categorie {
  nom: string;
  nbProduits: number;
  chiffreAffaires?: number;
  ventes?: number;
  pourcentageProduits?: number;
}

interface MonthlyStat {
  mois: string;
  ca: number;
  ventes: number;
  orders?: number;
}

interface DashboardStats {
  totalProduits: number;
  totalClients: number;
  totalVentes: number;
  chiffreAffaires: number;
  prixMoyen: number;
  totalCategories: number;
  produitsFaibleStock: number;
  produitsRupture?: number;
  valeurStockTotal?: number;
  top5Produits: Produit[];
  distributionCategories: Categorie[];
  dernieresVentes?: any[];
  alertes?: any[];
  nombreAlertes?: number;
}

interface KPI {
  conversionRate: number;
  averageOrderValue: number;
  customerRetention: number;
  npsScore: number;
  growthRate: number;
  profitMargin: number;
}

interface Trend {
  period: string;
  value: number;
  change: number;
}

interface PerformanceMetric {
  metric: string;
  value: number;
  target: number;
  status: string;
  progress: number;
}

interface StockStats {
  totalStockValue: number;
  averageStockAge: number;
  turnoverRate: number;
  stockOutCount: number;
}

interface Alert {
  type: string;
  produit: string;
  stockActuel?: number;
  seuil?: number;
  ventes?: number;
  priorite: string;
  message: string;
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const AnalysteDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [timeRange, setTimeRange] = useState('last30days');

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | undefined>(undefined);
  const [kpiData, setKpiData] = useState<KPI | undefined>(undefined);
  const [topProducts, setTopProducts] = useState<Produit[]>([]);
  const [bestClients, setBestClients] = useState<Client[]>([]);
  const [categoriesData, setCategoriesData] = useState<Categorie[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Produit[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetric[]>([]);
  const [stockStats, setStockStats] = useState<StockStats | undefined>(undefined);
  const [alertes, setAlertes] = useState<Alert[]>([]);
  const [scatterData, setScatterData] = useState<any[]>([]);

  const loadAllData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await axiosInstance.get('/dashboard/stats-globales');
      const globalData = res.data;

      setDashboardStats(globalData.statsBasiques);
      setKpiData(globalData.kpis);
      setMonthlyStats(globalData.evolutionCA);
      setCategoriesData(globalData.statsBasiques.distributionCategories);
      setStockStats(globalData.statsStock);
      setAlertes(globalData.alertes);
      setTrends(globalData.tendances);
      setPerformance(globalData.performances?.metrics || []);
      setBestClients(globalData.topClients || []);
      setTopProducts(globalData.topProduits || []);

      if (globalData.statsBasiques?.top5Produits) {
        const lowStock = globalData.statsBasiques.top5Produits.filter((p: Produit) => p.stock < 5);
        setLowStockProducts(lowStock);
        
        const scatter = globalData.statsBasiques.top5Produits.map((produit: Produit) => ({
          x: produit.stock,
          y: produit.nombreVentes || 0,
          name: produit.nom,
          ca: produit.chiffreAffaires || 0
        }));
        setScatterData(scatter);
      }

      setSuccessMessage('Données mises à jour');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setErrorMessage('Impossible de charger les données. Vérifiez la connexion API.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/dashboard/stats/filtre?dateDebut=${dateRange.start}&dateFin=${dateRange.end}`);
      const data = res.data;
      setDashboardStats((prev) => ({ ...(prev ?? ({} as DashboardStats)), ...data }));
      setSuccessMessage('Données filtrées avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Erreur lors du filtrage');
    } finally {
      setLoading(false);
    }
  };

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
    };

    if (format === 'csv') {
      const csvContent = convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${new Date().getTime()}.csv`;
      a.click();
    } else if (format === 'json') {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${new Date().getTime()}.json`;
      a.click();
    }

    setSuccessMessage(`Données exportées en ${format.toUpperCase()}`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const convertToCSV = (obj: Record<string, any>) => {
    const header = Object.keys(obj).join(',');
    const values = Object.values(obj)
      .map((v) => (typeof v === 'object' ? JSON.stringify(v) : v))
      .join(',');
    return `${header}\n${values}`;
  };

  const applyTimeFilter = () => {
    let startDate = new Date();
    let endDate = new Date();

    switch (timeRange) {
      case 'today':
        startDate = endDate = new Date();
        break;
      case 'last7days':
        startDate = new Date(new Date().setDate(new Date().getDate() - 7));
        break;
      case 'last30days':
        startDate = new Date(new Date().setDate(new Date().getDate() - 30));
        break;
      case 'last90days':
        startDate = new Date(new Date().setDate(new Date().getDate() - 90));
        break;
      case 'custom':
        startDate = new Date(dateRange.start);
        endDate = new Date(dateRange.end);
        break;
    }

    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    });

    fetchFilteredData();
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'products', label: 'Produits' },
    { id: 'sales', label: 'Ventes' },
    { id: 'clients', label: 'Clients' },
    { id: 'categories', label: 'Catégories' },
    { id: 'reports', label: 'Rapports' },
  ];

  const radarData = kpiData
    ? [
        { subject: 'Conversion', A: kpiData.conversionRate * 10, fullMark: 100 },
        { subject: 'Panier Moy.', A: (kpiData.averageOrderValue / 100) * 100, fullMark: 100 },
        { subject: 'Rétention', A: kpiData.customerRetention, fullMark: 100 },
        { subject: 'NPS', A: kpiData.npsScore * 10, fullMark: 100 },
        { subject: 'Croissance', A: kpiData.growthRate * 3, fullMark: 100 },
        { subject: 'Marge', A: kpiData.profitMargin * 2, fullMark: 100 },
      ]
    : [];

  const pieData = categoriesData.map((cat, i) => ({
    name: cat.nom,
    value: cat.chiffreAffaires || cat.nbProduits,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <>
      {loading && !dashboardStats ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : !dashboardStats ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">Impossible de charger les données.</p>
          <button
            onClick={loadAllData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {/* Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-900/20 border border-green-500/50 rounded-lg text-green-300">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Navigation */}
          <div className="mb-6 flex flex-wrap gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Time Filter */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <select
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value);
                if (e.target.value !== 'custom') {
                  setTimeout(() => applyTimeFilter(), 100);
                }
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700"
            >
              <option value="today">Aujourd'hui</option>
              <option value="last7days">7 derniers jours</option>
              <option value="last30days">30 derniers jours</option>
              <option value="last90days">90 derniers jours</option>
              <option value="custom">Période personnalisée</option>
            </select>

            {timeRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700"
                />
                <button
                  onClick={applyTimeFilter}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Appliquer
                </button>
              </>
            )}

            <button
              onClick={loadAllData}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Chargement...' : 'Actualiser'}
            </button>
          </div>

          {/* VUE D'ENSEMBLE */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <p className="text-gray-400 mb-6">Analytique en temps réel • Données API</p>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => exportData('csv')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm"
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={() => exportData('json')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm"
                >
                  📥 Export JSON
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Chiffre d'Affaires"
                  value={`$${(dashboardStats?.chiffreAffaires || 0).toLocaleString()}`}
                  icon={<span>💰</span>}
                  color="green"
                  trend={kpiData?.growthRate ? { value: kpiData.growthRate, isPositive: kpiData.growthRate >= 0 } : undefined}
                />
                <StatCard
                  title="Total Ventes"
                  value={dashboardStats?.totalVentes || 0}
                  icon={<span>🛒</span>}
                  color="blue"
                />
                <StatCard
                  title="Total Clients"
                  value={dashboardStats?.totalClients || 0}
                  icon={<span>👥</span>}
                  color="purple"
                />
                <StatCard
                  title="Produits"
                  value={dashboardStats?.totalProduits || 0}
                  icon={<span>📦</span>}
                  color="yellow"
                />
              </div>

              {/* Évolution CA & Ventes */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
                <h3 className="text-xl font-bold mb-6 text-white">📈 Évolution CA & Ventes</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="mois" stroke="#94a3b8" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="ca" name="CA" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="ventes"
                      name="Ventes"
                      stroke="#10b981"
                      strokeWidth={3}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Radar & Pie Charts */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h3 className="text-xl font-bold mb-6 text-white">🎯 Radar KPIs</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#475569" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
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
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '8px',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h3 className="text-xl font-bold mb-6 text-white">🥧 Répartition par Catégorie</h3>
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
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '8px',
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Alertes */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-bold mb-6 text-white">⚠️ Alertes ({alertes.length})</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alertes.slice(0, 6).map((alerte, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border ${
                        alerte.priorite === 'HAUTE'
                          ? 'border-red-500/30 bg-red-500/10'
                          : alerte.priorite === 'MOYENNE'
                          ? 'border-amber-500/30 bg-amber-500/10'
                          : 'border-blue-500/30 bg-blue-500/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-slate-400">{alerte.type}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded font-semibold ${
                            alerte.priorite === 'HAUTE'
                              ? 'bg-red-500/20 text-red-300'
                              : alerte.priorite === 'MOYENNE'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-blue-500/20 text-blue-300'
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
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">📊 Analytics Avancé</h3>
              <p className="text-gray-400 mb-6">Analyse approfondie des données</p>

              {/* Tendances */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
                <h3 className="text-xl font-bold mb-6 text-white">📈 Tendances Hebdomadaires</h3>
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
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
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

              {/* Scatter Chart */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-bold mb-6 text-white">⚡ Corrélation Stock / Ventes</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" dataKey="x" name="Stock" stroke="#94a3b8" fontSize={12} />
                    <YAxis type="number" dataKey="y" name="Ventes" stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Scatter name="Produits" data={scatterData} fill="#f59e0b">
                      {scatterData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Scatter>
                    <ReferenceLine x={50} stroke="#3b82f6" strokeDasharray="3 3" />
                    <ReferenceLine y={5} stroke="#10b981" strokeDasharray="3 3" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* PRODUITS */}
          {activeSection === 'products' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">📦 Analyse des Produits</h3>

              {lowStockProducts.length > 0 && (
                <div className="bg-red-900/20 p-6 rounded-lg border border-red-700/50 mb-6">
                  <h4 className="text-lg font-bold text-white mb-4">⚠️ Alertes Stock Faible ({lowStockProducts.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {lowStockProducts.map((product, i) => (
                      <div key={i} className="bg-slate-800/40 rounded-lg p-4 border border-red-500/30">
                        <h5 className="font-semibold text-white">{product.nom}</h5>
                        <p className="text-red-300 text-sm">{product.stock} restants</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
                <h4 className="text-xl font-bold mb-6 text-white">Niveaux de Stock par Produit</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={dashboardStats?.top5Produits || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="nom" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="stock" name="Stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="nombreVentes" name="Ventes" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                  <h4 className="text-xl font-bold text-white">Liste des Produits</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Produit</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Prix</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Stock</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Ventes</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">CA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product, i) => (
                        <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/40">
                          <td className="px-6 py-4 font-medium text-white">{product.nom}</td>
                          <td className="px-6 py-4 text-blue-400">${product.prix?.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                product.stock > 20
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : product.stock > 5
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{product.nombreVentes || 0}</td>
                          <td className="px-6 py-4 text-emerald-400">
                            ${product.chiffreAffaires?.toLocaleString() || '0'}
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
          {activeSection === 'sales' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">💰 Analytique des Ventes</h3>

              <div className="grid lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                  title="Ventes totales"
                  value={dashboardStats?.totalVentes || 0}
                  icon={<span>🛒</span>}
                  color="blue"
                />
                <StatCard
                  title="Chiffre d'affaires"
                  value={`$${(dashboardStats?.chiffreAffaires || 0).toLocaleString()}`}
                  icon={<span>💰</span>}
                  color="green"
                />
                <StatCard
                  title="Panier moyen"
                  value={`$${kpiData?.averageOrderValue?.toFixed(2) || '0.00'}`}
                  icon={<span>🛍️</span>}
                  color="purple"
                />
                <StatCard
                  title="Taux conversion"
                  value={`${kpiData?.conversionRate?.toFixed(1) || '0.0'}%`}
                  icon={<span>📈</span>}
                  color="yellow"
                />
              </div>

              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
                <h4 className="text-xl font-bold mb-6 text-white">Évolution Mensuelle des Ventes</h4>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="mois" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="ventes"
                      name="Ventes"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Tendances */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h4 className="text-xl font-bold mb-6 text-white">Tendances par Période</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {trends.map((trend, i) => (
                    <div key={i} className="bg-slate-700/40 rounded-lg p-4 text-center">
                      <p className="text-slate-400 text-sm">{trend.period}</p>
                      <p className="text-xl font-bold text-white">${trend.value.toLocaleString()}</p>
                      <p className={`text-xs font-semibold ${trend.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trend.change >= 0 ? '↗' : '↘'} {Math.abs(trend.change)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CLIENTS */}
          {activeSection === 'clients' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">👥 Analyse Clients</h3>

              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h4 className="text-lg font-bold mb-6 text-white">Top Clients par CA</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bestClients.slice(0, 8)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                      <YAxis dataKey="nom" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="chiffreAffaires" name="CA ($)" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h4 className="text-lg font-bold mb-6 text-white">Métriques Clients</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/40 rounded-lg">
                      <span className="text-slate-300">Clients totaux</span>
                      <span className="text-xl font-bold text-white">{dashboardStats?.totalClients || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/40 rounded-lg">
                      <span className="text-slate-300">Taux rétention</span>
                      <span className="text-xl font-bold text-white">
                        {kpiData?.customerRetention?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/40 rounded-lg">
                      <span className="text-slate-300">Score NPS</span>
                      <span className="text-xl font-bold text-white">
                        {kpiData?.npsScore?.toFixed(1) || '0.0'}/10
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/40 rounded-lg">
                      <span className="text-slate-300">Panier moyen</span>
                      <span className="text-xl font-bold text-white">
                        ${kpiData?.averageOrderValue?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste clients */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h4 className="text-lg font-bold mb-6 text-white">Détail Clients</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bestClients.map((client, i) => (
                    <div key={i} className="bg-slate-700/40 rounded-lg p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">{client.nom?.charAt(0) || 'C'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{client.nom}</p>
                        <p className="text-xs text-slate-400">{client.nombreVentes || 0} achats</p>
                      </div>
                      <p className="text-lg font-bold text-emerald-400">
                        ${client.chiffreAffaires?.toLocaleString() || '0'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CATÉGORIES */}
          {activeSection === 'categories' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">📊 Analyse par Catégorie</h3>

              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h4 className="text-lg font-bold mb-6 text-white">Distribution CA par Catégorie</h4>
                  <ResponsiveContainer width="100%" height={350}>
                    <RechartsPie>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <h4 className="text-lg font-bold mb-6 text-white">Performance par Catégorie</h4>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={categoriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="nom" stroke="#94a3b8" fontSize={11} angle={-45} textAnchor="end" height={60} />
                      <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '8px',
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
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Détail catégories */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h4 className="text-lg font-bold mb-6 text-white">Détail par Catégorie</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoriesData.map((cat, i) => (
                    <div key={i} className="bg-slate-700/40 rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <h5 className="font-bold text-white text-lg">{cat.nom}</h5>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Produits</span>
                          <span className="text-white font-semibold">{cat.nbProduits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">CA</span>
                          <span className="text-emerald-400 font-semibold">
                            ${cat.chiffreAffaires?.toLocaleString() || '0'}
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
          {activeSection === 'reports' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">📄 Rapports et Exports</h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Rapport Mensuel', desc: 'Performance complète', icon: '📅' },
                  { title: 'Analyse Produits', desc: 'Top produits et stock', icon: '📦' },
                  { title: 'Analyse Clients', desc: 'Comportement et fidélité', icon: '👥' },
                  { title: 'Rapport Financier', desc: 'CA, marges et profits', icon: '💰' },
                  { title: 'Analyse Catégories', desc: 'Performance par catégorie', icon: '📊' },
                  { title: 'Rapport Complet', desc: 'Toutes les données', icon: '📁' },
                ].map((report, i) => (
                  <div key={i} className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-all">
                    <div className="flex flex-col items-center text-center">
                      <div className="text-4xl mb-4">{report.icon}</div>
                      <h4 className="text-lg font-bold text-white mb-2">{report.title}</h4>
                      <p className="text-sm text-slate-400 mb-4">{report.desc}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => exportData('csv')}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                        >
                          CSV
                        </button>
                        <button
                          onClick={() => exportData('json')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                        >
                          JSON
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default AnalysteDashboard;
