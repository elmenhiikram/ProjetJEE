import { useEffect, useState } from 'react';
import StatCard from '../../components/charts/StatCard';
import { dashboardApi, type DashboardStats } from '../../api/dashboardApi';

const InvestisseurDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await dashboardApi.getStats();
        setStats(res.data);
      } catch (e) {
        // Si l'endpoint n'est pas dispo, on garde un dashboard minimal.
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <p className="text-gray-400 mb-6">Vue d'ensemble de vos investissements</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Investissements"
              value={stats?.totalInvestments ?? 0}
              icon={<span>💼</span>}
              color="blue"
            />
            <StatCard
              title="Produits"
              value={stats?.totalProducts ?? 0}
              icon={<span>📦</span>}
              color="purple"
            />
            <StatCard
              title="Revenu Total"
              value={`${(stats?.totalRevenue ?? 0).toLocaleString()} DH`}
              icon={<span>📈</span>}
              color="green"
            />
            <StatCard
              title="Ventes"
              value={stats?.totalSales ?? 0}
              icon={<span>💰</span>}
              color="yellow"
            />
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-2">Accès rapide</h3>
            <p className="text-sm text-slate-300">
              Utilisez le menu à gauche pour accéder à la Gestion des Investissements.
            </p>
          </div>
        </>
      )}
    </>
  );
};

export default InvestisseurDashboard;
