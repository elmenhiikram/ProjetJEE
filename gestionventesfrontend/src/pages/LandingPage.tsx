import { useState, useEffect } from "react"
import {
  Zap,
  Shield,
  Truck,
  HeadphonesIcon,
  Star,
  ShoppingBag,
  Sparkles,
  Award,
  Smartphone,
  Laptop,
  Headphones,
  Gamepad2,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  MapPin,
  Phone,
  Loader,
  Heart,
  ShoppingCart,
  User,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Wifi,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { productApi } from "../api/productApi"

interface Product {
  id: number
  nom: string
  description: string
  prix: number
  image?: string
  quantite?: number
  categorie?: {
    id: number
    nom: string
  }
  rating?: number
}

export default function LandingPage() {
  const navigate = useNavigate()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState({ days: 15, hours: 10, mins: 56, secs: 54 })

  const categories = [
    { name: "Phones", icon: Smartphone, color: "from-blue-500 to-cyan-500" },
    { name: "Computers", icon: Laptop, color: "from-purple-500 to-pink-500" },
    { name: "Accessories", icon: Headphones, color: "from-orange-500 to-red-500" },
    { name: "Laptops", icon: Laptop, color: "from-green-500 to-emerald-500" },
    { name: "Monitors", icon: Monitor, color: "from-yellow-500 to-orange-500" },
    { name: "Networking", icon: Wifi, color: "from-indigo-500 to-purple-500" },
    { name: "PC Gaming", icon: Gamepad2, color: "from-teal-500 to-cyan-500" },
  ]

  const features = [
    {
      icon: Shield,
      title: "Paiements Sécurisés",
      description: "Transactions 100% sécurisées avec cryptage",
    },
    {
      icon: Truck,
      title: "Livraison Rapide",
      description: "Expédition express sous 24-48 heures",
    },
    {
      icon: Award,
      title: "Qualité Premium",
      description: "Produits authentiques avec garantie",
    },
    {
      icon: HeadphonesIcon,
      title: "Support 24/7",
      description: "Service client expert à tout moment",
    },
  ]

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await productApi.getAll()
        // Limiter à 8 produits pour la landing page
        const productsData: Product[] = Array.isArray(response.data) 
          ? response.data.filter((p) => p.id !== undefined).slice(0, 8) as Product[]
          : []
        setProducts(productsData)
        setError(null)
      } catch (err) {
        console.error('Erreur lors de la récupération des produits:', err)
        setError('Impossible de charger les produits.')
        // Fallback avec produits par défaut
        setProducts([
          {
            id: 1,
            nom: "Casque Sans Fil Pro",
            description: "Son premium avec réduction de bruit active",
            prix: 299,
            rating: 4.8,
            quantite: 15,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
          },
          {
            id: 2,
            nom: "Montre Connectée Ultra",
            description: "Suivi santé avancé et surveillance fitness",
            prix: 449,
            rating: 4.9,
            quantite: 8,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
          },
          {
            id: 3,
            nom: "Caméra Action 4K",
            description: "Capturez les moments de la vie en détails époustouflants",
            prix: 379,
            rating: 4.7,
            quantite: 12,
            image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
          },
          {
            id: 4,
            nom: "Laptop Gaming Pro",
            description: "Performances gaming haute puissance en déplacement",
            prix: 1499,
            rating: 4.9,
            quantite: 5,
            image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let { days, hours, mins, secs } = prev
        secs--
        if (secs < 0) {
          secs = 59
          mins--
        }
        if (mins < 0) {
          mins = 59
          hours--
        }
        if (hours < 0) {
          hours = 23
          days--
        }
        if (days < 0) {
          days = 0
          hours = 0
          mins = 0
          secs = 0
        }
        return { days, hours, mins, secs }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getBadge = (index: number) => {
    const badges = ["30% Off", "20% Off", "15% Off", "25% Off"]
    return badges[index] || "Sale"
  }

  const getOriginalPrice = (price: number, index: number) => {
    const discounts = [0.3, 0.2, 0.15, 0.25]
    const discount = discounts[index] || 0.2
    return (price / (1 - discount)).toFixed(2)
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 -z-20" />
      <div className="fixed inset-0 opacity-20 -z-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full filter blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes shimmer { 0%, 100% { background-position: 200% 0; } 50% { background-position: -200% 0; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); } 50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.5); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-shimmer { background-size: 200% auto; animation: shimmer 3s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
      `}</style>

      {/* Top Bar */}
      <div className="bg-slate-900/80 border-b border-slate-800/50 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm">
          <div className="flex items-center gap-4 text-slate-400">
            <span>Français</span>
            <span>EUR</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-blue-400 transition-colors">Aide</button>
            <button onClick={() => navigate('/signup')} className="text-slate-400 hover:text-blue-400 transition-colors">
              Rejoignez-nous
            </button>
            <button onClick={() => navigate('/login')} className="text-slate-400 hover:text-blue-400 transition-colors">
              Connexion
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative w-11 h-11 animate-glow rounded-xl flex items-center justify-center font-bold text-slate-950 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 shadow-lg shadow-blue-500/25">
                <Zap className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent animate-shimmer">
                TechShop
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('/')} className="text-white font-medium hover:text-blue-400 transition-colors border-b-2 border-blue-400 pb-1">
                Accueil
              </button>
              <button onClick={() => navigate('/login')} className="text-slate-300 font-medium hover:text-blue-400 transition-colors">Boutique</button>
              <button className="text-slate-300 font-medium hover:text-blue-400 transition-colors">À propos</button>
              <button className="text-slate-300 font-medium hover:text-blue-400 transition-colors">Contact</button>
            </nav>

            {/* Header Icons */}
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-300 hover:text-blue-400 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-300 hover:text-blue-400 transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-xs text-white flex items-center justify-center">
                  0
                </span>
              </button>
              <button onClick={() => navigate('/login')} className="p-2 text-slate-300 hover:text-blue-400 transition-colors">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-sm">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span className="text-white text-sm">Collection Premium 2025</span>
              </div>

              <h1 className="text-4xl font-black text-white">
                {products[0]?.nom || "Casque Sans Fil"}
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Premium
                </span>
              </h1>

              <button
                onClick={() => navigate('/signup')}
                className="group px-6 py-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-white font-semibold flex items-center gap-2 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Acheter Maintenant
              </button>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-slate-900"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-slate-400 text-sm">100+ Avis</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-4 right-4 z-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl px-4 py-2 text-white">
                <span className="text-xs">À partir de</span>
                <p className="text-2xl font-black">{products[0]?.prix || 49}€</p>
              </div>

              <div className="relative h-80 lg:h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                <img
                  src={products[0]?.image || "/placeholder.svg?height=400&width=500"}
                  alt={products[0]?.nom || "Produit en vedette"}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute -bottom-4 right-0 flex gap-2">
                {products.slice(1, 3).map((product) => (
                  <div
                    key={product.id}
                    className="w-16 h-16 rounded-xl bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 overflow-hidden"
                  >
                    <img
                      src={product.image || `/placeholder.svg?height=64&width=64`}
                      alt={product.nom}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 lg:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-400 text-sm mb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full" />
                Catégories
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Parcourir par{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Catégorie
                </span>
              </h2>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {categories.map((category, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 group-hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center">
                  <category.icon className="w-10 h-10 text-slate-400 group-hover:text-blue-400 mb-3 transition-colors" />
                  <p className="text-xs font-semibold text-slate-300 group-hover:text-white text-center transition-colors">
                    {category.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner with Countdown */}
      <section className="py-12 lg:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 lg:p-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-red-400 text-sm">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  Ne ratez pas!
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white">
                  Améliorez Votre
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Expérience Musicale
                  </span>
                </h2>

                <div className="flex gap-3">
                  {[
                    { value: countdown.days, label: "Jour" },
                    { value: countdown.hours, label: "Hrs" },
                    { value: countdown.mins, label: "Min" },
                    { value: countdown.secs, label: "Sec" },
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="w-14 h-14 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center">
                        <span className="text-xl font-black text-white">{item.value.toString().padStart(2, "0")}</span>
                      </div>
                      <span className="text-xs text-slate-400 mt-1">{item.label}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Découvrez-le!
                </button>
              </div>

              <div className="relative h-64 lg:h-80">
                <img
                  src={products[0]?.image || "/placeholder.svg?height=320&width=400"}
                  alt="Produit vedette"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid Section */}
      <section className="py-12 lg:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-400 text-sm mb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full" />
                Nos Produits
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Explorez nos{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Produits
                </span>
              </h2>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product, index) => (
                  <div key={product.id} className="group relative">
                    <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-700/50 group-hover:border-blue-500/50 transition-all duration-300 shadow-lg">
                      <div className="relative h-44 md:h-52 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.nom}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-lg font-bold">
                          {getBadge(index)}
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < Math.round(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
                            />
                          ))}
                          <span className="text-xs text-slate-500 ml-1">({Math.floor(Math.random() * 50) + 10})</span>
                        </div>

                        <h3 className="text-sm font-semibold text-white line-clamp-1">{product.nom}</h3>

                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            {product.prix}€
                          </span>
                          <span className="text-sm text-slate-500 line-through">
                            {getOriginalPrice(product.prix, index)}€
                          </span>
                        </div>

                        <div className="flex gap-1.5 pt-1">
                          <div className="w-3 h-3 rounded-full bg-red-500 border border-slate-600" />
                          <div className="w-3 h-3 rounded-full bg-blue-500 border border-slate-600" />
                          <div className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-10">
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 rounded-full text-white font-semibold backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5"
                >
                  Voir Tous les Produits
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 lg:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/25">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-xl mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Zap className="w-5 h-5 text-slate-950" />
                </div>
                <h3 className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  TechShop
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Votre destination de confiance pour la technologie et l'innovation premium.
              </p>
              <div className="flex gap-3">
                <button className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-200 group">
                  <Instagram className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </button>
                <button className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-200 group">
                  <Facebook className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </button>
                <button className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-200 group">
                  <Twitter className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm">Boutique</h4>
              <ul className="space-y-2">
                <li><button className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Tous les Produits</button></li>
                <li><button className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Meilleures Ventes</button></li>
                <li><button className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Nouveautés</button></li>
                <li><button className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Offres</button></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm">Entreprise</h4>
              <ul className="space-y-2">
                <li><button className="text-slate-400 hover:text-blue-400 text-sm transition-colors">À Propos</button></li>
                <li><button className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Contact</button></li>
                <li><button className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Conditions</button></li>
                <li><button className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Confidentialité</button></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-sm">support@techshop.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-sm">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-sm">123 Tech Street, Silicon Valley, CA 94025</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">© 2025 TechShop. Tous droits réservés.</p>
            <div className="flex gap-6">
              <button className="text-slate-500 hover:text-blue-400 text-sm transition-colors">Confidentialité</button>
              <button className="text-slate-500 hover:text-blue-400 text-sm transition-colors">Conditions</button>
              <button className="text-slate-500 hover:text-blue-400 text-sm transition-colors">Cookies</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
