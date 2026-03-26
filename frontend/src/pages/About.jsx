import { Link } from 'react-router-dom';
import { FiShield, FiUsers, FiTrendingUp, FiCheckCircle, FiHeadphones, FiLock, FiArrowRight, FiMapPin, FiAward } from 'react-icons/fi';
import useScrollReveal from '../hooks/useScrollReveal';

const About = () => {
  useScrollReveal();
  return (
    <div className="about-page">

      {/* Hero Section — Dark Dramatic */}
      <section className="about-hero">
        <div className="about-hero-glow about-hero-glow--right"></div>
        <div className="about-hero-glow about-hero-glow--left"></div>
        <div className="about-hero-container">
          <div className="about-hero-label">
            <span className="about-hero-label-dot"></span>
            OUR STORY
          </div>
          <h1 className="about-hero-title">
            Elevating Real Estate<br />
            in <span>Nepal</span>
          </h1>
          <p className="about-hero-subtitle">
            We're building the most trusted and transparent property platform,
            seamlessly connecting buyers, sellers, and renters across all 77 unique districts.
          </p>
          <div className="about-hero-divider"></div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="about-mission" data-animate>
        <div className="container">
          <div className="about-mission-grid">
            <div className="about-mission-text">
              <div className="section-label" style={{ color: '#A9783A' }}>THE MISSION</div>
              <h2 className="about-mission-title">
                Empowering Your <em>Property</em> Decisions
              </h2>
              <p className="about-mission-desc">
                For decades, the Nepalese real estate market has navigated through fragmented
                information and complex processes. JKB Nepal was born out of a desire for
                clarity and elegance.
              </p>
              <p className="about-mission-desc">
                We provide a single, sophisticated source of truth. Every listing is meticulously
                verified, allowing you to bypass unnecessary hurdles and step into your new
                investment with complete confidence.
              </p>
              <Link to="/properties" className="about-mission-link">
                Explore Our Properties <FiArrowRight size={16} />
              </Link>
            </div>
            <div className="about-mission-image">
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Beautiful Home"
              />
              <div className="about-mission-image-overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="about-values" data-animate>
        <div className="container">
          <div className="about-values-header">
            <div className="section-label" style={{ color: '#A9783A' }}>WHAT DRIVES US</div>
            <h2 className="about-values-title">Our Core <em>Values</em></h2>
          </div>

          <div className="about-values-grid">
            {[
              {
                icon: <FiShield size={28} />,
                title: 'Absolute Trust',
                desc: 'We meticulously verify every listing and agent, maintaining an elegant, spam-free environment for serious buyers and sellers.'
              },
              {
                icon: <FiUsers size={28} />,
                title: 'Direct Clarity',
                desc: 'We bridge the gap instantly, removing friction and allowing transparent, direct negotiations between property parties.'
              },
              {
                icon: <FiTrendingUp size={28} />,
                title: 'Refined Experience',
                desc: 'We utilize state-of-the-art technology to ensure your property search is as fast, beautiful, and intuitive as possible.'
              }
            ].map((item, i) => (
              <div key={i} className="about-value-card">
                <div className="about-value-card-accent"></div>
                <div className="about-value-card-icon">{item.icon}</div>
                <h4 className="about-value-card-title">{item.title}</h4>
                <p className="about-value-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section — Dark Strip */}
      <section className="about-stats" data-animate>
        <div className="about-stats-glow"></div>
        <div className="container">
          <div className="about-stats-header">
            <div className="section-label" style={{ color: '#A9783A' }}>OUR IMPACT</div>
            <h2 className="about-stats-title">By the <em>Numbers</em></h2>
          </div>
          <div className="about-stats-grid">
            {[
              { value: '1,240+', label: 'Verified Listings', icon: <FiCheckCircle size={20} /> },
              { value: '380+', label: 'Trusted Sellers', icon: <FiUsers size={20} /> },
              { value: '77', label: 'Districts Covered', icon: <FiMapPin size={20} /> },
              { value: '98%', label: 'User Satisfaction', icon: <FiAward size={20} /> },
            ].map((s, i) => (
              <div key={i} className="about-stat-card">
                <div className="about-stat-icon">{s.icon}</div>
                <div className="about-stat-value">{s.value}</div>
                <div className="about-stat-divider"></div>
                <div className="about-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="about-trust" data-animate>
        <div className="container">
          <div className="about-trust-header">
            <div className="section-label" style={{ color: '#A9783A' }}>WHY CHOOSE US</div>
            <h2 className="about-trust-title">Built on <em>Trust</em></h2>
          </div>
          <div className="about-trust-grid">
            {[
              {
                icon: <FiCheckCircle size={30} />,
                title: 'Verified Agents',
                desc: 'Every agent on our platform goes through a rigorous verification process to ensure credibility and professionalism.'
              },
              {
                icon: <FiLock size={30} />,
                title: 'Secure Platform',
                desc: 'Your data and transactions are protected with industry-leading security measures and encrypted communications.'
              },
              {
                icon: <FiHeadphones size={30} />,
                title: '24/7 Support',
                desc: 'Our dedicated support team is always available to assist you with any questions or concerns about your property journey.'
              }
            ].map((item, i) => (
              <div key={i} className="about-trust-card">
                <div className="about-trust-card-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" data-animate>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>JOIN THE NETWORK</div>
          <h2>Ready to Find Your <em>Place?</em></h2>
          <p className="cta-subtitle">
            Whether you're looking for a luxury apartment in Kathmandu or an estate in Pokhara,
            JKB Nepal is where your journey begins.
          </p>
          <div className="cta-buttons">
            <Link to="/properties" className="btn-primary">Explore Collection</Link>
            <Link to="/contact" className="btn-outline-light">Get in Touch</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
