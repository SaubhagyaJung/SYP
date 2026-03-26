import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowRight, FiArrowLeft, FiStar, FiSearch, FiFileText, FiMessageCircle, FiCheckCircle, FiHome, FiMap, FiLayers, FiBriefcase, FiKey, FiShoppingBag, FiPlus, FiX } from 'react-icons/fi';
import PropertyCard from '../components/PropertyCard';
import { getFeaturedProperties, getPublicReviews, submitReview } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useScrollReveal from '../hooks/useScrollReveal';

const CATEGORIES = [
  { name: 'House', type: 'house', icon: <FiHome />, count: '1,200+', desc: 'Independent homes, villas, bungalows, and residential houses across Nepal.' },
  { name: 'Land', type: 'land', icon: <FiMap />, count: '3,400+', desc: 'Residential and commercial land plots in prime locations across Nepal.' },
  { name: 'Apartment', type: 'apartment', icon: <FiLayers />, count: '890+', desc: 'Modern apartments, flats, and condos in urban and suburban areas.' },
  { name: 'Commercial', type: 'commercial', icon: <FiShoppingBag />, count: '340+', desc: 'Retail, showroom, co-working, and industrial commercial spaces.' },
  { name: 'Office', type: 'office', icon: <FiBriefcase />, count: '220+', desc: 'Professional office spaces for businesses of all sizes.' },
  { name: 'Rental', type: 'rental', icon: <FiKey />, count: '1,100+', desc: 'Flexible rental properties — from studios to full homes.' },
];

const STEPS = [
  { title: 'Search & Filter', desc: 'Use our powerful filters to find your ideal property by location, type, price, and more.', icon: <FiSearch size={22} /> },
  { title: 'View Details', desc: 'Explore images, descriptions, features, pricing, and full seller information.', icon: <FiFileText size={22} /> },
  { title: 'Connect to Seller', desc: 'Contact the owner directly via our built-in inquiry system.', icon: <FiMessageCircle size={22} /> },
  { title: 'Close Your Deal', desc: 'Finalize your purchase or rental with confidence through trusted transactions.', icon: <FiCheckCircle size={22} /> },
];

// Fallback reviews (used if API fails)
const FALLBACK_REVIEWS = [
  { id: 1, text: 'Found our dream home in Lalitpur within two weeks. The listing was accurate and the seller was genuine. Highly recommend!', author: 'Anita Maharjan', role: 'Homebuyer, Lalitpur', rating: 5 },
  { id: 2, text: 'I listed my property and received a genuine buyer within the first month. No middlemen, no hassle.', author: 'Rajesh Shrestha', role: 'Property Seller, Kathmandu', rating: 5 },
  { id: 3, text: 'As a real estate agent, JKB Nepal has become my go-to platform. The interface is polished and trustworthy.', author: 'Sunita Gurung', role: 'Real Estate Agent, Pokhara', rating: 5 },
  { id: 4, text: 'Invested in commercial property through JKB Nepal. The verification process gave me confidence in every listing I browsed.', author: 'Bikram Thapa', role: 'Investor, Biratnagar', rating: 5 },
  { id: 5, text: 'The search filters made it incredibly easy to find exactly what I was looking for. Moved into our new apartment within a month!', author: 'Priya Acharya', role: 'Homebuyer, Bhaktapur', rating: 5 },
  { id: 6, text: 'Bought a beautiful plot of land in Chitwan. The entire process was seamless and transparent.', author: 'Dipak Karki', role: 'Land Buyer, Chitwan', rating: 4 },
  { id: 7, text: 'Found a perfect rental apartment in Thamel through JKB Nepal. The direct contact with landlords saved me broker fees.', author: 'Srijana Tamang', role: 'Tenant, Kathmandu', rating: 5 },
  { id: 8, text: 'As a developer, listing multiple properties is effortless. The platform reaches genuine buyers across Nepal.', author: 'Mohan Rai', role: 'Property Developer, Pokhara', rating: 5 },
];

const Home = () => {
  useScrollReveal();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [featured, setFeatured] = useState([]);
  const [reviews, setReviews] = useState([]);
  const sliderRef = useRef(null);
  
  // Search state
  const [searchTab, setSearchTab] = useState('buy');
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('');
  
  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ text: '', role: '', rating: 5 });
  const [reviewStatus, setReviewStatus] = useState({ loading: false, error: null, success: false });

  useEffect(() => {
    if (location.hash === '#how-it-works') {
      setTimeout(() => {
        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  useEffect(() => {
    getFeaturedProperties().then(res => setFeatured(res.data)).catch((err) => {
      console.error('Failed to fetch featured properties:', err);
      setFeatured([]);
    });
    getPublicReviews().then(res => setReviews(res.data)).catch(() => setReviews(FALLBACK_REVIEWS));
  }, []);

  const displayReviews = reviews.length > 0 ? reviews : FALLBACK_REVIEWS;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTab) params.set('listing_type', searchTab);
    if (searchCity) params.set('city', searchCity);
    if (searchType) params.set('property_type', searchType);
    navigate(`/properties?${params.toString()}`);
  };

  const scrollTestimonials = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 400; // Adjust based on card width + gap
      sliderRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleOpenReviewModal = () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setShowReviewModal(true);
    setReviewStatus({ loading: false, error: null, success: false });
    setReviewForm({ text: '', role: '', rating: 5 });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.text.trim()) return setReviewStatus({ ...reviewStatus, error: 'Review text cannot be empty.' });
    
    setReviewStatus({ loading: true, error: null, success: false });
    try {
      const res = await submitReview(reviewForm);
      setReviews(prev => [res.data, ...prev]);
      setReviewStatus({ loading: false, error: null, success: true });
      setTimeout(() => setShowReviewModal(false), 2000);
    } catch (err) {
      setReviewStatus({ loading: false, error: 'Failed to submit review. Please try again.', success: false });
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-glow hero-glow-right"></div>
        <div className="hero-glow hero-glow-left"></div>

        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              Nepal's Premier Property Platform
            </div>

            <h1 className="hero-title">
              Find Your <span>Dream</span>
              <br />
              Property in Nepal
            </h1>

            <p className="hero-subtitle">
              Discover verified homes, apartments, land, and commercial spaces across Nepal
              with a trusted, premium property search experience.
            </p>

            <div className="hero-actions">
              <Link to="/properties" className="btn btn-primary btn-lg">
                Browse Properties
              </Link>
              <a href="#how-it-works" className="btn btn-outline-light btn-lg">
                How It Works
              </a>
            </div>

            <div className="hero-stats">
              <div className="hero-stat-card">
                <div className="hero-stat-value">1,240+</div>
                <div className="hero-stat-label">Active Listings</div>
              </div>

              <div className="hero-stat-card">
                <div className="hero-stat-value">380+</div>
                <div className="hero-stat-label">Verified Sellers</div>
              </div>

              <div className="hero-stat-card">
                <div className="hero-stat-value">77</div>
                <div className="hero-stat-label">Districts Covered</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Search */}
      <section className="search-section">
        <div className="container search-container">
          <div className="search-shell">
            <div className="search-tabs-row">
              {['buy', 'rent', 'commercial', 'land'].map(tab => (
                <button
                  key={tab}
                  className={`search-tab-pill ${searchTab === tab ? 'active' : ''}`}
                  onClick={() => setSearchTab(tab)}
                  type="button"
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="search-fields-grid">
              <div className="search-field-block">
                <label>Location</label>
                <div className="search-input-wrap search-select-wrap">
                  <select value={searchCity} onChange={e => setSearchCity(e.target.value)}>
                    <option value="">All Locations</option>
                    <option>Kathmandu</option>
                    <option>Lalitpur</option>
                    <option>Bhaktapur</option>
                    <option>Pokhara</option>
                    <option>Chitwan</option>
                    <option>Butwal</option>
                    <option>Dharan</option>
                    <option>Biratnagar</option>
                    <option>Birgunj</option>
                    <option>Hetauda</option>
                    <option>Janakpur</option>
                    <option>Nepalgunj</option>
                    <option>Itahari</option>
                    <option>Damak</option>
                    <option>Dhangadhi</option>
                    <option>Tulsipur</option>
                    <option>Siddharthanagar</option>
                  </select>
                </div>
              </div>

              <div className="search-field-block">
                <label>Property Type</label>
                <div className="search-input-wrap search-select-wrap">
                  <select value={searchType} onChange={e => setSearchType(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                    <option value="office">Office</option>
                  </select>
                </div>
              </div>

              <div className="search-field-block">
                <label>Price Range</label>
                <div className="search-input-wrap search-select-wrap">
                  <select>
                    <option value="">Any Price</option>
                    <option value="0-5000000">Under 50 Lakh</option>
                    <option value="5000000-10000000">50L – 1 Cr</option>
                    <option value="10000000-30000000">1 Cr – 3 Cr</option>
                    <option value="30000000-999999999">Above 3 Cr</option>
                  </select>
                </div>
              </div>

              <div className="search-field-block">
                <label>Keyword</label>
                <div className="search-input-wrap">
                  <input
                    type="text"
                    placeholder="Baneshwor, 3BHK, land..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch();
                    }}
                  />
                </div>
              </div>

              <button className="search-btn-premium" onClick={handleSearch} type="button">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Featured Properties */}
      <section className="featured-section" data-animate>
        <div className="container">
          <div className="featured-header">
            <div>
              <div className="section-label">Curated Selection</div>
              <h2>Featured <em className="text-gold text-italic">Properties</em></h2>
              <p className="section-subtitle">Hand-picked, verified properties from trusted sellers across Nepal.</p>
            </div>
            <Link to="/properties" className="view-all-link">View All <FiArrowRight /></Link>
          </div>
          <div className="grid-3">
            {featured.slice(0, 6).map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="category-section" data-animate>
        <div className="container">
          <div className="section-label">Explore</div>
          <h2>Browse by <em className="text-gold text-italic">Category</em></h2>
          <p className="section-subtitle">Find the property type based on your needs — from studios to full commercial spaces.</p>
          <div className="category-grid">
            {CATEGORIES.map(cat => (
              <Link key={cat.type} to={`/properties?property_type=${cat.type}`} className="category-card">
                <div className="category-header-wrap">
                  <div className="category-icon-wrap">{cat.icon}</div>
                  <div className="category-card-count">{cat.count} listings</div>
                </div>
                <h4>{cat.name}</h4>
                <p>{cat.desc}</p>
                <div className="category-card-link">Explore {cat.name} <FiArrowRight className="explore-arrow" /></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      {/* Why JKB */}
      <section className="why-jkb-section" id="why" data-animate>
        <div className="container why-jkb-container">
          <div className="why-jkb-grid">
            <div className="why-jkb-left">
              <div className="why-jkb-tag">Why JKB Nepal</div>

              <h2 className="why-jkb-title">
                Nepal's Most <span>Trusted</span>
                <br />
                Property Platform
              </h2>

              <p className="why-jkb-subtitle">
                Built specifically for Nepal's real estate landscape — with local knowledge,
                verified listings, and transparent processes.
              </p>

              <div className="why-jkb-points">
                <div className="why-jkb-point">
                  <div className="why-jkb-point-num">01</div>
                  <div className="why-jkb-point-content">
                    <h4>Verified Listings Only</h4>
                    <p>
                      Every property is reviewed before going live. No duplicates, no fraud,
                      no misleading details.
                    </p>
                  </div>
                </div>

                <div className="why-jkb-point">
                  <div className="why-jkb-point-num">02</div>
                  <div className="why-jkb-point-content">
                    <h4>Nepal-Specific Structure</h4>
                    <p>
                      Properties listed in local formats — Ropani, Anna, Dhur — with districts,
                      municipalities, wards.
                    </p>
                  </div>
                </div>

                <div className="why-jkb-point">
                  <div className="why-jkb-point-num">03</div>
                  <div className="why-jkb-point-content">
                    <h4>Direct Seller Contact</h4>
                    <p>
                      Reach sellers directly with zero middleman fees through our secure inquiry
                      system.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="why-jkb-right">
              <div className="why-jkb-stats-panel">
                <div className="why-jkb-stat-card">
                  <div className="why-jkb-stat-value">1,240</div>
                  <div className="why-jkb-stat-label">Active Properties</div>
                </div>

                <div className="why-jkb-stat-card">
                  <div className="why-jkb-stat-value">98%</div>
                  <div className="why-jkb-stat-label">Verified Listings</div>
                </div>

                <div className="why-jkb-stat-card">
                  <div className="why-jkb-stat-value">77</div>
                  <div className="why-jkb-stat-label">Districts Covered</div>
                </div>

                <div className="why-jkb-stat-card">
                  <div className="why-jkb-stat-value">380+</div>
                  <div className="why-jkb-stat-label">Trusted Sellers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-section" data-animate>
        <div className="container">
          <div className="section-label">Simple Process</div>
          <h2>How It <em className="text-gold text-italic">Works</em></h2>
          <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 50px', maxWidth: '600px' }}>Your journey to finding the perfect property, simplified into four easy steps.</p>
          <div className="how-steps">
            <div className="how-steps-connector"></div>
            {STEPS.map((step, i) => (
              <div key={i} className="how-step-card">
                <div className="how-step-icon-wrap">
                  <div className="how-step-icon">{step.icon}</div>
                </div>
                <h5>{step.title}</h5>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — Client Slider */}
      <section className="client-reviews-section" data-animate>
        <div className="container client-reviews-container">
          <div className="client-reviews-header">
            <div className="client-reviews-title-block">
              <div className="client-section-label">O U R &nbsp; R E V I E W S</div>
              <h2 className="client-reviews-title">
                What Our <span className="text-muted">Clients</span> Say
              </h2>
            </div>
            
            {/* Keeping the add review feature accessible on the top right on larger screens, underneath on mobile */}
            <button className="btn btn-primary add-review-top-btn" onClick={handleOpenReviewModal} style={{ gap: '8px', marginLeft: 'auto' }}>
              <FiPlus /> Add Review
            </button>
          </div>
          
          <div className="client-slider-wrapper">
            <button className="client-nav-btn client-nav-prev" onClick={() => scrollTestimonials('left')} aria-label="Previous">
              <FiArrowLeft size={18} />
            </button>

            <div className="client-slider-track" ref={sliderRef}>
              {displayReviews.map((t, i) => (
                <div key={`rev-${i}`} className="client-review-card">
                  <div className="client-card-top">
                    <div className="client-avatar">
                     {/* In a real scenario these would be actual images, using initials for now */}
                     {t.author.charAt(0)}
                    </div>
                    <div className="client-brand-pill">
                      <FiStar fill="currentColor" size={14} /> 
                      <span>{Number(t.rating) ? Number(t.rating).toFixed(1) : '5.0'} Rating</span>
                    </div>
                  </div>
                  
                  <div className="client-quote-icon">“</div>
                  
                  <p className="client-review-text">{t.text}</p>
                  
                  <div className="client-author-block">
                    <div className="client-author-name">{t.author}</div>
                    <div className="client-author-role">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="client-nav-btn client-nav-next" onClick={() => scrollTestimonials('right')} aria-label="Next">
              <FiArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" data-animate>
        <div className="container">
          <div className="section-label">For Property Owners</div>
          <h2>Ready to <em className="text-gold text-italic">List</em> Your Property?</h2>
          <p className="cta-subtitle">Join 380+ verified sellers on JKB Nepal. Reach genuine buyers across the country with a free listing.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
            <Link to="/properties" className="btn btn-outline-light btn-lg">Browse Listings</Link>
          </div>
        </div>
      </section>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content review-modal">
            <div className="modal-header">
              <h3>Share Your Experience</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowReviewModal(false)}
                disabled={reviewStatus.loading}
              >
                <FiX size={24} />
              </button>
            </div>
            
            {reviewStatus.success ? (
              <div className="modal-body review-modal-success">
                <div className="success-icon"><FiCheckCircle size={48} /></div>
                <h4>Thank You!</h4>
                <p>Your review has been successfully submitted and is now visible on the platform.</p>
              </div>
            ) : (
              <div className="modal-body">
                <form onSubmit={handleReviewSubmit}>
                  {reviewStatus.error && <div className="form-error">{reviewStatus.error}</div>}
                  
                  <div className="form-group">
                    <label>Rating</label>
                    <div className="rating-select-slider">
                      <div className="rating-display">
                        <FiStar fill="var(--gold)" stroke="var(--gold)" size={24} />
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                          {Number(reviewForm.rating).toFixed(1)}
                        </span>
                        <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>/ 5.0</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        step="0.1" 
                        className="rating-range-input"
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({ ...reviewForm, rating: parseFloat(e.target.value) })}
                        disabled={reviewStatus.loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">Your Role / Location (Optional)</label>
                    <input
                      type="text"
                      id="role"
                      className="form-input"
                      placeholder="e.g. Homebuyer, Kathmandu"
                      value={reviewForm.role}
                      onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })}
                      disabled={reviewStatus.loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="text">Your Review</label>
                    <textarea
                      id="text"
                      className="form-input"
                      placeholder="Tell us about your experience with JKB Nepal..."
                      rows={5}
                      value={reviewForm.text}
                      onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                      disabled={reviewStatus.loading}
                      required
                    ></textarea>
                  </div>

                  <div className="modal-actions" style={{ marginTop: '24px' }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={reviewStatus.loading || !reviewForm.text.trim()}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      {reviewStatus.loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
