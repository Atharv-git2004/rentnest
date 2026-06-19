import React, { useState } from 'react';

const Offers = () => {
  const [copiedCode, setCopiedCode] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  // 📋 Clipboard API mechanism to copy text and toggle success states safely
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000); // Clears tracking flag after 2 seconds
  };

  // 🎁 Unified Live Promotion Repositories
  const tenantOffers = [
    {
      id: 1,
      title: 'First Month Rent Discount! 🏡',
      description: 'Claim a flat 10% discount on your initial month rent fee when secure your first home booking via RentNest.',
      code: 'NESTNEW10',
      tag: 'New User',
    },
    {
      id: 2,
      title: 'Zero Brokerage Premium ⚡',
      description: 'Unlock priority properties with absolutely zero hidden agent markups or middleman platform processing fees.',
      code: 'ZEROFEE',
      tag: 'Limited Time',
    }
  ];

  const ownerOffers = [
    {
      id: 3,
      title: 'Free Premium Boost 👑',
      description: 'Get an exclusive high-visibility Premium verified badge completely free for 3 months upon property onboarding.',
      code: 'FREEOWNER',
      tag: 'Owners Only',
    },
    {
      id: 4,
      title: 'Festival Season Dhamaka 🌸',
      description: 'Boost your asset visibility across prime regions during festive seasons like Onam or Vishu with a 50% ad discount.',
      code: 'KERALAFEST',
      tag: 'Festival Special',
    }
  ];

  // 🎨 High-End Premium Design Tokens
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
      maxWidth: '720px',
      margin: '0 auto',
      lineHeight: '1.6',
      fontWeight: '500',
    },
    section: {
      marginBottom: '60px',
    },
    sectionTitle: {
      fontSize: '22px',
      color: '#0f172a',
      fontWeight: '800',
      marginBottom: '28px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: '30px',
    },
    card: (id) => ({
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      padding: '35px 30px 30px 30px',
      boxShadow: hoveredCard === id 
        ? '0 20px 25px -5px rgba(15, 23, 42, 0.06), 0 10px 10px -5px rgba(15, 23, 42, 0.02)'
        : '0 4px 6px -1px rgba(15, 23, 42, 0.02), 0 2px 4px -1px rgba(15, 23, 42, 0.01)',
      border: '1px solid #f1f5f9',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transform: hoveredCard === id ? 'translateY(-4px)' : 'translateY(0)',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    }),
    badge: {
      position: 'absolute',
      top: '20px',
      right: '25px',
      backgroundColor: '#ecfdf5', // Soft emerald tint
      color: '#059669', // Emerald Text
      padding: '6px 14px',
      borderRadius: '30px',
      fontSize: '12px',
      fontWeight: '700',
      letterSpacing: '0.02em',
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#0f172a',
      marginTop: '10px',
      marginBottom: '12px',
    },
    cardDesc: {
      color: '#475569', // Slate 600
      fontSize: '14px',
      lineHeight: '1.6',
      marginBottom: '25px',
    },
    codeSection: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#f8fafc',
      padding: '12px 16px',
      borderRadius: '14px',
      border: '1px dashed #cbd5e1',
    },
    codeText: {
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontWeight: '800',
      fontSize: '16px',
      color: '#0f172a',
      letterSpacing: '1.5px',
    },
    copyButton: (id) => ({
      background: copiedCode === id 
        ? '#0f172a'
        : (hoveredBtn === id ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'),
      color: '#ffffff',
      border: 'none',
      padding: '10px 18px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '13px',
      transition: 'all 0.2s ease',
      boxShadow: copiedCode !== id && hoveredBtn === id ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none',
    })
  };

  return (
    <div style={styles.container}>
      
      {/* 🎉 Cinematic Header Segment */}
      <div style={styles.header}>
        <h1 style={styles.mainTitle}>Exclusive Rewards & Offers</h1>
        <p style={styles.subtitle}>
          Maximize your real estate savings. Whether you are hunting for a premium lease or list down 
          your family rental asset, utilize our premium verified vouchers below.
        </p>
      </div>

      {/* 🏠 Tenant Incentive Block */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <span style={{ color: '#10b981' }}>🔍</span> For Verified Renters
        </h2>
        <div style={styles.grid}>
          {tenantOffers.map((offer) => (
            <div 
              key={offer.id} 
              style={styles.card(offer.id)}
              onMouseEnter={() => setHoveredCard(offer.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <span style={styles.badge}>{offer.tag}</span>
              <div>
                <h3 style={styles.cardTitle}>{offer.title}</h3>
                <p style={styles.cardDesc}>{offer.description}</p>
              </div>
              <div style={styles.codeSection}>
                <span style={styles.codeText}>{offer.code}</span>
                <button 
                  onClick={() => handleCopyCode(offer.code)} 
                  style={styles.copyButton(offer.id)}
                  onMouseEnter={() => setHoveredBtn(offer.id)}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  {copiedCode === offer.code ? 'Copied! ✅' : 'Copy Code'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔑 Landlord Incentive Block */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <span style={{ color: '#10b981' }}>👑</span> For Property Owners
        </h2>
        <div style={styles.grid}>
          {ownerOffers.map((offer) => (
            <div 
              key={offer.id} 
              style={styles.card(offer.id)}
              onMouseEnter={() => setHoveredCard(offer.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <span style={styles.badge}>{offer.tag}</span>
              <div>
                <h3 style={styles.cardTitle}>{offer.title}</h3>
                <p style={styles.cardDesc}>{offer.description}</p>
              </div>
              <div style={styles.codeSection}>
                <span style={styles.codeText}>{offer.code}</span>
                <button 
                  onClick={() => handleCopyCode(offer.code)} 
                  style={styles.copyButton(offer.id)}
                  onMouseEnter={() => setHoveredBtn(offer.id)}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  {copiedCode === offer.code ? 'Copied! ✅' : 'Copy Code'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Offers;