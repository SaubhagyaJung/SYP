import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="footer-brand">JKB<span>.</span>Nepal</div>
            <p className="footer-desc">
              Nepal's most trusted real estate marketplace. Buy, sell, and invest in properties across all 77 districts.
            </p>
          </div>
          <div>
            <h5 className="footer-heading">BROWSE</h5>
            <div className="footer-links">
              <Link to="/properties?property_type=house">Buy Houses</Link>
              <Link to="/properties?property_type=apartment">Apartments</Link>
              <Link to="/properties?property_type=land">Land Plots</Link>
              <Link to="/properties?property_type=commercial">Commercial</Link>
              <Link to="/properties">All Listings</Link>
            </div>
          </div>
          <div>
            <h5 className="footer-heading">COMPANY</h5>
            <div className="footer-links">
              <Link to="/about">About JKB Nepal</Link>
              <Link to="/#how-it-works">How It Works</Link>
              <Link to="/about#trust">Trust & Safety</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          </div>
          <div>
            <h5 className="footer-heading">LEGAL</h5>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 JKB Nepal Pvt. Ltd. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
