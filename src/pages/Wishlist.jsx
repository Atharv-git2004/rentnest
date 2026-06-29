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
        const res = await apiRequest('/users/wishlist', { method: 'GET' });
        
        const contentType = res.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (res.ok && data.success) {
            setWishlistProps(data.wishlist || []);
          } else {
            setError(data.message || "Failed to fetch wishlist");
          }
        } else {
          setError("Backend route not found (404 Error). Please make sure the backend is updated.");
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        setError("Network error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  // ഈ ഫംഗ്ഷൻ വഴി പ്രോപ്പർട്ടി വിഷ്‌ലിസ്റ്റിൽ നിന്ന് റിമൂവ് ചെയ്താൽ കാർഡ് ലൈവ് ആയി മാറും
  const handleRemoveFromWishlistUI = (propertyId) => {
    setWishlistProps(prev => prev.filter(prop => prop._id !== propertyId));
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600"></div>
    </div>
  );

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
            <div key={property._id} onClick={() => handleRemoveFromWishlistUI(property._id)}>
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
                currentUserWishlist={[property._id]} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;