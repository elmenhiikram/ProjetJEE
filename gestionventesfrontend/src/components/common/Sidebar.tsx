import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  UserCog,
  Shield,
  Briefcase,
  Layers,
  DollarSign,
  Zap,
  X,
  TrendingDown,
} from 'lucide-react';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { path: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/gestion/roles', label: 'Gestion des Rôles', icon: Shield },
        { path: '/gestion/employes', label: 'Gestion des Employés', icon: UserCog },
        { path: '/gestion/categories', label: 'Gestion des Catégories', icon: Layers },
        { path: '/gestion/investisseurs', label: 'Gestion des Investisseurs', icon: Briefcase },
        { path: '/gestion/investissements', label: 'Gestion des Investissements', icon: TrendingDown },
        { path: '/gestion/produits', label: 'Gestion des Produits', icon: Package },
        { path: '/gestion/clients', label: 'Gestion des Clients', icon: Users },
        { path: '/gestion/ventes', label: 'Gestion des Ventes', icon: DollarSign },
      ];
    }

    if (user?.role === 'vendeur') {
      return [
        { path: '/dashboard/vendeur', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/gestion/ventes', label: 'Gestion des Ventes', icon: DollarSign },
        { path: '/gestion/clients', label: 'Gestion des Clients', icon: Users },
      ];
    }

    if (user?.role === 'analyste') {
      return [
        { path: '/dashboard/analyste', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/sales', label: 'Analyses Ventes', icon: TrendingUp },
        { path: '/reports', label: 'Rapports', icon: TrendingUp },
      ];
    }

    if (user?.role === 'client') {
      return [
        { path: '/dashboard/client', label: 'Mon Espace', icon: LayoutDashboard },
        { path: '/products', label: 'Catalogue', icon: ShoppingBag },
        { path: '/my-orders', label: 'Mes Commandes', icon: ShoppingCart },
      ];
    }

    if (user?.role === 'investisseur') {
      return [
        { path: '/dashboard/investisseur', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/gestion/investissements', label: 'Gestion des Investissements', icon: TrendingDown },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50
        bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
              <Zap className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                TechShop
              </h2>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
