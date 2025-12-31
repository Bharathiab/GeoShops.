import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FaHotel, FaHospital, FaUmbrellaBeach, FaCut, FaTaxi, FaUniversity, FaTags, FaCalendarAlt, FaArrowRight, FaTicketAlt, FaPercent } from 'react-icons/fa';
import { fetchActiveOffers } from '../../api';
import { getPropertyImage, handleImageError } from '../../utils/imageUtils';

const tabList = [
  "Hotels", "All Offers", "Hospitals",  "Salons", "Cabs"
];

const getTabIcon = (tab) => {
  switch(tab) {
    case "Hotels": return <FaHotel />;
    case "Hospitals": return <FaHospital />;
    case "Salons": return <FaCut />;
    case "Cabs": return <FaTaxi />;
    default: return <FaTags />;
  }
};

const tabToDepartmentMap = {
  "Hotels": "Hotel",
  "Hospitals": "Hospital",
  "Salons": "Salon",
  "Cabs": "Cab"
};

const TiltCard = ({ offer, index, onBook }) => {
  const type = offer.propertyType || offer.department;
  const imgSrc = getPropertyImage(offer.imageUrl, type);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="col-lg-6 mb-4"
    >
      <motion.div
        className="offer-card-horizontal"
        whileHover={{ 
          y: -8,
          scale: 1.02,
          transition: { type: "spring", stiffness: 400, damping: 15 }
        }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Shine Effect Element */}
        <div className="card-shine-effect"></div>

        {/* Left: Image Side */}
        <div className="card-image-side" style={{ transform: "translateZ(20px)" }}>
          <img 
            src={imgSrc} 
            alt={offer.title} 
            className="card-img-horizontal"
            onError={(e) => handleImageError(e, type)}
          />
          <div className="card-badge-top">
             <FaTicketAlt className="me-1" size={10}/> {offer.offerType || "Festive"}
          </div>
          {offer.discountPercentage && (
             <div className="card-discount-tag">
               {offer.discountPercentage}% OFF
             </div>
          )}
        </div>

        {/* Right: Content Side */}
        <div className="card-content-side" style={{ transform: "translateZ(10px)" }}>
          <div className="dept-label">{type}</div>
          <h5 className="offer-main-title">{offer.title}</h5>
          <p className="offer-sub-desc">{offer.description}</p>
          
          <div className="card-footer-info">
            <div className="expiry-date">
               <FaCalendarAlt className="me-2 text-primary" size={12}/>
               <span>Valid till {new Date(offer.validTo).toLocaleDateString()}</span>
            </div>
            
            <button className="offer-btn-book" onClick={() => onBook(offer)}>
              Book Now <FaArrowRight className="ms-1" size={12}/>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

function OffersSection() {
  const [activeTab, setActiveTab] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const data = await fetchActiveOffers();
        const sortedData = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOffers(sortedData);
      } catch (error) {
        console.error("Failed to load offers", error);
      } finally {
        setLoading(false);
      }
    };
    loadOffers();
  }, []);

  const activeTabLabel = tabList[activeTab];
  const filteredOffers = activeTabLabel === "All Offers"
    ? offers
    : offers.filter(offer => {
        const requiredDept = tabToDepartmentMap[activeTabLabel] || activeTabLabel;
        const offerType = offer.propertyType || offer.department;
        return offerType === requiredDept;
      });

  const visibleOffers = (activeTabLabel === "All Offers" && !showAll)
    ? filteredOffers.slice(0, 4)
    : filteredOffers;

  const handleBookNow = (offer) => {
    const type = offer.propertyType || offer.department || 'hotel';
    navigate(`/user/booking/${type.toLowerCase()}`);
  };

  return (
    <>
    <style>
      {`
        .glass-offers-wrapper {
          width: 100%;
          margin: 60px 0;
          position: relative;
          overflow: hidden;
          z-index: 10;
        }

        .offers-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: -1;
          opacity: 0.4;
        }

        .orb-emerald {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
          top: -100px;
          right: -100px;
        }

        .orb-gold {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(191, 161, 66, 0.1) 0%, transparent 70%);
          bottom: -150px;
          left: -100px;
        }

        .premium-offers-section {
          font-family: 'Outfit', sans-serif;
        }

        .offer-card-horizontal {
          display: flex;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 
            0 10px 40px rgba(0,0,0,0.1),
            12px -12px 35px rgba(191, 161, 66, 0.05); 
          border: 1px solid rgba(255, 255, 255, 0.1);
          height: 180px;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .offer-card-horizontal::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 50%;
          height: 100%;
          background: radial-gradient(circle at top right, rgba(191, 161, 66, 0.25), transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .offer-card-horizontal:hover {
          transform: translateY(-8px) scale(1.02);
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 
            0 25px 50px rgba(0,0,0,0.2),
            20px -20px 60px rgba(191, 161, 66, 0.15);
          border-color: rgba(191, 161, 66, 0.3);
        }

        /* Shine Effect (Synchronized with Special Offers) */
        .card-shine-effect {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          transition: none;
          z-index: 5;
          pointer-events: none;
        }

        .offer-card-horizontal:hover .card-shine-effect {
          animation: shine 1s forwards;
        }

        @keyframes shine {
          100% {
            left: 125%;
          }
        }

        .modern-tabs {
          border-bottom: none !important;
          display: flex !important;
          gap: 15px;
          flex-wrap: wrap;
        }

        .nav-link.modern-tab {
          border: 1px solid rgba(255,255,255,0.1) !important;
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.7);
          border-radius: 50px;
          padding: 10px 24px;
          font-size: 0.9rem;
          font-weight: 600;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .nav-link.modern-tab:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          z-index: 2;
        }

        .nav-link.modern-tab.active {
          background: #10b981 !important;
          border-color: #10b981 !important;
          color: white !important;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.3);
          z-index: 3;
          animation: tabGlow 2s infinite alternate;
        }

        @keyframes tabGlow {
          from {
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.4), 0 0 20px rgba(16, 185, 129, 0.2);
          }
          to {
            box-shadow: 0 0 25px rgba(16, 185, 129, 0.8), 0 0 50px rgba(16, 185, 129, 0.4);
          }
        }

        .section-title {
          font-weight: 800;
          font-size: 3.5rem;
          letter-spacing: -2px;
          margin-bottom: 0.5rem;
          color: #ffffff;
        }

        .text-gradient {
          background: linear-gradient(135deg, #ffffff 0%, #bfa142 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: titlePulse 3s infinite alternate;
        }

        @keyframes titlePulse {
          from { filter: drop-shadow(0 0 2px rgba(191, 161, 66, 0.2)); }
          to { filter: drop-shadow(0 0 8px rgba(191, 161, 66, 0.5)); }
        }

        .card-image-side {
          width: 180px;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .card-img-horizontal {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .offer-card-horizontal:hover .card-img-horizontal {
          transform: scale(1.1);
        }

        .card-badge-top {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(255, 255, 255, 0.9);
          padding: 4px 10px;
          border-radius: 50px;
          font-size: 0.65rem;
          font-weight: 700;
          color: #0f766e;
          text-transform: uppercase;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          z-index: 2;
        }

        .card-discount-tag {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: #10b981;
          color: white;
          padding: 6px 12px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.8rem;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          z-index: 2;
        }

        .card-content-side {
          padding: 16px 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          z-index: 1;
        }

        .dept-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #10b981;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-bottom: 4px;
        }

        .offer-main-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 4px;
          line-height: 1.2;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .offer-sub-desc {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }

        .card-footer-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .expiry-date {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 500;
          display: flex;
          align-items: center;
        }

        .offer-btn-book {
          background: transparent;
          color: #10b981;
          border: 1.5px solid #10b981;
          padding: 6px 14px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.8rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .offer-btn-book:hover {
          background: #10b981;
          color: white;
          box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
          transform: scale(1.05);
        }


        .floating-toggle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #10b981;
          color: white;
          border: none;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 30px auto 0;
          transition: all 0.3s ease;
        }
      `}
    </style>
    
    <div className="glass-offers-wrapper">
      {/* Background Orbs for Glass Effect */}
      <motion.div
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="offers-orb orb-emerald"
      />
      <motion.div
        animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="offers-orb orb-gold"
      />

      <div className="container py-5 mt-5 premium-offers-section">
        <div className="section-header mb-5">
          <motion.h2 
             className="section-title text-white mb-2"
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
          >
            Exclusive <span className="text-gradient">Offers</span>
          </motion.h2>
          <motion.p 
             className="text-white-50 lead"
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2, duration: 0.8 }}
          >
             Unlock enhanced experiences with our curated deals.
          </motion.p>
        </div>

        <div className="mb-5">
          <div className="nav nav-tabs modern-tabs">
            {tabList.map((tab, idx) => (
              <motion.div 
                className="nav-item" 
                key={tab}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  className={`nav-link modern-tab ${activeTab === idx ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(idx);
                    setShowAll(false);
                  }}
                >
                  {getTabIcon(tab)} {tab}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
               key="loader"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="text-center py-5"
            >
              <div className="spinner-border text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
               key={activeTabLabel}
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.6 }}
            >
               <div className="row g-4">
                 {visibleOffers.length > 0 ? (
                   visibleOffers.map((offer, idx) => (
                     <TiltCard 
                       key={offer.id || idx} 
                       offer={offer} 
                       index={idx} 
                       onBook={handleBookNow}
                     />
                   ))
                 ) : (
                   <div className="col-12 text-center text-white-50 py-5">
                     <h4>No {activeTabLabel} offers available.</h4>
                     <p>Check back later for more exciting deals!</p>
                   </div>
                 )}
               </div>

               {activeTabLabel === "All Offers" && filteredOffers.length > 4 && (
                 <motion.button
                   onClick={() => setShowAll(!showAll)}
                   className="floating-toggle"
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                 >
                   <FaArrowRight style={{ transform: showAll ? 'rotate(-90deg)' : 'rotate(90deg)' }}/>
                 </motion.button>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
}

export default OffersSection;
