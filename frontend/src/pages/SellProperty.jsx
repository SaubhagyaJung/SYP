import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty, uploadImages } from '../services/api';
import { FiUploadCloud, FiX, FiHome, FiMapPin, FiDollarSign, FiImage, FiFileText, FiCheckCircle } from 'react-icons/fi';

const STEPS = [
  { label: 'Basic Info', icon: <FiHome size={18} /> },
  { label: 'Location', icon: <FiMapPin size={18} /> },
  { label: 'Details', icon: <FiFileText size={18} /> },
  { label: 'Images', icon: <FiImage size={18} /> },
];

const SellProperty = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '', description: '', price: '', property_type: 'house', listing_type: 'buy',
    bedrooms: '', bathrooms: '', area: '', area_unit: 'sq.ft',
    location: '', city: '', district: '', address: '', features: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let imageUrls = [];
      if (images.length > 0) {
        const fd = new FormData();
        images.forEach(img => fd.append('images', img));
        const uploadRes = await uploadImages(fd);
        imageUrls = uploadRes.data.urls;
      }
      const features = form.features.split(',').map(f => f.trim()).filter(Boolean);
      await createProperty({ ...form, price: Number(form.price), bedrooms: Number(form.bedrooms) || 0, bathrooms: Number(form.bathrooms) || 0, area: Number(form.area) || 0, features, images: imageUrls });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  if (success) {
    return (
      <div className="sell-page-v2">
        <div className="sell-success-screen">
          <div className="sell-success-icon"><FiCheckCircle size={64} /></div>
          <h2>Listing Submitted!</h2>
          <p>Your property has been submitted successfully. It will be reviewed and go live shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sell-page-v2">
      <div className="sell-container">
        {/* Header */}
        <div className="sell-header">
          <div className="sell-header-label">L I S T &nbsp; Y O U R &nbsp; P R O P E R T Y</div>
          <h1 className="sell-header-title">Post a New <span className="text-gold">Listing</span></h1>
          <p className="sell-header-desc">Fill in the details below to list your property on JKB Nepal.</p>
        </div>

        {/* Step Indicator */}
        <div className="sell-steps">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`sell-step-item ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
              onClick={() => i <= step && setStep(i)}
            >
              <div className="sell-step-num">{i < step ? <FiCheckCircle size={18} /> : s.icon}</div>
              <span className="sell-step-label">{s.label}</span>
              {i < STEPS.length - 1 && <div className="sell-step-line" />}
            </div>
          ))}
        </div>

        {error && <div className="auth-error-msg" style={{ marginBottom: '24px' }}>{error}</div>}

        {/* Form Card */}
        <div className="sell-form-card">
          <form onSubmit={handleSubmit}>
            {/* Step 0: Basic Info */}
            <div className={`sell-step-content ${step === 0 ? 'visible' : ''}`}>
              <div className="sell-form-group">
                <label>Property Title</label>
                <input className="sell-input" placeholder="e.g. Modern Villa in Budhanilkantha" value={form.title} onChange={e => update('title', e.target.value)} required />
              </div>
              <div className="sell-form-row">
                <div className="sell-form-group">
                  <label>Property Type</label>
                  <select className="sell-input" value={form.property_type} onChange={e => update('property_type', e.target.value)}>
                    <option value="house">House</option><option value="apartment">Apartment</option>
                    <option value="land">Land</option><option value="commercial">Commercial</option>
                    <option value="office">Office</option><option value="rental">Rental</option>
                  </select>
                </div>
                <div className="sell-form-group">
                  <label>Listing Type</label>
                  <select className="sell-input" value={form.listing_type} onChange={e => update('listing_type', e.target.value)}>
                    <option value="buy">For Sale</option><option value="rent">For Rent</option>
                  </select>
                </div>
              </div>
              <div className="sell-form-row">
                <div className="sell-form-group">
                  <label>Price (NPR)</label>
                  <input className="sell-input" type="number" placeholder="e.g. 15000000" value={form.price} onChange={e => update('price', e.target.value)} required />
                </div>
                <div className="sell-form-group">
                  <label>Area</label>
                  <div className="sell-area-row">
                    <input className="sell-input" type="number" placeholder="e.g. 2400" value={form.area} onChange={e => update('area', e.target.value)} />
                    <select className="sell-input sell-area-unit" value={form.area_unit} onChange={e => update('area_unit', e.target.value)}>
                      <option>sq.ft</option><option>aana</option><option>ropani</option><option>dhur</option><option>kattha</option><option>bigha</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Location */}
            <div className={`sell-step-content ${step === 1 ? 'visible' : ''}`}>
              <div className="sell-form-row">
                <div className="sell-form-group">
                  <label>City</label>
                  <select className="sell-input" value={form.city} onChange={e => update('city', e.target.value)} required>
                    <option value="">Select City</option>
                    <option>Kathmandu</option><option>Lalitpur</option><option>Bhaktapur</option>
                    <option>Pokhara</option><option>Chitwan</option><option>Butwal</option><option>Dharan</option>
                    <option>Biratnagar</option><option>Birgunj</option><option>Hetauda</option>
                    <option>Janakpur</option><option>Nepalgunj</option><option>Itahari</option>
                    <option>Damak</option><option>Dhangadhi</option><option>Tulsipur</option><option>Siddharthanagar</option>
                  </select>
                </div>
                <div className="sell-form-group">
                  <label>Location / Area</label>
                  <input className="sell-input" placeholder="e.g. Budhanilkantha" value={form.location} onChange={e => update('location', e.target.value)} required />
                </div>
              </div>
              <div className="sell-form-group">
                <label>Full Address</label>
                <input className="sell-input" placeholder="Full address of the property" value={form.address} onChange={e => update('address', e.target.value)} />
              </div>
            </div>

            {/* Step 2: Details */}
            <div className={`sell-step-content ${step === 2 ? 'visible' : ''}`}>
              <div className="sell-form-row">
                <div className="sell-form-group">
                  <label>Bedrooms</label>
                  <input className="sell-input" type="number" placeholder="0" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} />
                </div>
                <div className="sell-form-group">
                  <label>Bathrooms</label>
                  <input className="sell-input" type="number" placeholder="0" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} />
                </div>
              </div>
              <div className="sell-form-group">
                <label>Description</label>
                <textarea className="sell-input sell-textarea" placeholder="Describe your property in detail..." value={form.description} onChange={e => update('description', e.target.value)} required />
              </div>
              <div className="sell-form-group">
                <label>Features (comma separated)</label>
                <input className="sell-input" placeholder="Parking, Garden, CCTV, Modular Kitchen" value={form.features} onChange={e => update('features', e.target.value)} />
              </div>
            </div>

            {/* Step 3: Images */}
            <div className={`sell-step-content ${step === 3 ? 'visible' : ''}`}>
              <div className="sell-form-group">
                <label>Property Images</label>
                <label className="sell-upload-area">
                  <FiUploadCloud size={36} />
                  <span>Click or drag to upload images (max 10)</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
                {previews.length > 0 && (
                  <div className="sell-preview-grid">
                    {previews.map((src, i) => (
                      <div key={i} className="sell-preview-item">
                        <img src={src} alt="" />
                        <button className="sell-remove-btn" type="button" onClick={() => removeImage(i)}><FiX size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="sell-nav-buttons">
              {step > 0 && (
                <button type="button" className="sell-btn-back" onClick={prevStep}>Back</button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" className="sell-btn-next" onClick={nextStep}>Continue</button>
              ) : (
                <button type="submit" className="sell-btn-submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Listing'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellProperty;
