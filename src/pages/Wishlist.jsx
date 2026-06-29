import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import PropertyCard from '../components/PropertyCard';

const Wishlist = () => {
  const [wishlistProps, setWishlistProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError(null);
      try {
        // FIX 1: apiRequest നേരിട്ട് ഡാറ്റ റിട്ടേൺ ചെയ്യുന്ന രീതിയിലേക്ക് മാറ്റി
        const data = await apiRequest('/users/wishlist', { method: 'GET' });
        
        if (data && (data.success || Array.isArray(data.wishlist))) {
          // ബാക്ക്-എൻഡ് റെസ്പോൺസ് അനുസരിച്ച് വിഷ്‌ലിസ്റ്റ് അറേ സെറ്റ് ചെയ്യുന്നു
          setWishlistProps(data.wishlist || data || []);
        } else {
          setError(data?.message || "Failed to fetch wishlist");
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        setError("Network error or Route not found. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600"></div>
    </div>
  );

  // പ്രോപ്പർട്ടി ഐഡികൾ മാത്രം അടങ്ങിയ ഒരു അറേ പ്രോപ്സ് ആയി നൽകാൻ
  const wishlistIds = wishlistProps.map(item => item._id);

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">My Wishlist</h1>
      
      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 text-center">
          <p className="font-semibold text-lg">Error</p>
          <p>{error}</p>
        </div>
      ) : wishlistProps.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-200 border-dashed">
          <h3 className="text-xl font-medium text-slate-700 mb-2">Your wishlist is empty</h3>
          <p className="text-slate-500">You haven't added any properties yet. Explore properties and click the heart icon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProps.map((property) => (
            // FIX 2: പുറത്തെ div-ൽ ഉണ്ടായിരുന്ന onClick നീക്കം ചെയ്തു (ഇപ്പോൾ കാർഡ് ക്ലിക്ക് ചെയ്താൽ കറക്റ്റ് ആയി Navigate ചെയ്യും)
            <div key={property._id}>
              <PropertyCard 
                id={property._id}
                image={property.images?.[0] || property.image || property.houseImage} 
                title={property.title}
                location={property.location}
                price={property.price}
                bhk={property.bhk || property.bedrooms}
                description={property.description}
                area={property.area}
                bathrooms={property.bathrooms}
                // നിലവിലുള്ള വിഷ്‌ലിസ്റ്റ് ഐഡികൾ കൃത്യമായി പാസ്സ് ചെയ്യുന്നു
                currentUserWishlist={wishlistIds} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;