import React, { useState } from 'react';

const SearchBar = () => {
  // State elements to capture user search queries
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    // Ready for backend API integration 
    console.log("Executing query for:", { location, propertyType, priceRange });
  };

  // 🎨 Ultra-Modern High-Fidelity Design System (Optimized for Dark Hero Background overlays)
  const styles = {
    searchBarContainer: {
      width: '100%',
      maxWidth: '950px',
      backgroundColor: '#ffffff', // Clean white card base to pop from the dark hero gradient
      padding: '24px',
      borderRadius: '20px',
      // Multi-layered cinematic shadow
      boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 12px 24px -8px rgba(15, 23, 42, 0.15)',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      boxSizing: 'border-box',
    },
    form: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: '20px',
      flexWrap: 'wrap', 
    },
    inputGroup: {
      flex: '1',
      minWidth: '220px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '12px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color: '#475569', // Slate 600
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      backgroundColor: '#f8fafc', // Light slate variant
      color: '#0f172a',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    select: {
      width: '100%',
      padding: '14px 16px',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      outline: 'none',
      cursor: 'pointer',
      boxSizing: 'border-box',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    btnSearch: {
      padding: '14px 36px',
      background: isBtnHovered 
        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Premium Emerald Gradient matching site theme
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      boxShadow: isBtnHovered 
        ? '0 12px 20px -6px rgba(5, 150, 105, 0.4)' 
        : '0 8px 16px -4px rgba(16, 185, 129, 0.3)',
      transform: isBtnHovered ? 'translateY(-2px)' : 'translateY(0)',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      height: '48px', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  };

  return (
    <div style={styles.searchBarContainer}>
      <form style={styles.form} onSubmit={handleSearch}>
        
        {/* 📍 1. Location Input Field */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            <span style={{ color: '#10b981' }}>📍</span> Location
          </label>
          <input 
            type="text" 
            placeholder="e.g., Kozhikode, Kannur" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={styles.input}
            onFocus={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.borderColor = '#10b981';
              e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* 🏠 2. Property Type Dropdown Selector */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            <span style={{ color: '#10b981' }}>🏠</span> Property Type
          </label>
          <select 
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            style={styles.select}
            onFocus={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.borderColor = '#10b981';
              e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">Select type...</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Traditional House">Traditional House</option>
            <option value="Single Room">Single Room</option>
          </select>
        </div>

        {/* 💰 3. Rent Budget Range Input */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            <span style={{ color: '#10b981' }}>💰</span> Budget Range
          </label>
          <input 
            type="text" 
            placeholder="e.g., 5000 - 20000 INR" 
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            style={styles.input}
            onFocus={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.borderColor = '#10b981';
              e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* 🔍 4. Interactive Search Submission Button */}
        <button 
          type="submit" 
          style={styles.btnSearch}
          onMouseEnter={() => setIsBtnHovered(true)}
          onMouseLeave={() => setIsBtnHovered(false)}
        >
          Search Properties
        </button>

      </form>
    </div>
  );
};

export default SearchBar;