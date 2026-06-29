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
        const data = await apiRequest('/users/wishlist', { method: 'GET' });
        
        // FIX: ബാക്ക്-എൻഡ് ഏത് ഫോർമാറ്റിൽ ഡാറ്റ തന്നാലും അത് അറേ (Array) ആണോ എന്ന് കൃത്യമായി ചെക്ക് ചെയ്യുന്നു
        if (data) {
          if (Array.isArray(data)) {
            // 1. ഡാറ്റ നേരിട്ട് അറേ ആയി വന്നാൽ (e.g., [...])
            setWishlistProps(data);
          } else if (data.wishlist && Array.isArray(data.wishlist)) {
            // 2. ഒബ്ജക്റ്റിനുള്ളിൽ wishlist എന്ന കീയിൽ വന്നാൽ (e.g., { wishlist: [...] })
            setWishlistProps(data.wishlist);
          } else if (data.data && Array.isArray(data.data)) {
            // 3. ഒബ്ജക്റ്റിനുള്ളിൽ data എന്ന കീയിൽ വന്നാൽ (e.g., { data: [...] })
            setWishlistProps(data.data);
          } else if (data.success === false) {
            // 4. ബാക്ക്-എൻഡ് വ്യക്തമായി എറർ മെസ്സേജ് തന്നാൽ
            setError(data.message || "Failed to fetch wishlist");
          } else {
            // 5. ഡാറ്റ വന്നു പക്ഷെ അതിൽ പ്രോപ്പർട്ടികൾ ഒന്നും ഇല്ലെങ്കിൽ
            setWishlistProps([]);
          }
        } else {
          setError("No response from server");
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

  // പ്രോപ്പർട്ടി ഐഡികൾ മാത്രം അടങ്ങിയ ഒരു അറേ പ്രോപ്സ് ആയി നൽകാൻ (ഹാർട്ട് ഐക്കൺ റെഡ് കളർ ആകാൻ ഇത് സഹായിക്കും)
  const wishlistIds = wishlistProps.map(item => item._id || item);

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
          {wishlistProps.map((property) => {
            // സുരക്ഷിതമായി ഐഡി കണ്ടുപിടിക്കാൻ
            const propertyId = property._id || property.id || property;
            
            // പ്രോപ്പർട്ടി ഒരു ഒബ്ജക്റ്റ് ആണെന്ന് ഉറപ്പാക്കുക, അല്ലെങ്കിൽ റെൻഡർ ചെയ്യില്ല
            if (typeof property !== 'object' || !propertyId) return null;

            return (
              <div key={propertyId}>
                <PropertyCard 
                  id={propertyId}
                  image={property.images?.[0] || property.image || property.houseImage} 
                  title={property.title}
                  location={property.location}
                  price={property.price}
                  bhk={property.bhk || property.bedrooms}
                  description={property.description}
                  area={property.area}
                  bathrooms={property.bathrooms}
                  currentUserWishlist={wishlistIds} 
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;