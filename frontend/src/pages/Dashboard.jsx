import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProperties, getMyInquiries, getFavorites, deleteProperty, updateProfile, uploadAvatar, replyToInquiry } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { FiUser, FiHome, FiHeart, FiMessageSquare, FiLogOut, FiEdit2, FiTrash2, FiBox, FiSettings, FiCamera, FiX, FiLoader } from 'react-icons/fi';
import '../styles/dashboard.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const Dashboard = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [listings, setListings] = useState([]);
  const [saved, setSaved] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  
  // Profile state including avatar
  const [profile, setProfile] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  const [msg, setMsg] = useState({ text: '', type: '' });

  const [replyMode, setReplyMode] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Update profile state if user changes (hydration)
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (tab === 'listings') getUserProperties().then(r => setListings(r.data)).catch(() => {});
    if (tab === 'saved') getFavorites().then(r => setSaved(r.data)).catch(() => {});
    if (tab === 'inquiries') getMyInquiries().then(r => setInquiries(r.data)).catch(() => {});
  }, [tab]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try { 
      await deleteProperty(id); 
      setListings(prev => prev.filter(p => p.id !== id)); 
    } catch {}
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile(profile);
      setUser(res.data);
      setMsg({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 5000);
    } catch { 
      setMsg({ text: 'Profile update failed. Please try again.', type: 'error' }); 
    }
  };

  const handleSubmitReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      await replyToInquiry(id, replyText);
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: 'replied' } : inq));
      setReplyMode(null);
      setReplyText('');
      setMsg({ text: 'Reply sent successfully!', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    } catch {
      setMsg({ text: 'Failed to send reply.', type: 'error' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    }
  };

  // Avatar upload handlers
  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setMsg({ text: 'Please select a JPEG, PNG, or WebP image.', type: 'error' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
      return;
    }
    // Validate size
    if (file.size > MAX_SIZE) {
      setMsg({ text: 'Image must be smaller than 5MB.', type: 'error' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload
    handleAvatarUpload(file);
  };

  const handleAvatarUpload = async (file) => {
    setAvatarUploading(true);
    try {
      const avatarUrl = await uploadAvatar(file);
      const updatedProfile = { ...profile, avatar: avatarUrl };
      setProfile(updatedProfile);
      const res = await updateProfile(updatedProfile);
      setUser(res.data);
      setAvatarPreview(null);
      setMsg({ text: 'Profile picture updated!', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    } catch {
      setAvatarPreview(null);
      setMsg({ text: 'Failed to upload image. Please try again.', type: 'error' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const updatedProfile = { ...profile, avatar: '' };
      setProfile(updatedProfile);
      // Need to send something to clear avatar — send a space which backend will store,
      // or we adjust: send 'avatar' as empty string
      const res = await updateProfile({ ...updatedProfile, avatar: ' ' });
      setUser({ ...res.data, avatar: '' });
      setMsg({ text: 'Profile picture removed.', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    } catch {
      setMsg({ text: 'Failed to remove picture.', type: 'error' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'profile', label: 'My Profile', icon: <FiUser className="dashboard-nav-icon" /> },
    { id: 'listings', label: 'My Listings', icon: <FiHome className="dashboard-nav-icon" /> },
    { id: 'saved', label: 'Saved Properties', icon: <FiHeart className="dashboard-nav-icon" /> },
    { id: 'inquiries', label: 'Inquiries', icon: <FiMessageSquare className="dashboard-nav-icon" /> },
  ];

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
  };

  const currentAvatarSrc = avatarPreview || profile.avatar;

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-profile-summary">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="dashboard-avatar" />
          ) : (
            <div className="dashboard-avatar">{getInitials(user?.name)}</div>
          )}
          <div className="dashboard-profile-info">
            <h4>{user?.name || 'User'}</h4>
            <p>{user?.role || 'Member'}</p>
          </div>
        </div>

        <nav className="dashboard-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`dashboard-nav-item ${tab === item.id ? 'active' : ''}`}
              onClick={() => { setTab(item.id); setMsg({ text: '', type: '' }); }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          
          <div style={{ flexGrow: 1 }}></div>
          
          <button className="dashboard-nav-item" onClick={handleLogout} style={{ color: '#D32F2F', marginTop: 'auto' }}>
            <FiLogOut className="dashboard-nav-icon" />
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <div className="dashboard-main-card">
          <h2 className="dashboard-page-title">
            {navItems.find(i => i.id === tab)?.label}
          </h2>

          {/* Profile Tab */}
          {tab === 'profile' && (
            <div>
              {msg.text && (
                <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '24px' }}>
                  {msg.text}
                </div>
              )}

              {/* Avatar Upload Widget */}
              <div className="avatar-upload-section">
                <div className="avatar-upload-zone" onClick={() => !avatarUploading && fileInputRef.current?.click()}>
                  {avatarUploading && (
                    <div className="avatar-loading-overlay">
                      <FiLoader className="avatar-spinner" size={24} />
                    </div>
                  )}
                  {currentAvatarSrc && currentAvatarSrc.trim() ? (
                    <img src={currentAvatarSrc} alt="Profile" className="avatar-preview-img" />
                  ) : (
                    <div className="avatar-fallback">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <div className="avatar-overlay">
                    <FiCamera size={20} />
                    <span>Change Photo</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarSelect}
                    className="avatar-file-input"
                  />
                </div>
                <div className="avatar-upload-info">
                  <h4>Profile Picture</h4>
                  <p>JPG, PNG or WebP. Max 5MB.</p>
                  {profile.avatar && profile.avatar.trim() && (
                    <button type="button" className="avatar-remove-btn" onClick={handleRemoveAvatar}>
                      <FiX size={14} /> Remove Photo
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleProfileUpdate}>
                <div className="dashboard-form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      className="form-input" 
                      value={profile.name} 
                      onChange={e => setProfile({...profile, name: e.target.value})} 
                      placeholder="e.g. Ram Sharma"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address <span className="text-secondary" style={{fontSize: '11px', textTransform: 'none'}}>(cannot be changed)</span></label>
                    <input 
                      className="form-input" 
                      value={user?.email || ''} 
                      disabled 
                      style={{ opacity: 0.6, cursor: 'not-allowed' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      className="form-input" 
                      value={profile.phone} 
                      onChange={e => setProfile({...profile, phone: e.target.value})} 
                      placeholder="e.g. 9841234567"
                    />
                  </div>
                </div>
                <div style={{ marginTop: '32px' }}>
                  <button type="submit" className="btn btn-primary btn-lg">
                    <FiSettings size={18} /> Update Profile Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Listings Tab */}
          {tab === 'listings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <p className="text-secondary" style={{ fontSize: '1.1rem' }}>
                  You have <strong>{listings.length}</strong> active property listings.
                </p>
                <Link to="/sell" className="btn btn-primary">
                  + Add New Listing
                </Link>
              </div>
              
              {listings.length === 0 ? (
                <div className="empty-state-elegant">
                  <FiBox className="empty-state-elegant-icon" />
                  <h4>No listings found</h4>
                  <p>You haven't posted any property listings yet.</p>
                  <Link to="/sell" className="btn btn-primary" style={{ marginTop: '16px' }}>Start Posting</Link>
                </div>
              ) : (
                <div className="listings-list">
                  {listings.map(p => (
                    <div key={p.id} className="listing-card-row-elegant">
                      <div className="img-wrap">
                        <img src={p.primary_image || `https://placehold.co/300x200/F5F1EA/D2A85F?text=Property`} alt={p.title} />
                      </div>
                      <div className="info">
                        <h5>{p.title}</h5>
                        <p>{p.location}, {p.city} &middot; <span className={`badge badge-${p.status}`} style={{ marginLeft: '4px' }}>{p.status}</span></p>
                        <p className="text-gold" style={{ fontWeight: 600, marginTop: '8px' }}>Rs. {Number(p.price).toLocaleString()}</p>
                      </div>
                      <div className="actions">
                        <Link to={`/properties/${p.id}`} className="btn btn-outline btn-sm" title="Edit Listing">
                          <FiEdit2 size={16} />
                        </Link>
                        <button className="btn btn-outline btn-sm" onClick={() => handleDelete(p.id)} title="Delete Listing">
                          <FiTrash2 size={16} color="#D32F2F" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Tab */}
          {tab === 'saved' && (
            <div>
              {saved.length === 0 ? (
                <div className="empty-state-elegant">
                  <FiHeart className="empty-state-elegant-icon" />
                  <h4>No saved properties</h4>
                  <p>Properties you favorite will appear here for easy access.</p>
                  <Link to="/properties" className="btn btn-outline" style={{ marginTop: '16px' }}>Browse Properties</Link>
                </div>
              ) : (
                <div className="grid-3">
                  {saved.map(p => <PropertyCard key={p.id} property={p} />)}
                </div>
              )}
            </div>
          )}

          {/* Inquiries Tab */}
          {tab === 'inquiries' && (
            <div>
              {inquiries.length === 0 ? (
                <div className="empty-state-elegant">
                  <FiMessageSquare className="empty-state-elegant-icon" />
                  <h4>No inquiries yet</h4>
                  <p>When people contact you about your listings, they will appear here.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Sender Details</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map(inq => (
                      <React.Fragment key={inq.id}>
                        <tr>
                          <td style={{ fontWeight: 500 }}>{inq.property_title}</td>
                          <td>
                            <strong>{inq.name}</strong><br/>
                            <span className="text-secondary" style={{ fontSize: '13px' }}>{inq.email}</span>
                          </td>
                          <td style={{ maxWidth: '300px', lineHeight: 1.5 }}>{inq.message}</td>
                          <td>
                            <span className={`badge badge-${inq.status === 'new' ? 'pending' : 'approved'}`}>
                              {inq.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                            {new Date(inq.created_at).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </td>
                          <td>
                            {inq.status !== 'replied' ? (
                              <button 
                                className="admin-btn"
                                onClick={() => setReplyMode(inq.id)}
                              >
                                Reply
                              </button>
                            ) : (
                              <span className="text-secondary" style={{fontSize: '13px'}}>Replied</span>
                            )}
                          </td>
                        </tr>
                        {replyMode === inq.id && (
                          <tr key={`reply-${inq.id}`}>
                            <td colSpan="6" style={{ padding: '16px', background: 'var(--off-white)' }}>
                              <textarea 
                                className="form-input" 
                                rows="3" 
                                placeholder="Write your reply to the sender..."
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                style={{ marginBottom: '12px', resize: 'vertical' }}
                              ></textarea>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-primary btn-sm" onClick={() => handleSubmitReply(inq.id)}>Send Reply</button>
                                <button className="btn btn-outline btn-sm" onClick={() => { setReplyMode(null); setReplyText(''); }}>Cancel</button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
