import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './register.scss';
import useAuthStore from '../../store/useAuthStore';
import { validateEmail } from '../../utils/validation';
import axiosInstance from '../../utils/axios';

const Register = () => {
    const { register } = useAuthStore();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const checkEmailExists = async (email) => {
        try {
            const response = await axiosInstance.post("/auth/check-email", { email });
            return response.data.exists;
        } catch (error) {
            console.error("Error checking email:", error);
            return false;
        }
    };

    const handleEmailBlur = async () => {
        if (!formData.email) return;

        if (!validateEmail(formData.email)) {
            setEmailError('Please enter a valid email address (e.g., example@gmail.com)');
            return;
        }

        try {
            const exists = await checkEmailExists(formData.email);
            if (exists) {
                setEmailError('This email is already registered. Please use a different email address.');
            } else {
                setEmailError('');
            }
        } catch (err) {
            console.error("Error checking email:", err);
        }
    };

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

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Image size should be less than 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }

            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!avatar) {
                throw new Error("Please upload a profile picture");
            }

            if (formData.password !== formData.confirmPassword) {
                throw new Error("Passwords don't match");
            }

            // Validate email format
            if (!validateEmail(formData.email)) {
                throw new Error("Please enter a valid email address (e.g., example@gmail.com)");
            }

            // Check if email is already in use
            const emailExists = await checkEmailExists(formData.email);
            if (emailExists) {
                throw new Error("This email is already registered. Please use a different email address.");
            }

            const formDataToSend = new FormData();
            formDataToSend.append('username', formData.username);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('image', avatar);
            formDataToSend.append('role', formData.role);

            const res = await register(formDataToSend);

            // If successful, redirect to login page
            navigate('/login');
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
                    <h2>Create Account</h2>
                    <p>Join us and start your journey</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="avatar-upload" onClick={handleImageClick}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        <div className="avatar-preview">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar preview" />
                            ) : (
                                <div className="avatar-placeholder">
                                    <i className="fas fa-user"></i>
                                    <span>Add Avatar</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Choose a username"
                        />
                    </div>

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
                        <label htmlFor="role">Role</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="user">User</option>
                            <option value="agent">Agent</option>

                        </select>
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
                            placeholder="Create a password"
                            minLength="6"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm your password"
                            minLength="6"
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?
                        <Link to="/login" className="switch-btn">
                            Sign In
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

export default Register; 