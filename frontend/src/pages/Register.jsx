import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight } from 'react-icons/fi';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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

          <h1 className="auth-glass-title">Create Account</h1>
          <p className="auth-glass-desc">Join Nepal's premier property platform</p>

          {error && <div className="auth-glass-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-glass-row">
              <div className="auth-glass-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
              </div>
              <div className="auth-glass-field">
                <label>Phone <span style={{ opacity: 0.5, fontWeight: 400 }}>(Optional)</span></label>
                <input
                  type="text"
                  placeholder="98XXXXXXXX"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                />
              </div>
            </div>

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
              <label>Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="auth-glass-btn" disabled={loading}>
              {loading ? <span className="auth-glass-spinner" /> : <>Create Account <FiArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-glass-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
