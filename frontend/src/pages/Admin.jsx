import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  getAdminStats, getAdminUsers, getAdminProperties, getAdminInquiries,
  updatePropertyStatus, toggleFeaturedProperty, updateUserRole, deleteUser,
  adminDeleteProperty, updateAdminInquiryStatus,
  getAdminReviews, createAdminReview, updateAdminReview, deleteAdminReview, toggleAdminReviewActive
} from '../services/api';
import {
  FiBarChart2, FiUsers, FiHome, FiMessageSquare, FiActivity,
  FiShield, FiTrash2, FiStar, FiCheck, FiX, FiLogOut,
  FiCheckCircle, FiClock, FiAlertCircle, FiAward, FiTrendingUp, FiMail,
  FiPlus, FiSearch, FiSettings, FiExternalLink, FiEye, FiFilter
} from 'react-icons/fi';
import '../styles/admin.css';

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [inquiryFilter, setInquiryFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [reviewForm, setReviewForm] = useState({ author: '', role: '', text: '', rating: 5 });
  const [editingReview, setEditingReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    getAdminStats().then(r => setStats(r.data)).catch(() => setStats({
      totalUsers: 0, totalProperties: 0, approvedProperties: 0,
      pendingProperties: 0, totalInquiries: 0, featuredProperties: 0
    }));
  }, []);

  useEffect(() => {
    if (tab === 'overview' || tab === 'users' || tab === 'activity') getAdminUsers().then(r => setUsers(r.data)).catch(() => {});
    if (tab === 'overview' || tab === 'properties' || tab === 'pending') getAdminProperties().then(r => setProperties(r.data)).catch(() => {});
    if (tab === 'overview' || tab === 'inquiries' || tab === 'activity') getAdminInquiries().then(r => setInquiries(r.data)).catch(() => {});
    if (tab === 'reviews') getAdminReviews().then(r => setReviews(r.data)).catch(() => {});
  }, [tab]);

  const handleStatus = async (id, status) => {
    try {
      await updatePropertyStatus(id, status);
      setProperties(prev => prev.map(p => p.id === id ? {...p, status} : p));
      showToast(`Property ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch { showToast('Action failed', 'error'); }
  };

  const handleFeatured = async (id) => {
    try {
      const res = await toggleFeaturedProperty(id);
      setProperties(prev => prev.map(p => p.id === id ? {...p, is_featured: res.data.is_featured} : p));
      showToast(res.data.is_featured ? 'Property featured' : 'Property unfeatured');
    } catch { showToast('Action failed', 'error'); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(id, role);
      setUsers(prev => prev.map(u => u.id === id ? {...u, role} : u));
      showToast(`User role changed to ${role}`);
    } catch { showToast('Action failed', 'error'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast('User deleted');
    } catch { showToast('Delete failed', 'error'); }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Delete this property permanently?')) return;
    try {
      await adminDeleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      showToast('Property deleted');
    } catch { showToast('Delete failed', 'error'); }
  };

  const handleInquiryStatus = async (id, status) => {
    try {
      await updateAdminInquiryStatus(id, status);
      setInquiries(prev => prev.map(inq => inq.id === id ? {...inq, status} : inq));
      showToast(`Inquiry marked as ${status}`);
    } catch { showToast('Action failed', 'error'); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // Review handlers
  const handleCreateReview = async () => {
    if (!reviewForm.author || !reviewForm.text) return showToast('Author and text are required', 'error');
    try {
      const res = await createAdminReview(reviewForm);
      setReviews(prev => [res.data, ...prev]);
      setReviewForm({ author: '', role: '', text: '', rating: 5 });
      setShowReviewForm(false);
      showToast('Review created successfully');
    } catch { showToast('Failed to create review', 'error'); }
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;
    try {
      const res = await updateAdminReview(editingReview, reviewForm);
      setReviews(prev => prev.map(r => r.id === editingReview ? res.data : r));
      setEditingReview(null);
      setReviewForm({ author: '', role: '', text: '', rating: 5 });
      setShowReviewForm(false);
      showToast('Review updated successfully');
    } catch { showToast('Failed to update review', 'error'); }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await deleteAdminReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      showToast('Review deleted');
    } catch { showToast('Delete failed', 'error'); }
  };

  const handleToggleReview = async (id) => {
    try {
      const res = await toggleAdminReviewActive(id);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, is_active: res.data.is_active } : r));
      showToast(res.data.is_active ? 'Review activated' : 'Review deactivated');
    } catch { showToast('Action failed', 'error'); }
  };

  const handleEditReview = (review) => {
    setReviewForm({ author: review.author, role: review.role || '', text: review.text, rating: review.rating || 5 });
    setEditingReview(review.id);
    setShowReviewForm(true);
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A';

  // Filtered data
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || (p.city && p.city.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch = (inq.property_title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (inq.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = inquiryFilter === 'all' || inq.status === inquiryFilter;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = properties.filter(p => p.status === 'pending').length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <FiBarChart2 className="admin-nav-icon" /> },
    { id: 'users', label: 'Users', icon: <FiUsers className="admin-nav-icon" /> },
    { id: 'properties', label: 'Properties', icon: <FiHome className="admin-nav-icon" /> },
    { id: 'pending', label: 'Pending', icon: <FiClock className="admin-nav-icon" />, badge: pendingCount },
    { id: 'inquiries', label: 'Inquiries', icon: <FiMessageSquare className="admin-nav-icon" /> },
    { id: 'reviews', label: 'Reviews', icon: <FiStar className="admin-nav-icon" /> },
    { id: 'activity', label: 'Activity', icon: <FiActivity className="admin-nav-icon" /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings className="admin-nav-icon" /> },
  ];

  // Generate recent activity from data
  const recentActivity = [
    ...users.slice(0, 2).map(u => ({ type: 'user', text: <><strong>{u.name}</strong> joined the platform</>, time: new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) })),
    ...properties.slice(0, 2).map(p => ({ type: 'property', text: <><strong>{p.title}</strong> listed by {p.seller_name}</>, time: 'Recent' })),
    ...inquiries.slice(0, 1).map(inq => ({ type: 'inquiry', text: <><strong>{inq.name}</strong> inquired about {inq.property_title}</>, time: new Date(inq.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) })),
  ];

  return (
    <div className="admin-layout">
      {/* Dark Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-icon"><FiShield size={20} /></div>
          <div className="admin-sidebar-info">
            <h4>{user?.name || 'Admin'}</h4>
            <p>Administrator</p>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-label">Main</div>
          {navItems.slice(0, 6).map(item => (
            <button key={item.id} className={`admin-nav-item ${tab === item.id ? 'active' : ''}`}
              onClick={() => { setTab(item.id); setSearchQuery(''); setStatusFilter('all'); setRoleFilter('all'); setInquiryFilter('all'); }}>
              {item.icon}{item.label}
              {item.badge > 0 && <span className="admin-nav-badge">{item.badge}</span>}
            </button>
          ))}

          <div className="admin-nav-divider"></div>
          <div className="admin-nav-label">System</div>
          {navItems.slice(6).map(item => (
            <button key={item.id} className={`admin-nav-item ${tab === item.id ? 'active' : ''}`}
              onClick={() => { setTab(item.id); setSearchQuery(''); }}>
              {item.icon}{item.label}
            </button>
          ))}

          <div style={{ flexGrow: 1 }}></div>

          <button className="admin-nav-item admin-nav-item--danger" onClick={handleLogout}>
            <FiLogOut className="admin-nav-icon" /> Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-content" key={tab}>
        <div className="admin-main-card">

          {/* ===== OVERVIEW ===== */}
          {tab === 'overview' && (
            <div>
              <div className="admin-page-header">
                <h2 className="admin-page-title">Dashboard Overview</h2>
                <p className="admin-page-subtitle">Platform performance at a glance</p>
              </div>

              <div className="admin-stat-grid">
                {[
                  { value: stats.totalUsers || 0, label: 'Total Users', iconClass: 'admin-stat-icon--users', icon: <FiUsers size={20} /> },
                  { value: stats.totalProperties || 0, label: 'Total Properties', iconClass: 'admin-stat-icon--properties', icon: <FiHome size={20} /> },
                  { value: stats.approvedProperties || 0, label: 'Approved', iconClass: 'admin-stat-icon--approved', icon: <FiCheckCircle size={20} /> },
                  { value: stats.pendingProperties || 0, label: 'Pending Review', iconClass: 'admin-stat-icon--pending', icon: <FiClock size={20} /> },
                  { value: stats.featuredProperties || 0, label: 'Featured', iconClass: 'admin-stat-icon--featured', icon: <FiAward size={20} /> },
                  { value: stats.totalInquiries || 0, label: 'Total Inquiries', iconClass: 'admin-stat-icon--inquiries', icon: <FiMail size={20} /> },
                ].map((s, i) => (
                  <div key={i} className="admin-stat-item">
                    <div className="admin-stat-header">
                      <div>
                        <div className="admin-stat-value">{s.value}</div>
                        <div className="admin-stat-label">{s.label}</div>
                      </div>
                      <div className={`admin-stat-icon ${s.iconClass}`}>{s.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="admin-quick-actions">
                <button className="admin-quick-action" onClick={() => setTab('users')}>
                  <div className="admin-quick-action-icon"><FiUsers size={18} /></div>
                  Manage Users
                </button>
                <button className="admin-quick-action" onClick={() => setTab('properties')}>
                  <div className="admin-quick-action-icon"><FiHome size={18} /></div>
                  Review Properties
                </button>
                <button className="admin-quick-action" onClick={() => setTab('inquiries')}>
                  <div className="admin-quick-action-icon"><FiMessageSquare size={18} /></div>
                  View Inquiries
                </button>
                <button className="admin-quick-action" onClick={() => navigate('/sell')}>
                  <div className="admin-quick-action-icon"><FiPlus size={18} /></div>
                  Add Property
                </button>
              </div>

              {/* Recent Activity */}
              {recentActivity.length > 0 && (
                <div className="admin-recent-section">
                  <div className="admin-section-header">
                    <span className="admin-section-title">Recent Activity</span>
                    <span className="admin-section-badge">{recentActivity.length} events</span>
                  </div>
                  <div className="admin-activity-list">
                    {recentActivity.map((item, i) => (
                      <div key={i} className="admin-activity-item">
                        <div className={`admin-activity-dot admin-activity-dot--${item.type}`}></div>
                        <div className="admin-activity-text">{item.text}</div>
                        <div className="admin-activity-time">{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== USERS ===== */}
          {tab === 'users' && (
            <div>
              <div className="admin-page-header">
                <h2 className="admin-page-title">User Management</h2>
                <p className="admin-page-subtitle">Manage all registered accounts</p>
              </div>

              <div className="admin-filter-bar">
                <input className="admin-search-input" placeholder="Search users..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <select className="admin-filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
                <span className="admin-filter-count">{filteredUsers.length} of {users.length} users</span>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-premium-table">
                  <thead>
                    <tr><th>User</th><th>Role</th><th>Phone</th><th>Joined</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-cell-avatar">{getInitials(u.name)}</div>
                            <div className="user-cell-details">
                              <div className="user-cell-name">{u.name}</div>
                              <div className="user-cell-email">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-featured' : 'badge-buy'}`}>{u.role}</span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.phone || '—'}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td>
                          <div className="admin-btn-group">
                            <button className={`admin-btn-icon ${u.role === 'admin' ? 'admin-btn-icon--delete' : 'admin-btn-icon--primary'}`} title={u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'} onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'user' : 'admin')}>
                              <FiShield size={16} />
                            </button>
                            {u.role !== 'admin' && (
                              <button className="admin-btn-icon admin-btn-icon--delete" title="Delete User" onClick={() => handleDeleteUser(u.id)}>
                                <FiTrash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={5} className="admin-empty-state">No users match your filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== PROPERTIES ===== */}
          {tab === 'properties' && (
            <div>
              <div className="admin-page-header">
                <h2 className="admin-page-title">Property Management</h2>
                <p className="admin-page-subtitle">Review, approve, and manage listings</p>
              </div>

              <div className="admin-filter-bar">
                <input className="admin-search-input" placeholder="Search properties..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <select className="admin-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <span className="admin-filter-count">{filteredProperties.length} of {properties.length} properties</span>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-premium-table">
                  <thead>
                    <tr><th>Property</th><th>Seller</th><th>City</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredProperties.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div>
                              <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {p.title}
                                {p.is_featured === 1 && <FiStar size={13} className="featured-star" fill="currentColor" />}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 600, marginTop: '2px' }}>Rs. {Number(p.price).toLocaleString()}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.seller_name}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.city}</td>
                        <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                        <td>
                          <div className="admin-btn-group" style={{ justifyContent: 'flex-end' }}>
                            {p.status !== 'approved' && (
                              <button className="admin-btn-icon admin-btn-icon--approve" title="Approve Property" onClick={() => handleStatus(p.id, 'approved')}>
                                <FiCheck size={16} />
                              </button>
                            )}
                            {p.status !== 'rejected' && (
                              <button className="admin-btn-icon admin-btn-icon--reject" title="Reject Property" onClick={() => handleStatus(p.id, 'rejected')}>
                                <FiX size={16} />
                              </button>
                            )}
                            <button className={`admin-btn-icon ${p.is_featured ? 'admin-btn-icon--featured' : ''}`} title={p.is_featured ? 'Unfeature Property' : 'Feature Property'} onClick={() => handleFeatured(p.id)}>
                              <FiStar size={16} fill={p.is_featured ? 'currentColor' : 'none'} color={p.is_featured ? 'currentColor' : 'var(--text-light)'} />
                            </button>
                            <a href={`/properties/${p.id}`} target="_blank" rel="noreferrer" className="admin-btn-icon admin-btn-icon--primary" title="View Property">
                              <FiExternalLink size={16} />
                            </a>
                            <button className="admin-btn-icon admin-btn-icon--delete" title="Delete Property" onClick={() => handleDeleteProperty(p.id)}>
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProperties.length === 0 && (
                      <tr><td colSpan={5} className="admin-empty-state">No properties match your filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== PENDING PROPERTIES ===== */}
          {tab === 'pending' && (
            <div>
              <div className="admin-page-header">
                <h2 className="admin-page-title">Pending Properties</h2>
                <p className="admin-page-subtitle">Review and approve property submissions awaiting moderation</p>
              </div>

              <div className="admin-filter-bar">
                <input className="admin-search-input" placeholder="Search pending properties..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <span className="admin-filter-count">{properties.filter(p => p.status === 'pending' && p.title.toLowerCase().includes(searchQuery.toLowerCase())).length} pending properties</span>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-premium-table">
                  <thead>
                    <tr><th>Property</th><th>Seller</th><th>City</th><th>Price</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                  </thead>
                  <tbody>
                    {properties.filter(p => p.status === 'pending' && p.title.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.title}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.seller_name}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.city}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>Rs. {Number(p.price).toLocaleString()}</td>
                        <td>
                          <div className="admin-btn-group" style={{ justifyContent: 'flex-end' }}>
                            <button className="admin-btn-icon admin-btn-icon--approve" title="Approve" onClick={() => handleStatus(p.id, 'approved')}>
                              <FiCheck size={16} />
                            </button>
                            <button className="admin-btn-icon admin-btn-icon--reject" title="Reject" onClick={() => handleStatus(p.id, 'rejected')}>
                              <FiX size={16} />
                            </button>
                            <a href={`/properties/${p.id}`} target="_blank" rel="noreferrer" className="admin-btn-icon admin-btn-icon--primary" title="View">
                              <FiExternalLink size={16} />
                            </a>
                            <button className="admin-btn-icon admin-btn-icon--delete" title="Delete" onClick={() => handleDeleteProperty(p.id)}>
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {properties.filter(p => p.status === 'pending' && p.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <tr><td colSpan={5} className="admin-empty-state">No pending properties to review</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== INQUIRIES ===== */}
          {tab === 'inquiries' && (
            <div>
              <div className="admin-page-header">
                <h2 className="admin-page-title">Inquiry Management</h2>
                <p className="admin-page-subtitle">Track and respond to customer inquiries</p>
              </div>

              <div className="admin-filter-bar">
                <input className="admin-search-input" placeholder="Search inquiries..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <select className="admin-filter-select" value={inquiryFilter} onChange={e => setInquiryFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="replied">Replied</option>
                </select>
                <span className="admin-filter-count">{filteredInquiries.length} of {inquiries.length} inquiries</span>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-premium-table">
                  <thead>
                    <tr><th>Property</th><th>From</th><th>Message</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredInquiries.map(inq => (
                      <tr key={inq.id}>
                        <td style={{ fontWeight: 500, maxWidth: '160px' }}>{inq.property_title}</td>
                        <td>
                          <div className="user-cell-details">
                            <div className="user-cell-name">{inq.name}</div>
                            <div className="user-cell-email">{inq.email}</div>
                          </div>
                        </td>
                        <td style={{ maxWidth: '200px', lineHeight: 1.5, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{inq.message}</td>
                        <td>
                          <span className={`badge badge-${inq.status === 'new' ? 'pending' : inq.status === 'replied' ? 'approved' : 'buy'}`}>
                            {inq.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {new Date(inq.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td>
                          <div className="admin-btn-group">
                            {inq.status !== 'replied' && (
                              <button className="admin-btn-icon admin-btn-icon--respond" title="Mark as Replied" onClick={() => handleInquiryStatus(inq.id, 'replied')}>
                                <FiCheckCircle size={16} />
                              </button>
                            )}
                            {inq.status === 'replied' && (
                              <button className="admin-btn-icon admin-btn-icon--primary" title="Reopen Inquiry" onClick={() => handleInquiryStatus(inq.id, 'new')}>
                                <FiAlertCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredInquiries.length === 0 && (
                      <tr><td colSpan={6} className="admin-empty-state">No inquiries match your filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== REVIEWS ===== */}
          {tab === 'reviews' && (
            <div>
              <div className="admin-page-header">
                <h2 className="admin-page-title">Review Management</h2>
                <p className="admin-page-subtitle">Manage testimonials shown on the homepage</p>
              </div>

              <div className="admin-filter-bar">
                <input className="admin-search-input" placeholder="Search reviews..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <select className="admin-filter-select" value={reviewFilter} onChange={e => setReviewFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button className="admin-btn-add" onClick={() => { setShowReviewForm(true); setEditingReview(null); setReviewForm({ author: '', role: '', text: '', rating: 5 }); }}>
                  <FiPlus size={16} /> Add Review
                </button>
                <span className="admin-filter-count">{reviews.filter(r => {
                  const matchesSearch = r.author.toLowerCase().includes(searchQuery.toLowerCase()) || r.text.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesFilter = reviewFilter === 'all' || (reviewFilter === 'active' ? r.is_active : !r.is_active);
                  return matchesSearch && matchesFilter;
                }).length} of {reviews.length} reviews</span>
              </div>

              {/* Add/Edit Review Form */}
              {showReviewForm && (
                <div className="admin-review-form">
                  <h4 style={{ marginBottom: '16px', fontWeight: 600 }}>{editingReview ? 'Edit Review' : 'Add New Review'}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <input className="admin-search-input" placeholder="Author name" value={reviewForm.author} onChange={e => setReviewForm({ ...reviewForm, author: e.target.value })} />
                    <input className="admin-search-input" placeholder="Role (e.g. Homebuyer, Kathmandu)" value={reviewForm.role} onChange={e => setReviewForm({ ...reviewForm, role: e.target.value })} />
                  </div>
                  <textarea className="admin-search-input" placeholder="Review text..." value={reviewForm.text} onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })} style={{ width: '100%', minHeight: '80px', marginBottom: '12px', resize: 'vertical' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rating:</label>
                    <select className="admin-filter-select" value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })} style={{ minWidth: '80px' }}>
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>)}
                    </select>
                    <div style={{ flex: 1 }}></div>
                    <button className="admin-btn-icon" onClick={() => { setShowReviewForm(false); setEditingReview(null); }} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', background: 'var(--off-white)', border: '1px solid var(--border)' }}>Cancel</button>
                    <button className="admin-btn-icon admin-btn-icon--approve" onClick={editingReview ? handleUpdateReview : handleCreateReview} style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem' }}>
                      {editingReview ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              )}

              <div className="admin-table-wrap">
                <table className="admin-premium-table">
                  <thead>
                    <tr><th>Author</th><th>Review</th><th>Rating</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                  </thead>
                  <tbody>
                    {reviews.filter(r => {
                      const matchesSearch = r.author.toLowerCase().includes(searchQuery.toLowerCase()) || r.text.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesFilter = reviewFilter === 'all' || (reviewFilter === 'active' ? r.is_active : !r.is_active);
                      return matchesSearch && matchesFilter;
                    }).map(r => (
                      <tr key={r.id}>
                        <td>
                          <div className="user-cell-details">
                            <div className="user-cell-name">{r.author}</div>
                            <div className="user-cell-email">{r.role}</div>
                          </div>
                        </td>
                        <td style={{ maxWidth: '280px', lineHeight: 1.5, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.text}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(r.rating || 5)].map((_, j) => <FiStar key={j} size={12} fill="var(--gold)" stroke="var(--gold)" />)}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${r.is_active ? 'badge-approved' : 'badge-rejected'}`}>
                            {r.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-btn-group" style={{ justifyContent: 'flex-end' }}>
                            <button className={`admin-btn-icon ${r.is_active ? 'admin-btn-icon--reject' : 'admin-btn-icon--approve'}`} title={r.is_active ? 'Deactivate' : 'Activate'} onClick={() => handleToggleReview(r.id)}>
                              {r.is_active ? <FiX size={16} /> : <FiCheck size={16} />}
                            </button>
                            <button className="admin-btn-icon admin-btn-icon--primary" title="Edit Review" onClick={() => handleEditReview(r)}>
                              <FiEye size={16} />
                            </button>
                            <button className="admin-btn-icon admin-btn-icon--delete" title="Delete Review" onClick={() => handleDeleteReview(r.id)}>
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {reviews.filter(r => {
                      const matchesSearch = r.author.toLowerCase().includes(searchQuery.toLowerCase()) || r.text.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesFilter = reviewFilter === 'all' || (reviewFilter === 'active' ? r.is_active : !r.is_active);
                      return matchesSearch && matchesFilter;
                    }).length === 0 && (
                      <tr><td colSpan={5} className="admin-empty-state">No reviews match your filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== ACTIVITY ===== */}
          {tab === 'activity' && (
            <div>
              <div className="admin-page-header">
                <h2 className="admin-page-title">Activity Summary</h2>
                <p className="admin-page-subtitle">Platform metrics and health overview</p>
              </div>

              <div className="activity-grid">
                <div className="activity-card">
                  <div className="activity-card-icon activity-card-icon--users"><FiUsers size={22} /></div>
                  <div className="activity-card-value">{stats.totalUsers || 0}</div>
                  <div className="activity-card-label">Registered Users</div>
                </div>
                <div className="activity-card">
                  <div className="activity-card-icon activity-card-icon--pending"><FiClock size={22} /></div>
                  <div className="activity-card-value">{stats.pendingProperties || 0}</div>
                  <div className="activity-card-label">Pending Approvals</div>
                </div>
                <div className="activity-card">
                  <div className="activity-card-icon activity-card-icon--inquiries"><FiTrendingUp size={22} /></div>
                  <div className="activity-card-value">{stats.totalInquiries || 0}</div>
                  <div className="activity-card-label">Total Inquiries</div>
                </div>
              </div>

              <div className="admin-health-section">
                <div className="admin-section-header">
                  <span className="admin-section-title">Platform Health</span>
                </div>
                <div className="admin-health-grid">
                  <div className="admin-health-card">
                    <div className="admin-health-card-label">Approval Rate</div>
                    <div className="admin-health-bar">
                      <div className="admin-health-bar-fill admin-health-bar-fill--gold" style={{
                        width: stats.totalProperties ? `${Math.round((stats.approvedProperties / stats.totalProperties) * 100)}%` : '0%'
                      }}></div>
                    </div>
                    <span className="admin-health-percent">
                      {stats.totalProperties ? Math.round((stats.approvedProperties / stats.totalProperties) * 100) : 0}% of properties approved
                    </span>
                  </div>
                  <div className="admin-health-card">
                    <div className="admin-health-card-label">Featured Rate</div>
                    <div className="admin-health-bar">
                      <div className="admin-health-bar-fill admin-health-bar-fill--blue" style={{
                        width: stats.totalProperties ? `${Math.round((stats.featuredProperties / stats.totalProperties) * 100)}%` : '0%'
                      }}></div>
                    </div>
                    <span className="admin-health-percent">
                      {stats.totalProperties ? Math.round((stats.featuredProperties / stats.totalProperties) * 100) : 0}% of properties featured
                    </span>
                  </div>
                  <div className="admin-health-card">
                    <div className="admin-health-card-label">Inquiry Response Rate</div>
                    <div className="admin-health-bar">
                      <div className="admin-health-bar-fill admin-health-bar-fill--green" style={{
                        width: stats.totalInquiries
                          ? `${Math.round((inquiries.filter(i => i.status === 'replied').length / Math.max(inquiries.length, 1)) * 100)}%`
                          : '0%'
                      }}></div>
                    </div>
                    <span className="admin-health-percent">
                      {inquiries.length ? Math.round((inquiries.filter(i => i.status === 'replied').length / inquiries.length) * 100) : 0}% of inquiries replied
                    </span>
                  </div>
                  <div className="admin-health-card">
                    <div className="admin-health-card-label">Admin-to-User Ratio</div>
                    <div className="admin-health-bar">
                      <div className="admin-health-bar-fill admin-health-bar-fill--gold" style={{
                        width: users.length ? `${Math.round((users.filter(u => u.role === 'admin').length / Math.max(users.length, 1)) * 100)}%` : '0%'
                      }}></div>
                    </div>
                    <span className="admin-health-percent">
                      {users.filter(u => u.role === 'admin').length} admins of {users.length || stats.totalUsers || 0} total users
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== SETTINGS ===== */}
          {tab === 'settings' && (
            <div>
              <div className="admin-page-header">
                <h2 className="admin-page-title">Platform Settings</h2>
                <p className="admin-page-subtitle">Configure your platform preferences</p>
              </div>

              <div style={{ display: 'grid', gap: '20px', animation: 'adminFadeInUp 0.5s ease' }}>
                {[
                  { title: 'Site Name', desc: 'The name displayed across the platform', value: 'JKB Nepal' },
                  { title: 'Default Currency', desc: 'Currency used for property pricing', value: 'NPR (Rs.)' },
                  { title: 'Max Featured Properties', desc: 'Maximum properties that can be featured', value: '10' },
                  { title: 'Auto-Approve Listings', desc: 'Automatically approve new property listings', value: 'Disabled' },
                  { title: 'Contact Email', desc: 'Primary contact email for inquiries', value: 'info@jkbnepal.com' },
                ].map((setting, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '20px 24px', background: 'var(--off-white)', borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    transition: 'all 0.25s ease',
                    animation: `adminFadeInUp 0.5s ease ${i * 0.05}s both`
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{setting.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{setting.desc}</div>
                    </div>
                    <div style={{
                      padding: '8px 18px', background: 'var(--white)', borderRadius: '8px',
                      border: '1px solid var(--border)', fontSize: '0.88rem', fontWeight: 500,
                      color: 'var(--text-primary)', minWidth: '120px', textAlign: 'center'
                    }}>{setting.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          {toast.type === 'success' ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Admin;
