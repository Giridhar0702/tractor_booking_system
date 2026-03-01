import { Tractor, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Company Info Section */}
            <div className="footer-section">
              <div className="footer-logo">
                <Tractor size={24} color="#22c55e" />
                <span className="font-bold text-lg">AgriRent</span>
              </div>
              <p className="footer-description">
                Making farm equipment rental simple, accessible, and affordable for farmers across the region.
              </p>
              <div className="footer-contact">
                <div className="contact-item">
                  <MapPin size={16} />
                  <span>123 Farm Road, Agricultural District</span>
                </div>
                <div className="contact-item">
                  <Phone size={16} />
                  <span>+91 9360772070</span>
                </div>
                <div className="contact-item">
                  <Mail size={16} />
                  <span>support@agrirent.com</span>
                </div>
              </div>
            </div>

            {/* Company Links */}
            <div className="footer-section">
              <h4 className="footer-title">Company</h4>
              <ul className="footer-links">
                <li><Link to="/">About Us</Link></li>
                <li><Link to="/">How It Works</Link></li>
                <li><Link to="/">Blog</Link></li>
                <li><Link to="/">Careers</Link></li>
                <li><Link to="/">Press</Link></li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="footer-section">
              <h4 className="footer-title">Support</h4>
              <ul className="footer-links">
                <li><Link to="/">Help Center</Link></li>
                <li><Link to="/">Contact Us</Link></li>
                <li><Link to="/">FAQs</Link></li>
                <li><Link to="/">Pricing</Link></li>
                <li><Link to="/">Report Issue</Link></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="footer-section">
              <h4 className="footer-title">Legal</h4>
              <ul className="footer-links">
                <li><Link to="/">Terms of Service</Link></li>
                <li><Link to="/">Privacy Policy</Link></li>
                <li><Link to="/">Cookie Policy</Link></li>
                <li><Link to="/">Terms for Owners</Link></li>
                <li><Link to="/">Terms for Renters</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              © {currentYear} AgriRent Platform. All rights reserved.
            </div>
            <div className="footer-socials">
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
