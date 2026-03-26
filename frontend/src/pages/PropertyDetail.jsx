import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiChevronLeft, FiChevronRight, FiHeart, FiPhone, FiMail, FiCheckCircle } from 'react-icons/fi';
import { IoBedOutline } from 'react-icons/io5';
import { LuBath, LuRuler } from 'react-icons/lu';
import { getPropertyById, createInquiry, getFeaturedProperties } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import '../styles/properties.css';

const formatPrice = (p) => {
  const n = Number(p);
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)} Lakh`;
  return `${n.toLocaleString()}`;
};

// Default property image from uploads
const DEFAULT_PROPERTY_IMG = '/uploads/Properties.png';

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [similar, setSimilar] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  
  const [inquiry, setInquiry] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    phone: user?.phone || '', 
    message: 'Hello, I am interested in this property and would like to schedule a viewing.' 
  });
  const [inquiryMsg, setInquiryMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    setLoading(true);
    getPropertyById(id).then(res => {
      setProperty(res.data);
    }).catch(() => {
      setProperty(null);
    }).finally(() => setLoading(false));
    
    getFeaturedProperties().then(res => {
      setSimilar(res.data?.slice(0, 3) || []);
    }).catch(() => {});
  }, [id]);

  const handleInquiry = async (e) => {
    e.preventDefault();
    try {
      await createInquiry({ property_id: Number(id), ...inquiry });
      setInquiryMsg({ text: 'Inquiry sent successfully! The owner will contact you soon.', type: 'success' });
      setInquiry({ ...inquiry, message: '' });
      setTimeout(() => setInquiryMsg({ text: '', type: '' }), 5000);
    } catch { 
      setInquiryMsg({ text: 'Failed to send inquiry. Please try again.', type: 'error' }); 
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="loading-spinner" style={{ width: 50, height: 50 }}></div>
    </div>
  );
  
  if (!property) return (
    <div className="container" style={{ padding: '100px 0' }}>
      <div className="empty-state-elegant">
        <h4>Property Not Found</h4>
        <p>This listing may have been removed or is no longer available.</p>
        <Link to="/properties" className="btn btn-primary" style={{ marginTop: '20px' }}>Browse Properties</Link>
      </div>
    </div>
  );

  const features = typeof property.features === 'string' ? JSON.parse(property.features || '[]') : (property.features || []);
  
  // Fix broken images from database by using the uploaded demo image
  let displayImages = property.images?.length > 0 ? [...property.images] : [];
  if (displayImages.length === 0 || displayImages[0].image_url?.includes('/api/placeholder')) {
    displayImages = [{ image_url: DEFAULT_PROPERTY_IMG }];
  }

  return (
    <div className="detail-page animate-fade-up" style={{ paddingBottom: '80px' }}>
      
      {/* Immersive Hero Gallery */}
      <div className="detail-hero-section">
        {(!showGallery && displayImages.length >= 3) ? (
          <div className="detail-collage-grid">
            <div className="collage-item collage-item-main" onClick={() => { setImgIndex(0); setShowGallery(true); }}>
              <img src={displayImages[0]?.image_url} alt={property.title} />
              <div className="collage-item-overlay">View Photos</div>
              <div className="premium-property-badges" style={{ top: 24, left: 24 }}>
                {property.is_featured && <span className="premium-badge badge-featured-lux">Premium Collection</span>}
                <span className="premium-badge badge-type-lux">
                  {property.listing_type === 'buy' ? 'For Sale' : 'For Rent'}
                </span>
              </div>
            </div>
            {displayImages.slice(1, 5).map((img, idx) => (
              <div key={idx} className="collage-item collage-item-sub" onClick={() => { setImgIndex(idx + 1); setShowGallery(true); }}>
                <img src={img.image_url} alt={`${property.title} - ${idx + 2}`} />
                <div className="collage-item-overlay">View Photos</div>
              </div>
            ))}
            <button className="btn-view-photos" onClick={() => setShowGallery(true)}>
              <FiChevronRight /> View all photos
            </button>
          </div>
        ) : (
          <div className="detail-hero-gallery">
            <img src={displayImages[imgIndex]?.image_url} alt={property.title} />
            
            <div className="premium-property-badges" style={{ top: 24, left: 24 }}>
              {property.is_featured && <span className="premium-badge badge-featured-lux">Premium Collection</span>}
              <span className="premium-badge badge-type-lux">
                {property.listing_type === 'buy' ? 'For Sale' : 'For Rent'}
              </span>
            </div>

            {displayImages.length > 1 && (
              <div className="detail-gallery-nav">
                <button aria-label="Previous image" onClick={() => setImgIndex(i => i > 0 ? i - 1 : displayImages.length - 1)}>
                  <FiChevronLeft />
                </button>
                <button aria-label="Next image" onClick={() => setImgIndex(i => i < displayImages.length - 1 ? i + 1 : 0)}>
                  <FiChevronRight />
                </button>
              </div>
            )}
            
            {(showGallery && displayImages.length >= 3) && (
              <button 
                className="btn-view-photos" 
                style={{ bottom: 'auto', top: 24, right: 24 }} 
                onClick={() => { setShowGallery(false); setImgIndex(0); }}
              >
                Close Gallery
              </button>
            )}
          </div>
        )}
      </div>

      <div className="container">
        <div className="detail-layout-split">
          
          {/* Main Left Column */}
          <div className="detail-main-column">
            
            <div className="detail-header-block animate-fade-up delay-1">
              <h1 className="detail-title-lux">{property.title}</h1>
              <div className="premium-property-location" style={{ fontSize: '1.1rem', marginBottom: 0 }}>
                <FiMapPin size={18} /> {property.address}, {property.city}, {property.district}
              </div>
            </div>

            {/* Key Features Grid */}
            <div className="detail-features-cards animate-fade-up delay-2">
              {property.bedrooms > 0 && (
                <div className="feature-stat-card">
                  <IoBedOutline className="icon" />
                  <span className="val">{property.bedrooms}</span>
                  <span className="lbl">Bedrooms</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="feature-stat-card">
                  <LuBath className="icon" />
                  <span className="val">{property.bathrooms}</span>
                  <span className="lbl">Bathrooms</span>
                </div>
              )}
              {property.area > 0 && (
                <div className="feature-stat-card">
                  <LuRuler className="icon" />
                  <span className="val">{property.area}</span>
                  <span className="lbl">{property.area_unit}</span>
                </div>
              )}
              <div className="feature-stat-card">
                <FiCheckCircle className="icon" />
                <span className="val" style={{ textTransform: 'capitalize' }}>{property.property_type}</span>
                <span className="lbl">Type</span>
              </div>
            </div>

            {/* Description */}
            <div className="animate-fade-up delay-3" style={{ marginBottom: '40px' }}>
              <h3 className="detail-section-title">About this property</h3>
              <p className="detail-description-text">{property.description}</p>
            </div>

            {/* Amenities Section */}
            {features.length > 0 && (
              <div className="animate-fade-up delay-4" style={{ marginBottom: '40px' }}>
                <h3 className="detail-section-title">Features & Amenities</h3>
                <div className="amenity-grid">
                  {features.map((f, i) => (
                    <div key={i} className="amenity-tag-lux">
                      <FiCheckCircle /> {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>

          {/* Right Sticky Sidebar */}
          <div className="detail-sidebar-column animate-fade-up delay-5">
            
            {/* Price Box */}
            <div className="sidebar-card-lux" style={{ textAlign: 'center', padding: '32px 24px', background: 'var(--primary-dark)' }}>
              <p style={{ color: 'var(--text-on-dark)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '8px' }}>Guide Price</p>
              <div className="detail-price-lux" style={{ marginTop: 0 }}>
                <span>NPR</span> {formatPrice(property.price)}
                {property.listing_type === 'rent' && <span style={{ color: 'var(--text-on-dark)' }}> /month</span>}
              </div>
            </div>

            {/* Seller Contact Card */}
            <div className="sidebar-card-lux">
              <div className="seller-profile-lux">
                <div className="seller-avatar-lg">
                  {property.seller_name ? property.seller_name.charAt(0).toUpperCase() : 'J'}
                </div>
                <div className="seller-info-lux">
                  <h4>{property.seller_name || 'JKB Agent'}</h4>
                  <p>Listing Agent</p>
                </div>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                {property.seller_phone && (
                  <div className="contact-row">
                    <FiPhone size={18} /> <strong>{property.seller_phone}</strong>
                  </div>
                )}
                {property.seller_email && (
                  <div className="contact-row">
                    <FiMail size={18} /> {property.seller_email}
                  </div>
                )}
              </div>
            </div>

            {/* Inquiry Form Card */}
            <div className="sidebar-card-lux">
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '16px' }}>Request Details</h3>
              
              {inquiryMsg.text && (
                <div className={`alert ${inquiryMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '16px', padding: '12px', fontSize: '0.9rem' }}>
                  {inquiryMsg.text}
                </div>
              )}
              
              <form onSubmit={handleInquiry} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input 
                  className="form-input" 
                  placeholder="Your Full Name" 
                  value={inquiry.name} 
                  onChange={e => setInquiry({...inquiry, name: e.target.value})} 
                  required 
                />
                <input 
                  className="form-input" 
                  type="email" 
                  placeholder="Email Address" 
                  value={inquiry.email} 
                  onChange={e => setInquiry({...inquiry, email: e.target.value})} 
                  required 
                />
                <input 
                  className="form-input" 
                  placeholder="Phone Number" 
                  value={inquiry.phone} 
                  onChange={e => setInquiry({...inquiry, phone: e.target.value})} 
                />
                <textarea 
                  className="form-textarea" 
                  placeholder="I am interested in this property..." 
                  value={inquiry.message} 
                  onChange={e => setInquiry({...inquiry, message: e.target.value})} 
                  required 
                  style={{ minHeight: '100px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>
                  Send Message
                </button>
              </form>
            </div>
            
          </div>
        </div>

        {/* Similar Properties */}
        {similar.length > 0 && (
          <div style={{ marginTop: '80px', borderTop: '1px solid var(--border-light)', paddingTop: '60px' }}>
            <h3 className="detail-section-title" style={{ border: 'none', fontSize: '2.5rem' }}>Similar Properties</h3>
            <p className="text-secondary" style={{ marginBottom: '32px' }}>Explore other exclusive listings you might like.</p>
            <div className="grid-3">
              {similar.filter(s => s.id !== Number(id)).slice(0, 3).map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;
