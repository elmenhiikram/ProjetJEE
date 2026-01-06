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
      '/dashboard': 'Tableau de Bord',
      '/dashboard/admin': 'Tableau de Bord Admin',
      '/dashboard/vendeur': 'Tableau de Bord Vendeur',
      '/dashboard/analyste': 'Tableau de Bord Analyste',
      '/dashboard/client': 'Tableau de Bord Client',
      '/dashboard/investisseur': 'Tableau de Bord Investisseur',
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
    let title = pathToTitle[path] || 'Tableau de Bord';
    
    // Si on est sur le dashboard client, utiliser la section active
    if (path === '/dashboard/client' && clientDashboardState?.activeSection) {
      const sectionTitles: { [key: string]: string } = {
        'overview': 'Vue d\'ensemble',
        'ventes': 'Mes Achats',
        'products': 'Boutique',
        'wishlist': 'Liste de Souhaits',
        'cart': 'Panier',
      };
      title = sectionTitles[clientDashboardState.activeSection] || 'Tableau de Bord Client';
    }
    
    setPageTitle(title);
  }, [location.pathname, clientDashboardState?.activeSection]);

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
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 flex items-center justify-between gap-4 p-4 border-b border-slate-700 bg-slate-800/95 backdrop-blur-sm">
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
        <main className="flex-1 p-6 overflow-y-auto">
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
