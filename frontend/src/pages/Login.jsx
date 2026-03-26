import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-scene">
      {/* Animated background shapes */}
      <div className="auth-shapes">
        <div className="auth-shape auth-shape--1" />
        <div className="auth-shape auth-shape--2" />
        <div className="auth-shape auth-shape--3" />
        <div className="auth-shape auth-shape--4" />
      </div>

      <div className="auth-glass-card">
        <div className="auth-glass-inner">
          <Link to="/" className="auth-glass-logo">JKB<span>.</span>Nepal</Link>

          <h1 className="auth-glass-title">Welcome Back</h1>
          <p className="auth-glass-desc">Sign in to continue to your account</p>

          {error && <div className="auth-glass-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-glass-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-glass-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Password</label>
                <Link to="#" className="auth-glass-forgot">Forgot?</Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="auth-glass-btn" disabled={loading}>
              {loading ? <span className="auth-glass-spinner" /> : <>Sign In <FiArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-glass-switch">
            Don't have an account? <Link to="/register">Create One</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
