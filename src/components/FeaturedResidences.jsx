import React, { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard'; // Ensure PropertyCard component is in the same directory

const FeaturedResidences = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter categories
  const categories = ['All', 'Apartment', 'Villa', 'Penthouse', 'Studio'];

  // Fetch properties from the backend API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Adjust the API route based on your environment (e.g., http://localhost:5000/api/properties)
        const response = await fetch('http://localhost:5000/api/properties'); 
        const data = await response.json();
        
        // Extract and set properties array from the API response
        const fetchedProperties = data.data || data.properties || data || [];
        setProperties(fetchedProperties);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter properties based on the selected category
  const filteredProperties = activeCategory === 'All' 
    ? properties 
    : properties.filter(prop => 
        (prop.propertyType && prop.propertyType.toLowerCase() === activeCategory.toLowerCase()) || 
        (prop.type && prop.type.toLowerCase() === activeCategory.toLowerCase())
      );

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* --- Header & Filters Section --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 sm:mb-10 gap-6 w-full">
        <div className="w-full lg:w-auto">
          <div className="text-emerald-500 font-bold text-xs sm:text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <span aria-hidden="true">♛</span> CURATED COLLECTION
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 sm:mb-3 leading-tight">
            Featured Residences
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl">
            Discover architectural masterpieces available worldwide.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-slate-50 p-1.5 rounded-xl sm:rounded-2xl border border-slate-100 w-full lg:w-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeCategory === category
                  ? "bg-white text-emerald-600 shadow-sm ring-1 ring-black/5"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* --- Properties Grid Section --- */}
      {loading ? (
        <div className="flex justify-center items-center h-48 sm:h-64 w-full">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property._id}
              id={property._id}
              title={property.title}
              location={property.location || property.address}
              price={property.price}
              bhk={property.bhk || property.bedrooms}
              description={property.description}
              area={property.area}
              bathrooms={property.bathrooms}
              // Pass the original image data to the PropertyCard
              image={property.image}
              houseImage={property.houseImage} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 px-4 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100 w-full">
          <h3 className="text-base sm:text-lg font-bold text-slate-700 mb-2">No properties found</h3>
          <p className="text-sm sm:text-base text-slate-500">Check back later or try a different category.</p>
        </div>
      )}
    </section>
  );
};

export default FeaturedResidences;