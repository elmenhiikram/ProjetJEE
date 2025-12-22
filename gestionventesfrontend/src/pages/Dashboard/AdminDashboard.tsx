import { useState, useEffect } from 'react';
import StatCard from '../../components/charts/StatCard';
import { dashboardApi } from '../../api/dashboardApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalClients: 0,
    totalEmployees: 0,
    totalInvestors: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <p className="text-gray-400 mb-6">
            Vue d'ensemble complète de la plateforme
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Ventes" value={stats.totalSales} icon={<span>💰</span>} color="blue" />
            <StatCard
              title="Revenu Total"
              value={`${stats.totalRevenue.toLocaleString()}€`}
              icon={<span>📈</span>}
              color="green"
            />
            <StatCard title="Produits" value={stats.totalProducts} icon={<span>📦</span>} color="purple" />
            <StatCard title="Clients" value={stats.totalClients} icon={<span>👥</span>} color="yellow" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard title="Employés" value={stats.totalEmployees} icon={<span>👔</span>} color="blue" />
            <StatCard title="Investisseurs" value={stats.totalInvestors} icon={<span>💼</span>} color="green" />
          </div>
        </>
      )}
    </>
  );
};

export default AdminDashboard;
