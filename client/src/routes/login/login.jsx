import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './login.scss';
import useAuthStore from '../../store/useAuthStore';
import { validateEmail } from '../../utils/validation';

const Login = () => {

    const { login } = useAuthStore();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear email error when user starts typing again
        if (name === 'email') {
            setEmailError('');
        }
    };

    // Validate email when user finishes typing
    const handleEmailBlur = () => {
        if (formData.email && !validateEmail(formData.email)) {
            setEmailError('Please enter a valid email address (e.g., example@gmail.com)');
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // Validate email format
            if (!validateEmail(formData.email)) {
                throw new Error("Please enter a valid email address (e.g., example@gmail.com)");
            }
            
            if (!formData.password.trim()) {
                throw new Error("Password is required");
            }
            
            const response = await login(formData);
            if (response.user) {
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Sign in to access your account</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleEmailBlur}
                            required
                            placeholder="Enter your email"
                            className={emailError ? 'error-input' : ''}
                        />
                        {emailError && <div className="input-error">{emailError}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?
                        <Link to="/register" className="switch-btn">
                            Sign Up
                        </Link>
                    </p>
                </div>

                <div className="home-link">
                    <Link to="/">
                        <i className="fas fa-home"></i> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
