import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Heart,
  Star,
  Search,
  Package,
  Settings,
  Calendar,
  Clock,
  Check,
  Home,
  Loader,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { productApi, type Product } from "../../api/productApi";
import { categoryApi, type Category } from "../../api/categoryApi";
import { clientApi, type Client } from "../../api/clientApi";
import { saleApi, type SaleRequest } from "../../api/saleApi";
import { fetchCustomerPurchases, type CustomerPurchase } from "../../services/clientService";

interface CartItem extends Product {
  quantity: number;
}

interface ProfileData {
  nom: string;
  prenom: string;
  email: string;
  numeroTel: string;
  address: string;
}

const ClientDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [sales, setSales] = useState<CustomerPurchase[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [editingProfile, setEditingProfile] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    nom: user?.name || "Client",
    prenom: "",
    email: user?.email || "",
    numeroTel: "",
    address: "",
  });

  // Persistance du panier
  const saveCartToLocalStorage = (cartItems: CartItem[]) => {
    try {
      localStorage.setItem("user_cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Erreur sauvegarde panier:", error);
    }
  };

  const loadCartFromLocalStorage = (): CartItem[] => {
    try {
      const savedCart = localStorage.getItem("user_cart");
      if (savedCart) {
        return JSON.parse(savedCart);
      }
    } catch (error) {
      console.error("Erreur chargement panier:", error);
    }
    return [];
  };

  // Mise à jour du stock
  const updateProductStock = async (productId: number, quantityToRemove: number): Promise<boolean> => {
    try {
      const response = await productApi.getById(productId);
      const product = response.data;
      const currentStock = product.quantite || 0;
      const newStock = Math.max(0, currentStock - quantityToRemove);

      await productApi.update(productId, {
        ...product,
        quantite: newStock,
      });

      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === productId ? { ...p, quantite: newStock } : p
        )
      );

      return true;
    } catch (error) {
      console.error("Erreur mise à jour stock:", error);
      return false;
    }
  };

  // Charger les produits
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productApi.getAll();
      setProducts(response.data || []);
      setFilteredProducts(response.data || []);
    } catch (error) {
      console.error("Erreur chargement produits:", error);
      setErrorMessage("Impossible de charger les produits");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Charger les catégories
  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Erreur chargement catégories:", error);
      setCategories([]);
    }
  };

  // Charger les données du client
  const fetchClientData = async () => {
    try {
      setLoadingData(true);

      const email = user?.email;
      if (!email) {
        console.error("Email utilisateur non disponible");
        return;
      }

      const clientResponse = await clientApi.getByEmail(email);

      if (clientResponse.data) {
        const client = clientResponse.data;
        setClientData(client);

        setProfileData({
          nom: client.nom || user?.name || "Client",
          prenom: client.prenom || "",
          email: client.email || user?.email || "",
          numeroTel: client.numeroTel || "",
          address: client.address || "",
        });

        const clientId = client.id;
        if (clientId) {
          try {
            const salesData = await fetchCustomerPurchases(clientId);

            setSales(salesData);

            const spent = salesData.reduce(
              (sum, sale) => sum + sale.quantite * (sale.produit?.prix ?? 0),
              0
            );
            setTotalSpent(spent);
            setTotalOrders(salesData.length);
          } catch (error) {
            console.error("Erreur lors de la récupération des ventes:", error);
            setSales([]);
            setTotalSpent(0);
            setTotalOrders(0);
          }
        }
      }
    } catch (error) {
      console.error("Erreur chargement données client:", error);
      setErrorMessage("Impossible de charger les données du client");
      setSales([]);
      setTotalSpent(0);
      setTotalOrders(0);
    } finally {
      setLoadingData(false);
    }
  };

  // Gestion du checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setErrorMessage("Votre panier est vide");
      return;
    }

    try {
      const clientId = clientData?.id;

      if (!clientId) {
        setErrorMessage("Impossible d'identifier le client. Veuillez vous reconnecter.");
        return;
      }

      const now = new Date();
      const dateVente = now.toISOString().split("T")[0];
      const timeString = now.toTimeString();
      const heureVente = timeString.split(" ")[0];

      // Mettre à jour le stock pour chaque produit
      for (const item of cart) {
        if (item.id) {
          const success = await updateProductStock(item.id, item.quantity);
          if (!success) {
            setErrorMessage(`Erreur mise à jour stock pour ${item.nom}`);
            return;
          }
        }
      }

      // Créer les ventes
      const ventePromises = cart.map((item) => {
        if (!item.id) return Promise.resolve();
        
        const venteData: SaleRequest = {
          clientId: clientId,
          produitId: item.id,
          dateVente: dateVente,
          heureVente: heureVente,
          quantite: item.quantity,
        };

        return saleApi.create(venteData);
      });

      await Promise.all(ventePromises);

      setSuccessMessage("Commande confirmée avec succès !");
      setCart([]);
      localStorage.removeItem("user_cart");
      await fetchClientData();
      await fetchProducts();
      setTimeout(() => setActiveSection("ventes"), 2000);
    } catch (error) {
      setErrorMessage("Impossible de confirmer la commande: " + (error as Error).message);
      console.error("Checkout error:", error);
    }
  };

  // Gestion du profil
  const handleProfileSave = async () => {
    try {
      if (clientData?.id) {
        const updatedClient: Client = {
          ...clientData,
          nom: profileData.nom,
          prenom: profileData.prenom,
          email: profileData.email,
          numeroTel: profileData.numeroTel,
          address: profileData.address,
        };

        await clientApi.update(clientData.id, updatedClient);
        setClientData(updatedClient);
      }

      setEditingProfile(false);
      setSuccessMessage("Profil mis à jour avec succès !");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
      setErrorMessage("Impossible de mettre à jour le profil");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Initialisation
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoadingData(true);

      await Promise.all([fetchProducts(), fetchCategories()]);

      const savedCart = loadCartFromLocalStorage();
      if (savedCart.length > 0) {
        setCart(savedCart);
      }

      if (user?.email) {
        await fetchClientData();
      }

      setLoadingData(false);
    };

    initializeDashboard();
  }, [user?.email]);

  // Fonctions de filtrage
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    filterProducts(value, selectedCategory);
  };

  const handleCategoryFilter = (catId: string) => {
    setSelectedCategory(catId);
    filterProducts(searchTerm, catId);
  };

  const filterProducts = (search: string, catId: string) => {
    let filtered = products;

    if (catId !== "all") {
      filtered = filtered.filter((p) => p.categorie?.id === parseInt(catId));
    }

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.nom?.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  // Gestion de la wishlist
  const toggleWishlist = (productId: number) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Gestion du panier
  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    let newCart: CartItem[];

    if (existingItem) {
      newCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    saveCartToLocalStorage(newCart);
    setSuccessMessage(`${product.nom} ajouté au panier !`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const removeFromCart = (productId: number) => {
    const newCart = cart.filter((item) => item.id !== productId);
    setCart(newCart);
    saveCartToLocalStorage(newCart);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    let newCart: CartItem[];
    if (quantity <= 0) {
      newCart = cart.filter((item) => item.id !== productId);
    } else {
      newCart = cart.map((item) => (item.id === productId ? { ...item, quantity } : item));
    }
    setCart(newCart);
    saveCartToLocalStorage(newCart);
  };

  // Gestion des erreurs d'image
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, productName: string) => {
    e.currentTarget.src = `https://placehold.co/300x300/1e293b/ffffff?text=${encodeURIComponent(
      productName || "Produit"
    )}`;
    e.currentTarget.onerror = null;
  };

  // Calculs
  const cartTotal = cart.reduce((sum, item) => sum + (item.prix || 0) * item.quantity, 0);
  const productsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  const menuItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "ventes", label: "Mes Achats", icon: Package },
    { id: "products", label: "Shop", icon: ShoppingCart },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "cart", label: "Panier", icon: ShoppingCart },
    { id: "profile", label: "Profil", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Messages de succès/erreur */}
      {successMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-300 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300 text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Menu de navigation */}
      <div className="bg-slate-800/60 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
        <div className="flex flex-wrap gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeSection === item.id
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{item.label}</span>
                {item.id === "cart" && cart.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {productsInCart}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* OVERVIEW */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-black mb-2 text-white">Bienvenue, {profileData.nom}! 👋</h2>
            <p className="text-slate-400">Voici un aperçu de votre espace client</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Total Achats",
                value: totalOrders,
                icon: Package,
                color: "from-blue-600 to-cyan-600",
              },
              {
                label: "Total Dépensé",
                value: `$${totalSpent.toFixed(2)}`,
                icon: TrendingUp,
                color: "from-emerald-600 to-teal-600",
              },
              {
                label: "Wishlist",
                value: wishlist.length,
                icon: Heart,
                color: "from-red-600 to-pink-600",
              },
              {
                label: "Panier",
                value: productsInCart,
                icon: ShoppingCart,
                color: "from-purple-600 to-pink-600",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                      <p className="text-3xl font-black text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-xl font-bold mb-6 text-white">Derniers Achats</h3>
              <div className="space-y-3">
                {sales.slice(0, 3).map((sale) => (
                  <div
                    key={`${sale.client?.id ?? 'c'}-${sale.produit?.id ?? 'p'}-${sale.dateVente ?? 'd'}-${sale.heureVente ?? 't'}`}
                    className="flex items-center justify-between p-4 bg-slate-700/40 rounded-xl"
                  >
                    <div>
                      <p className="font-semibold text-white">{sale.produit?.nom || "Produit"}</p>
                      <p className="text-xs text-slate-400">
                        {sale.dateVente ? new Date(sale.dateVente).toLocaleDateString("fr-FR") : ""} à{" "}
                        {sale.heureVente}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">${(sale.quantite * (sale.produit?.prix ?? 0)).toFixed(2)}</p>
                      <p className="text-xs text-slate-400">{sale.quantite} unité(s)</p>
                    </div>
                  </div>
                ))}
                {sales.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-4">Aucun achat pour le moment</p>
                )}
              </div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-xl font-bold mb-6 text-white">Statut Compte</h3>
              <div className="space-y-3">
                {[
                  { label: "Statut", value: "Actif", color: "text-emerald-400" },
                  { label: "Type Client", value: "Standard", color: "text-white" },
                  { label: "Points Fidélité", value: `${totalOrders * 100} pts`, color: "text-blue-400" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between p-3 bg-slate-700/40 rounded-lg">
                    <span className="text-slate-400">{item.label}</span>
                    <span className={`font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MES ACHATS (VENTES) */}
      {activeSection === "ventes" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-black mb-2 text-white">Mes Achats</h2>
          {loadingData ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50">
              <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-medium">Aucun achat pour le moment</p>
              <button
                onClick={() => setActiveSection("products")}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold mt-4"
              >
                Commencer à acheter
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((sale) => (
                <div
                  key={`${sale.client?.id ?? 'c'}-${sale.produit?.id ?? 'p'}-${sale.dateVente ?? 'd'}-${sale.heureVente ?? 't'}`}
                  className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{sale.produit?.nom || "Produit"}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />{" "}
                          {sale.dateVente ? new Date(sale.dateVente).toLocaleDateString("fr-FR") : ""}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" /> {sale.heureVente}
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" /> {sale.quantite} article(s)
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        ${(sale.quantite * (sale.produit?.prix ?? 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SHOP PRODUCTS */}
      {activeSection === "products" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-black mb-2 text-white">Boutique</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher produits..."
                value={searchTerm || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/60 backdrop-blur-xl rounded-xl border border-slate-700/50 focus:border-blue-500/50 text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-slate-800/60 backdrop-blur-xl rounded-xl border border-slate-700/50 focus:border-blue-500/50 text-white focus:outline-none"
            >
              <option value="all">Toutes catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>

          {loadingProducts ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50">
              <ShoppingCart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-medium">Aucun produit trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-slate-800/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-700/50 hover:border-blue-500/50 transition-all"
                >
                  <div className="relative h-48 bg-slate-700 overflow-hidden">
                    <img
                      src={
                        product.image ||
                        `https://placehold.co/300x300/1e293b/ffffff?text=${encodeURIComponent(product.nom)}`
                      }
                      alt={product.nom}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => handleImageError(e, product.nom)}
                    />
                    <button
                      onClick={() => product.id && toggleWishlist(product.id)}
                      className="absolute top-3 right-3 p-2 bg-slate-900/80 rounded-xl hover:bg-red-500/20 transition-all"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          product.id && wishlist.includes(product.id)
                            ? "fill-red-500 text-red-500"
                            : "text-white"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-white line-clamp-2">{product.nom}</h3>
                    <p className="text-sm text-slate-400 line-clamp-1">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Catégorie: {product.categorie?.nom || "Non catégorisé"}
                      </span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < 4 ? "fill-yellow-400 text-yellow-400" : "text-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        ${product.prix?.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          (product.quantite || 0) > 0
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {(product.quantite || 0) > 0
                          ? `${product.quantite} en stock`
                          : "Rupture de stock"}
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={(product.quantite || 0) === 0}
                      className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        (product.quantite || 0) === 0
                          ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/50"
                      }`}
                    >
                      {(product.quantite || 0) === 0 ? "Rupture de stock" : "Ajouter au panier"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WISHLIST */}
      {activeSection === "wishlist" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-black mb-2 text-white">Ma Wishlist</h2>
          {wishlist.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50">
              <Heart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-medium">Votre wishlist est vide</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
                .filter((p) => p.id && wishlist.includes(p.id))
                .map((product) => (
                  <div
                    key={product.id}
                    className="group bg-slate-800/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-700/50 hover:border-blue-500/50 transition-all"
                  >
                    <div className="relative h-48 bg-slate-700 overflow-hidden">
                      <img
                        src={
                          product.image ||
                          `https://placehold.co/300x300/1e293b/ffffff?text=${encodeURIComponent(
                            product.nom
                          )}`
                        }
                        alt={product.nom}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => handleImageError(e, product.nom)}
                      />
                      <button
                        onClick={() => product.id && toggleWishlist(product.id)}
                        className="absolute top-3 right-3 p-2 bg-slate-900/80 rounded-xl hover:bg-red-500/20 transition-all"
                      >
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </button>
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-white line-clamp-2">{product.nom}</h3>
                      <p className="text-sm text-slate-400 line-clamp-1">{product.description}</p>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                          ${product.prix?.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={(product.quantite || 0) === 0}
                        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                          (product.quantite || 0) === 0
                            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/50"
                        }`}
                      >
                        {(product.quantite || 0) === 0 ? "Rupture de stock" : "Ajouter au panier"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* PANIER */}
      {activeSection === "cart" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-black mb-2 text-white">Mon Panier</h2>
          {cart.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50">
              <ShoppingCart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-medium">Votre panier est vide</p>
              <button
                onClick={() => setActiveSection("products")}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold mt-4"
              >
                Continuer vos achats
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
                  >
                    <div className="flex gap-4">
                      <img
                        src={
                          item.image ||
                          `https://placehold.co/100x100/1e293b/ffffff?text=${encodeURIComponent(item.nom)}`
                        }
                        alt={item.nom}
                        className="w-24 h-24 object-cover rounded-xl"
                        onError={(e) => handleImageError(e, item.nom)}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-2">{item.nom}</h3>
                        <p className="text-slate-400 text-sm mb-3">${item.prix?.toFixed(2)}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 bg-slate-700/60 rounded-xl p-1">
                            <button
                              onClick={() => item.id && updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 rounded-lg hover:bg-slate-600 transition-all"
                            >
                              <Minus className="w-4 h-4 text-white" />
                            </button>
                            <span className="px-3 font-semibold text-white">{item.quantity}</span>
                            <button
                              onClick={() => item.id && updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 rounded-lg hover:bg-slate-600 transition-all"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          </div>
                          <button
                            onClick={() => item.id && removeFromCart(item.id)}
                            className="p-2 rounded-xl hover:bg-red-500/20 text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">
                          ${((item.prix || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 sticky top-4">
                  <h3 className="text-xl font-bold mb-6 text-white">Résumé</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-slate-400">
                      <span>Sous-total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Livraison</span>
                      <span>Gratuite</span>
                    </div>
                    <div className="border-t border-slate-700 pt-3 flex justify-between text-white font-bold text-lg">
                      <span>Total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                  >
                    Confirmer la commande
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PROFIL */}
      {activeSection === "profile" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-black mb-2 text-white">Mon Profil</h2>
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Nom</label>
                  <input
                    type="text"
                    value={profileData.nom}
                    onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                    disabled={!editingProfile}
                    className="w-full px-4 py-3 bg-slate-700/60 rounded-xl border border-slate-600/50 text-white focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Prénom</label>
                  <input
                    type="text"
                    value={profileData.prenom}
                    onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                    disabled={!editingProfile}
                    className="w-full px-4 py-3 bg-slate-700/60 rounded-xl border border-slate-600/50 text-white focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!editingProfile}
                  className="w-full px-4 py-3 bg-slate-700/60 rounded-xl border border-slate-600/50 text-white focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Téléphone</label>
                <input
                  type="text"
                  value={profileData.numeroTel}
                  onChange={(e) => setProfileData({ ...profileData, numeroTel: e.target.value })}
                  disabled={!editingProfile}
                  className="w-full px-4 py-3 bg-slate-700/60 rounded-xl border border-slate-600/50 text-white focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Adresse</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  disabled={!editingProfile}
                  className="w-full px-4 py-3 bg-slate-700/60 rounded-xl border border-slate-600/50 text-white focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              {editingProfile ? (
                <>
                  <button
                    onClick={handleProfileSave}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold hover:shadow-lg transition-all"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="flex-1 py-3 bg-slate-700 rounded-xl text-white font-semibold hover:bg-slate-600 transition-all"
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-semibold hover:shadow-lg transition-all"
                >
                  Modifier le profil
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
