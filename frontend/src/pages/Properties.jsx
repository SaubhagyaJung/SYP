import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { getProperties, getFavorites, toggleFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiList, FiSearch, FiSliders, FiMapPin, FiHome, FiTag, FiTrendingUp } from 'react-icons/fi';
import useScrollReveal from '../hooks/useScrollReveal';
import '../styles/properties.css';

const Properties = () => {
  useScrollReveal();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    property_type: searchParams.get('property_type') || '',
    listing_type: searchParams.get('listing_type') || '',
    min_price: '', max_price: '', bedrooms: '',
    sort: 'newest',
  });
  const [viewMode, setViewMode] = useState('grid');
  const [forceTrigger, setForceTrigger] = useState(0);

  // Fetch properties based on search filters
  useEffect(() => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    
    getProperties(params).then(res => {
      setProperties(res.data.properties || res.data);
    }).catch((err) => {
      console.error('Failed to fetch properties:', err);
      setProperties([]);
    }).finally(() => setLoading(false));
  }, [forceTrigger]); 

  // Fetch favorites if user is logged in
  useEffect(() => {
    if (user) {
      getFavorites()
        .then(res => setFavorites(res.data.map(p => p.id)))
        .catch(() => {});
    } else {
      setFavorites([]);
    }
  }, [user]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearchClick = () => {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) searchParams.set(key, value); else searchParams.delete(key);
    });
    setSearchParams(searchParams);
    setForceTrigger(prev => prev + 1);
  };

  const handleFavorite = async (propertyId) => {
    if (!user) {
      // Must be logged in to favorite
      navigate('/login');
      return;
    }
    
    try {
      await toggleFavorite(propertyId);
      setFavorites(prev => 
        prev.includes(propertyId) 
          ? prev.filter(id => id !== propertyId)
          : [...prev, propertyId]
      );
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  return (
    <div className="properties-page" style={{ background: '#FAFAFA', marginTop: '-88px', minHeight: '100vh' }}>
      
      {/* Premium Hero Section */}
      <section className="properties-hero hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-glow hero-glow-right"></div>
        <div className="hero-glow hero-glow-left"></div>
        
        <div className="container-wide" style={{ position: 'relative', zIndex: 2, paddingTop: '160px', paddingBottom: '40px' }}>
          <div className="properties-hero-content" data-animate>
            <div className="properties-hero-badge">Exclusive Listings</div>
            <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>
              Discover <em className="text-gold text-italic">Properties</em>
            </h1>
            <p className="hero-subtitle" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 0 28px', color: 'rgba(255,255,255,0.7)' }}>
              Showing {properties.length} exclusive listings across Nepal. Find your dream home, land, or commercial space today.
            </p>
            <div className="properties-hero-stats">
              <div className="properties-hero-stat"><span>{properties.length}</span> Listings</div>
              <div className="properties-hero-stat-divider"></div>
              <div className="properties-hero-stat"><span>17</span> Locations</div>
              <div className="properties-hero-stat-divider"></div>
              <div className="properties-hero-stat"><span>380+</span> Verified Sellers</div>
            </div>
          </div>

          {/* Elevated Search Console */}
          <div className="premium-search-console-wrapper" data-animate style={{ animationDelay: '0.2s' }}>
            <div className="premium-search-console">
              <div className="search-filter-group">
                <div className="search-filter-label"><FiMapPin size={13} /> Location</div>
                <select value={filters.city} onChange={e => updateFilter('city', e.target.value)}>
                  <option value="">All Locations</option>
                  <option>Kathmandu</option><option>Lalitpur</option><option>Bhaktapur</option>
                  <option>Pokhara</option><option>Chitwan</option><option>Butwal</option><option>Dharan</option>
                  <option>Biratnagar</option><option>Birgunj</option><option>Hetauda</option>
                  <option>Janakpur</option><option>Nepalgunj</option><option>Itahari</option>
                  <option>Damak</option><option>Dhangadhi</option><option>Tulsipur</option><option>Siddharthanagar</option>
                </select>
              </div>
              <div className="search-filter-divider"></div>
              <div className="search-filter-group">
                <div className="search-filter-label"><FiHome size={13} /> Type</div>
                <select value={filters.property_type} onChange={e => updateFilter('property_type', e.target.value)}>
                  <option value="">Any Property Type</option>
                  <option value="house">House</option><option value="apartment">Apartment</option>
                  <option value="land">Land</option><option value="commercial">Commercial</option>
                  <option value="office">Office</option><option value="rental">Rental</option>
                </select>
              </div>
              <div className="search-filter-divider"></div>
              <div className="search-filter-group">
                <div className="search-filter-label"><FiTag size={13} /> Purpose</div>
                <select value={filters.listing_type} onChange={e => updateFilter('listing_type', e.target.value)}>
                  <option value="">Buy or Rent</option>
                  <option value="buy">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
              <div className="search-filter-divider"></div>
              <div className="search-filter-group">
                <div className="search-filter-label"><FiTrendingUp size={13} /> Sort By</div>
                <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
              </div>
              <button className="search-btn" onClick={handleSearchClick}>
                <FiSearch size={18} />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="properties-results-section" style={{ padding: '60px 0 100px' }}>
        <div className="container-wide">
          
          <div className="properties-controls-bar" data-animate style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--primary-dark)', margin: 0 }}>
              Top <span className="text-gold">Matches</span>
            </h3>
            <div className="view-mode-toggles" style={{ display: 'flex', gap: '8px', background: 'var(--white)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-dark' : 'btn-outline'}`} onClick={() => setViewMode('grid')} style={{ border: 'none', padding: '8px 16px', borderRadius: '8px' }}><FiGrid size={18} /></button>
              <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-dark' : 'btn-outline'}`} onClick={() => setViewMode('list')} style={{ border: 'none', padding: '8px 16px', borderRadius: '8px' }}><FiList size={18} /></button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <div className="loading-spinner" style={{ width: 40, height: 40, borderTopColor: 'var(--gold)' }} />
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid-3' : 'grid-1'} style={{ gap: '30px' }}>
              {properties.map((p, index) => (
                <div 
                  key={p.id} 
                  className="property-card-stagger"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <PropertyCard 
                    property={p} 
                    onFavorite={handleFavorite}
                    isFavorite={favorites.includes(p.id)}
                  />
                </div>
              ))}
            </div>
          )}

        {!loading && properties.length === 0 && (
          <div className="empty-state-elegant" style={{ marginTop: '20px' }}>
            <FiSliders className="empty-state-elegant-icon" />
            <h4>No properties match your exact criteria</h4>
            <p style={{ maxWidth: 400, margin: '0 auto 24px' }}>Try adjusting your filters, location, or property type to discover more exclusive listings.</p>
            <button className="btn btn-outline" onClick={() => {
              setFilters({ city: '', property_type: '', listing_type: '', min_price: '', max_price: '', bedrooms: '', sort: 'newest' });
              setForceTrigger(t => t + 1);
            }}>
              Clear Filters
            </button>
          </div>
        )}
        </div>
      </section>
    </div>
  );
};

export default Properties;
