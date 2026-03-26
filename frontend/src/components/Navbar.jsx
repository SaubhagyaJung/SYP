import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { FiMenu, FiX, FiBell, FiCheck } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdown, setDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (user) {
      getMyNotifications().then(res => setNotifs(res.data)).catch(() => {});
    }
  }, [user]);

  const unreadCount = notifs.filter(n => !n.is_read).length;

  const handleMarkRead = async (id) => {
    try {
      if (!notifs.find(n => n.id === id)?.is_read) {
        await markNotificationRead(id);
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      }
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifs(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch {}
  };

  const isHome = location.pathname === '/';
  const isProperties = location.pathname.startsWith('/properties');
  const isPropertyDetail = /^\/properties\/\d+/.test(location.pathname);
  const isLogin = location.pathname === '/login';
  const isAbout = location.pathname === '/about';
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdmin = location.pathname.startsWith('/admin');
  const isRegister = location.pathname === '/register';
  
  const isTransparentPage = (isHome || isProperties || isLogin || isRegister || isAbout || isDashboard || isAdmin) && !scrolled;
  const isLightText = (isHome || isAbout || isLogin || isRegister || (isProperties && !isPropertyDetail)) && !scrolled;
  const isAdminNav = isAdmin && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path ? 'navbar-link active' : 'navbar-link';

  const handleLogout = () => {
    logout();
    setDropdown(false);
    navigate('/');
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
  };

  return (
    <nav className={`navbar ${isTransparentPage ? 'nav-transparent' : ''} ${isLightText ? 'nav-light-text' : ''} ${isAdminNav ? 'nav-admin' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">JKB<span>.</span>Nepal</Link>

        <div className={`navbar-links ${mobileOpen ? 'mobile-open' : ''}`}>
          <Link to="/properties" className={isActive('/properties')} onClick={() => setMobileOpen(false)}>Properties</Link>
          <Link to="/#how-it-works" className={location.hash === '#how-it-works' ? 'navbar-link active' : 'navbar-link'} onClick={() => setMobileOpen(false)}>How It Works</Link>
          <Link to="/about" className={isActive('/about')} onClick={() => setMobileOpen(false)}>About</Link>
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              {/* Notifications */}
              <div style={{ position: 'relative' }}>
                <button 
                  className="navbar-icon-btn" 
                  onClick={() => { setShowNotifs(!showNotifs); setDropdown(false); }}
                >
                  <FiBell size={20} />
                  {unreadCount > 0 && <span className="notif-badge"></span>}
                </button>
                {showNotifs && (
                  <div className="navbar-dropdown notif-dropdown" onClick={e => e.stopPropagation()}>
                    <div className="notif-header">
                      <h4>Notifications</h4>
                      {unreadCount > 0 && <button onClick={handleMarkAllRead}>Mark all read</button>}
                    </div>
                    <div className="notif-body">
                      {notifs.length === 0 ? (
                        <div className="notif-empty">No notifications yet.</div>
                      ) : (
                        notifs.map(n => (
                          <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`} onClick={() => handleMarkRead(n.id)}>
                            <div className="notif-item-top">
                              <strong>{n.title}</strong>
                              {!n.is_read && <div className="unread-dot"></div>}
                            </div>
                            <p>{n.message}</p>
                            <span className="notif-time">{new Date(n.created_at).toLocaleDateString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="navbar-user">
                <div className="navbar-avatar" onClick={() => { setDropdown(!dropdown); setShowNotifs(false); }}>
                {user.avatar && user.avatar.trim() ? (
                  <img src={user.avatar} alt={user.name} className="navbar-avatar-img" />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              {dropdown && (
                <div className="navbar-dropdown">
                  <Link to="/dashboard" onClick={() => setDropdown(false)}>Dashboard</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setDropdown(false)}>Admin Panel</Link>
                  )}
                  <button onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
            </>
          ) : (
            <Link to="/login" className="navbar-signin">Sign In</Link>
          )}
          <Link to={user ? '/sell' : '/login'} className="navbar-post-btn">Post Property</Link>
          <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
