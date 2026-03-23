import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { getProperties, getFavorites, toggleFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiList, FiSearch, FiSliders } from 'react-icons/fi';
import '../styles/properties.css';

const MOCK = [
  { id: 1, title: 'Modern Villa with Roof Garden', price: 24500000, property_type: 'house', listing_type: 'buy', bedrooms: 4, bathrooms: 3, area: 3200, area_unit: 'sq.ft', location: 'Budhanilkantha', city: 'Kathmandu', is_featured: true },
  { id: 2, title: 'Contemporary House near Patan', price: 18500000, property_type: 'house', listing_type: 'buy', bedrooms: 3, bathrooms: 2, area: 2400, area_unit: 'sq.ft', location: 'Patan', city: 'Lalitpur', is_featured: true },
  { id: 3, title: 'Apartment in Civil Mall Area', price: 8500000, property_type: 'apartment', listing_type: 'buy', bedrooms: 3, bathrooms: 2, area: 1450, area_unit: 'sq.ft', location: 'Sundhara', city: 'Kathmandu', is_featured: true },
  { id: 4, title: 'Residential Land — River Access', price: 3200000, property_type: 'land', listing_type: 'buy', bedrooms: 0, bathrooms: 0, area: 8, area_unit: 'aana', location: 'Lubhu', city: 'Lalitpur', is_featured: false },
  { id: 5, title: 'Office Space — Durbar Marg', price: 12000000, property_type: 'office', listing_type: 'buy', bedrooms: 0, bathrooms: 1, area: 1800, area_unit: 'sq.ft', location: 'Durbar Marg', city: 'Kathmandu', is_featured: false },
  { id: 6, title: 'Lakeside Rental — Pokhara', price: 45000, property_type: 'rental', listing_type: 'rent', bedrooms: 2, bathrooms: 1, area: 950, area_unit: 'sq.ft', location: 'Lakeside', city: 'Pokhara', is_featured: true },
  { id: 7, title: 'Commercial Building — Chitwan', price: 52000000, property_type: 'commercial', listing_type: 'buy', bedrooms: 0, bathrooms: 4, area: 5600, area_unit: 'sq.ft', location: 'Bharatpur', city: 'Chitwan', is_featured: false },
  { id: 8, title: 'Luxury Apartment — Jhamsikhel', price: 35000000, property_type: 'apartment', listing_type: 'buy', bedrooms: 4, bathrooms: 3, area: 2800, area_unit: 'sq.ft', location: 'Jhamsikhel', city: 'Lalitpur', is_featured: true },
  { id: 9, title: '2BHK Flat — Dharan', price: 4200000, property_type: 'apartment', listing_type: 'buy', bedrooms: 2, bathrooms: 1, area: 980, area_unit: 'sq.ft', location: 'Dharan', city: 'Dharan', is_featured: false },
];

const Properties = () => {
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
    }).catch(() => {
      let filtered = [...MOCK];
      if (filters.city) filtered = filtered.filter(p => p.city === filters.city);
      if (filters.property_type) filtered = filtered.filter(p => p.property_type === filters.property_type);
      if (filters.listing_type) filtered = filtered.filter(p => p.listing_type === filters.listing_type);
      setProperties(filtered);
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
    <div className="properties-page" style={{ paddingTop: '148px', paddingBottom: '60px', background: '#FAFAFA', marginTop: '-88px', minHeight: '100vh' }}>
      <div className="container-wide">
        
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-dark)', marginBottom: '8px' }}>
              Discover <em className="text-gold text-italic">Properties</em>
            </h2>
            <p className="text-secondary" style={{ fontSize: '1rem' }}>
              Showing {properties.length} exclusive listings across Nepal.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', background: 'var(--white)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-dark' : 'btn-outline'}`} onClick={() => setViewMode('grid')} style={{ border: 'none' }}><FiGrid size={18} /></button>
            <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-dark' : 'btn-outline'}`} onClick={() => setViewMode('list')} style={{ border: 'none' }}><FiList size={18} /></button>
          </div>
        </div>

        <div className="premium-search-console">
          <select value={filters.city} onChange={e => updateFilter('city', e.target.value)}>
            <option value="">All Locations</option>
            <option>Kathmandu</option><option>Lalitpur</option><option>Bhaktapur</option>
            <option>Pokhara</option><option>Chitwan</option><option>Butwal</option><option>Dharan</option>
          </select>
          <select value={filters.property_type} onChange={e => updateFilter('property_type', e.target.value)}>
            <option value="">Any Property Type</option>
            <option value="house">House</option><option value="apartment">Apartment</option>
            <option value="land">Land</option><option value="commercial">Commercial</option>
            <option value="office">Office</option><option value="rental">Rental</option>
          </select>
          <select value={filters.listing_type} onChange={e => updateFilter('listing_type', e.target.value)}>
            <option value="">Buy or Rent</option>
            <option value="buy">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
          <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
            <option value="newest">Sort: Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <button className="search-btn" onClick={handleSearchClick}>
            <FiSearch style={{ marginRight: '8px' }} /> Search Properties
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <div className="loading-spinner" style={{ width: 40, height: 40, borderTopColor: 'var(--gold)' }} />
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid-3' : 'grid-1'} style={{ gap: '30px' }}>
            {properties.map(p => (
              <PropertyCard 
                key={p.id} 
                property={p} 
                onFavorite={handleFavorite}
                isFavorite={favorites.includes(p.id)}
              />
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
    </div>
  );
};

export default Properties;
