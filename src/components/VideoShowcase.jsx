import React from "react";

const VideoShowcase = () => {
  const styles = {
    container: {
      width: "100%",
      maxWidth: "950px",
      backgroundColor: "#ffffff",
      padding: "12px",
      borderRadius: "24px",
      boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(255,255,255,0.2)",
      margin: "0 auto",
      transform: "translateY(0)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      cursor: "pointer",
    },
    videoWrapper: {
      position: "relative",
      borderRadius: "16px",
      overflow: "hidden",
      width: "100%",
      aspectRatio: "16/9", // വീഡിയോ കൃത്യം സൈസിൽ ഇരിക്കാൻ
      backgroundColor: "#1e293b", // ലോഡ് ആവുന്നതിന് മുൻപുള്ള കളർ
    },
    video: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    },
    overlayText: {
      position: "absolute",
      bottom: "24px",
      left: "24px",
      backgroundColor: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(8px)",
      padding: "12px 24px",
      borderRadius: "14px",
      color: "#0f172a",
      fontSize: "15px",
      fontWeight: "700",
      letterSpacing: "0.5px",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
  };

  return (
    <div
      style={styles.container}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 30px 60px -12px rgba(15, 23, 42, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 25px 50px -12px rgba(15, 23, 42, 0.3)";
      }}
    >
      <div style={styles.videoWrapper}>
        {/* 🎬 Video Tag */}
        <video autoPlay loop muted playsInline style={styles.video}>
          {/* നിങ്ങൾക്ക് ഇഷ്ടമുള്ള റിയൽ എസ്റ്റേറ്റ് വീഡിയോ ഇവിടെ നൽകാം. 
              ഉദാഹരണത്തിന് നിങ്ങളുടെ സ്വന്തം വീഡിയോ public ഫോൾഡറിൽ ഉണ്ടെങ്കിൽ: 
              src="/my-video.mp4" എന്ന് കൊടുക്കാം. */}
          <source src="https://cdn.pixabay.com/video/2019/11/04/28731-370503080_large.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* ✨ ചെറിയൊരു ഓവർലേ ആനിമേഷൻ ടെക്സ്റ്റ് */}
        <div style={styles.overlayText} className="animate-bounce">
          <span style={{ fontSize: "18px" }}>✨</span>
          Experience Luxury Living
        </div>
      </div>
    </div>
  );
};

export default VideoShowcase;
