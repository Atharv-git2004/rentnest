import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Heart, BedDouble, Bath, Maximize, ArrowRight } from 'lucide-react';
import { apiRequest } from '../services/api';
import toast from 'react-hot-toast'; // Toast ഉണ്ടെങ്കിൽ ഉപയോഗിക്കാം, അല്ലെങ്കിൽ alert വെക്കാം

// .env ഫയലിൽ VITE_API_URL കൃത്യമാണെന്ന് ഉറപ്പുവരുത്തുക
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://rentnest-backend-civ9.onrender.com';

const PropertyCard = ({ id, image, houseImage, title, location, price, bhk, description, area, bathrooms, currentUserWishlist = [] }) => {
  const navigate = useNavigate();
  
  const [isLiked, setIsLiked] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  useEffect(() => {
    // currentUserWishlist ഉണ്ടോ എന്ന് നോക്കി ആദ്യം തന്നെ നിറം സെറ്റ് ചെയ്യുന്നു
    if (currentUserWishlist && Array.isArray(currentUserWishlist) && currentUserWishlist.includes(id)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  }, [currentUserWishlist, id]);

  const handleNavigate = () => {
    navigate(`/property/${id}`);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return ''; 
    if (imagePath.startsWith('http')) return imagePath; 
    const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\//, '');
    return `${BACKEND_URL}/${cleanPath}`;
  };

  const actualImage = houseImage || image;
  const displayImage = getImageUrl(actualImage);

  const handleWishlistToggle = async (e) => {
    e.stopPropagation(); 
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) {
      alert("Please login to add properties to your wishlist.");
      navigate('/login');
      return;
    }

    setIsWishlistLoading(true);
    
    // Optimistic Update: API പ്രതികരിക്കും മുൻപേ UI മാറ്റുന്നു
    const previousState = isLiked;
    setIsLiked(!isLiked); 

    try {
      const res = await apiRequest('/users/wishlist/toggle', {
        method: 'POST',
        body: { propertyId: id } 
      });

      if (!res.ok) {
        throw new Error("Server rejected request");
      }

      const data = await res.json();
      console.log("Wishlist updated:", data);
      
    } catch (error) {
      console.error("Wishlist error details:", error);
      // എറർ വന്നാൽ പഴയ അവസ്ഥയിലേക്ക് മാറ്റുന്നു
      setIsLiked(previousState); 
      alert("Failed to update wishlist. Please check your internet or backend.");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <motion.div
      onClick={handleNavigate}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full w-full"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 border-b border-slate-100">
        {displayImage ? (
          <img
            src={displayImage}
            alt={title || "Property"}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=No+Image"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">No Image</div>
        )}

        <button
          onClick={handleWishlistToggle}
          disabled={isWishlistLoading}
          className="absolute top-3 right-3 z-10 bg-white/90 p-2 rounded-full shadow-sm hover:scale-110 transition-transform"
        >
          <Heart
            size={18}
            className={`transition-colors duration-200 ${
              isLiked ? "fill-red-500 text-red-500" : "text-slate-400"
            }`}
          />
        </button>

        <div className="absolute bottom-3 left-3 z-10 flex gap-2">
            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl font-black text-slate-900 shadow-lg">
                ₹{price?.toLocaleString('en-IN') || "0"}
            </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-4">{location}</p>
        <div className="mt-auto flex justify-between border-t pt-4">
            <span className="text-xs font-bold">{bhk} BHK</span>
            <span className="text-xs font-bold">{area} sqft</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;