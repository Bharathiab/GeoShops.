import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge } from "react-bootstrap";
import { 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaToggleOn, 
    FaToggleOff, 
    FaBuilding, 
    FaTicketAlt, 
    FaTag, 
    FaIdCard,
    FaCrown,
    FaCheckCircle,
    FaTimesCircle,
    FaLayerGroup
} from "react-icons/fa";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Toast from "../../utils/toast";
import { fetchSubscriptions, createSubscription, updateSubscription, deleteSubscription, updateSubscriptionStatus } from "../../api";
import { motion } from "framer-motion";
import "../../components/admin/AdminDashboardModern.css";
import "bootstrap/dist/css/bootstrap.min.css";

const CARD_STYLES = [
    { name: 'Royal Purple', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Luxurious Gold', value: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)' },
    { name: 'Fresh Mint', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { name: 'Midnight Blue', value: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
    { name: 'Soft Rose', value: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)' },
    { name: 'Sunset Vibes', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
    { name: 'Ocean Blue', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'Deep Space', value: 'linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)' },
    { name: 'Neon Glow', value: 'linear-gradient(to right, #00dbde, #fc00ff)' },
    { name: 'Premium Dark', value: 'linear-gradient(to right, #434343 0%, black 100%)' },
    { name: 'Lush Green', value: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' },
    { name: 'Crimson Tide', value: 'linear-gradient(to right, #ed213a, #93291e)' }
];

const AdminSubscriptionList = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);
    const [currentSubscription, setCurrentSubscription] = useState({
        planName: "",
        amount: "",
        validityDays: "",
        description: "",
        createdBy: "Admin",
        status: "Active",
        backgroundStyle: ""
    });

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const loadSubscriptions = async () => {
        try {
            setLoading(true);
            const data = await fetchSubscriptions();
            setSubscriptions(data);
        } catch (error) {
            console.error("Error loading subscriptions:", error);
            Toast.error("Failed to load subscriptions");
        } finally {
            setLoading(false);
        }
    };

    const handleShowModal = (subscription = null) => {
        if (subscription) {
            setIsEditing(true);
            setCurrentSubscription(subscription);
        } else {
            setIsEditing(false);
            setCurrentSubscription({
                planName: "",
                amount: "",
                validityDays: "",
                description: "",
                createdBy: "Admin",
                status: "Active",
                maxProperties: 0,
                maxCoupons: 0,
                maxOffers: 0,
                maxMembershipCardDesigns: 0,
                allowedCardTypes: "",
                backgroundStyle: ""
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentSubscription({
            planName: "",
            amount: "",
            validityDays: "",
            description: "",
            createdBy: "Admin",
            status: "Active",
            maxProperties: 0,
            maxCoupons: 0,
            maxOffers: 0,
            maxMembershipCardDesigns: 0,
            allowedCardTypes: "",
            backgroundStyle: ""
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateSubscription(currentSubscription.id, currentSubscription);
                Toast.success("Subscription updated successfully");
            } else {
                await createSubscription(currentSubscription);
                Toast.success("Subscription created successfully");
            }
            handleCloseModal();
            loadSubscriptions();
        } catch (error) {
            console.error("Error saving subscription:", error);
            Toast.error("Failed to save subscription");
        }
    };

    const handleDelete = (subscription) => {
        setSubscriptionToDelete(subscription);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!subscriptionToDelete) return;
        
        try {
            await deleteSubscription(subscriptionToDelete.id);
            Toast.success("Subscription deleted successfully");
            loadSubscriptions();
            setShowDeleteModal(false);
            setSubscriptionToDelete(null);
        } catch (error) {
            console.error("Error deleting subscription:", error);
            Toast.error("Failed to delete subscription");
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
        try {
            await updateSubscriptionStatus(id, newStatus);
            loadSubscriptions();
        } catch (error) {
            console.error("Error toggling status:", error);
            Toast.error("Failed to update status");
        }
    };

    const handleCardTypeChange = (type) => {
        let currentTypes = currentSubscription.allowedCardTypes ? currentSubscription.allowedCardTypes.split(',') : [];
        if (currentTypes.includes(type)) {
            currentTypes = currentTypes.filter(t => t !== type);
        } else {
            currentTypes.push(type);
        }
        setCurrentSubscription({ ...currentSubscription, allowedCardTypes: currentTypes.join(',') });
    };

    return (
        <>
            <div className="admin-main-content">
                <AdminNavbar />
                <Container fluid className="p-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="p-4"
                    >
                        {/* Header */}
                        <div className="mb-4 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3 shadow-sm" style={{width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <FaCrown className="text-primary fs-2" />
                                </div>
                                <div>
                                    <h2 className="fw-bold text-dark mb-0">Subscription Plans</h2>
                                    <p className="text-muted mb-0">Manage pricing and features for hosts</p>
                                </div>
                            </div>
                            <Button 
                                variant="primary" 
                                onClick={() => handleShowModal()}
                                className="px-4 py-2 rounded-pill shadow-sm fw-bold border-0 d-flex align-items-center"
                                style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)" }}
                            >
                                <FaPlus className="me-2" />
                                Create Plan
                            </Button>
                        </div>

                         {/* Stats Row */}
                         <Row className="g-4 mb-4">
                            <Col md={4}>
                                <Card className="modern-card border-0 shadow-sm">
                                    <Card.Body className="d-flex align-items-center">
                                        <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                            <FaLibrary className="text-primary fs-4" />
                                        </div>
                                        <div>
                                            <h4 className="fw-bold mb-0">{subscriptions.length}</h4>
                                            <div className="text-muted small">Total Plans</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                             <Col md={4}>
                                <Card className="modern-card border-0 shadow-sm">
                                    <Card.Body className="d-flex align-items-center">
                                        <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                                            <FaCheckCircle className="text-success fs-4" />
                                        </div>
                                        <div>
                                            <h4 className="fw-bold mb-0">{subscriptions.filter(s => s.status === 'Active').length}</h4>
                                            <div className="text-muted small">Active Plans</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                             <Col md={4}>
                                <Card className="modern-card border-0 shadow-sm">
                                    <Card.Body className="d-flex align-items-center">
                                        <div className="rounded-circle bg-secondary bg-opacity-10 p-3 me-3">
                                            <FaLayerGroup className="text-secondary fs-4" />
                                        </div>
                                        <div>
                                            <h4 className="fw-bold mb-0">{subscriptions.reduce((acc, curr) => acc + (curr.backgroundStyle ? curr.backgroundStyle.split(',').length : 0), 0)}</h4>
                                            <div className="text-muted small">Style Variations</div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Card className="modern-card border-0 shadow-sm overflow-hidden">
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <Table hover className="modern-table mb-0 align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">#</th>
                                                <th className="py-3 text-secondary text-uppercase small fw-bold">Plan Name</th>
                                                <th className="py-3 text-secondary text-uppercase small fw-bold">Amount</th>
                                                <th className="py-3 text-secondary text-uppercase small fw-bold">Created By</th>
                                                <th className="py-3 text-secondary text-uppercase small fw-bold">Validity</th>
                                                <th className="py-3 text-secondary text-uppercase small fw-bold" style={{minWidth: '200px'}}>Attributes</th>
                                                <th className="py-3 text-secondary text-uppercase small fw-bold">Backgrounds</th>
                                                <th className="py-3 text-secondary text-uppercase small fw-bold">Status</th>
                                                <th className="py-3 text-secondary text-uppercase small fw-bold text-end px-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="9" className="text-center py-5">
                                                        <div className="spinner-border text-primary" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : subscriptions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="9" className="text-center py-5 text-muted">
                                                        No subscriptions found
                                                    </td>
                                                </tr>
                                            ) : (
                                                subscriptions.map((sub, index) => (
                                                    <motion.tr 
                                                        key={sub.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                                        whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                                                    >
                                                        <td className="px-4 fw-bold text-muted">#{index + 1}</td>
                                                        <td className="fw-bold text-dark">{sub.planName}</td>
                                                        <td className="fw-bold text-success">₹{sub.amount}</td>
                                                        <td>
                                                            <Badge bg="light" text="dark" className="border fw-normal px-2">
                                                                {sub.createdBy || 'Admin'}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-warning bg-opacity-10 text-dark border border-warning rounded-pill px-3">
                                                                {sub.validityDays} Days
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex flex-wrap gap-2">
                                                                <Badge bg="white" text="dark" className="border shadow-sm d-flex align-items-center" title="Max Properties">
                                                                    <FaBuilding className="text-primary me-1" /> {sub.maxProperties || 0}
                                                                </Badge>
                                                                <Badge bg="white" text="dark" className="border shadow-sm d-flex align-items-center" title="Max Coupons">
                                                                    <FaTicketAlt className="text-warning me-1" /> {sub.maxCoupons || 0}
                                                                </Badge>
                                                                <Badge bg="white" text="dark" className="border shadow-sm d-flex align-items-center" title="Max Offers">
                                                                    <FaTag className="text-success me-1" /> {sub.maxOffers || 0}
                                                                </Badge>
                                                                <Badge bg="white" text="dark" className="border shadow-sm d-flex align-items-center" title="Max Membership Cards">
                                                                    <FaIdCard className="text-danger me-1" /> {sub.maxMembershipCardDesigns || 0}
                                                                </Badge>
                                                            </div>
                                                            {sub.allowedCardTypes && (
                                                                <div className="mt-2 d-flex flex-wrap gap-1">
                                                                    {sub.allowedCardTypes.split(',').map((type, i) => (
                                                                        <Badge key={i} bg="secondary" className="fw-normal" style={{fontSize: '0.65rem'}}>{type}</Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '150px' }}>
                                                                {sub.backgroundStyle && sub.backgroundStyle.split(',').map((styleName, idx) => {
                                                                    const styleObj = CARD_STYLES.find(s => s.name === styleName);
                                                                    return styleObj ? (
                                                                        <div
                                                                            key={idx}
                                                                            className="shadow-sm"
                                                                            style={{
                                                                                width: '20px',
                                                                                height: '20px',
                                                                                background: styleObj.value,
                                                                                borderRadius: '6px',
                                                                                border: '1px solid rgba(0,0,0,0.1)'
                                                                            }}
                                                                            title={styleName}
                                                                        ></div>
                                                                    ) : null;
                                                                })}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Badge bg={sub.status === "Active" ? "success" : "secondary"} className="rounded-pill px-3">
                                                                {sub.status === "Active" ? <FaCheckCircle className="me-1"/> : <FaTimesCircle className="me-1"/>}
                                                                {sub.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-end px-4">
                                                            <div className="d-flex gap-2 justify-content-end">
                                                                <Button
                                                                    variant="light"
                                                                    size="sm"
                                                                    className="btn-icon rounded-circle shadow-sm text-primary"
                                                                    onClick={() => handleShowModal(sub)}
                                                                    title="Edit"
                                                                    style={{width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                                                >
                                                                    <FaEdit />
                                                                </Button>
                                                                <Button
                                                                    variant="light"
                                                                    size="sm"
                                                                    className={`btn-icon rounded-circle shadow-sm ${sub.status === "Active" ? "text-warning" : "text-success"}`}
                                                                    onClick={() => handleToggleStatus(sub.id, sub.status)}
                                                                    title={sub.status === "Active" ? "Deactivate" : "Activate"}
                                                                    style={{width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                                                >
                                                                    {sub.status === "Active" ? <FaToggleOff /> : <FaToggleOn />}
                                                                </Button>
                                                                <Button
                                                                    variant="light"
                                                                    size="sm"
                                                                    className="btn-icon rounded-circle shadow-sm text-danger"
                                                                    onClick={() => handleDelete(sub)}
                                                                    title="Delete"
                                                                    style={{width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                                                >
                                                                    <FaTrash />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </motion.div>

                    {/* Create/Edit Modal - Modernized */}
                    <Modal show={showModal} onHide={handleCloseModal} size="lg" centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
                        <Modal.Header closeButton style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)" }} className="border-0 text-white">
                            <Modal.Title className="fw-bold d-flex align-items-center">
                                {isEditing ? <FaEdit className="me-2"/> : <FaPlus className="me-2"/>}
                                {isEditing ? "Edit Subscription Plan" : "Create New Plan"}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4 bg-light">
                            <Form onSubmit={handleSubmit}>
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body p-4">
                                        <h6 className="fw-bold text-uppercase text-secondary small border-bottom pb-2 mb-3">Basic Information</h6>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-secondary">Plan Name <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={currentSubscription.planName || ""}
                                                        onChange={(e) => setCurrentSubscription({ ...currentSubscription, planName: e.target.value })}
                                                        required
                                                        className="form-control-lg fs-6 bg-light border-0 shadow-sm"
                                                        placeholder="e.g. Starter Plan"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-secondary">Amount (₹) <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        step="0.01"
                                                        value={currentSubscription.amount || ""}
                                                        onChange={(e) => setCurrentSubscription({ ...currentSubscription, amount: e.target.value })}
                                                        required
                                                        className="form-control-lg fs-6 bg-light border-0 shadow-sm"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-secondary">Validity (Days) <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={currentSubscription.validityDays || ""}
                                                        onChange={(e) => setCurrentSubscription({ ...currentSubscription, validityDays: e.target.value })}
                                                        required
                                                        className="form-control-lg fs-6 bg-light border-0 shadow-sm"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-secondary">Description</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={2}
                                                        value={currentSubscription.description || ""}
                                                        onChange={(e) => setCurrentSubscription({ ...currentSubscription, description: e.target.value })}
                                                        className="bg-light border-0 shadow-sm"
                                                        placeholder="Brief description of the plan..."
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>

                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body p-4">
                                         <h6 className="fw-bold text-uppercase text-secondary small border-bottom pb-2 mb-3">Limits & Quotas</h6>
                                         <Row className="g-3">
                                            <Col md={3}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-secondary">Properties</Form.Label>
                                                    <Form.Control type="number" value={currentSubscription.maxProperties || 0} onChange={(e) => setCurrentSubscription({...currentSubscription, maxProperties: e.target.value})} className="bg-light border-0 shadow-sm" />
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-secondary">Coupons</Form.Label>
                                                    <Form.Control type="number" value={currentSubscription.maxCoupons || 0} onChange={(e) => setCurrentSubscription({...currentSubscription, maxCoupons: e.target.value})} className="bg-light border-0 shadow-sm" />
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-secondary">Offers</Form.Label>
                                                    <Form.Control type="number" value={currentSubscription.maxOffers || 0} onChange={(e) => setCurrentSubscription({...currentSubscription, maxOffers: e.target.value})} className="bg-light border-0 shadow-sm" />
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-secondary">Cards</Form.Label>
                                                    <Form.Control type="number" value={currentSubscription.maxMembershipCardDesigns || 0} onChange={(e) => setCurrentSubscription({...currentSubscription, maxMembershipCardDesigns: e.target.value})} className="bg-light border-0 shadow-sm" />
                                                </Form.Group>
                                            </Col>
                                         </Row>
                                    </div>
                                </div>

                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body p-4">
                                         <h6 className="fw-bold text-uppercase text-secondary small border-bottom pb-2 mb-3">Design Options</h6>
                                         
                                         <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold text-secondary d-block mb-2">Allowed Card Types</Form.Label>
                                            <div className="d-flex gap-2 flex-wrap">
                                                {['Silver', 'Gold', 'Platinum', 'Diamond', 'VIP'].map((type) => (
                                                    <Form.Check
                                                        key={type}
                                                        type="checkbox"
                                                        id={`check-${type}`}
                                                        label={type}
                                                        checked={currentSubscription.allowedCardTypes?.split(',').includes(type)}
                                                        onChange={() => handleCardTypeChange(type)}
                                                        className="custom-checkbox"
                                                    />
                                                ))}
                                            </div>
                                        </Form.Group>

                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-secondary d-block mb-2">Allowed Background Styles</Form.Label>
                                            <div className="d-flex gap-2 flex-wrap">
                                                {CARD_STYLES.map((style) => {
                                                     const isSelected = currentSubscription.backgroundStyle?.split(',').includes(style.name);
                                                     return (
                                                        <div key={style.name} className="text-center" style={{ width: '60px' }}>
                                                            <div
                                                                style={{
                                                                    width: '100%',
                                                                    height: '40px',
                                                                    background: style.value,
                                                                    border: isSelected ? '3px solid #4f46e5' : '1px solid #e5e7eb',
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer',
                                                                    position: 'relative',
                                                                    boxShadow: isSelected ? '0 0 0 2px #c7d2fe' : 'none'
                                                                }}
                                                                onClick={() => {
                                                                    let currentStyles = currentSubscription.backgroundStyle ? currentSubscription.backgroundStyle.split(',').filter(s => s) : [];
                                                                    if (currentStyles.includes(style.name)) {
                                                                        currentStyles = currentStyles.filter(s => s !== style.name);
                                                                    } else {
                                                                        currentStyles.push(style.name);
                                                                    }
                                                                    setCurrentSubscription({ ...currentSubscription, backgroundStyle: currentStyles.join(',') });
                                                                }}
                                                                title={style.name}
                                                            >
                                                                {isSelected && (
                                                                    <div style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#4f46e5', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        ✓
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                     );
                                                })}
                                            </div>
                                        </Form.Group>
                                    </div>
                                </div>
                                
                                <Form.Group className="mb-3">
                                   <div className="d-flex gap-4">
                                     <div className="flex-grow-1">
                                        <Form.Label className="small fw-bold text-secondary">Created By</Form.Label>
                                        <Form.Select value={currentSubscription.createdBy || "Admin"} onChange={(e) => setCurrentSubscription({ ...currentSubscription, createdBy: e.target.value })} className="bg-light border-0 shadow-sm">
                                            <option value="Admin">Admin</option>
                                            <option value="Host">Host</option>
                                        </Form.Select>
                                     </div>
                                     <div className="flex-grow-1">
                                        <Form.Label className="small fw-bold text-secondary">Status</Form.Label>
                                        <Form.Select value={currentSubscription.status || "Active"} onChange={(e) => setCurrentSubscription({ ...currentSubscription, status: e.target.value })} className="bg-light border-0 shadow-sm">
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </Form.Select>
                                     </div>
                                   </div>
                                </Form.Group>

                                <div className="text-end pt-3 border-top">
                                    <Button variant="white" onClick={handleCloseModal} className="me-2 rounded-pill px-4 fw-bold border shadow-sm">
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit" className="rounded-pill px-5 fw-bold shadow-sm" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)", border: 'none' }}>
                                        {isEditing ? "Update Plan" : "Create Plan"}
                                    </Button>
                                </div>
                            </Form>
                        </Modal.Body>
                    </Modal>

                    {/* Delete Confirmation Modal */}
                    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
                        <Modal.Header closeButton style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }} className="border-0 text-white">
                            <Modal.Title className="fw-bold">
                                <FaTrash className="me-2 mb-1" /> Delete Subscription
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4 text-center bg-white">
                           <div className="mb-4 mt-2">
                                <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center bounce-animation" style={{width: '90px', height: '90px'}}>
                                    <FaTrash className="text-danger display-5" />
                                </div>
                           </div>
                           <h4 className="fw-bold text-dark mb-2">Are you sure?</h4>
                           <p className="text-secondary mb-4 px-4">
                             Do you really want to delete this subscription plan? This process cannot be undone.
                           </p>

                           {subscriptionToDelete && (
                             <div className="card border-0 bg-light shadow-sm text-start mx-auto" style={{maxWidth: '350px'}}>
                                <div className="card-body p-3">
                                   <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                                       <span className="text-secondary small fw-bold text-uppercase">PLAN NAME</span>
                                       <span className="fw-bold text-dark">{subscriptionToDelete.planName}</span>
                                   </div>
                                   <div className="d-flex justify-content-between align-items-center">
                                       <span className="text-secondary small fw-bold text-uppercase">AMOUNT</span>
                                       <span className="fw-bold text-success">₹{subscriptionToDelete.amount}</span>
                                   </div>
                                </div>
                             </div>
                           )}
                        </Modal.Body>
                        <Modal.Footer className="border-0 justify-content-center pb-5 bg-white">
                          <Button variant="white" onClick={() => setShowDeleteModal(false)} className="rounded-pill px-4 me-3 text-secondary fw-bold border shadow-sm">
                            Cancel
                          </Button>
                          <Button 
                            variant="danger" 
                            onClick={confirmDelete} 
                            className="rounded-pill px-5 shadow-sm fw-bold border-0"
                            style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
                          >
                            Yes, Delete It
                          </Button>
                        </Modal.Footer>
                    </Modal>

                </Container>
            </div>
        </>
    );
};

// Simple definition for FaLibrary since it wasn't imported
const FaLibrary = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M32 448c0 17.7 14.3 32 32 32h128c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32H64C46.3 32 32 46.3 32 64v384zm160-32c0-17.7 14.3-32 32-32h128c17.7 0 32 14.3 32 32v384c0 17.7-14.3 32-32 32H224c-17.7 0-32-14.3-32-32V416zm192 0c0-17.7 14.3-32 32-32h32c17.7 0 32 14.3 32 32v32c0 17.7-14.3 32-32 32h-32c-17.7 0-32-14.3-32-32v-32zM64 128h96v32H64v-32zm0 64h96v32H64v-32zm0 64h96v32H64v-32zm0 64h96v32H64v-32zm192-192h96v32h-96v-32zm0 64h96v32h-96v-32zm0 64h96v32h-96v-32z"></path>
    </svg>
);

export default AdminSubscriptionList;
