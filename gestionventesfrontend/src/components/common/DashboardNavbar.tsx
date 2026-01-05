import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { clientApi } from '../../api/clientApi';
import { employeeApi } from '../../api/employeeApi';
import { investorApi } from '../../api/investorApi';

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [imgOk, setImgOk] = useState(true);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setImgOk(true);
  }, [photoUrl]);

  useEffect(() => {
    const onClickOutside = (evt: MouseEvent) => {
      if (!showDropdown) return;
      const target = evt.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    const loadPhoto = async () => {
      if (!user?.id) {
        setPhotoUrl(null);
        return;
      }

      try {
        if (user.role === 'client') {
          const res = await clientApi.getById(user.id);
          setPhotoUrl(res.data.photoUrl?.trim() || null);
          return;
        }

        if (user.role === 'vendeur' || user.role === 'analyste' || user.role === 'admin') {
          const res = await employeeApi.getById(user.id);
          setPhotoUrl(res.data.photoUrl?.trim() || null);
          return;
        }

        if (user.role === 'investisseur') {
          const res = await investorApi.getById(user.id);
          setPhotoUrl(res.data.photoUrl?.trim() || null);
          return;
        }

        setPhotoUrl(null);
      } catch {
        setPhotoUrl(null);
      }
    };

    loadPhoto();
  }, [user?.id, user?.role]);

  const handleLogout = () => {
    setShowDropdown(false);
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  const goProfile = () => {
    setShowDropdown(false);
    navigate('/profile');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setShowDropdown((v) => !v)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
        aria-label="Ouvrir le menu profil"
      >
        <div className="w-9 h-9 rounded-full bg-slate-700/60 border border-slate-600 flex items-center justify-center overflow-hidden">
          {photoUrl && imgOk ? (
            <img
              src={photoUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={() => setImgOk(false)}
            />
          ) : (
            <UserIcon className="w-5 h-5 text-slate-200" />
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-slate-300" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl py-2 z-50 border border-slate-700">
          <button
            type="button"
            onClick={goProfile}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
          >
            <UserIcon className="w-4 h-4" />
            Profil
          </button>
          <hr className="my-2 border-slate-700" />
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardNavbar;
