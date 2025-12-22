import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/authApi';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (message.text) setMessage({ text: '', type: '' });
    };

    // Handle Login submission - REAL API CALL
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await authApi.login(formData);
            console.log('✅ Login successful:', response.data);
            
            const userData = response.data;
            const user = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role as 'admin' | 'vendeur' | 'analyste' | 'client' | 'investisseur',
                token: userData.token,
            };
            
            setMessage({ text: `Bienvenue, ${user.name}!`, type: 'success' });
            
            setTimeout(() => {
                login(user);
                // Redirection vers le dashboard selon le rôle
                navigate('/dashboard');
            }, 1000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || "Email ou mot de passe incorrect.";
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

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
                <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent text-center">Connexion</h2>
                
                <div>
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

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1 text-left">
                        Password <span className="text-red-400">*</span>
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
                        ) : 'Connexion'}
                    </button>
                </div>
            </form>

            {/* Switcher Link */}
            <div className="text-center pt-4">
                <a
                    href="/signup"
                    className="font-medium text-blue-400 hover:text-cyan-400 transition duration-150 ease-in-out"
                >
                    Pas de compte ? S'inscrire
                </a>
            </div>
            
           
        </div>
    );
};

export default Login;
