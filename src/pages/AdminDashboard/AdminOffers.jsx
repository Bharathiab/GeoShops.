import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Modal, Form, Badge } from "react-bootstrap";
import { 
    FaPlus, 
    FaGift, 
    FaTag, 
    FaEdit, 
    FaTrash, 
    FaCalendarAlt,
    FaPercent,
    FaFire,
    FaExclamationTriangle
} from "react-icons/fa";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Toast from "../../utils/toast";
import { fetchOffers, createOffer, updateOffer, deleteOffer } from "../../api";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../components/admin/AdminDashboardModern.css";

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [offerToDelete, setOfferToDelete] = useState(null);

  const [newOffer, setNewOffer] = useState({
    title: "",
    description: "",
    type: "Festive",
    discountPercentage: "",
    validFrom: "",
    validTo: "",
    banner: null
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const data = await fetchOffers();
      setOffers(data);
    } catch (error) {
      console.error("Error loading offers:", error);
      Toast.error("Failed to load offers");
    } finally {
        setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "banner") {
      setNewOffer({ ...newOffer, banner: files[0] });
      // Create local preview
      if (files[0]) {
          const reader = new FileReader();
          reader.onloadend = () => setPreviewImage(reader.result);
          reader.readAsDataURL(files[0]);
      } else {
          setPreviewImage(null);
      }
    } else {
      setNewOffer({ ...newOffer, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", newOffer.title);
      formData.append("description", newOffer.description);
      formData.append("offerType", newOffer.type);
      formData.append("discountPercentage", newOffer.discountPercentage);
      formData.append("validFrom", newOffer.validFrom);
      formData.append("validTo", newOffer.validTo || "");
      if (newOffer.banner) {
        formData.append("banner", newOffer.banner);
      }

      if (editingOfferId) {
        await updateOffer(editingOfferId, formData);
        Toast.success("Offer updated successfully!");
      } else {
        await createOffer(formData);
        Toast.success("Offer created successfully!");
      }

      handleCloseModal();
      loadOffers();
    } catch (error) {
      console.error("Error saving offer:", error);
      Toast.error("Failed to save offer.");
    }
  };

  const handleEdit = (offer) => {
    setEditingOfferId(offer.id);
    setNewOffer({
      title: offer.title,
      description: offer.description,
      type: offer.offerType || offer.type || "Festive",
      discountPercentage: offer.discountPercentage || offer.discount_percentage,
      validFrom: offer.validFrom ? offer.validFrom.split('T')[0] : offer.valid_from?.split('T')[0],
      validTo: offer.validTo ? offer.validTo.split('T')[0] : offer.valid_to?.split('T')[0] || "",
      banner: null
    });
    // Set preview if existing image
    if (offer.imageUrl) {
        setPreviewImage(`http://localhost:5000${offer.imageUrl}`);
    } else {
        setPreviewImage(null);
    }
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
      setOfferToDelete(id);
      setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!offerToDelete) return;
    try {
        await deleteOffer(offerToDelete);
        loadOffers();
        Toast.success("Offer deleted successfully!");
        setShowDeleteModal(false);
    } catch (error) {
        console.error("Error deleting offer:", error);
        Toast.error("Failed to delete offer.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOfferId(null);
    setPreviewImage(null);
    setNewOffer({
      title: "",
      description: "",
      type: "Festive",
      discountPercentage: "",
      validFrom: "",
      validTo: "",
      banner: null
    });
  };

  // Stats
  const totalOffers = offers.length;
  const activeOffers = offers.filter(o => o.status === 'Active').length;
  // Calculate max discount safely
  const maxDiscount = offers.reduce((max, curr) => {
      const val = parseInt(curr.discountPercentage || curr.discount_percentage || 0);
      return val > max ? val : max;
  }, 0);

  const stats = [
      { label: "Total Offers", value: totalOffers, icon: <FaGift />, color: "primary" },
      { label: "Active Deals", value: activeOffers, icon: <FaTag />, color: "success" },
      { label: "Best Discount", value: `${maxDiscount}% OFF`, icon: <FaFire />, color: "danger" }
  ];

  const cardVariants = {
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
                        <FaGift className="me-2 text-primary" />
                        Offers Management
                    </h2>
                    <p className="text-muted mb-0">Create and share exciting offers with users</p>
                </div>
                <Button 
                    onClick={() => setShowModal(true)}
                    className="btn-vibrant-primary d-flex align-items-center"
                >
                    <FaPlus className="me-2" /> CREATE NEW OFFER
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

          <Row className="g-4">
            {loading ? (
                <Col className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </Col>
            ) : offers.length === 0 ? (
                <Col className="text-center py-5">
                    <div className="text-muted">
                        <FaGift size={48} className="mb-3 opacity-50" />
                        <h5>No Active Offers</h5>
                        <p>Create a new offer to engage your customers!</p>
                    </div>
                </Col>
            ) : (
             offers.map((offer, index) => (
              <Col md={4} key={offer.id}>
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                >
                <div className="modern-card h-100 border-0 shadow-sm overflow-hidden position-relative">
                    {/* Discount Badge */}
                    <div className="position-absolute top-0 end-0 m-3 z-1">
                        <Badge bg="danger" className="py-2 px-3 rounded-pill shadow-sm">
                            <FaPercent className="me-1" size={10} />
                            {offer.discountPercentage || offer.discount_percentage}% OFF
                        </Badge>
                    </div>
                    
                    {/* Image Area */}
                    <div 
                        className="bg-light d-flex align-items-center justify-content-center position-relative"
                        style={{ height: '180px', overflow: 'hidden' }}
                    >
                        {offer.imageUrl ? (
                             <img 
                                src={`http://localhost:5000${offer.imageUrl}`} 
                                alt={offer.title}
                                className="w-100 h-100 object-fit-cover"
                             />
                        ) : (
                            <div className={`w-100 h-100 d-flex align-items-center justify-content-center bg-${offer.type === 'Festive' ? 'warning' : 'info'} bg-opacity-10`}>
                                 <FaGift size={40} className={`text-${offer.type === 'Festive' ? 'warning' : 'info'}`} />
                            </div>
                        )}
                        {/* Status Overlay */}
                         <div className="position-absolute bottom-0 start-0 w-100 p-2 bg-dark bg-opacity-50 text-white d-flex justify-content-between align-items-center">
                             <small className="d-flex align-items-center">
                                 <FaCalendarAlt className="me-2" />
                                 {new Date(offer.validFrom || offer.valid_from).toLocaleDateString()} - {offer.validTo || offer.valid_to ? new Date(offer.validTo || offer.valid_to).toLocaleDateString() : 'Ongoing'}
                             </small>
                         </div>
                    </div>

                    <div className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                             <Badge bg={offer.status === 'Active' ? 'success' : 'secondary'} className="mb-2">
                                {offer.status}
                             </Badge>
                             <small className="text-muted fw-bold text-uppercase">{offer.type || offer.offerType}</small>
                        </div>
                        
                        <h5 className="fw-bold text-dark mb-2">{offer.title}</h5>
                        <p className="text-muted small mb-4 line-clamp-2" style={{minHeight: '40px'}}>
                            {offer.description}
                        </p>

                        <div className="d-flex gap-2 border-top pt-3">
                            <Button variant="light" className="flex-grow-1 btn-outline-modern btn-sm text-primary fw-bold" onClick={() => handleEdit(offer)}>
                                <FaEdit className="me-2" /> Edit
                            </Button>
                            <Button variant="light" className="flex-grow-1 btn-outline-modern btn-sm text-danger fw-bold" onClick={() => handleDeleteClick(offer.id)}>
                                <FaTrash className="me-2" /> Delete
                            </Button>
                        </div>
                    </div>
                </div>
                </motion.div>
              </Col>
            )))}
          </Row>
        </Container>
      </div>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered contentClassName="border-0 shadow-lg">
        <Modal.Header closeButton className="bg-light border-0">
          <Modal.Title className="fw-bold d-flex align-items-center">
            <div className="bg-primary text-white rounded-circle p-2 me-2 d-flex justify-content-center align-items-center" style={{width: 32, height: 32}}>
                <FaGift size={14} />
            </div>
            {editingOfferId ? "Edit Offer" : "Create New Offer"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <Row>
                <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-muted text-uppercase">Offer Title</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={newOffer.title}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Diwali Dhamaka, Summer Sale"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-muted text-uppercase">Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={newOffer.description}
                        onChange={handleInputChange}
                        required
                        placeholder="Describe the offer details..."
                      />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Banner Image</Form.Label>
                        <div 
                            className="border rounded p-2 text-center bg-light d-flex align-items-center justify-content-center position-relative mb-2"
                            style={{ height: '140px', cursor: 'pointer', overflow: 'hidden' }}
                            onClick={() => document.getElementById('bannerInput').click()}
                        >
                            {previewImage ? (
                                <img src={previewImage} alt="Preview" className="w-100 h-100 object-fit-cover rounded" />
                            ) : (
                                <div className="text-muted small">
                                    <FaGift size={24} className="mb-2 d-block mx-auto" />
                                    Click to Upload
                                </div>
                            )}
                        </div>
                        <Form.Control
                            id="bannerInput"
                            type="file"
                            name="banner"
                            accept="image/*"
                            onChange={handleInputChange}
                            className="d-none"
                        />
                         {previewImage && (
                            <div className="text-center">
                                <Button variant="link" size="sm" className="text-danger p-0" onClick={(e) => {
                                    e.preventDefault();
                                    setPreviewImage(null);
                                    setNewOffer({ ...newOffer, banner: null });
                                }}>Remove Image</Button>
                            </div>
                        )}
                    </Form.Group>
                </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Offer Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={newOffer.type}
                    onChange={handleInputChange}
                  >
                    <option value="Festive">Festive Offer</option>
                    <option value="Special">Special Offer</option>
                    <option value="Flash Sale">Flash Sale</option>
                    <option value="Seasonal">Seasonal Deal</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Discount Percentage (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="discountPercentage"
                    value={newOffer.discountPercentage}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="100"
                    placeholder="e.g. 25"
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
                    name="validFrom"
                    value={newOffer.validFrom}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Valid To</Form.Label>
                  <Form.Control
                    type="date"
                    name="validTo"
                    value={newOffer.validTo}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="bg-light border-0">
            <Button variant="outline-secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="btn-vibrant-primary px-4">
              {editingOfferId ? "Save Changes" : "Create Offer"}
            </Button>
          </Modal.Footer>
        </Form>
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
            <h5 className="mb-3">Delete Offer?</h5>
            <p className="text-muted">
                Are you sure you want to delete this offer? This action cannot be undone.
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
    </div>
  );
};

export default AdminOffers;
