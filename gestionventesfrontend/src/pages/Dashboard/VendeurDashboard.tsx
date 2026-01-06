import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/charts/StatCard';

const VendeurDashboard = () => {
  const navigate = useNavigate();
  const [stats, _setStats] = useState({
    mySales: 45,
    myRevenue: 23450,
    myClients: 18,
    commission: 2345,
  });

  return (
    <>
      <div className="mb-6">
        <p className="text-gray-400 mt-2">Suivez vos performances et vos ventes</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Mes Ventes"
          value={stats.mySales}
          icon={<span>🛍️</span>}
          color="blue"
          trend={{ value: 15.3, isPositive: true }}
        />
        <StatCard
          title="Mon Chiffre d'Affaires"
          value={`${stats.myRevenue.toLocaleString()}€`}
          icon={<span>💵</span>}
          color="green"
          trend={{ value: 12.1, isPositive: true }}
        />
        <StatCard
          title="Mes Clients"
          value={stats.myClients}
          icon={<span>👤</span>}
          color="purple"
        />
        <StatCard
          title="Commission"
          value={`${stats.commission}€`}
          icon={<span>💰</span>}
          color="yellow"
          trend={{ value: 8.5, isPositive: true }}
        />
      </div>
    </>
  );
};

export default VendeurDashboard;
