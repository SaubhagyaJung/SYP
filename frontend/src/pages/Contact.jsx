import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import useScrollReveal from '../hooks/useScrollReveal';

const Contact = () => {
  useScrollReveal();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    }, 1200);
  };

  return (
    <div className="contact-page-v2">
      {/* ── Dark Hero Section ── */}
      <section className="contact-hero">
        <div className="contact-hero-glow contact-hero-glow--right"></div>
        <div className="contact-hero-glow contact-hero-glow--left"></div>
        <div className="contact-hero-inner" data-animate>
          <div className="contact-hero-label">
            <span className="contact-hero-label-dot"></span>
            Get in Touch
          </div>
          <h1 className="contact-hero-title">
            Let's Start a<br /><span>Conversation</span>
          </h1>
          <p className="contact-hero-subtitle">
            Whether you're looking for your dream property or need expert guidance — we're here to help every step of the way.
          </p>
          <div className="contact-hero-divider"></div>
        </div>
      </section>

      {/* ── Contact Info Strip ── */}
      <section className="contact-info-strip">
        <div className="container-wide">
          <div className="contact-info-strip-grid" data-animate>
            <a href="tel:+9779801234567" className="contact-strip-card">
              <div className="contact-strip-icon">
                <FiPhone size={22} />
              </div>
              <div className="contact-strip-text">
                <span className="contact-strip-label">Call Us</span>
                <span className="contact-strip-value">+977 9801-234-567</span>
              </div>
              <FiArrowRight className="contact-strip-arrow" size={16} />
            </a>

            <a href="mailto:info@jkbnepal.com" className="contact-strip-card">
              <div className="contact-strip-icon">
                <FiMail size={22} />
              </div>
              <div className="contact-strip-text">
                <span className="contact-strip-label">Email Us</span>
                <span className="contact-strip-value">info@jkbnepal.com</span>
              </div>
              <FiArrowRight className="contact-strip-arrow" size={16} />
            </a>

            <div className="contact-strip-card">
              <div className="contact-strip-icon">
                <FiMapPin size={22} />
              </div>
              <div className="contact-strip-text">
                <span className="contact-strip-label">Visit Us</span>
                <span className="contact-strip-value">Durbar Marg, Kathmandu</span>
              </div>
            </div>

            <div className="contact-strip-card">
              <div className="contact-strip-icon">
                <FiClock size={22} />
              </div>
              <div className="contact-strip-text">
                <span className="contact-strip-label">Office Hours</span>
                <span className="contact-strip-value">Sun – Fri, 10 AM – 6 PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content: Form + Map ── */}
      <section className="contact-main">
        <div className="container-wide">
          <div className="contact-main-grid">
            {/* Form Column */}
            <div className="contact-form-column" data-animate>
              <div className="contact-form-card">
                <div className="contact-form-header">
                  <h2 className="contact-form-title">Send a Message</h2>
                  <p className="contact-form-desc">
                    Fill out the form below and our team will get back to you within 24 hours.
                  </p>
                </div>

                {sent && (
                  <div className="contact-success-msg">
                    <FiCheckCircle size={20} />
                    <span>Message sent successfully! We'll be in touch soon.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="contact-form-inner">
                  <div className="contact-form-row">
                    <div className="contact-field">
                      <label>Full Name</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="contact-field">
                      <label>Email Address</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="contact-field">
                    <label>Subject</label>
                    <input
                      type="text"
                      placeholder="How can we help?"
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="contact-field">
                    <label>Message</label>
                    <textarea
                      placeholder="Tell us about your inquiry..."
                      rows={6}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="contact-submit-btn" disabled={sending}>
                    {sending ? (
                      <>
                        <span className="contact-spinner"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend size={17} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Side Column */}
            <div className="contact-side-column" data-animate>
              {/* Map placeholder */}
              <div className="contact-map-card">
                <iframe
                  title="JKB Nepal Office"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.282804945508!2d85.31456717549654!3d27.714034976173843!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190a74aa1f23%3A0x74ebef82ad0e5c15!2sDurbar%20Marg%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* FAQ Quick */}
              <div className="contact-faq-card">
                <h4>Frequently Asked</h4>
                <div className="contact-faq-item">
                  <strong>How quickly do you respond?</strong>
                  <p>We typically respond within 24 business hours to all inquiries.</p>
                </div>
                <div className="contact-faq-item">
                  <strong>Can I schedule a property visit?</strong>
                  <p>Absolutely! Mention it in your message and we'll arrange a convenient time.</p>
                </div>
                <div className="contact-faq-item">
                  <strong>Do you charge for consultations?</strong>
                  <p>Initial consultations are completely free. No hidden fees.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
