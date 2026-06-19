import React, { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard'; // 💡 PropertyCard ഫയൽ ഇതേ ഫോൾഡറിലാണെന്ന് ഉറപ്പുവരുത്തുക

const FeaturedResidences = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  // സ്ക്രീൻഷോട്ടിൽ കാണുന്ന ഫിൽറ്റർ ഓപ്ഷനുകൾ
  const categories = ['All', 'Apartment', 'Villa', 'Penthouse', 'Studio'];

  // 💡 ബാക്ക്-എൻഡിൽ നിന്ന് പ്രോപ്പർട്ടികൾ എടുക്കുന്ന ഫങ്ഷൻ
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // നിങ്ങളുടെ യഥാർത്ഥ API റൂട്ട് അനുസരിച്ച് ഈ ലിങ്ക് മാറ്റാം 
        // (ഉദാഹരണത്തിന്: http://localhost:5000/api/properties)
        const response = await fetch('http://localhost:5000/api/properties'); 
        const data = await response.json();
        
        // API-യിൽ നിന്ന് വരുന്ന ഡാറ്റ അറേയിലേക്ക് സെറ്റ് ചെയ്യുന്നു
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

  // കാറ്റഗറി അനുസരിച്ച് പ്രോപ്പർട്ടികൾ ഫിൽറ്റർ ചെയ്യുന്നു
  const filteredProperties = activeCategory === 'All' 
    ? properties 
    : properties.filter(prop => 
        (prop.propertyType && prop.propertyType.toLowerCase() === activeCategory.toLowerCase()) || 
        (prop.type && prop.type.toLowerCase() === activeCategory.toLowerCase())
      );

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      {/* --- Header & Filters Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <div className="text-emerald-500 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
            ♛ CURATED COLLECTION
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
            Featured Residences
          </h2>
          <p className="text-slate-500 text-sm">
            Discover architectural masterpieces available worldwide.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeCategory === category
                  ? "bg-white text-emerald-600 shadow-sm"
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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              // 💡 ഇവിടെയാണ് നമ്മൾ ഫിക്സ് ചെയ്ത ഒറിജിനൽ ഇമേജ് ഡാറ്റ അയക്കുന്നത്
              image={property.image}
              houseImage={property.houseImage} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-2">No properties found</h3>
          <p className="text-slate-500">Check back later or try a different category.</p>
        </div>
      )}
    </section>
  );
};

export default FeaturedResidences;