import { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import StatCard from '../../components/charts/StatCard';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import LineChart from '../../components/charts/LineChart';
import Loader from '../../components/common/Loader';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Ventes"
          value={stats?.totalSales || 0}
          icon="💰"
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Revenu Total"
          value={`${stats?.totalRevenue || 0}€`}
          icon="📈"
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Produits"
          value={stats?.totalProducts || 0}
          icon="📦"
          color="purple"
        />
        <StatCard
          title="Clients"
          value={stats?.totalClients || 0}
          icon="👥"
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Ventes par Mois</h2>
          <LineChart
            data={{
              labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
              datasets: [
                {
                  label: 'Ventes',
                  data: [12, 19, 3, 5, 2, 3],
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                },
              ],
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Ventes par Catégorie</h2>
          <PieChart
            data={{
              labels: ['Électronique', 'Vêtements', 'Alimentation', 'Autres'],
              datasets: [
                {
                  label: 'Ventes',
                  data: [300, 150, 100, 50],
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                  ],
                  borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                  ],
                },
              ],
            }}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Produits les Plus Vendus</h2>
        <BarChart
          data={{
            labels: ['Produit A', 'Produit B', 'Produit C', 'Produit D', 'Produit E'],
            datasets: [
              {
                label: 'Quantité Vendue',
                data: [65, 59, 80, 81, 56],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgb(59, 130, 246)',
              },
            ],
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
