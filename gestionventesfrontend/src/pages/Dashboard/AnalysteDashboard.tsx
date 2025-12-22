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
