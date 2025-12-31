import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { FaArrowRight, FaGift } from "react-icons/fa";
import { fetchActiveOffers } from "../../api";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";

const DashboardOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All Offers");
    
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

            // Fetch global active offers
            const activeOffers = await fetchActiveOffers(userId);
            setOffers(activeOffers.filter(o => o.type !== 'Special'));
            setLoading(false);
        } catch (error) {
            console.error("Error loading offers:", error);
            setLoading(false);
        }
    };

    const filterCategories = ["Hotels", "All Offers", "Hospitals", "Holidays", "Salons", "Cabs", "Bank Offers"];

    const getFilteredItems = () => {
        if (activeTab === "All Offers") return offers;
        
        return offers.filter(o => {
            const type = o.propertyType || "";
            const desc = o.description || "";
            const searchTerms = activeTab.toLowerCase().slice(0, -1);
            
            return type.toLowerCase().includes(searchTerms) || desc.toLowerCase().includes(searchTerms);
        });
    };

    const filteredOffers = getFilteredItems();

    return (
        <div className="py-5" style={{ backgroundColor: "#f8fafc" }}>
            <style>
                {`
                    .offer-tab-btn-dash {
                        background: transparent;
                        border: none;
                        color: #64748b;
                        font-weight: 600;
                        padding: 0.5rem 1.25rem;
                        border-radius: 4px;
                        transition: all 0.3s ease;
                        font-family: 'Plus Jakarta Sans', sans-serif;
                        font-size: 0.9rem;
                    }
                    .offer-tab-btn-dash:hover {
                        color: #0f172a;
                        background: rgba(0,0,0,0.05);
                    }
                    .offer-tab-btn-dash.active {
                        background: #0f172a;
                        color: #fff;
                        font-weight: 700;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    }
                    .elite-offer-card-dash {
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        display: flex;
                        flex-direction: row;
                        height: 220px;
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                        position: relative;
                        border: 1px solid #e2e8f0;
                    }
                    .elite-offer-card-dash:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                    }
                    .elite-offer-img-col {
                        width: 40%;
                        position: relative;
                        overflow: hidden;
                    }
                    .elite-offer-img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.5s ease;
                    }
                    .elite-offer-card-dash:hover .elite-offer-img {
                        transform: scale(1.05);
                    }
                    .elite-offer-content-col {
                        width: 60%;
                        padding: 1.5rem;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        position: relative;
                    }
                    .tc-apply {
                        position: absolute;
                        top: 1rem;
                        right: 1.5rem;
                        font-size: 0.65rem;
                        color: #9ca3af;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        font-weight: 600;
                    }
                    .offer-title-dash {
                        font-size: 1.4rem;
                        font-weight: 800;
                        color: #1e293b;
                        line-height: 1.2;
                        margin-bottom: 0.5rem;
                        font-family: 'Outfit', sans-serif;
                    }
                    .offer-desc-dash {
                        font-size: 0.9rem;
                        color: #64748b;
                        margin-bottom: 1.25rem;
                        line-height: 1.5;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    .btn-book-now-dash {
                        background: transparent;
                        color: #2563eb;
                        font-weight: 800;
                        padding: 0;
                        text-transform: uppercase;
                        font-size: 0.85rem;
                        letter-spacing: 0.5px;
                        border: none;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        transition: gap 0.3s ease;
                    }
                    .btn-book-now-dash:hover {
                        gap: 0.8rem;
                        color: #1d4ed8;
                        text-decoration: none;
                    }
                    @media (max-width: 768px) {
                        .elite-offer-card-dash {
                            flex-direction: column;
                            height: auto;
                        }
                        .elite-offer-img-col, .elite-offer-content-col {
                            width: 100%;
                        }
                        .elite-offer-img-col {
                            height: 160px;
                        }
                    }
                `}
            </style>
            
            <Container>
                <div className="mb-4">
                    <h2 className="fw-bold mb-4 font-heading text-dark" style={{ fontSize: '2rem' }}>Exclusive Offers</h2>
                    <div className="d-flex flex-wrap gap-2 pb-2">
                        {filterCategories.map((cat) => (
                            <button
                                key={cat}
                                className={`offer-tab-btn-dash ${activeTab === cat ? 'active' : ''}`}
                                onClick={() => setActiveTab(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                       <div className="spinner-border text-primary" role="status"></div>
                       <p className="mt-3 text-muted">Loading offers...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <Row className="g-4">
                            {filteredOffers.length > 0 ? (
                                filteredOffers.map((offer, index) => (
                                    <Col lg={6} key={offer.id}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="elite-offer-card-dash"
                                        >
                                            <div className="elite-offer-img-col">
                                                <img
                                                    src={offer.imageUrl ? `http://localhost:5000${offer.imageUrl}` : 'https://images.unsplash.com/photo-1540544660431-98411d9b7d99?auto=format&fit=crop&w=800&q=80'}
                                                    alt={offer.title}
                                                    className="elite-offer-img"
                                                />
                                            </div>
                                            <div className="elite-offer-content-col">
                                                <div className="tc-apply">T&C's APPLY</div>
                                                <h3 className="offer-title-dash">{offer.title}</h3>
                                                <p className="offer-desc-dash">
                                                    {offer.description}
                                                </p>
                                                <div className="mt-auto">
                                                    <button 
                                                        className="btn-book-now-dash"
                                                        onClick={() => navigate(offer.propertyId ? `/user/booking/hotel/${offer.propertyId}` : '/user')}
                                                    >
                                                        BOOK NOW <FaArrowRight size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Col>
                                ))
                            ) : (
                                <Col xs={12}>
                                    <div className="text-center py-5 border border-dashed rounded-4">
                                        <FaGift size={30} className="text-muted opacity-25 mb-3"/>
                                        <h5 className="text-muted">No offers found for {activeTab}</h5>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </AnimatePresence>
                )}
            </Container>
        </div>
    );
};

export default DashboardOffers;
