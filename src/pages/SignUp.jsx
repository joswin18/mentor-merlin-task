import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { apiFetch } from '../utils/api';

function SignUp() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+91',
        contactNumber: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        password: '',
        confirmPassword: '',
    });
    const [touched, setTouched] = useState({
        firstName: false,
        lastName: false,
        email: false,
        contactNumber: false,
        password: false,
        confirmPassword: false,
    });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            navigate('/schedule', { replace: true });
        }
    }, [navigate]);

    const validateFirstName = (value) => {
        if (!value.trim()) {
            return 'First name is required.';
        }
        if (value.trim().length < 2) {
            return 'First name must be at least 2 characters.';
        }
        return '';
    };

    const validateLastName = (value) => {
        if (!value.trim()) {
            return 'Last name is required.';
        }
        if (value.trim().length < 2) {
            return 'Last name must be at least 2 characters.';
        }
        return '';
    };

    const validateEmail = (value) => {
        if (!value) {
            return 'Email is required.';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'Please enter a valid email address.';
        }
        return '';
    };

    const validateContactNumber = (value) => {
        if (!value.trim()) {
            return 'Contact number is required.';
        }
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(value.trim())) {
            return 'Please enter a valid 10-digit contact number.';
        }
        return '';
    };

    const validatePassword = (value) => {
        if (!value) {
            return 'Password is required.';
        }
        if (value.length < 6) {
            return 'Password must be at least 6 characters.';
        }
        if (!/(?=.*[a-z])/.test(value)) {
            return 'Password must contain at least one lowercase letter.';
        }
        if (!/(?=.*[A-Z])/.test(value)) {
            return 'Password must contain at least one uppercase letter.';
        }
        if (!/(?=.*[0-9])/.test(value)) {
            return 'Password must contain at least one number.';
        }
        return '';
    };

    const validateConfirmPassword = (value, passwordValue) => {
        if (!value) {
            return 'Please confirm your password.';
        }
        if (value !== passwordValue) {
            return 'Passwords do not match.';
        }
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (touched[name]) {
            let error = '';
            switch (name) {
                case 'firstName':
                    error = validateFirstName(value);
                    break;
                case 'lastName':
                    error = validateLastName(value);
                    break;
                case 'email':
                    error = validateEmail(value);
                    break;
                case 'contactNumber':
                    error = validateContactNumber(value);
                    break;
                case 'password':
                    error = validatePassword(value);
                    
                    if (touched.confirmPassword) {
                        setFieldErrors((prev) => ({
                            ...prev,
                            confirmPassword: validateConfirmPassword(formData.confirmPassword, value),
                        }));
                    }
                    break;
                case 'confirmPassword':
                    error = validateConfirmPassword(value, formData.password);
                    break;
                default:
                    break;
            }
            setFieldErrors((prev) => ({ ...prev, [name]: error }));
        }
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));

        let error = '';
        switch (field) {
            case 'firstName':
                error = validateFirstName(formData.firstName);
                break;
            case 'lastName':
                error = validateLastName(formData.lastName);
                break;
            case 'email':
                error = validateEmail(formData.email);
                break;
            case 'contactNumber':
                error = validateContactNumber(formData.contactNumber);
                break;
            case 'password':
                error = validatePassword(formData.password);
                if (touched.confirmPassword) {
                    setFieldErrors((prev) => ({
                        ...prev,
                        confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
                    }));
                }
                break;
            case 'confirmPassword':
                error = validateConfirmPassword(formData.confirmPassword, formData.password);
                break;
            default:
                break;
        }
        setFieldErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        setError('');
        setTouched({
            firstName: true,
            lastName: true,
            email: true,
            contactNumber: true,
            password: true,
            confirmPassword: true,
        });

        const errors = {
            firstName: validateFirstName(formData.firstName),
            lastName: validateLastName(formData.lastName),
            email: validateEmail(formData.email),
            contactNumber: validateContactNumber(formData.contactNumber),
            password: validatePassword(formData.password),
            confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
        };

        setFieldErrors(errors);

        const hasErrors = Object.values(errors).some((error) => error !== '');
        if (hasErrors) {
            return;
        }

        try {
            setLoading(true);
            const data = await apiFetch('/api/auth/signup', {
                method: 'POST',
                body: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    contactNumber: `${formData.countryCode} ${formData.contactNumber}`,
                    password: formData.password,
                },
            });

            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            if (data.user) {
                localStorage.setItem('authUser', JSON.stringify(data.user));
            }

            navigate('/schedule');
        } catch (err) {
            console.error('Sign up error:', err);
            setError(err?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container signup-container">
                <h1 className="auth-title">Sign Up</h1>

                <form className="auth-card" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input
                                type="text"
                                className={`form-input ${touched.firstName && fieldErrors.firstName ? 'form-input-error' : ''}`}
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                onBlur={() => handleBlur('firstName')}
                                id="signup-firstname"
                            />
                            {touched.firstName && fieldErrors.firstName && (
                                <span className="field-error">{fieldErrors.firstName}</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <input
                                type="text"
                                className={`form-input ${touched.lastName && fieldErrors.lastName ? 'form-input-error' : ''}`}
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                onBlur={() => handleBlur('lastName')}
                                id="signup-lastname"
                            />
                            {touched.lastName && fieldErrors.lastName && (
                                <span className="field-error">{fieldErrors.lastName}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Email Id</label>
                            <input
                                type="email"
                                className={`form-input ${touched.email && fieldErrors.email ? 'form-input-error' : ''}`}
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={() => handleBlur('email')}
                                id="signup-email"
                            />
                            {touched.email && fieldErrors.email && (
                                <span className="field-error">{fieldErrors.email}</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Contact Number</label>
                            <div className="contact-input-group">
                                <select
                                    className="country-code-select"
                                    name="countryCode"
                                    value={formData.countryCode}
                                    onChange={handleChange}
                                    id="signup-country-code"
                                >
                                    <option value="+91">+91</option>
                                    <option value="+1">+1</option>
                                    <option value="+44">+44</option>
                                    <option value="+61">+61</option>
                                    <option value="+81">+81</option>
                                    <option value="+86">+86</option>
                                    <option value="+971">+971</option>
                                </select>
                                <input
                                    type="tel"
                                    className={`form-input contact-number-input ${touched.contactNumber && fieldErrors.contactNumber ? 'form-input-error' : ''}`}
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('contactNumber')}
                                    id="signup-contact"
                                />
                            </div>
                            {touched.contactNumber && fieldErrors.contactNumber && (
                                <span className="field-error">{fieldErrors.contactNumber}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className={`form-input ${touched.password && fieldErrors.password ? 'form-input-error' : ''}`}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={() => handleBlur('password')}
                                id="signup-password"
                            />
                            {touched.password && fieldErrors.password && (
                                <span className="field-error">{fieldErrors.password}</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                className={`form-input ${touched.confirmPassword && fieldErrors.confirmPassword ? 'form-input-error' : ''}`}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={() => handleBlur('confirmPassword')}
                                id="signup-confirm-password"
                            />
                            {touched.confirmPassword && fieldErrors.confirmPassword && (
                                <span className="field-error">{fieldErrors.confirmPassword}</span>
                            )}
                        </div>
                    </div>

                    {error && <p className="auth-error">{error}</p>}
                </form>

                <p className="auth-link-text">
                    Already have an Account?{' '}
                    <Link to="/" className="auth-link-bold">
                        Login
                    </Link>
                </p>

                <button
                    type="submit"
                    className="auth-button"
                    id="signup-button"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Signing up...' : 'Sign Up'}
                </button>
            </div>
        </div>
    );
}

export default SignUp;
