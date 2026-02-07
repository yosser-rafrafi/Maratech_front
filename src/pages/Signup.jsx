import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Signup = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Responsable'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Les mots de passe ne correspondent pas');
        }

        setLoading(true);

        try {
            const { confirmPassword, ...signupData } = formData;
            const result = await signup(signupData);

            if (result && result.success === false) {
                setError(result.error);
            } else {
                navigate('/success');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-visual">
                <div className="visual-content">
                    <h2>Rejoignez l'Équipage</h2>
                    <p>Créez votre compte en quelques secondes et commencez votre voyage de formation avec ASTBA.</p>
                </div>
            </div>

            <div className="auth-form-container">
                <div className="auth-card">
                    <h1>Créer un compte</h1>
                    <p className="auth-subtitle">Rejoignez notre plateforme de formation maritime.</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nom complet</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Jean Dupont"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

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
                            <label>Rôle</label>
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="Responsable">Responsable Formation</option>
                                <option value="formateur">Formateur</option>
                                <option value="admin">Administrateur</option>
                            </select>
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

                        <div className="form-group">
                            <label>Confirmer le mot de passe</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-auth" disabled={loading}>
                            {loading ? 'Création...' : 'S\'inscrire'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Déjà un compte ? <Link to="/login">Se connecter</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
