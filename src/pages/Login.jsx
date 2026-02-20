import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { apiFetch } from '../utils/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/schedule', { replace: true });
    }
  }, [navigate]);

  const validateEmail = (emailValue) => {
    if (!emailValue) {
      return 'Email is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const validatePassword = (passwordValue) => {
    if (!passwordValue) {
      return 'Password is required.';
    }
    if (passwordValue.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setFieldErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    } else if (field === 'password') {
      setFieldErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    setTouched({ email: true, password: true });
    setError('');

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setFieldErrors({
      email: emailError,
      password: passwordError,
    });

    if (emailError || passwordError) {
      return;
    }

    try {
      setLoading(true);
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (data.user) {
        localStorage.setItem('authUser', JSON.stringify(data.user));
      }

      try {
        const selected = await apiFetch('/api/slots/selected');
        const hasSlots = Array.isArray(selected?.slots) && selected.slots.length > 0;
        navigate(hasSlots ? '/scheduled-classes' : '/schedule');
      } catch {
        
        navigate('/schedule');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Login</h1>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Id</label>
            <input
              type="email"
              className={`form-input ${touched.email && fieldErrors.email ? 'form-input-error' : ''}`}
              value={email}
              onChange={handleEmailChange}
              onBlur={() => handleBlur('email')}
              id="login-email"
            />
            {touched.email && fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-input ${touched.password && fieldErrors.password ? 'form-input-error' : ''}`}
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
              id="login-password"
            />
            {touched.password && fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>

          {error && <p className="auth-error">{error}</p>}
        </form>

        <Link to="/signup" className="auth-link">
          Create a new account
        </Link>

        <button
          type="submit"
          className="auth-button"
          id="login-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}

export default Login;
