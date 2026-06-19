import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const styles = {
    footer: {
      backgroundColor: '#15803d', // Dark Emerald Green
      color: '#ffffff',
      padding: '40px 50px 20px 50px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      marginTop: 'auto',
    },
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '30px',
      maxWidth: '1200px',
      margin: '0 auto',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      paddingBottom: '30px',
    },
    brandSection: { flex: '1', minWidth: '250px' },
    logo: { fontSize: '22px', fontWeight: '700', marginBottom: '12px' },
    logoSpan: { color: '#bae6fd' },
    description: { fontSize: '14px', color: '#e2e8f0', lineHeight: '1.6' },
    linksSection: { display: 'flex', gap: '50px', flexWrap: 'wrap' },
    linkColumn: { display: 'flex', flexDirection: 'column', gap: '10px' },
    columnTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '5px', color: '#bae6fd' },
    link: { color: '#f1f5f9', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' },
    bottomBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '15px',
      maxWidth: '1200px',
      margin: '20px auto 0 auto',
      fontSize: '13px',
      color: '#cbd5e1',
    },
    socials: { display: 'flex', gap: '15px' },
    socialIcon: { color: '#ffffff', textDecoration: 'none', fontSize: '16px' }
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.brandSection}>
          <div style={styles.logo}>
            RentNest<span style={styles.logoSpan}> Kerala</span>
          </div>
          <p style={styles.description}>
            Find your perfect stay in God's Own Country. We connect house owners and tenants easily and securely.
          </p>
        </div>

        <div style={styles.linksSection}>
          <div style={styles.linkColumn}>
            <span style={styles.columnTitle}>About</span>
            <Link to="/about" style={styles.link}>Our Story</Link>
            <Link to="/careers" style={styles.link}>Careers</Link>
            <Link to="/blog" style={styles.link}>Blog</Link>
          </div>

          <div style={styles.linkColumn}>
            <span style={styles.columnTitle}>Terms</span>
            <Link to="/privacy" style={styles.link}>Privacy Policy</Link>
            <Link to="/terms" style={styles.link}>Terms of Service</Link>
            <Link to="/safety" style={styles.link}>Trust & Safety</Link>
          </div>

          <div style={styles.linkColumn}>
            <span style={styles.columnTitle}>Contact</span>
            <Link to="/help" style={styles.link}>Help Center</Link>
            <Link to="/support" style={styles.link}>Local Support</Link>
            <Link to="/advertise" style={styles.link}>Advertise</Link>
          </div>
        </div>
      </div>

      <div style={styles.bottomBar}>
        <div>&copy; {new Date().getFullYear()} RentNest Kerala. All rights reserved.</div>
        <div style={styles.socials}>
          <a href="#" style={styles.socialIcon}>FB</a>
          <a href="#" style={styles.socialIcon}>IG</a>
          <a href="#" style={styles.socialIcon}>TW</a>
          <a href="#" style={styles.socialIcon}>LN</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;