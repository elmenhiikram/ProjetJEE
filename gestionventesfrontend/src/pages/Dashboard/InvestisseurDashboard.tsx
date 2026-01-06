import { useEffect, useState } from 'react';
import { 
  Package, 
  TrendingUp, 
  Users, 
  Loader
} from 'lucide-react';
import StatCard from '../../components/charts/StatCard';
import { dashboardApi, type DashboardStats } from '../../api/dashboardApi';
import { clientApi, type Client } from '../../api/clientApi';
import { saleApi } from '../../api/saleApi';

const InvestisseurDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // États pour les clients
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  
  // États pour les ventes
  const [sales, setSales] = useState<any[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardApi.getStats();
        setStats(res.data);
      } catch (e) {
        setStats(null);
      }
    };

    load();
    fetchClients();
    fetchSales();
  }, []);

  // Charger les clients
  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await clientApi.getAll();
      // Trier les clients par ID croissant (du plus petit au plus grand)
      const sortedClients = (response.data || []).sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
      setClients(sortedClients);
    } catch (error) {
      console.error("Erreur chargement clients:", error);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  // Charger les ventes
  const fetchSales = async () => {
    try {
      setLoadingSales(true);
      const response = await saleApi.getAll();
      // Trier les ventes par ID décroissant (du plus grand au plus petit)
      const sortedSales = (response.data || []).sort((a: any, b: any) => (b.id || 0) - (a.id || 0));
      setSales(sortedSales);
    } catch (error) {
      console.error("Erreur chargement ventes:", error);
      setSales([]);
    } finally {
      setLoadingSales(false);
    }
  };

  return (
    <>
      <div className="space-y-8">
        {/* En-tête */}
        <div>
          <h2 className="text-3xl font-black mb-2 text-white">Dashboard Investisseur</h2>
          <p className="text-slate-400">Vue d'ensemble de vos investissements et opérations</p>
        </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* Section Gestion des Ventes */}
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              Gestion des Ventes
            </h3>
            {loadingSales ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400">Aucune vente enregistrée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">ID Client</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">ID Produit</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Produit</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Client</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Quantité</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.slice(0, 10).map((sale, idx) => (
                      <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4 text-slate-300">{sale.client?.id || '-'}</td>
                        <td className="py-3 px-4 text-slate-300">{sale.produit?.id || '-'}</td>
                        <td className="py-3 px-4 text-white">{sale.produit?.nom || "N/A"}</td>
                        <td className="py-3 px-4 text-slate-300">{sale.client?.nom || "N/A"} {sale.client?.prenom || ""}</td>
                        <td className="py-3 px-4 text-slate-300">{sale.quantite}</td>
                        <td className="py-3 px-4 text-slate-300">{sale.dateVente}</td>
                        <td className="py-3 px-4 text-emerald-400 font-semibold">
                          {((sale.quantite || 0) * (sale.produit?.prix || 0)).toFixed(2)} dhs
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section Gestion des Clients */}
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              Gestion des Clients
            </h3>
            {loadingClients ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400">Aucun client enregistré</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Nom</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Prénom</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Téléphone</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Adresse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.slice(0, 10).map((client) => (
                      <tr key={client.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4 text-white font-medium">{client.nom}</td>
                        <td className="py-3 px-4 text-slate-300">{client.prenom}</td>
                        <td className="py-3 px-4 text-slate-300">{client.email}</td>
                        <td className="py-3 px-4 text-slate-300">{client.numeroTel}</td>
                        <td className="py-3 px-4 text-slate-300">{client.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </div>
    </>
  );
};

export default InvestisseurDashboard;
