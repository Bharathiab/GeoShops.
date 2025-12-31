import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Table, Badge, ProgressBar } from 'react-bootstrap';
import { 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaTicketAlt, 
    FaCopy, 
    FaPercentage, 
    FaMoneyBillWave,
    FaCalendarAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle,
    FaChartLine
} from 'react-icons/fa';
import AdminNavbar from '../../components/admin/AdminNavbar';
import Toast from '../../utils/toast';
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../api';
import { motion, AnimatePresence } from "framer-motion";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../../components/admin/AdminDashboardModern.css";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);
  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: '',
    validFrom: '',
    validTo: '',
    usageLimit: ''
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await fetchCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Error loading coupons:', error);
      Toast.error('Failed to load coupons');
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!newCoupon.code || !newCoupon.discountValue) {
        Toast.error("Please fill in all required fields");
        return;
    }

    try {
      if (editingCouponId) {
        await updateCoupon(editingCouponId, newCoupon);
        Toast.success('Coupon updated successfully!');
      } else {
        await createCoupon(newCoupon);
        Toast.success('Coupon created successfully!');
      }
      handleCloseModal();
      loadCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      Toast.error('Failed to save coupon.');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCouponId(coupon.id);
    setNewCoupon({
      code: coupon.code,
      discountType: coupon.discountType || coupon.discount_type || 'Percentage',
      discountValue: coupon.discountValue || coupon.discount_value || '',
      validFrom: coupon.validFrom || coupon.valid_from || '',
      validTo: coupon.validTo || coupon.valid_to || '',
      usageLimit: coupon.usageLimit || coupon.usage_limit || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = (id) => {
      setCouponToDelete(id);
      setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
      if (!couponToDelete) return;

      try {
        await deleteCoupon(couponToDelete);
        loadCoupons();
        Toast.success('Coupon deleted successfully!');
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Error deleting coupon:', error);
        Toast.error('Failed to delete coupon.');
      }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingCouponId(null);
    setNewCoupon({
      code: '',
      discountType: 'Percentage',
      discountValue: '',
      validFrom: '',
      validTo: '',
      usageLimit: ''
    });
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon({ ...newCoupon, code });
  };

  const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      Toast.success('Code copied to clipboard!');
  };

  // Stats
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.status === 'Active').length;
  // Calculate total redemptions safely
  const totalRedemptions = coupons.reduce((acc, curr) => acc + (parseInt(curr.used_count || curr.usedCount || 0)), 0);

  const stats = [
      { label: "Total Coupons", value: totalCoupons, icon: <FaTicketAlt />, color: "primary" },
      { label: "Active Campaigns", value: activeCoupons, icon: <FaCheckCircle />, color: "success" },
      { label: "Total Redemptions", value: totalRedemptions, icon: <FaChartLine />, color: "info" }
  ];

  // Animation variants
  const tableRowVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="d-flex bg-light min-vh-100">
        <AdminNavbar />
        <div className="dashboard-container flex-grow-1">
            <Container fluid className="pb-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>
                            <FaTicketAlt className="me-2 text-primary" />
                            Coupon Management
                        </h2>
                        <p className="text-muted mb-0">Create and manage discount coupons for users</p>
                    </div>
                    <Button 
                        onClick={() => setShowAddModal(true)}
                        className="btn-vibrant-primary d-flex align-items-center"
                    >
                        <FaPlus className="me-2" /> CREATE NEW COUPON
                    </Button>
                </div>

                {/* Stats Cards */}
                <Row className="mb-4 g-3">
                    {stats.map((stat, index) => (
                        <Col md={4} key={index}>
                            <div className="modern-card p-4 stats-card border-0 h-100">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="stat-label text-muted mb-1">{stat.label}</p>
                                        <h3 className="stat-value mb-0">{stat.value}</h3>
                                    </div>
                                    <div className={`stat-icon-wrapper bg-${stat.color} bg-opacity-10 text-${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>

                {/* Coupons Table */}
                <Card className="modern-card border-0 shadow-sm">
                  <div className="card-header-modern bg-white">
                    <span className="d-flex align-items-center">
                        <FaTicketAlt className="me-2 text-primary" /> Active Coupons
                    </span>
                  </div>
                  <Card.Body className="p-0">
                    <Table responsive hover className="modern-table mb-0 align-middle">
                        <thead className="bg-light">
                          <tr>
                            <th className="ps-4">Code</th>
                            <th>Type</th>
                            <th>Discount</th>
                            <th>Validity</th>
                            <th>Usage</th>
                            <th>Status</th>
                            <th className="text-end pe-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                             <tr>
                                <td colSpan="7" className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </td>
                             </tr>
                          ) : coupons.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-5 text-muted">
                                    <FaTicketAlt className="mb-2 text-secondary display-6" />
                                    <p>No coupons found. Create one to get started!</p>
                                </td>
                            </tr>
                          ) : (
                            coupons.map((coupon, index) => {
                                const dValue = coupon.discountValue || coupon.discount_value;
                                const dType = coupon.discountType || coupon.discount_type;
                                const validFrom = coupon.validFrom || coupon.valid_from;
                                const validTo = coupon.validTo || coupon.valid_to;
                                const usageLimit = coupon.usageLimit || coupon.usage_limit;
                                const usedCount = coupon.used_count || coupon.usedCount || 0;
                                // Basic usage percentage for progress bar
                                const usagePercent = usageLimit ? Math.min((usedCount / usageLimit) * 100, 100) : 0;
                                
                                return (
                                <motion.tr 
                                    key={coupon.id}
                                    variants={tableRowVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: index * 0.05 }}
                                >
                                  <td className="ps-4">
                                    <div className="d-flex align-items-center">
                                        <code className="fs-6 fw-bold text-primary bg-primary bg-opacity-10 px-2 py-1 rounded me-2">
                                            {coupon.code}
                                        </code>
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="p-0 text-muted"
                                          onClick={() => copyToClipboard(coupon.code)}
                                          title="Copy Code"
                                        >
                                          <FaCopy />
                                        </Button>
                                    </div>
                                  </td>
                                  <td>
                                      <Badge bg="light" text="dark" className="border fw-normal">
                                          {dType}
                                      </Badge>
                                  </td>
                                  <td>
                                    <span className="fw-bold text-success">
                                        {dType === 'Percentage' ? `${dValue}%` : `₹${dValue}`}
                                    </span>
                                  </td>
                                  <td>
                                      <div className="d-flex flex-column small text-muted">
                                          <span>From: {validFrom ? new Date(validFrom).toLocaleDateString() : 'N/A'}</span>
                                          <span>To: {validTo ? new Date(validTo).toLocaleDateString() : 'N/A'}</span>
                                      </div>
                                  </td>
                                  <td style={{minWidth: '120px'}}>
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span>{usedCount} Used</span>
                                        <span className="text-muted">{usageLimit || '∞'} Limit</span>
                                    </div>
                                    {usageLimit && (
                                        <ProgressBar now={usagePercent} variant="info" style={{height: '4px'}} />
                                    )}
                                  </td>
                                  <td>
                                    <Badge bg={coupon.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill px-3">
                                        {coupon.status === 'Active' ? <FaCheckCircle className="me-1" /> : <FaTimesCircle className="me-1" />}
                                        {coupon.status}
                                    </Badge>
                                  </td>
                                  <td className="text-end pe-4">
                                    <Button variant="light" className="btn-outline-modern btn-sm me-2" onClick={() => handleEdit(coupon)}>
                                      <FaEdit className="text-primary" />
                                    </Button>
                                    <Button variant="light" className="btn-outline-modern btn-sm" onClick={() => handleDeleteClick(coupon.id)}>
                                      <FaTrash className="text-danger" />
                                    </Button>
                                  </td>
                                </motion.tr>
                            );})
                          )}
                        </tbody>
                    </Table>
                  </Card.Body>
                </Card>

            {/* Add/Edit Coupon Modal */}
            <Modal show={showAddModal} onHide={handleCloseModal} size="md" centered contentClassName="border-0 shadow-lg">
              <Modal.Header closeButton className="bg-light border-0">
                <Modal.Title className="fw-bold d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle p-2 me-2 d-flex justify-content-center align-items-center" style={{width: 32, height: 32}}>
                        <FaTicketAlt size={14} />
                    </div>
                    {editingCouponId ? 'Edit Coupon' : 'Create New Coupon'}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="p-4">
                <Form>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Coupon Code</Form.Label>
                        <div className="d-flex">
                            <Form.Control
                            type="text"
                            placeholder="Enter Code (e.g. SUMMER25)"
                            value={newCoupon.code}
                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                            className="me-2"
                            />
                            <Button variant="outline-secondary" onClick={generateRandomCode}>
                                Generate
                            </Button>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Type</Form.Label>
                        <Form.Select
                          value={newCoupon.discountType}
                          onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                        >
                          <option value="Percentage">Percentage (%)</option>
                          <option value="Fixed">Fixed Amount (₹)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Discount Value</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder={newCoupon.discountType === 'Percentage' ? 'e.g. 20' : 'e.g. 500'}
                          value={newCoupon.discountValue}
                          onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Valid From</Form.Label>
                        <Form.Control
                          type="date"
                          value={newCoupon.validFrom}
                          onChange={(e) => setNewCoupon({ ...newCoupon, validFrom: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Valid To</Form.Label>
                        <Form.Control
                          type="date"
                          value={newCoupon.validTo}
                          onChange={(e) => setNewCoupon({ ...newCoupon, validTo: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted text-uppercase">Usage Limit</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter limit (optional)"
                      value={newCoupon.usageLimit}
                      onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                    />
                    <Form.Text className="text-muted">
                        Leave empty for unlimited usage
                    </Form.Text>
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer className="bg-light border-0">
                <Button variant="outline-secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  className="btn-vibrant-primary px-4"
                >
                  {editingCouponId ? 'Save Changes' : 'Create Coupon'}
                </Button>
              </Modal.Footer>
            </Modal>
            
            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered contentClassName="border-0 shadow-lg">
                <Modal.Header className="bg-danger text-white border-0">
                    <Modal.Title className="d-flex align-items-center">
                        <FaExclamationTriangle className="me-2" /> Confirm Deletion
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 text-center">
                    <div className="mb-3 text-danger">
                        <motion.div
                            animate={{ 
                                rotate: [0, -10, 10, -10, 10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 0.5 }}
                        >
                            <FaTrash size={40} />
                        </motion.div>
                    </div>
                    <h5 className="mb-3">Delete Coupon?</h5>
                    <p className="text-muted">
                        Are you sure you want to delete this coupon? This action cannot be undone.
                    </p>
                </Modal.Body>
                <Modal.Footer className="bg-light border-0 justify-content-center">
                    <Button variant="secondary" className="px-4" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" className="px-4 d-flex align-items-center" onClick={confirmDelete}>
                        <FaTrash className="me-2" /> Delete
                    </Button>
                </Modal.Footer>
            </Modal>
            </Container>
        </div>
    </div>
  );
};

export default AdminCoupons;
