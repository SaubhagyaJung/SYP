import { Link } from 'react-router-dom';
import { FiHeart, FiMapPin, FiCheck } from 'react-icons/fi';
import { IoBedOutline } from 'react-icons/io5';
import { LuBath, LuRuler } from 'react-icons/lu';
import '../styles/properties.css';

const formatPrice = (price) => {
  const num = Number(price);
  if (num >= 10000000) return `NPR ${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `NPR ${(num / 100000).toFixed(1)} Lakh`;
  if (num >= 1000) return `NPR ${(num / 1000).toFixed(0)}K`;
  return `NPR ${num.toLocaleString()}`;
};

// Default property image from uploads
const DEFAULT_PROPERTY_IMG = '/uploads/Properties.png';

const PropertyCard = ({ property, onFavorite, isFavorite }) => {
  
  // Use the uploaded default image if no valid primary_image exists
  let imgSrc = property.primary_image;
  if (!imgSrc || imgSrc.includes('/api/placeholder')) {
    imgSrc = DEFAULT_PROPERTY_IMG;
  }

  return (
    <div className="premium-property-card">
      <Link to={`/properties/${property.id}`}>
        <div className="premium-property-card-img-wrap">
          <img src={imgSrc} alt={property.title} className="premium-property-card-img" loading="lazy" />
          
          <div className="premium-property-badges">
            {property.is_featured && <span className="premium-badge badge-featured-lux">Featured</span>}
            <span className="premium-badge badge-type-lux">
              {property.listing_type === 'buy' ? 'For Sale' : 'For Rent'}
            </span>
          </div>
        </div>
      </Link>
      
      {onFavorite && (
        <button 
          className="premium-fav-btn" 
          onClick={() => onFavorite(property.id)}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <FiHeart 
            fill={isFavorite ? '#E53935' : 'transparent'} 
            color={isFavorite ? '#E53935' : '#111'} 
            size={18} 
          />
        </button>
      )}

      <Link to={`/properties/${property.id}`} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div className="premium-property-card-body">
          <div className="premium-property-price">
            {formatPrice(property.price)}
            {property.listing_type === 'rent' && <span>/mo</span>}
          </div>
          
          <h3 className="premium-property-title">{property.title}</h3>
          
          <div className="premium-property-location">
            <FiMapPin /> {property.location}, {property.city}
          </div>
          
          <div className="premium-property-features">
            {property.bedrooms > 0 && (
              <span className="premium-feature">
                <IoBedOutline /> {property.bedrooms} Beds
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="premium-feature">
                <LuBath /> {property.bathrooms} Baths
              </span>
            )}
            {property.area > 0 && (
              <span className="premium-feature">
                <LuRuler /> {property.area} {property.area_unit}
              </span>
            )}
            {property.bedrooms === 0 && property.bathrooms === 0 && property.area === 0 && (
               <span className="premium-feature">
                  <FiCheck /> Available Now
               </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;
