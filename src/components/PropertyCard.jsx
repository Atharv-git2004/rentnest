import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Heart, BedDouble, Bath, Maximize, ArrowRight } from 'lucide-react';

// Set default backend running URL
const BACKEND_URL = 'http://localhost:5000';

// Accept houseImage alongside other properties as props
const PropertyCard = ({ id, image, houseImage, title, location, price, bhk, description, area, bathrooms }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  // Navigation function
  const handleNavigate = () => {
    navigate(`/property/${id}`);
  };

  // Function to fetch the original image from the database
  const getImageUrl = (imagePath) => {
    if (!imagePath) return ''; // Removed automatic fake Unsplash image
    if (imagePath.startsWith('http')) return imagePath; 

    // Convert Windows backslashes (\) to forward slashes (/)
    const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\//, '');
    return `${BACKEND_URL}/${cleanPath}`;
  };

  // Prioritize houseImage if available, else fallback to image field
  const actualImage = houseImage || image;
  const displayImage = getImageUrl(actualImage);

  return (
    <motion.div
      onClick={handleNavigate}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full w-full"
    >
      {/* --- 1. IMAGE & BADGES SECTION --- */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 border-b border-slate-100">
        {displayImage ? (
          <img
            src={displayImage}
            alt={title || "Property"}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            onError={(e) => {
              // Show a clean gray box message if the image is missing locally
              e.target.onerror = null; 
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' fill='%2394a3b8' font-family='sans-serif' font-size='12' font-weight='bold' text-anchor='middle' dy='.3em'%3EImage Not Found on Server%3C/text%3E%3C/svg%3E";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-xs font-bold text-slate-400">
            No Image Uploaded
          </div>
        )}

        {/* Hover Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Like Button (Heart) */}
        <button
          onClick={(e) => {
            e.stopPropagation(); 
            setIsLiked(!isLiked);
          }}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full shadow-sm hover:scale-110 transition-transform duration-200"
          aria-label="Like property"
        >
          <Heart
            size={18}
            className={`transition-colors duration-200 ${
              isLiked ? "fill-red-500 text-red-500" : "text-slate-400"
            }`}
          />
        </button>

        {/* Floating Price Tag on Image */}
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-10 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="bg-white/95 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-black text-slate-900 shadow-lg flex items-center gap-1">
            <span className="text-xs sm:text-sm">₹{price?.toLocaleString('en-IN') || "0"}</span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase tracking-wider">/mo</span>
          </div>
          {bhk && (
            <div className="bg-emerald-500 text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-lg">
              {bhk} BHK
            </div>
          )}
        </div>
      </div>

      {/* --- 2. DETAILS SECTION --- */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        
        {/* Title & Location */}
        <div className="mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-tight mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {title || "Premium Residence"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1 sm:gap-1.5">
            <MapPin size={14} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{location || "Location unavailable"}</span>
          </p>
        </div>

        {/* Description Snippet */}
        <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 mb-4 sm:mb-5 leading-relaxed">
          {description || "Explore this beautiful and spacious property."}
        </p>

        <div className="mt-auto space-y-3 sm:space-y-4">
          {/* Amenities Strip */}
          <div className="flex flex-wrap items-center justify-between gap-y-2 py-3 border-y border-slate-100">
            <div className="flex items-center gap-1 sm:gap-1.5 text-slate-600">
              <BedDouble size={14} className="text-slate-400 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-xs font-bold">{bhk || 2} Beds</span>
            </div>
            <div className="hidden sm:block w-[1px] h-4 bg-slate-200"></div>
            <div className="flex items-center gap-1 sm:gap-1.5 text-slate-600">
              <Bath size={14} className="text-slate-400 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-xs font-bold">{bathrooms || bhk || 2} Baths</span>
            </div>
            <div className="hidden sm:block w-[1px] h-4 bg-slate-200"></div>
            <div className="flex items-center gap-1 sm:gap-1.5 text-slate-600">
              <Maximize size={14} className="text-slate-400 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-xs font-bold">{area || "1200"} sqft</span>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full bg-slate-50 hover:bg-emerald-600 text-slate-700 hover:text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn">
            View Details
            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

    </motion.div>
  );
};

export default PropertyCard;