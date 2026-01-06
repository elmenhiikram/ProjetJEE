import { useState, useEffect } from 'react';
import { useLogin } from '../hooks/useLogin';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { handleLogin, isLoading, error, success, clearMessages } = useLogin();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Clears message after a delay
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(clearMessages, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success, clearMessages]);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error || success) clearMessages();
    };

    // Handle form submission
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLogin(formData);
    };

    const message = error || success;
    const messageType = error ? 'error' : 'success';

    return (
        <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-xl border border-slate-800/50 p-8 space-y-6 rounded-xl shadow-2xl shadow-black/20">
            {/* Retour à l'accueil */}
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Retour à l'accueil</span>
            </button>

            {/* Message Box */}
            {message && (
                <div
                    className={`p-4 rounded-lg text-sm transition-opacity duration-300 ${
                        messageType === 'success'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                    role="alert"
                >
                    {message}
                </div>
            )}

            {/* Login Form */}
            <form onSubmit={onSubmit} className="space-y-6">
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
