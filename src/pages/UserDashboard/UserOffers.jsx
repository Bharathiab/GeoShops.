import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import { FaGift, FaTag, FaClock, FaTicketAlt, FaCopy, FaArrowRight } from "react-icons/fa";
import UserNavbar from "../../components/user/UserNavbar";
import { fetchActiveOffers, fetchBookings, fetchCoupons } from "../../api";
import { motion } from "framer-motion";
import Toast from "../../utils/toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "./DepartmentBooking.css";
import "../HostDashboard/HostDashboard.css";
import "../../styles/PremiumHeader.css";

const UserOffers = () => {
    const [offers, setOffers] = useState([]);
    const [specialOffers, setSpecialOffers] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        try {
            const loginData = localStorage.getItem("userLoginData");
            let userId = null;
            if (loginData) {
                userId = JSON.parse(loginData).userId;
            }

            // Fetch global active offers (Festive, etc.) - filtered by user
            const activeOffers = await fetchActiveOffers(userId);

            // Fetch active coupons - filtered by user
            const allCoupons = await fetchCoupons(userId);
            const activeCoupons = allCoupons.filter(c => c.status === 'Active');

            // Calculate Special Offers based on booking history
            let calculatedSpecialOffers = [];
            if (userId) {
                const bookings = await fetchBookings(userId);
                const propertyCounts = {};
                bookings.forEach(b => {
                    const propId = b.propertyId || b.hotel_id || b.saloon_id || b.hospital_id || b.cab_id;
                    const propName = b.propertyName || "Property";
                    if (propId) {
                        if (!propertyCounts[propId]) {
                            propertyCounts[propId] = { count: 0, name: propName };
                        }
                        propertyCounts[propId].count += 1;
                    }
                });

                // If bookings >= 4, generate a special offer
                Object.keys(propertyCounts).forEach(propId => {
                    if (propertyCounts[propId].count >= 4) {
                        calculatedSpecialOffers.push({
                            id: `special-${propId}`,
                            title: `Loyalty Reward: ${propertyCounts[propId].name}`,
                            description: `You've booked ${propertyCounts[propId].name} ${propertyCounts[propId].count} times! Enjoy 10% OFF your next visit.`,
                            type: 'Special',
                            discount_percentage: 10,
                            valid_to: null, // No expiry for now
                            status: 'Active'
                        });
                    }
                });
            }

            setOffers(activeOffers.filter(o => o.type !== 'Special'));
            setSpecialOffers(calculatedSpecialOffers);
            setCoupons(activeCoupons);
            setLoading(false);
        } catch (error) {
            console.error("Error loading offers:", error);
            setLoading(false);
        }
    };

    const copyCouponCode = (code) => {
        navigator.clipboard.writeText(code);
        Toast.success(`Coupon code "${code}" copied! Use it during booking.`);
    };

    return (
        <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            <UserNavbar />
            
            <div className="properties-container">
                {/* Premium Elite Header */}
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
                    
                    <Container>
                        <div className="header-content-wrapper position-relative z-1 py-5">
                            <motion.div 
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 80, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="header-accent-line mb-3"
                                style={{ 
                                    height: '4px', 
                                    background: 'linear-gradient(90deg, #fbbf24 0%, transparent 100%)',
                                    borderRadius: '2px'
                                }}
                            ></motion.div>
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="display-3 fw-900 mb-2 text-white font-heading" 
                                style={{ letterSpacing: '-2px' }}
                            >
                                Exclusive <span className="text-gradient-gold">Offers</span>
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="lead text-white text-opacity-80 mb-0 fw-500 max-w-2xl"
                            >
                                Curated deals and loyalty rewards tailored for your elite lifestyle.
                            </motion.p>
                        </div>
                    </Container>
                </header>

                <Container>

                {loading ? (
                    <p className="text-center">Loading offers...</p>
                ) : (
                    <>
                        {/* Special Offers Section */}
                        {specialOffers.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-5"
                            >
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="bg-gold-light bg-opacity-10 p-2 rounded-4 shadow-sm">
                                        <FaTag className="text-warning fs-4" />
                                    </div>
                                    <h3 className="mb-0 fw-900 text-dark font-heading tracking-tight">Loyalty Rewards</h3>
                                </div>
                                <Row className="g-3">
                                    {specialOffers.map((offer, index) => (
                                        <Col md={6} lg={3} key={offer.id}>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                whileHover={{ 
                                                    y: -8,
                                                    scale: 1.02,
                                                    transition: { type: "spring", stiffness: 400, damping: 10 }
                                                }}
                                                transition={{ delay: index * 0.05 }}
                                                className="modern-card h-100 p-3 border-0 shadow-lg position-relative overflow-hidden"
                                                style={{ 
                                                    background: 'linear-gradient(135deg, #fffcf0 0%, #ffffff 100%)',
                                                    border: '1px solid rgba(251, 191, 36, 0.2)'
                                                }}
                                            >
                                                {/* Shine Effect */}
                                                <div className="card-shine-effect"></div>
                                                
                                                <div className="position-relative z-1">
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <Badge bg="warning" text="dark" className="rounded-pill px-3 py-1 fw-bold border-0 shadow-sm extra-small">ELITE PERK</Badge>
                                                        <div className="text-gold-modern fs-5 fw-900">{offer.discount_percentage}% OFF</div>
                                                    </div>
                                                    <h5 className="fw-900 text-dark mb-2 font-heading h6">{offer.title}</h5>
                                                    <p className="text-muted extra-small mb-4 fw-500" style={{ lineHeight: '1.5', fontSize: '0.8rem' }}>
                                                        {offer.description}
                                                    </p>
                                                    <Button className="btn-gold-gradient w-100 rounded-pill py-2 fw-800 shadow-md extra-small tracking-wider">CLAIM REWARD</Button>
                                                </div>
                                            </motion.div>
                                        </Col>
                                    ))}
                                </Row>
                            </motion.div>
                        )}

                        {/* Festive/General Offers Section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-5"
                        >
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="bg-primary bg-opacity-10 p-2 rounded-4 shadow-sm">
                                    <FaGift className="text-primary fs-4" />
                                </div>
                                <h3 className="mb-0 fw-900 text-dark font-heading tracking-tight">Festive & Seasonal Deals</h3>
                            </div>
                            
                            <Row className="g-3">
                                {offers.length > 0 ? (
                                    offers.map((offer, index) => (
                                        <Col md={6} lg={3} key={offer.id}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ 
                                                    y: -10,
                                                    transition: { type: "spring", stiffness: 300 }
                                                }}
                                                transition={{ delay: index * 0.05 }}
                                                className="elite-property-card h-100"
                                            >
                                                <div className="card-shine-effect"></div>
                                                <div className="elite-card-image-wrapper p-2 overflow-hidden">
                                                    {offer.imageUrl ? (
                                                        <img
                                                            src={`http://localhost:5000${offer.imageUrl}`}
                                                            alt={offer.title}
                                                            className="elite-card-image rounded-3"
                                                            style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div style={{ height: '140px', background: 'var(--gradient-primary)', borderRadius: '12px' }} className="d-flex align-items-center justify-content-center shadow-inner">
                                                            <FaGift size={40} className="text-white opacity-40 animate-float-icon" />
                                                        </div>
                                                    )}
                                                    <div className="position-absolute top-2 right-2 m-2">
                                                        <Badge bg="danger" className="rounded-pill px-2 py-1 fw-bold shadow-lg extra-small" style={{ fontSize: '0.65rem' }}>{offer.type}</Badge>
                                                    </div>
                                                </div>
                                                <div className="elite-card-body p-3 pt-0">
                                                    <h5 className="fw-800 text-dark mb-1 h6">{offer.title}</h5>
                                                    <p className="text-muted extra-small mb-3 fw-500" style={{ fontSize: '0.7rem' }}>{offer.description}</p>
                                                    
                                                    <div className="elite-price-display mt-auto pt-2 border-top">
                                                        <div>
                                                            <span className="elite-price-val text-primary-light h5 mb-0" style={{ fontSize: '1.2rem' }}>{offer.discount_percentage}% OFF</span>
                                                            <div className="d-flex align-items-center text-muted extra-small mt-0 fw-600" style={{ fontSize: '0.65rem' }}>
                                                                <FaClock className="me-1 opacity-50" />
                                                                {offer.valid_to ? new Date(offer.valid_to).toLocaleDateString() : 'Ongoing'}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            className="btn-elite-primary rounded-pill px-3 py-1 extra-small"
                                                            style={{ fontSize: '0.7rem' }}
                                                            onClick={() => navigate(offer.propertyId ? `/user/booking/hotel/${offer.propertyId}` : '/user')}
                                                        >
                                                            Book <FaArrowRight className="ms-1" size={10} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Col>
                                    ))
                                ) : (
                                    <Col>
                                        <div className="p-4 text-center bg-white rounded-4 border border-dashed border-2">
                                            <FaGift size={30} className="text-muted opacity-25 mb-2" />
                                            <p className="text-muted small mb-0 fw-500">New experiences loading...</p>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </motion.div>

                        {/* Coupons Section */}
                        {coupons.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-5 pb-5"
                            >
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="bg-success bg-opacity-10 p-2 rounded-4 shadow-sm">
                                        <FaTicketAlt className="text-success fs-4" />
                                    </div>
                                    <h3 className="mb-0 fw-900 text-dark font-heading tracking-tight">Available Privileges</h3>
                                </div>
                                
                                <Row className="g-3">
                                    {coupons.map((coupon, index) => (
                                        <Col md={6} lg={3} key={coupon.id}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ 
                                                    scale: 1.05,
                                                    transition: { type: "spring", stiffness: 400, damping: 15 }
                                                }}
                                                transition={{ delay: index * 0.05 }}
                                                className="coupon-card-v2 p-3 bg-white rounded-4 border-2 shadow-sm border-dashed"
                                                style={{ borderColor: 'rgba(5, 150, 105, 0.2)' }}
                                            >
                                                <div className="card-shine-effect"></div>
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <Badge className="bg-emerald-gradient px-2 py-1 rounded-pill shadow-sm extra-small" style={{ fontSize: '0.6rem' }}>PRIVILEGE</Badge>
                                                    <div className="text-emerald-modern fw-900 fs-5">
                                                        {coupon.discountType === 'Percentage'
                                                            ? `${coupon.discountValue}%`
                                                            : `₹${coupon.discountValue}`} <span className="extra-small text-muted fw-bold" style={{ fontSize: '0.6rem' }}>OFF</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-2 bg-light rounded-3 text-center mb-3 border border-info border-opacity-10 position-relative overflow-hidden">
                                                    <code className="fs-5 fw-900 text-dark font-heading" style={{ letterSpacing: '2px' }}>{coupon.code}</code>
                                                </div>
                                                
                                                <div className="d-flex align-items-center text-muted extra-small mb-3 fw-600" style={{ fontSize: '0.65rem' }}>
                                                    <FaClock className="me-2 text-primary-light" />
                                                    {coupon.validTo ? new Date(coupon.validTo).toLocaleDateString() : 'Ongoing'}
                                                </div>
                                                
                                                <Button
                                                    variant="outline-success"
                                                    className="w-100 rounded-pill py-1 fw-800 border-2 btn-copy-elite d-flex align-items-center justify-content-center gap-1 extra-small"
                                                    style={{ fontSize: '0.7rem' }}
                                                    onClick={() => copyCouponCode(coupon.code)}
                                                >
                                                    <FaCopy size={12} /> COPY CODE
                                                </Button>
                                            </motion.div>
                                        </Col>
                                    ))}
                                </Row>
                            </motion.div>
                        )}
                    </>
                )}
            </Container>
            </div>
        </div>
    );
};

export default UserOffers;
