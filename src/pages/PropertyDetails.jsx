import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MapPin, IndianRupee, Bed, Bath, 
  Sparkles, Check, Info, ShieldCheck, MessageSquare, 
  Phone, Video 
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'http://localhost:5000'; 

const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return '';
  if (imagePath.startsWith('http')) return imagePath; 
  const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\//, '');
  return `${BACKEND_URL}/${cleanPath}`; 
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);

  const ownerId = property?.owner?._id || property?.ownerId || property?.owner;
  const isOwner = Boolean(currentUserId && ownerId && String(currentUserId) === String(ownerId));

  // Fetch Property Details
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        setFetchError(false);
        const res = await apiRequest(`/properties/${id}`); 
        const resData = await res.json();

        if (res.ok) {
          const actualData = resData.data || resData;
          setProperty(actualData);
          setSelectedRoomIndex(0); 
        } else {
          setFetchError(true);
        }
      } catch (err) {
        console.error("Error fetching property details:", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  // 🚀 PRO UX FIX: ചാറ്റിലേക്കും കോളിലേക്കും നാവിഗേറ്റ് ചെയ്യാനുള്ള ഫംഗ്ഷൻ
  const handleContactOwner = (actionType) => {
    if (!user) {
      alert("Please login to contact the owner.");
      return;
    }

    const ownerDataInfo = property?.owner || {};
    
    const ownerData = {
      ownerId: ownerId,
      ownerName: property?.ownerName || ownerDataInfo.name || 'Property Owner',
      ownerAvatar: property?.ownerAvatar || ownerDataInfo.avatar || '',
      startCall: actionType === 'video' || actionType === 'audio',
      callType: actionType === 'chat' ? null : actionType
    };

    // Chats പേജിലേക്ക് state സഹിതം നാവിഗേറ്റ് ചെയ്യുന്നു
    navigate('/chats', { state: ownerData });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (fetchError || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
        <p className="text-slate-500 font-medium">Property not found. Please check the URL or try again.</p>
        <button onClick={() => navigate('/')} className="text-sm font-bold bg-slate-950 text-white px-4 py-2 rounded-xl">Go Home</button>
      </div>
    );
  }

  const getRoomList = () => {
    let list = [];
    if (property.houseImage || property.image) {
      list.push({ 
        roomType: 'Main View', 
        imageUrl: property.houseImage || property.image,
        description: property.description || 'Main structural overview of the verified property.'
      });
    }
    if (property.rooms && property.rooms.length > 0) {
      list = [...list, ...property.rooms];
    }
    return list;
  };

  const roomList = getRoomList();
  const activeRoom = roomList[selectedRoomIndex] || roomList[0] || {};
  const activeImageUrl = getImageUrl(activeRoom.imageUrl);
  const ownerData = property.owner || {};

  return (
    <div className="min-h-screen bg-white pb-16 font-sans text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
      
      {/* NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back
        </button>
        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          ID: #{property._id?.substring(0, 8)}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="relative bg-slate-100 rounded-2xl overflow-hidden h-[260px] md:h-[460px] flex-shrink-0 group border border-slate-200 shadow-xs">
              {activeImageUrl ? (
                <img 
                  src={activeImageUrl} alt={activeRoom.roomType || "Property Core"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' fill='%2394a3b8' font-family='sans-serif' font-size='14' font-weight='bold' text-anchor='middle' dy='.3em'%3EImage Not Found on Server%3C/text%3E%3C/svg%3E";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm bg-slate-50">No Image Uploaded</div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {activeRoom.description && (
                <motion.div 
                  key={selectedRoomIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-950 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-center"
                >
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase tracking-wider mb-1.5">
                    <Sparkles size={14} className="animate-pulse" /> What makes the {activeRoom.roomType || 'room'} special:
                  </div>
                  <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
                    {activeRoom.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex lg:grid lg:grid-cols-2 gap-3 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto h-auto lg:h-[460px] content-start pb-2 lg:pb-0 pr-1 snap-x">
            {roomList.map((room, idx) => {
              const currentImgUrl = getImageUrl(room.imageUrl);
              const isSelected = selectedRoomIndex === idx;

              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedRoomIndex(idx)} 
                  className={`relative h-20 w-28 sm:w-36 lg:w-full flex-shrink-0 snap-start rounded-xl overflow-hidden cursor-pointer border-2 transition-all bg-slate-100 ${
                    isSelected ? 'border-slate-900 scale-95 shadow-sm ring-2 ring-slate-900/50' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={currentImgUrl} alt={room.roomType || 'Room'} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  <div className="absolute inset-0 bg-black/20 flex items-end p-1.5">
                    <span className="text-[10px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded-md line-clamp-1">{room.roomType || `Image ${idx + 1}`}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest bg-slate-100 text-slate-800 px-2.5 py-1 rounded">{property.type || 'Property'}</span>
              {property.status === 'approved' && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded"><ShieldCheck size={12} /> Verified</span>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">{property.title}</h1>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-500"><MapPin size={16} className="text-slate-400" /> {property.location}</p>
            <div className="flex items-center gap-6 pt-2 border-t border-slate-100 mt-4">
              <div className="flex items-center gap-2 text-slate-700"><div className="p-2 bg-slate-50 rounded-lg"><Bed size={18} /></div><span className="text-sm font-bold">{property.bedrooms || property.bhk || 0} Beds</span></div>
              <div className="flex items-center gap-2 text-slate-700"><div className="p-2 bg-slate-50 rounded-lg"><Bath size={18} /></div><span className="text-sm font-bold">{property.bathrooms || 0} Baths</span></div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Info size={14} /> Description</h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium whitespace-pre-line">{property.description || 'No description provided for this property.'}</p>
          </div>
          {property.amenities && property.amenities.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Sparkles size={14} /> Amenities Offered</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Check size={14} className="text-emerald-600 stroke-[3]" />
                    <span className="text-xs font-bold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDE PANEL */}
        <div className="lg:col-span-1">
          <div className="border border-slate-150 rounded-2xl p-6 shadow-xs bg-white sticky top-6 space-y-6">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rent / Month</span>
              <div className="flex items-center text-slate-950">
                <IndianRupee size={22} className="stroke-[2.5]" />
                <span className="text-2xl font-black tracking-tight">{Number(property.price) ? Number(property.price).toLocaleString('en-IN') : property.price}</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">{(property.ownerName || ownerData.name || 'O').charAt(0)}</div>
              <div>
                <p className="text-xs font-bold text-slate-400">Listed By</p>
                <p className="text-sm font-black text-slate-800">{property.ownerName || ownerData.name || 'Owner'}</p>
              </div>
            </div>

            {/* ACTION BUTTONS (Routes to /chats) */}
            {!isOwner ? (
              <div className="space-y-2.5">
                <button onClick={() => handleContactOwner('chat')} className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm shadow-slate-950/10">
                  <MessageSquare size={16} /> Chat With Owner
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleContactOwner('audio')} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold py-3.5 px-2 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Phone size={16} /> Audio Call
                  </button>
                  <button onClick={() => handleContactOwner('video')} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold py-3.5 px-2 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Video size={16} /> Video Call
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold py-3 px-4 rounded-xl text-center text-sm">
                This is your property
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;