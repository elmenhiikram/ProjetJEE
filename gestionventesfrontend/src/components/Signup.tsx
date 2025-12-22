import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import type { SignupRequest } from '../api/authApi';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        photoUrl: '',
        userType: 'client' as 'client' | 'investisseur' | 'employe',
        role: '',

        // Champs spécifiques Investisseur
        ice: '',
        nomEntreprise: '',
        adresseEntreprise: '',
        numeroEntreprise: '',
        emailEntreprise: '',
        logoUrl: '',
        domaineEntreprise: '',
        capitalDisponible: '',

        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Clears message after a delay
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (message.text) setMessage({ text: '', type: '' });
    };

    // Handle Sign Up submission - REAL API CALL
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', type: '' });

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setMessage({ text: "Les mots de passe ne correspondent pas.", type: 'error' });
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setMessage({ text: "Le mot de passe doit contenir au moins 6 caractères.", type: 'error' });
            setIsLoading(false);
            return;
        }

        try {
            // Préparer les données pour l'API
            const { confirmPassword, ...dataToSend } = formData;
            
            const signupData: SignupRequest = {
                nom: dataToSend.nom,
                prenom: dataToSend.prenom,
                email: dataToSend.email,
                password: dataToSend.password,
                telephone: dataToSend.telephone,
                adresse: dataToSend.adresse,
                photoUrl: dataToSend.photoUrl || undefined,
                userType: dataToSend.userType,
                role: dataToSend.role || undefined,
            };

            if (dataToSend.userType === 'investisseur') {
                signupData.ice = dataToSend.ice || undefined;
                signupData.nomEntreprise = dataToSend.nomEntreprise || undefined;
                signupData.adresseEntreprise = dataToSend.adresseEntreprise || undefined;
                signupData.numeroEntreprise = dataToSend.numeroEntreprise || undefined;
                signupData.emailEntreprise = dataToSend.emailEntreprise || undefined;
                signupData.logoUrl = dataToSend.logoUrl || undefined;
                signupData.domaineEntreprise = dataToSend.domaineEntreprise || undefined;
                signupData.capitalDisponible = dataToSend.capitalDisponible
                    ? Number(dataToSend.capitalDisponible)
                    : undefined;
            }
            
            const result = await authApi.signup(signupData);
            console.log('✅ Signup successful:', result.data);
            
            setMessage({ text: "Inscription réussie ! Redirection vers la connexion...", type: 'success' });
            setFormData({
                nom: '',
                prenom: '',
                email: '',
                telephone: '',
                adresse: '',
                photoUrl: '',
                userType: 'client',
                role: '',
                ice: '',
                nomEntreprise: '',
                adresseEntreprise: '',
                numeroEntreprise: '',
                emailEntreprise: '',
                logoUrl: '',
                domaineEntreprise: '',
                capitalDisponible: '',
                password: '',
                confirmPassword: ''
            });
            
            // Navigate to login after success
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || "Erreur lors de l'inscription.";
            setMessage({ 
                text: errorMsg, 
                type: 'error' 
            });
            console.error('❌ Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-xl border border-slate-800/50 p-8 space-y-6 rounded-xl shadow-2xl shadow-black/20">
            {/* Message Box */}
            {message.text && (
                <div
                    className={`p-4 rounded-lg text-sm transition-opacity duration-300 ${
                        message.type === 'success'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                    role="alert"
                >
                    {message.text}
                </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-6">
                <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent text-center">Inscription</h2>

            {/* User Type Selection: Client or Investor */}
            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-200 mb-2 text-left">
                    Type de Compte <span className="text-red-400">*</span>
                </label>
                <select 
                    name="userType" 
                    value={formData.userType} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
                    disabled={isLoading}
                >
                    <option value="client">Client</option>
                    <option value="investisseur">Investisseur</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                        Nom <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        id="nom"
                        name="nom"
                        required
                        value={formData.nom}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="prenom" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                        Prénom <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        required
                        value={formData.prenom}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                    Email <span className="text-red-400">*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                    disabled={isLoading}
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                        Mot de passe <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                        Confirmer <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="col-span-2">
                <label htmlFor="telephone" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                    Téléphone
                </label>
                <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                    disabled={isLoading}
                />
            </div>

            <div className="col-span-2">
                <label htmlFor="adresse" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                    Adresse
                </label>
                <input
                    type="text"
                    id="adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                    disabled={isLoading}
                />
            </div>

            <div className="col-span-2">
                <label htmlFor="photoUrl" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                    Photo URL
                </label>
                <input
                    type="text"
                    id="photoUrl"
                    name="photoUrl"
                    value={formData.photoUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                    disabled={isLoading}
                />
            </div>

            {formData.userType === 'investisseur' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="ice" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                                ICE
                            </label>
                            <input
                                type="text"
                                id="ice"
                                name="ice"
                                value={formData.ice}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="capitalDisponible" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                                Capital disponible
                            </label>
                            <input
                                type="number"
                                id="capitalDisponible"
                                name="capitalDisponible"
                                value={formData.capitalDisponible}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="col-span-2">
                        <label htmlFor="nomEntreprise" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                            Nom entreprise
                        </label>
                        <input
                            type="text"
                            id="nomEntreprise"
                            name="nomEntreprise"
                            value={formData.nomEntreprise}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="col-span-2">
                        <label htmlFor="adresseEntreprise" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                            Adresse entreprise
                        </label>
                        <input
                            type="text"
                            id="adresseEntreprise"
                            name="adresseEntreprise"
                            value={formData.adresseEntreprise}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="numeroEntreprise" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                                Numéro entreprise
                            </label>
                            <input
                                type="text"
                                id="numeroEntreprise"
                                name="numeroEntreprise"
                                value={formData.numeroEntreprise}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="emailEntreprise" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                                Email entreprise
                            </label>
                            <input
                                type="email"
                                id="emailEntreprise"
                                name="emailEntreprise"
                                value={formData.emailEntreprise}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="logoUrl" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                                Logo URL
                            </label>
                            <input
                                type="text"
                                id="logoUrl"
                                name="logoUrl"
                                value={formData.logoUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="domaineEntreprise" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                                Domaine
                            </label>
                            <input
                                type="text"
                                id="domaineEntreprise"
                                name="domaineEntreprise"
                                value={formData.domaineEntreprise}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm placeholder-slate-500"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>
            )}

                <div>
                    <button
                        type="submit"
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white transition duration-150 ease-in-out ${
                            isLoading
                                ? 'bg-blue-400/50 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/25'
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : "S'inscrire"}
                    </button>
                </div>
            </form>

            {/* Switcher Link */}
            <div className="text-center pt-4">
                <a
                    href="/login"
                    className="font-medium text-blue-400 hover:text-cyan-400 transition duration-150 ease-in-out"
                >
                    Déjà un compte ? Se connecter
                </a>
            </div>
        </div>
    );
};

export default Signup;
