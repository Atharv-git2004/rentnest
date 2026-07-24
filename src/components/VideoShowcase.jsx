import React from "react";

const RentHouseVideoCard = () => {
  const styles = {
    container: {
      width: "100%",
      maxWidth: "900px",
      backgroundColor: "#ffffff",
      padding: "16px",
      borderRadius: "24px",
      boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
      margin: "20px auto",
      transform: "translateY(0)",
      transition: "all 0.3s ease",
      cursor: "pointer",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    videoWrapper: {
      position: "relative",
      borderRadius: "16px",
      overflow: "hidden",
      width: "100%",
      aspectRatio: "16/9",
      backgroundColor: "#e2e8f0",
    },
    video: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    },
    // വീഡിയോയ്ക്ക് മുകളിൽ ടെക്സ്റ്റ് വ്യക്തമായി കാണാനുള്ള ഷാഡോ
    gradientOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 50%, transparent 100%)",
      pointerEvents: "none",
    },
    contentOverlay: {
      position: "absolute",
      bottom: "0",
      left: "0",
      right: "0",
      padding: "24px 32px",
      color: "#ffffff",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      flexWrap: "wrap",
      gap: "16px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      margin: "0 0 8px 0",
      letterSpacing: "0.5px",
    },
    location: {
      fontSize: "16px",
      color: "#cbd5e1",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      margin: 0,
      fontWeight: "500",
    },
    priceBadge: {
      backgroundColor: "#10b981", // പച്ച നിറം
      color: "white",
      padding: "10px 20px",
      borderRadius: "30px",
      fontWeight: "700",
      fontSize: "18px",
      boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
      display: "inline-block",
    },
    amenitiesRow: {
      display: "flex",
      gap: "20px",
      marginTop: "8px",
      fontSize: "15px",
      fontWeight: "500",
      color: "#f8fafc",
      borderTop: "1px solid rgba(255, 255, 255, 0.15)",
      paddingTop: "16px",
      flexWrap: "wrap",
    },
  };

  return (
    <div
      style={styles.container}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 30px 60px -15px rgba(0, 0, 0, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 20px 40px -10px rgba(0, 0, 0, 0.1)";
      }}
    >
      <div style={styles.videoWrapper}>
        <video autoPlay loop muted playsInline style={styles.video}>
          {/* ഒരു വീടിൻ്റെ പബ്ലിക് സാമ്പിൾ വീഡിയോ (Mixkit) ആണ് ഇവിടെ കൊടുത്തിരിക്കുന്നത് */}
          {/* നിങ്ങളുടെ വീഡിയോ ഉപയോഗിക്കാൻ ഇവിടെ 'src' മാറ്റുക (eg: src="/videos/my-house.mp4") */}
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-modern-architecture-and-the-sky-116-large.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* ഷാഡോ എഫക്റ്റ് */}
        <div style={styles.gradientOverlay}></div>

        {/* വീടിന്റെ വിവരങ്ങൾ */}
        <div style={styles.contentOverlay}>
          <div style={styles.headerRow}>
            <div>
              <h3 style={styles.title}>Premium 3BHK Independent Villa</h3>
              <p style={styles.location}>📍 Edappally, Kochi • Ready to Move</p>
            </div>
            <div style={styles.priceBadge}>₹18,000 / Month</div>
          </div>

          <div style={styles.amenitiesRow}>
            <span>🛏️ 3 Bedrooms</span>
            <span>🛁 3 Bathrooms</span>
            <span>🚗 Car Parking</span>
            <span>✨ Fully Furnished</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentHouseVideoCard;
