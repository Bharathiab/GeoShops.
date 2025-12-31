import React from 'react';
import { Container, Row, Col, Card, Carousel, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { fetchDepartments } from '../../api';
import { 
  FaHotel, FaHeartbeat, FaCut, FaCar, FaArrowRight, FaArrowLeft,
  FaStar, FaGift, FaUsers, FaQuoteLeft, FaCopy, FaCircle, FaShieldAlt, FaUmbrella
} from 'react-icons/fa';
import UserNavbar from '../../components/user/UserNavbar';
import './BookingSelection.css';
import { motion } from 'framer-motion';
import '../../styles/PremiumHeader.css';

const BookingSelection = () => {
  const navigate = useNavigate();
  const scrollRef = React.useRef(null);
  const [departments, setDepartments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isReady, setIsReady] = React.useState(false); // New state to handle initial scroll position

  // Icon Mapping
  const iconMap = {
    FaHotel: <FaHotel />,
    FaHeartbeat: <FaHeartbeat />,
    FaCar: <FaCar />,
    FaCut: <FaCut />,
    FaUsers: <FaUsers />,
    FaHospital: <FaHeartbeat />,
    FaShieldAlt: <FaShieldAlt />,
    FaUmbrella: <FaUmbrella />
  };

  React.useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await fetchDepartments();
      
      const staticFallback = [
        { id: 'hospital', name: 'Healthcare', iconName: 'FaHeartbeat', description: 'Access premium healthcare and specialist consultations.', features: 'General Medicine, Specialist Clinics, Diagnostics, Emergency Care', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { id: 'hotel', name: 'Hospitality', iconName: 'FaHotel', description: 'Curated selection of premium stays and luxury resorts.', features: 'Luxury Suites, Boutique Hotels, Resort Experiences, Concierge', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { id: 'cabs', name: 'Mobility', iconName: 'FaCar', description: 'Reliable and premium transportation for every journey.', features: 'Executive Sedans, Premium SUVs, Inter-city Travel, Hourly Rentals', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
        { id: 'salon', name: 'Wellness', iconName: 'FaCut', description: 'Professional beauty and wellness treatments by experts.', features: 'Styling, Therapeutic Massage, Skincare, Rejuvenation', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
      ];

      // Use data if available and not empty, otherwise use fallback
      const departmentData = (Array.isArray(data) && data.length > 0) ? data : staticFallback;
      
      const mapped = departmentData.map(d => {
        const name = d.name || 'Service';
        // Categorize theme based on industry standards
        const isBlueTheme = name.toLowerCase().includes('hospital') || name.toLowerCase().includes('medical');
        const isPinkTheme = name.toLowerCase().includes('wellness') || name.toLowerCase().includes('salon');
        const isGoldTheme = name.toLowerCase().includes('hospitality') || name.toLowerCase().includes('hotel');
        
        return {
          id: d.id || name,
          name: name,
          icon: (d.iconName && iconMap[d.iconName]) ? iconMap[d.iconName] : <FaStar />,
          description: d.description || 'Premium service experience',
          features: (typeof d.features === 'string') ? d.features.split(',').map(f => f.trim()) : (Array.isArray(d.features) ? d.features : ['Quality Service', '24/7 Support']),
          gradient: '#fbbf24', // Reverted to signature gold top bar
          accentColor: '#fbbf24',
          iconBg: 'rgba(251, 191, 36, 0.1)',
          route: `/user/booking/${name.toLowerCase().replace(/\s+/g, '-')}`
        };
      });
      setDepartments(mapped);
    } catch (error) {
      console.error("Error loading departments:", error);
      // Hard fallback on crash
      setDepartments([
        { name: 'Hospital', icon: <FaHeartbeat />, description: 'Book appointments with specialized doctors', features: ['General Physicians', 'Dermatologists', 'Cardiologists', 'Pediatricians'], gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', route: '/user/booking/hospital' },
        { name: 'Hotel', icon: <FaHotel />, description: 'Reserve your perfect room with premium amenities', features: ['AC Rooms', 'Non-AC Rooms', '2-Bedroom Suites', 'Food Services'], gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', route: '/user/booking/hotel' },
        { name: 'Cabs', icon: <FaCar />, description: 'Book reliable transportation at competitive rates', features: ['Economy Cabs', 'Premium Sedans', 'XL Vehicles', 'Distance-based Pricing'], gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', route: '/user/booking/cab' },
        { name: 'Salon', icon: <FaCut />, description: 'Pamper yourself with professional beauty services', features: ['Haircuts', 'Manicure & Pedicure', 'Facials', 'Massages'], gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', route: '/user/booking/salon' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Snapping Auto-scroll Logic
  React.useEffect(() => {
    let interval;
    if (departments.length > 0 && !isHovered && isReady) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % departments.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [departments, isHovered, isReady]);

  // Synchronized Centering Effect & Infinite Teleport
  React.useEffect(() => {
    if (departments.length === 0) return;
    
    // Initial centering of the second set
    if (!isReady && scrollRef.current) {
      const container = scrollRef.current;
      const firstCardInMiddle = container.children[departments.length];
      if (firstCardInMiddle) {
        container.scrollLeft = firstCardInMiddle.offsetLeft - (container.offsetWidth / 2) + (firstCardInMiddle.offsetWidth / 2);
        setIsReady(true);
      }
      return;
    }

    if (isHovered) return;
    
    const container = scrollRef.current;
    if (container) {
      // 1. Snap to target (could be in Set 2 or Set 3)
      const targetCardIndex = departments.length + currentIndex;
      const targetCard = container.children[targetCardIndex];
      
      if (targetCard) {
        const cardCenter = targetCard.offsetLeft + targetCard.offsetWidth / 2;
        container.scrollTo({
          left: cardCenter - (container.offsetWidth / 2),
          behavior: 'smooth'
        });

        // 2. Invisible Teleport: If we just snapped into Set 3 (index >= N), 
        // wait for scroll to finish then jump back to Set 2 invisibly.
        if (currentIndex >= departments.length - 1) {
          setTimeout(() => {
            if (scrollRef.current) {
              const resetIndex = departments.length; // First card of Set 2
              const resetCard = scrollRef.current.children[resetIndex];
              const resetPos = resetCard.offsetLeft - (scrollRef.current.offsetWidth / 2) + (resetCard.offsetWidth / 2);
              
              scrollRef.current.scrollTo({ left: resetPos, behavior: 'auto' });
              setCurrentIndex(0);
            }
          }, 600); // Wait for smooth scroll (duration 0.4s + buffer)
        }
      }
    }
  }, [currentIndex, departments, isHovered, isReady]);

  const hoverTimeout = React.useRef(null);
  const lastMousePos = React.useRef({ x: 0, y: 0 });
  const isAutoScrolling = React.useRef(false);

  const handleCardHover = (e) => {
    setIsHovered(true);
    
    // 1. Calculate mouse movement distance
    const dist = Math.sqrt(
      Math.pow(e.clientX - lastMousePos.current.x, 2) + 
      Math.pow(e.clientY - lastMousePos.current.y, 2)
    );
    
    // 2. Ignore if mouse hasn't physically moved (ignores cards sliding under cursor)
    if (dist < 5) return;
    
    // 3. Ignore if already intentionally scrolling
    if (isAutoScrolling.current) return;

    lastMousePos.current = { x: e.clientX, y: e.clientY };
    const card = e.currentTarget;
    const container = scrollRef.current;
    
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    
    hoverTimeout.current = setTimeout(() => {
      if (card && container) {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const containerCenter = container.scrollLeft + container.offsetWidth / 2;
        const offset = Math.abs(cardCenter - containerCenter);
        
        // 4. Center card with lock
        if (offset > 100) {
          isAutoScrolling.current = true;
          container.scrollTo({
            left: cardCenter - (container.offsetWidth / 2),
            behavior: 'smooth'
          });
          
          // Release lock after transition
          setTimeout(() => { isAutoScrolling.current = false; }, 800);
        }
      }
    }, 100);
  };

  const offers = [
    { title: "50% OFF on First Salon Booking", code: "SALON50" },
    { title: "Free Cancellation on Hotels", code: "STAYFREE" },
    { title: "₹300 OFF on Cab Rides", code: "RIDE300" },
    { title: "Flat 20% OFF on Doctor Consult", code: "HEALTH20" }
  ];

  const reviews = [
    { name: "Priya Sharma", rating: 5, text: "Best platform ever! Booked a salon appointment and hotel in 2 minutes. Super smooth!", avatar: "P" },
    { name: "Rahul Mehta", rating: 5, text: "The cab service is reliable and drivers are professional. Loved the real-time tracking!", avatar: "R" },
    { name: "Ananya Verma", rating: 5, text: "Got instant doctor appointment during emergency. This app literally saved my day!", avatar: "A" },
    { name: "Vikram Singh", rating: 5, text: "Amazing deals on hotels and great customer support. Highly recommended!", avatar: "V" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.15 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 } 
    }
  };

  /* ADVANCED ELITE ANIMATIONS */
  const cardHoverVariants = {
    rest: { scale: 1, rotateX: 0, rotateY: 0, boxShadow: "0 10px 40px rgba(0,0,0,0.06)" },
    hover: { 
      scale: 1.05, 
      rotateX: 5, 
      rotateY: 5, 
      boxShadow: "0 25px 50px rgba(251, 191, 36, 0.15)",
      transition: { type: "spring", stiffness: 300, damping: 15 } 
    }
  };

  const iconFloatVariants = {
    animate: {
      y: [0, -8, 0],
      rotate: [0, 5, -5, 0],
      scale: [1, 1.05, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const buttonPulseVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 0 20px rgba(251, 191, 36, 0.6)",
      transition: {
        duration: 0.3,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  const contentRevealVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const glossSweepVariants = {
    rest: { x: "-100%", opacity: 0 },
    hover: { 
      x: "100%", 
      opacity: 0.3,
      transition: { duration: 1, ease: "easeInOut" }
    }
  };


  return (
    <div className="booking-selection-wrapper">
      <UserNavbar selectedDepartment="Home" onDepartmentChange={(dept) => dept === 'Home' && navigate('/user')} />

      {/* Elite Premium Header */}
      <header className="membership-header-premium mb-5 position-relative overflow-hidden">
        {/* Animated Background Orbs */}
        <motion.div 
            animate={{ 
                x: [0, 50, 0], 
                y: [0, 30, 0],
                scale: [1, 1.1, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="hero-orb hero-orb-1"
        />
        <motion.div 
            animate={{ 
                x: [0, -40, 0], 
                y: [0, -20, 0],
                scale: [1, 1.2, 1]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="hero-orb hero-orb-2"
        />
        
        {/* Animated Background Particles */}
        <div className="particles-container">
            <motion.div animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 5, repeat: Infinity }} className="particle p1"></motion.div>
            <motion.div animate={{ y: [0, 30, 0], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 7, repeat: Infinity }} className="particle p2"></motion.div>
        </div>

        <Container className="position-relative z-index-2">
            <div className="hero-content mt-5">

                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="display-3 fw-900 mb-2 text-white font-heading" 
                    style={{ letterSpacing: '-2px' }}
                >
                    Choose Your <span className="text-gradient-gold">Experience</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lead text-white text-opacity-80 mb-0 fw-500 mx-auto"
                    style={{ maxWidth: '600px' }}
                >
                    Premium services curated for your lifestyle.
                </motion.p>
            </div>
        </Container>
      </header>


      <Container className="pb-5 mt-4 position-relative z-index-2">
          {/* Animated Card Grid with Auto-scroll capability */}
          <motion.div
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {loading ? (
              <div className="d-flex justify-content-center align-items-center w-100 py-5">
                <div className="elite-loader"></div>
              </div>
            ) : departments && departments.length > 0 ? (
              <div 
                ref={scrollRef}
                className="d-flex flex-nowrap py-5 px-2 scroll-container-horizontal" 
                style={{ 
                  overflowX: 'auto', 
                  WebkitOverflowScrolling: 'touch',
                  gap: '60px'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                  setIsHovered(false);
                  if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                }}
              >
                {[...departments, ...departments, ...departments].map((dept, index) => {
                  const relativeIndex = index % departments.length;
                  return (
                    <div
                      key={`${index}`}
                      className="flex-shrink-0 card-wrapper-v2"
                      style={{ width: 'calc(33.333% - 40px)' }}
                      onMouseEnter={(e) => handleCardHover(e, relativeIndex)}
                    >
                      <motion.div
                        initial={{ opacity: 0.3, scale: 0.85 }}
                        whileInView={{ opacity: 1, scale: 1.05 }}
                        viewport={{ root: scrollRef, amount: 0.2, margin: "0px -35% 0px -35%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="premium-white-card h-100 position-relative overflow-hidden border-0"
                      >
                        <div 
                          className="card-top-bar" 
                          style={{ background: dept.gradient }}
                        />
                        <Card.Body className="p-4 pt-5 text-center">
                          <motion.div 
                            className="icon-circle-v2 mx-auto mb-4"
                            style={{ 
                              background: dept.iconBg,
                              color: dept.accentColor,
                              border: `1px solid ${dept.accentColor}33`
                            }}
                            variants={iconFloatVariants}
                            animate="animate"
                          >
                            {dept.icon}
                          </motion.div>
                          <Card.Title className="card-title-v2">{dept.name}</Card.Title>
                          <Card.Text className="card-desc-v2 mb-4">
                            {dept.description}
                          </Card.Text>

                          <div className="features-container-v2 mb-4 p-3" style={{ background: '#f8fafc', borderRadius: '15px' }}>
                            {dept.features.slice(0, 4).map((feature, idx) => (
                              <div key={idx} className="d-flex align-items-center mb-2 last-mb-0">
                                <FaStar className="me-2" size={10} style={{ color: dept.accentColor }} />
                                <span className="fs-8 fw-600 text-muted">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <Button 
                            className="explore-btn-v2 w-100 py-2"
                            style={{ background: dept.gradient }}
                            onClick={() => navigate(dept.route)}
                            as={motion.button}
                            whileHover="hover"
                            variants={buttonPulseVariants}
                          >
                            Explore More <FaArrowRight className="ms-2" />
                          </Button>
                        </Card.Body>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5 w-100 bg-white rounded-5 shadow-sm border">
                <FaStar className="text-warning display-4 mb-3" />
                <h3 className="fw-bold">No Services Available</h3>
                <p className="text-muted">Stay tuned for upcoming elite services.</p>
              </div>
            )}
          </motion.div>
      </Container>
      
      {/* Offers Section */}
      {/* Offers Section */}
      <section className="offers-section py-5">
        <Container>
          <motion.div 
            className="d-flex align-items-center justify-content-center gap-3 mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white p-2 rounded-circle shadow-sm">
                <FaGift className="text-warning fs-3" />
            </div>
            <h2 className="section-title text-dark fw-900 mb-0 font-heading">Exclusive <span className="text-warning">Offers</span></h2>
          </motion.div>

          <Carousel indicators={false} interval={4000} pause={false} className="elite-carousel pb-5">
            {offers.map((offer, i) => (
              <Carousel.Item key={i}>
                <div className="d-flex justify-content-center">
                    <div className="premium-white-card p-4 p-md-5 text-center position-relative overflow-hidden" style={{ maxWidth: '800px', borderRadius: '24px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                        <div className="card-shine-effect opacity-50"></div>
                        <Badge bg="warning" text="dark" className="mb-3 px-3 py-2 rounded-pill fw-bold shadow-sm">LIMITED TIME DEAL</Badge>
                        <h3 className="display-6 fw-900 mb-2 text-dark font-heading">{offer.title}</h3>
                        <p className="text-muted fs-5 mb-4">{offer.description || "Unlock exclusive savings on your next booking."}</p>
                        
                        <div className="d-inline-flex align-items-center gap-3 bg-light px-4 py-3 rounded-4 border border-warning border-opacity-25 mb-4">
                            <span className="text-muted small fw-bold text-uppercase tracking-wider">CODE:</span>
                            <span className="fs-4 fw-900 text-dark font-heading tracking-widest">{offer.code}</span>
                            <Button variant="link" className="p-0 text-warning" onClick={() => {navigator.clipboard.writeText(offer.code)}}><FaCopy /></Button>
                        </div>

                        <div>
                            <Button className="btn-gold px-5 py-3 rounded-pill fw-800 shadow-lg text-uppercase tracking-wider">
                                <span className="position-relative z-1">Claim Offer <FaArrowRight className="ms-2" /></span>
                            </Button>
                        </div>
                    </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </Container>
      </section>

      {/* Refer & Earn */}
      <section className="refer-section py-5">
        <Container>
          <motion.div 
            className="refer-box-elite position-relative overflow-hidden rounded-5 p-5 text-center text-white shadow-lg"
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            style={{ 
                background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'url("https://www.transparenttextures.com/patterns/cubes.png")', opacity: 0.1 }}></div>
            
            <div className="position-relative z-1">
                <div className="bg-white bg-opacity-25 d-inline-flex p-3 rounded-circle mb-4 shadow-sm backdrop-blur">
                    <FaUsers className="text-white fs-1" />
                </div>
                <h3 className="display-5 fw-900 mb-3 font-heading">Refer & Earn ₹500</h3>
                <p className="fs-5 mb-4 opacity-90" style={{ maxWidth: '600px', margin: '0 auto' }}>Invite your friends to GeoBookings! You both get <strong className="text-white border-bottom border-2">₹500</strong> when they complete their first stay.</p>
                <Button variant="light" className="px-5 py-3 rounded-pill fw-900 text-warning shadow-lg">
                    Start Inviting <FaArrowRight className="ms-2" />
                </Button>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Member Reviews */}
      <section className="reviews-section py-5 bg-light">
        <Container>
           <motion.div 
            className="text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title text-dark fw-900 font-heading">Member <span className="text-warning">Reviews</span></h2>
            <p className="text-muted">See what our elite members are saying</p>
          </motion.div>

          <Carousel className="review-carousel pb-5" indicators={true} interval={5000}>
            {reviews.map((review, i) => (
              <Carousel.Item key={i}>
                <div className="d-flex justify-content-center">
                    <div className="review-box-elite bg-white p-5 rounded-5 shadow-sm border border-light text-center position-relative" style={{ maxWidth: '700px' }}>
                        <FaQuoteLeft className="text-warning opacity-25 display-1 position-absolute top-0 start-0 m-4" />
                        
                        <div className="review-header d-flex flex-column align-items-center mb-4 position-relative z-1">
                            <div className="avatar shadow-lg mb-3" style={{ width: '80px', height: '80px', fontSize: '2rem', background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}>
                                {review.avatar}
                            </div>
                            <h4 className="fw-800 text-dark mb-1">{review.name}</h4>
                            <div className="text-warning">
                                {[...Array(review.rating)].map((_, s) => (
                                <FaStar key={s} size={16} />
                                ))}
                            </div>
                        </div>
                        <p className="review-text fs-5 text-muted fst-italic position-relative z-1">"{review.text}"</p>
                    </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </Container>
      </section>
    </div>
  );
};

export default BookingSelection;
