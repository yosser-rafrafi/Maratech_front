import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(formData.email, formData.password);

            // Redirect based on role
            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'formateur') {
                navigate('/formateur');
            } else {
                navigate('/participant');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-visual">
                <div className="visual-content">
                    <h2>Bienvenue sur ASTBA</h2>
                    <p>La plateforme de gestion de formation maritime nouvelle génération. Accédez à vos cours, votre planning et votre suivi en un clic.</p>
                </div>
            </div>

            <div className="auth-form-container">
                <div className="auth-card">
                    <h1>Se connecter</h1>
                    <p className="auth-subtitle">Content de vous revoir sur la plateforme.</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Adresse e-mail</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="nom@exemple.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Mot de passe</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-auth" disabled={loading}>
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Pas encore de compte ? <Link to="/signup">Créer un compte</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
