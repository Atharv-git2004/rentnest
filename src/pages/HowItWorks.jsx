import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  // Track active hover state to drive luxury interactive lift transitions
  const [hoveredElement, setHoveredElement] = useState(null);

  // 🎨 Premium Emerald & Slate Unified Styling System
  const styles = {
    container: {
      padding: '80px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      backgroundColor: '#ffffff',
    },
    header: {
      textAlign: 'center',
      marginBottom: '60px',
    },
    mainTitle: {
      fontSize: '36px',
      color: '#0f172a', // Slate 900
      marginBottom: '16px',
      fontWeight: '800',
      letterSpacing: '-0.03em',
    },
    subtitle: {
      color: '#64748b', // Slate 500
      fontSize: '16px',
      maxWidth: '750px',
      margin: '0 auto',
      lineHeight: '1.6',
      fontWeight: '500',
    },
    sectionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: '40px',
      marginBottom: '50px',
    },
    column: {
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      // High-end subtle 3D shadow depth layering
      boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.04), 0 10px 10px -5px rgba(15, 23, 42, 0.02)',
      padding: '40px 35px',
      border: '1px solid #f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'all 0.3s ease',
    },
    columnHeaderTenant: {
      borderBottom: '3px solid #10b981', // Unified Brand Accent
      paddingBottom: '20px',
      marginBottom: '30px',
    },
    columnHeaderOwner: {
      borderBottom: '3px solid #059669', // Darker Emerald Accent
      paddingBottom: '20px',
      marginBottom: '30px',
    },
    colTitle: {
      fontSize: '22px',
      fontWeight: '800',
      color: '#0f172a',
      margin: '0 0 8px 0',
    },
    colDesc: {
      fontSize: '14px',
      color: '#64748b',
      margin: 0,
      fontWeight: '500',
    },
    stepCard: {
      display: 'flex',
      gap: '20px',
      alignItems: 'flex-start',
      marginBottom: '24px',
      padding: '20px',
      borderRadius: '16px',
      backgroundColor: '#f8fafc', // Modern Off-white/slate fallback
      border: '1px solid #f1f5f9',
    },
    stepNumberTenant: {
      backgroundColor: '#ecfdf5',
      color: '#059669',
      minWidth: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '800',
      fontSize: '15px',
    },
    stepNumberOwner: {
      backgroundColor: '#f0fdf4',
      color: '#16a34a',
      minWidth: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '800',
      fontSize: '15px',
    },
    stepHeading: {
      margin: '0 0 6px 0',
      color: '#0f172a',
      fontSize: '16px',
      fontWeight: '700',
    },
    stepText: {
      margin: 0,
      color: '#475569', // Slate 600
      fontSize: '14px',
      lineHeight: '1.5',
    },
    tenantButton: {
      display: 'block',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#ffffff',
      padding: '14px',
      borderRadius: '12px',
      textDecoration: 'none',
      fontWeight: '700',
      fontSize: '15px',
      marginTop: '20px',
      boxShadow: hoveredElement === 'tenantBtn' ? '0 12px 20px -6px rgba(16, 185, 129, 0.4)' : 'none',
      transform: hoveredElement === 'tenantBtn' ? 'translateY(-2px)' : 'translateY(0)',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    ownerButton: {
      display: 'block',
      textAlign: 'center',
      backgroundColor: '#ffffff',
      color: '#0f172a',
      padding: '13px',
      borderRadius: '12px',
      textDecoration: 'none',
      fontWeight: '700',
      fontSize: '15px',
      marginTop: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: hoveredElement === 'ownerBtn' ? '0 10px 15px -3px rgba(15, 23, 42, 0.05)' : 'none',
      transform: hoveredElement === 'ownerBtn' ? 'translateY(-2px)' : 'translateY(0)',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    safetyBox: {
      marginTop: '60px',
      padding: '24px',
      backgroundColor: '#fff9db', // Extremely soft warning yellow
      borderLeft: '4px solid #f59e0b',
      borderRadius: '12px',
    },
    safetyTitle: {
      margin: '0 0 6px 0',
      color: '#78350f',
      fontWeight: '700',
      fontSize: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    safetyText: {
      margin: 0,
      color: '#92400e',
      fontSize: '14px',
      lineHeight: '1.6',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      
      {/* 🚀 Dynamic Section Header */}
      <div style={styles.header}>
        <h1 style={styles.mainTitle}>How It Works</h1>
        <p style={styles.subtitle}>
          Zero brokers, zero hidden commission fees. RentNest Kerala directly links trusted property 
          owners with premium renters instantly and transparently.
        </p>
      </div>

      {/* 👥 Split Client Architecture Grid */}
      <div style={styles.sectionGrid}>
        
        {/* 🏠 1. For Renters / Tenants Module */}
        <div style={styles.column}>
          <div>
            <div style={styles.columnHeaderTenant}>
              <h2 style={styles.colTitle}>For Tenants 🔍</h2>
              <p style={styles.colDesc}>Secure your perfect dream home space in 3 effortless steps</p>
            </div>
            
            <div style={styles.stepCard}>
              <div style={styles.stepNumberTenant}>1</div>
              <div>
                <h3 style={styles.stepHeading}>Browse Listings</h3>
                <p style={styles.stepText}>Explore verified properties using advanced regional, budget, and configuration filters.</p>
              </div>
            </div>

            <div style={styles.stepCard}>
              <div style={styles.stepNumberTenant}>2</div>
              <div>
                <h3 style={styles.stepHeading}>Review Details</h3>
                <p style={styles.stepText}>Analyze structural breakdowns, localized pricing documentation, and premium space photos.</p>
              </div>
            </div>

            <div style={styles.stepCard}>
              <div style={styles.stepNumberTenant}>3</div>
              <div>
                <h3 style={styles.stepHeading}>Connect Directly</h3>
                <p style={styles.stepText}>Bypass middleman channels. Reach out straight to the verified homeowner to strike a lease deal.</p>
              </div>
            </div>
          </div>

          <Link 
            to="/properties" 
            style={styles.tenantButton}
            onMouseEnter={() => setHoveredElement('tenantBtn')}
            onMouseLeave={() => setHoveredElement(null)}
          >
            Explore Properties
          </Link>
        </div>

        {/* 🔑 2. For Landlords / Property Owners Module */}
        <div style={styles.column}>
          <div>
            <div style={styles.columnHeaderOwner}>
              <h2 style={styles.colTitle}>For Owners 👑</h2>
              <p style={styles.colDesc}>Onboard and lease out your premium real estate assets quickly</p>
            </div>

            <div style={styles.stepCard}>
              <div style={styles.stepNumberOwner}>1</div>
              <div>
                <h3 style={styles.stepHeading}>Create Profile</h3>
                <p style={styles.stepText}>Register seamlessly as an explicit landlord/owner entity on our portal completely free.</p>
              </div>
            </div>

            <div style={styles.stepCard}>
              <div style={styles.stepNumberOwner}>2</div>
              <div>
                <h3 style={styles.stepHeading}>List Your Property</h3>
                <p style={styles.stepText}>Utilize the dashboard engine to upload asset media, geographic details, rules, and pricing markers.</p>
              </div>
            </div>

            <div style={styles.stepCard}>
              <div style={styles.stepNumberOwner}>3</div>
              <div>
                <h3 style={styles.stepHeading}>Earn & Rent Out</h3>
                <p style={styles.stepText}>Receive unfiltered, structured requests directly from verified tenants locally or globally.</p>
              </div>
            </div>
          </div>

          <Link 
            to="/register" 
            style={styles.ownerButton}
            onMouseEnter={() => setHoveredElement('ownerBtn')}
            onMouseLeave={() => setHoveredElement(null)}
          >
            Register as Owner
          </Link>
        </div>

      </div>

      {/* 🛡️ Secure Verification & Compliance Footer Alert */}
      <div style={styles.safetyBox}>
        <h4 style={styles.safetyTitle}>💡 Safety & Verification Advisory:</h4>
        <p style={styles.safetyText}>
          RentNest works as an direct matching platform. To protect your financial security, always visit the real estate 
          location physically and verify complete ownership credentials before executing advance token deposits or legally binding signatures.
        </p>
      </div>
    </div>
  );
};

export default HowItWorks;