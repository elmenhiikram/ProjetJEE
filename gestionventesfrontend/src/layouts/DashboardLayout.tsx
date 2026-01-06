import { useState, useEffect } from 'react';
import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/common/Sidebar';
import DashboardNavbar from '@/components/common/DashboardNavbar';

type OutletContext = {
  setClientDashboardState: (state: {
    activeSection: string;
    setActiveSection: (section: string) => void;
    cartCount: number;
  }) => void;
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [clientDashboardState, setClientDashboardState] = useState<{
    activeSection: string;
    setActiveSection: (section: string) => void;
    cartCount: number;
  } | null>(null);
  const location = useLocation();

  // Mapper les routes aux titres
  useEffect(() => {
    const pathToTitle: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/dashboard/admin': 'Dashboard Admin',
      '/dashboard/vendeur': 'Dashboard Vendeur',
      '/dashboard/analyste': 'Dashboard Analyste',
      '/dashboard/client': 'Dashboard Client',
      '/dashboard/investisseur': 'Dashboard Investisseur',
      '/products': 'Gestion des Produits',
      '/sales': 'Gestion des Ventes',
      '/shop': 'Boutique',
      '/gestion/clients': 'Gestion des Clients',
      '/gestion/categories': 'Gestion des Catégories',
      '/gestion/ventes': 'Gestion des Ventes',
      '/gestion/products': 'Gestion des Produits',
      '/gestion/produits': 'Gestion des Produits',
      '/gestion/roles': 'Gestion des Rôles',
      '/gestion/investissements': 'Gestion des Investissements',
      '/gestion/employes': 'Gestion des Employés',
      '/profile': 'Mon Profil',
    };

    const path = location.pathname;
    const title = pathToTitle[path] || 'Dashboard';
    setPageTitle(title);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={clientDashboardState?.activeSection}
        setActiveSection={clientDashboardState?.setActiveSection}
        cartCount={clientDashboardState?.cartCount}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <header className="flex items-center justify-between gap-4 p-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-300 hover:text-white"
              aria-label="Ouvrir le menu"
            >
              <Menu />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{pageTitle}</h1>
            </div>
          </div>

          <DashboardNavbar />
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet context={{ setClientDashboardState } satisfies OutletContext} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

export function useClientDashboard() {
  return useOutletContext<OutletContext>();
}
