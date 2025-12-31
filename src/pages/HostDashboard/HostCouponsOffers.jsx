import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Table, Modal, Tabs, Tab, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaTag, FaGift, FaImage, FaCalendar, FaPercent, FaArrowLeft, FaTags, FaStar, FaHistory, FaUsers, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import HostNavbar from '../../components/host/HostNavbar';
import StatusModal from '../../components/common/StatusModal';
import { useNavigate } from 'react-router-dom';
import "./HostDashboard.css";

const HostCouponsOffers = () => {
  const [activeTab, setActiveTab] = useState('coupons');
  const [coupons, setCoupons] = useState([]);
  const [offers, setOffers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [editingOffer, setEditingOffer] = useState(null);
  const [alert, setAlert] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const [couponForm, setCouponForm] = useState({
    code: '', discountType: 'Percentage', discountValue: '',
    validFrom: '', validTo: '', propertyId: '', propertyType: '',
    maxUses: 0, targetAllUsers: true, targetUserIds: []
  });

  const [offerForm, setOfferForm] = useState({
    title: '', description: '', offerType: 'Festive', discountPercentage: '',
    validFrom: '', validTo: '', propertyId: '', propertyType: '',
    banner: null, targetAllUsers: true, targetUserIds: []
  });

  const navigate = useNavigate();
  const [modalConfig, setModalConfig] = useState({
    show: false, type: "success", message: "", onConfirm: null
  });

  const hostId = JSON.parse(localStorage.getItem('hostLoginData'))?.hostId;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [couponsRes, offersRes, propertiesRes, usersRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/host/${hostId}/coupons`),
        axios.get(`http://localhost:5000/api/host/${hostId}/offers`),
        axios.get(`http://localhost:5000/api/properties/host/${hostId}`),
        axios.get(`http://localhost:5000/api/host/${hostId}/users`)
      ]);
      setCoupons(couponsRes.data);
      setOffers(offersRes.data);
      setProperties(propertiesRes.data);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert('Error loading data', 'danger');
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: '', discountType: 'Percentage', discountValue: '',
      validFrom: '', validTo: '', propertyId: '', propertyType: '',
      maxUses: 0, targetAllUsers: true, targetUserIds: []
    });
    setShowCouponModal(true);
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code, discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      validFrom: coupon.validFrom?.split('T')[0] || '',
      validTo: coupon.validTo?.split('T')[0] || '',
      propertyId: coupon.propertyId || '',
      propertyType: coupon.propertyType || '',
      maxUses: coupon.usageLimit || 0,
      targetAllUsers: coupon.targetAllUsers !== false,
      targetUserIds: coupon.targetUserIds || []
    });
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async () => {
    try {
      const data = { hostId, ...couponForm };
      if (editingCoupon) {
        await axios.put(`http://localhost:5000/api/host/coupons/${editingCoupon.id}`, { ...data, status: editingCoupon.status });
        showAlert('Coupon updated!');
      } else {
        await axios.post('http://localhost:5000/api/host/coupons', data);
        showAlert('Coupon created!');
      }
      setShowCouponModal(false);
      loadData();
    } catch (error) {
      handleApiError(error, 'coupon');
    }
  };

  const handleApiError = (error, type) => {
    const msg = error.response?.data?.message || 'Error saving ' + type;
    if (msg.includes("limit reached")) {
      setModalConfig({
        show: true, type: "upgrade_limit", message: msg,
        onConfirm: () => navigate("/host/subscription-plans")
      });
    } else {
      showAlert(msg, 'danger');
    }
  };

  const handleDeleteCoupon = (id) => {
    setModalConfig({
      show: true, type: "confirm", message: "Delete this coupon permanently?",
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/host/coupons/${id}`);
          showAlert('Coupon deleted!');
          loadData();
          setModalConfig(prev => ({ ...prev, show: false }));
        } catch (error) {
          showAlert('Error deleting coupon', 'danger');
        }
      }
    });
  };

  const handleToggleCouponStatus = async (coupon) => {
    try {
      const newStatus = coupon.status === 'Active' ? 'Inactive' : 'Active';
      await axios.put(`http://localhost:5000/api/host/coupons/${coupon.id}`, { ...coupon, status: newStatus });
      showAlert(`Coupon ${newStatus.toLowerCase()}!`);
      loadData();
    } catch (error) {
      showAlert('Error updating status', 'danger');
    }
  };

  const handleCreateOffer = () => {
    setEditingOffer(null);
    setOfferForm({
      title: '', description: '', offerType: 'Festive', discountPercentage: '',
      validFrom: '', validTo: '', propertyId: '', propertyType: '',
      banner: null, targetAllUsers: true, targetUserIds: []
    });
    setBannerPreview(null);
    setShowOfferModal(true);
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title, description: offer.description, offerType: offer.offerType,
      discountPercentage: offer.discountPercentage,
      validFrom: offer.validFrom?.split('T')[0] || '',
      validTo: offer.validTo?.split('T')[0] || '',
      propertyId: offer.propertyId || '',
      propertyType: offer.propertyType || '',
      banner: null, targetAllUsers: offer.targetAllUsers !== false,
      targetUserIds: offer.targetUserIds || []
    });
    setBannerPreview(offer.imageUrl ? `http://localhost:5000${offer.imageUrl}` : null);
    setShowOfferModal(true);
  };

  const handleSaveOffer = async () => {
    try {
      const formData = new FormData();
      Object.keys(offerForm).forEach(key => {
        if (key === 'banner' && offerForm[key]) formData.append('banner', offerForm[key]);
        else if (key === 'targetUserIds') offerForm[key].forEach(id => formData.append('targetUserIds', id));
        else formData.append(key, offerForm[key]);
      });
      formData.append('hostId', hostId);

      if (editingOffer) {
        formData.append('status', editingOffer.status);
        await axios.put(`http://localhost:5000/api/host/offers/${editingOffer.id}`, formData);
        showAlert('Offer updated!');
      } else {
        await axios.post('http://localhost:5000/api/host/offers', formData);
        showAlert('Offer created!');
      }
      setShowOfferModal(false);
      loadData();
    } catch (error) {
      handleApiError(error, 'offer');
    }
  };

  const handleDeleteOffer = (id) => {
    setModalConfig({
      show: true, type: "confirm", message: "Delete this offer permanently?",
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/host/offers/${id}`);
          showAlert('Offer deleted!');
          loadData();
          setModalConfig(prev => ({ ...prev, show: false }));
        } catch (error) {
          showAlert('Error deleting offer', 'danger');
        }
      }
    });
  };

  const getPropertyName = (id, type) => {
    const p = properties.find(p => p.id === id && p.department === type);
    return p ? p.company : 'All Properties';
  };

  const containerVariants = { 
    hidden: { opacity: 0 }, 
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.12,
        delayChildren: 0.2
      } 
    } 
  };
  
  const itemVariants = { 
    hidden: { y: 30, opacity: 0 }, 
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    } 
  };

  const headerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <>
      <HostNavbar />
      <div className="host-main-content">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          {alert && <Alert variant={alert.type} dismissible className="animate-fade-in shadow-sm">{alert.message}</Alert>}

          <header className="dashboard-header mb-4">
            <div className="header-text">
              <h1>Coupons & Offers</h1>
              <p>Create and manage discount codes and promotional banners.</p>
            </div>
            <div className="d-flex gap-3">
              <div className="header-stats-card">
                <div className="header-stats-icon bg-primary bg-opacity-10 text-primary">
                  <FaTags size={20} />
                </div>
                <div>
                  <div className="header-stats-value">{coupons.length}</div>
                  <div className="header-stats-label">Total Coupons</div>
                </div>
              </div>
              <div className="header-stats-card">
                <div className="header-stats-icon bg-success bg-opacity-10 text-success">
                  <FaToggleOn size={20} />
                </div>
                <div>
                  <div className="header-stats-value">{coupons.filter(c => c.status === 'Active').length}</div>
                  <div className="header-stats-label">Active</div>
                </div>
              </div>
              <div className="header-stats-card">
                <div className="header-stats-icon bg-danger bg-opacity-10 text-danger">
                  <FaToggleOff size={20} />
                </div>
                <div>
                  <div className="header-stats-value">{coupons.filter(c => c.status !== 'Active').length}</div>
                  <div className="header-stats-label">Inactive</div>
                </div>
              </div>
            </div>
          </header>

          <motion.div 
            variants={itemVariants} 
            className="modern-card p-0 overflow-hidden border-0"
            style={{
              borderRadius: '1.25rem',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Tabs 
              activeKey={activeTab} 
              onSelect={(k) => setActiveTab(k)} 
              className="modern-tabs px-4 pt-4 border-0"
              style={{
                borderBottom: '2px solid #e2e8f0'
              }}
            >
              <Tab 
                eventKey="coupons" 
                title={
                  <div className="d-flex align-items-center gap-2 px-2 py-1">
                    <FaTag size={16} /> 
                    <span className="fw-600">Coupons</span>
                  </div>
                }
              >
                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="icon-box-sm bg-success bg-opacity-10 text-success rounded-3">
                        <FaTag size={18} />
                      </div>
                      <div>
                        <h5 className="mb-0 fw-extra-bold text-dark">Coupon Codes</h5>
                        <p className="mb-0 small text-muted">Create and manage discount coupons</p>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className="btn-modern btn-primary-modern d-flex align-items-center gap-2 fw-extra-bold" 
                        onClick={handleCreateCoupon}
                        style={{
                          padding: '0.65rem 1.25rem',
                          borderRadius: '0.75rem',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                        }}
                      >
                        <FaPlus /> Create Coupon
                      </Button>
                    </motion.div>
                  </div>
                  <div className="modern-table-container border-0" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                    <Table hover className="modern-table mb-0">
                      <thead style={{ background: '#f8fafc' }}>
                        <tr>
                          <th>
                            <div className="d-flex align-items-center gap-2">
                              <FaTag size={12} className="text-success" />
                              Code
                            </div>
                          </th>
                          <th>
                            <div className="d-flex align-items-center gap-2">
                              <FaPercent size={12} className="text-success" />
                              Discount
                            </div>
                          </th>
                          <th>
                            <div className="d-flex align-items-center gap-2">
                              <FaCalendar size={12} className="text-success" />
                              Validity
                            </div>
                          </th>
                          <th>
                            <div className="d-flex align-items-center gap-2">
                              <FaTag size={12} className="text-success" />
                              Property
                            </div>
                          </th>
                          <th>
                            <div className="d-flex align-items-center gap-2">
                              <FaHistory size={12} className="text-success" />
                              Usage
                            </div>
                          </th>
                          <th>Status</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence mode="popLayout">
                          {coupons.length === 0 ? (
                            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              <td colSpan="7" className="text-center py-5">
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="d-flex flex-column align-items-center gap-3"
                                >
                                  <div className="icon-box-xl bg-light text-muted rounded-circle">
                                    <FaTag size={40} />
                                  </div>
                                  <div>
                                    <h5 className="text-dark fw-extra-bold mb-2">No Coupons Yet</h5>
                                    <p className="text-muted mb-0">Start by creating your first coupon!</p>
                                  </div>
                                </motion.div>
                              </td>
                            </motion.tr>
                          ) : (
                            coupons.map((coupon) => (
                              <motion.tr 
                                key={coupon.id} 
                                layout 
                                initial={{ opacity: 0, x: -20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: 20 }}
                                whileHover={{ 
                                  backgroundColor: '#f8fafc',
                                  transition: { duration: 0.2 }
                                }}
                              >
                                <td>
                                  <motion.div 
                                    className="badge-modern badge-primary py-2 px-3 fw-extra-bold" 
                                    style={{ letterSpacing: '1.5px', fontSize: '0.85rem' }}
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    {coupon.code}
                                  </motion.div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <div className="icon-box-sm bg-success bg-opacity-10 text-success rounded-2">
                                      {coupon.discountType === 'Percentage' ? <FaPercent size={12}/> : <span style={{ fontSize: '0.9rem' }}>₹</span>}
                                    </div>
                                    <span className="fw-extra-bold text-dark">{coupon.discountValue}</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="small text-muted d-flex align-items-center gap-2 fw-600">
                                    <FaCalendar size={10}/> 
                                    <span>{new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validTo).toLocaleDateString()}</span>
                                  </div>
                                </td>
                                <td><small className="text-muted fw-600">{getPropertyName(coupon.propertyId, coupon.propertyType)}</small></td>
                                <td>
                                  <div className="d-flex flex-column gap-1">
                                    <small className="text-muted fw-600">{coupon.usageCount || 0} / {coupon.usageLimit || '∞'}</small>
                                    <div className="progress" style={{ height: '5px', width: '70px', borderRadius: '10px' }}>
                                      <div 
                                        className="progress-bar" 
                                        style={{ 
                                          width: `${coupon.usageLimit ? (coupon.usageCount/coupon.usageLimit)*100 : 0}%`,
                                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <motion.span 
                                    className={`badge-modern ${coupon.status === 'Active' ? 'badge-success' : 'badge-danger'}`}
                                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem', fontWeight: '700' }}
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    {coupon.status}
                                  </motion.span>
                                </td>
                                <td>
                                  <div className="d-flex justify-content-center gap-2">
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button 
                                        variant="light" 
                                        className="btn-icon" 
                                        onClick={() => handleToggleCouponStatus(coupon)} 
                                        title={coupon.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        style={{ borderRadius: '0.5rem' }}
                                      >
                                        {coupon.status === 'Active' ? <FaToggleOn className="text-success" size={24}/> : <FaToggleOff size={24}/>}
                                      </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button 
                                        variant="light" 
                                        className="btn-icon" 
                                        onClick={() => handleEditCoupon(coupon)} 
                                        title="Edit"
                                        style={{ borderRadius: '0.5rem' }}
                                      >
                                        <FaEdit/>
                                      </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button 
                                        variant="light" 
                                        className="btn-icon text-danger" 
                                        onClick={() => handleDeleteCoupon(coupon.id)} 
                                        title="Delete"
                                        style={{ borderRadius: '0.5rem' }}
                                      >
                                        <FaTrash/>
                                      </Button>
                                    </motion.div>
                                  </div>
                                </td>
                              </motion.tr>
                            ))
                          )}
                        </AnimatePresence>
                      </tbody>
                    </Table>
                  </div>
                </div>
              </Tab>

              <Tab 
                eventKey="offers" 
                title={
                  <div className="d-flex align-items-center gap-2 px-2 py-1">
                    <FaGift size={16} /> 
                    <span className="fw-600">Special Offers</span>
                  </div>
                }
              >
                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="icon-box-sm bg-success bg-opacity-10 text-success rounded-3">
                        <FaGift size={18} />
                      </div>
                      <div>
                        <h5 className="mb-0 fw-extra-bold text-dark">Active Offers</h5>
                        <p className="mb-0 small text-muted">Promote special deals and discounts</p>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className="btn-modern btn-primary-modern d-flex align-items-center gap-2 fw-extra-bold" 
                        onClick={handleCreateOffer}
                        style={{
                          padding: '0.65rem 1.25rem',
                          borderRadius: '0.75rem',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                        }}
                      >
                        <FaPlus /> Create Offer
                      </Button>
                    </motion.div>
                  </div>
                  <Row className="g-4">
                    <AnimatePresence mode="popLayout">
                      {offers.length === 0 ? (
                        <Col xs={12}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-5 d-flex flex-column align-items-center gap-3"
                          >
                            <div className="icon-box-xl bg-light text-muted rounded-circle">
                              <FaGift size={40} />
                            </div>
                            <div>
                              <h5 className="text-dark fw-extra-bold mb-2">No Offers Available</h5>
                              <p className="text-muted mb-0">Create your first special offer to attract customers!</p>
                            </div>
                          </motion.div>
                        </Col>
                      ) : (
                        offers.map((offer) => (
                          <Col md={6} lg={4} key={offer.id}>
                            <motion.div 
                              layout 
                              initial={{ opacity: 0, scale: 0.9 }} 
                              animate={{ opacity: 1, scale: 1 }} 
                              exit={{ opacity: 0, scale: 0.9 }}
                              whileHover={{ 
                                y: -8,
                                boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.3)',
                                transition: { duration: 0.3 }
                              }}
                              className="modern-card h-100 p-0 overflow-hidden border-0"
                              style={{
                                borderRadius: '1.25rem',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
                              }}
                            >
                              <div className="position-relative" style={{ height: '180px' }}>
                                <img 
                                  src={offer.imageUrl ? `http://localhost:5000${offer.imageUrl}` : 'https://via.placeholder.com/400x200?text=No+Image'} 
                                  alt={offer.title} 
                                  className="w-100 h-100 object-fit-cover"
                                  style={{ filter: 'brightness(0.95)' }}
                                />
                                <div className="position-absolute top-0 end-0 m-3 d-flex gap-2">
                                  <motion.span 
                                    className={`badge-modern ${offer.status === 'Active' ? 'badge-success' : 'badge-danger'}`}
                                    style={{ padding: '0.5rem 0.8rem', fontWeight: '700', backdropFilter: 'blur(10px)' }}
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    {offer.status}
                                  </motion.span>
                                  <motion.span 
                                    className="badge-modern badge-info"
                                    style={{ padding: '0.5rem 0.8rem', fontWeight: '700', backdropFilter: 'blur(10px)' }}
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    {offer.offerType}
                                  </motion.span>
                                </div>
                                <div className="position-absolute bottom-0 start-0 m-3">
                                  <motion.div 
                                    className="badge-modern py-2 px-4 shadow-lg fw-extra-bold" 
                                    style={{ 
                                      fontSize: '1.1rem',
                                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                      color: 'white',
                                      borderRadius: '0.75rem',
                                      backdropFilter: 'blur(10px)'
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    {offer.discountPercentage}% OFF
                                  </motion.div>
                                </div>
                              </div>
                              <div className="p-4">
                                <h6 className="fw-extra-bold mb-2 text-dark" style={{ fontSize: '1.1rem' }}>{offer.title}</h6>
                                <p className="text-muted small mb-3 line-clamp-2" style={{ height: '2.8rem', lineHeight: '1.4' }}>{offer.description}</p>
                                <hr className="my-3 border-light"/>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <div className="small text-muted fw-600">
                                    <FaCalendar size={11} className="me-1 text-success"/> 
                                    Exp: {new Date(offer.validTo).toLocaleDateString()}
                                  </div>
                                  <div className="small fw-extra-bold text-success truncate-1" style={{ maxWidth: '110px' }}>
                                    {getPropertyName(offer.propertyId, offer.propertyType)}
                                  </div>
                                </div>
                                <div className="d-flex gap-2 mt-auto">
                                  <motion.div className="flex-grow-1" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Button 
                                      variant="outline-success" 
                                      size="sm" 
                                      className="w-100 btn-modern fw-600" 
                                      onClick={() => handleEditOffer(offer)}
                                      style={{ borderRadius: '0.6rem', padding: '0.5rem' }}
                                    >
                                      <FaEdit className="me-1"/> Edit
                                    </Button>
                                  </motion.div>
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm" 
                                      className="btn-icon" 
                                      onClick={() => handleDeleteOffer(offer.id)}
                                      style={{ borderRadius: '0.6rem' }}
                                    >
                                      <FaTrash/>
                                    </Button>
                                  </motion.div>
                                </div>
                              </div>
                            </motion.div>
                          </Col>
                        ))
                      )}
                    </AnimatePresence>
                  </Row>
                </div>
              </Tab>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>

      {/* Coupons Modal */}
      <Modal show={showCouponModal} onHide={() => setShowCouponModal(false)} size="lg" centered className="modern-modal">
        <Modal.Header closeButton className="border-0 px-4 pt-4"><Modal.Title className="font-weight-bold">{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</Modal.Title></Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group><Form.Label className="small font-weight-bold">Coupon Code *</Form.Label><Form.Control type="text" placeholder="e.g., SUMMER50" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}/></Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group><Form.Label className="small font-weight-bold">Discount Type *</Form.Label><Form.Select value={couponForm.discountType} onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}><option value="Percentage">Percentage (%)</option><option value="Fixed">Fixed Amount (₹)</option></Form.Select></Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group><Form.Label className="small font-weight-bold">Value *</Form.Label><Form.Control type="number" placeholder="Value" value={couponForm.discountValue} onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}/></Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group><Form.Label className="small font-weight-bold">Max Uses</Form.Label><Form.Control type="number" placeholder="0 for unlimited" value={couponForm.maxUses} onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}/></Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group><Form.Label className="small font-weight-bold">Valid From *</Form.Label><Form.Control type="date" value={couponForm.validFrom} onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })}/></Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group><Form.Label className="small font-weight-bold">Valid To *</Form.Label><Form.Control type="date" value={couponForm.validTo} onChange={(e) => setCouponForm({ ...couponForm, validTo: e.target.value })}/></Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group><Form.Label className="small font-weight-bold">Property Type</Form.Label><Form.Select value={couponForm.propertyType} onChange={(e) => setCouponForm({ ...couponForm, propertyType: e.target.value, propertyId: '' })}><option value="">All Types</option><option value="Hotel">Hotel</option><option value="Salon">Salon</option><option value="Hospital">Hospital</option><option value="Cab">Cab</option></Form.Select></Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group><Form.Label className="small font-weight-bold">Specific Property</Form.Label><Form.Select value={couponForm.propertyId} onChange={(e) => setCouponForm({ ...couponForm, propertyId: e.target.value })} disabled={!couponForm.propertyType}><option value="">All Properties</option>{properties.filter(p => !couponForm.propertyType || p.department === couponForm.propertyType).map(p => <option key={p.id} value={p.id}>{p.company}</option>)}</Form.Select></Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Check type="checkbox" label="Target All Users" checked={couponForm.targetAllUsers} onChange={(e) => setCouponForm({...couponForm, targetAllUsers: e.target.checked})} className="mb-2"/>
                {!couponForm.targetAllUsers && (
                  <div className="user-selector p-2 border rounded bg-light" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                    {users.map(user => <Form.Check key={user.id} type="checkbox" label={`${user.firstName} (${user.email})`} checked={couponForm.targetUserIds.includes(user.id)} onChange={(e) => setCouponForm({...couponForm, targetUserIds: e.target.checked ? [...couponForm.targetUserIds, user.id] : couponForm.targetUserIds.filter(id => id !== user.id)})} className="small text-muted mb-1"/>)}
                  </div>
                )}
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4"><Button variant="light" onClick={() => setShowCouponModal(false)}>Cancel</Button><Button className="btn-modern btn-primary-modern" onClick={handleSaveCoupon}>Save Coupon</Button></Modal.Footer>
      </Modal>

      {/* Offers Modal */}
       <Modal show={showOfferModal} onHide={() => setShowOfferModal(false)} size="lg" centered className="modern-modal">
        <Modal.Header closeButton className="border-0 px-4 pt-4"><Modal.Title className="font-weight-bold">{editingOffer ? 'Edit Offer' : 'Create New Offer'}</Modal.Title></Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Form>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group><Form.Label className="small font-weight-bold">Offer Title *</Form.Label><Form.Control type="text" placeholder="e.g., Weekend Special" value={offerForm.title} onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}/></Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group><Form.Label className="small font-weight-bold">Description *</Form.Label><Form.Control as="textarea" rows={2} placeholder="Briefly describe the offer" value={offerForm.description} onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}/></Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group><Form.Label className="small font-weight-bold">Offer Type *</Form.Label><Form.Select value={offerForm.offerType} onChange={(e) => setOfferForm({ ...offerForm, offerType: e.target.value })}><option value="Festive">Festive</option><option value="Seasonal">Seasonal</option><option value="Special">Special</option></Form.Select></Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group><Form.Label className="small font-weight-bold">Discount (%) *</Form.Label><Form.Control type="number" placeholder="Percentage" value={offerForm.discountPercentage} onChange={(e) => setOfferForm({ ...offerForm, discountPercentage: e.target.value })}/></Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group><Form.Label className="small font-weight-bold">Valid From *</Form.Label><Form.Control type="date" value={offerForm.validFrom} onChange={(e) => setOfferForm({ ...offerForm, validFrom: e.target.value })}/></Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group><Form.Label className="small font-weight-bold">Valid To *</Form.Label><Form.Control type="date" value={offerForm.validTo} onChange={(e) => setOfferForm({ ...offerForm, validTo: e.target.value })}/></Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group><Form.Label className="small font-weight-bold">Property Type</Form.Label><Form.Select value={offerForm.propertyType} onChange={(e) => setOfferForm({ ...offerForm, propertyType: e.target.value, propertyId: '' })}><option value="">All Types</option><option value="Hotel">Hotel</option><option value="Salon">Salon</option><option value="Hospital">Hospital</option><option value="Cab">Cab</option></Form.Select></Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group><Form.Label className="small font-weight-bold">Specific Property</Form.Label><Form.Select value={offerForm.propertyId} onChange={(e) => setOfferForm({ ...offerForm, propertyId: e.target.value })} disabled={!offerForm.propertyType}><option value="">All Properties</option>{properties.filter(p => !offerForm.propertyType || p.department === offerForm.propertyType).map(p => <option key={p.id} value={p.id}>{p.company}</option>)}</Form.Select></Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-2"><Form.Label className="small font-weight-bold"><FaImage className="me-1"/> Banner Image</Form.Label><Form.Control type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if(f){ setOfferForm({...offerForm, banner: f}); setBannerPreview(URL.createObjectURL(f)); }}}/></Form.Group>
                {bannerPreview && <img src={bannerPreview} alt="Preview" className="rounded-3 shadow-sm" style={{ height: '80px', objectFit: 'cover', width: '200px' }}/>}
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4"><Button variant="light" onClick={() => setShowOfferModal(false)}>Cancel</Button><Button className="btn-modern btn-primary-modern" onClick={handleSaveOffer}>Save Offer</Button></Modal.Footer>
      </Modal>

      <StatusModal show={modalConfig.show} type={modalConfig.type} message={modalConfig.message} onHide={() => setModalConfig(prev => ({ ...prev, show: false }))} onConfirm={modalConfig.onConfirm} />
    </>
  );
};

export default HostCouponsOffers;

