import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Badge } from "react-bootstrap";
import { 
    FaEye, 
    FaTrash, 
    FaIdCard, 
    FaCrown, 
    FaUser, 
    FaClock, 
    FaLayerGroup,
    FaCheck,
    FaTimes,
    FaExclamationTriangle
} from "react-icons/fa";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Toast from "../../utils/toast";
import { fetchAllMembershipCardDesigns, deleteMembershipCardDesign } from "../../api";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../components/admin/AdminDashboardModern.css";

const AdminMembershipList = () => {
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [hostDesigns, setHostDesigns] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [designToDelete, setDesignToDelete] = useState(null);

    useEffect(() => {
        loadDesigns();
    }, []);

    const loadDesigns = async () => {
        setLoading(true);
        try {
            const data = await fetchAllMembershipCardDesigns();
            setDesigns(data);
        } catch (error) {
            console.error("Error loading membership card designs:", error);
            Toast.error("Failed to load membership card designs");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (hostId) => {
        const hostCards = designs.filter(d => d.hostId === hostId);
        setHostDesigns(hostCards);
        setShowModal(true);
    };

    const handleDeleteClick = (id, hostId) => {
        setDesignToDelete({ id, hostId });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!designToDelete) return;

        try {
            await deleteMembershipCardDesign(designToDelete.id);
            Toast.success("Card design deleted successfully");

            // Refresh main list
            await loadDesigns();

            // Update modal list if open
            setHostDesigns(prev => {
                const updated = prev.filter(d => d.id !== designToDelete.id);
                if (updated.length === 0) {
                    setShowModal(false); 
                }
                return updated;
            });
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Error deleting design:", error);
            Toast.error("Failed to delete card design");
        }
    };

    // Group designs by hostId for the main table
    const uniqueHosts = Object.values(designs.reduce((acc, curr) => {
        if (!acc[curr.hostId]) {
            acc[curr.hostId] = {
                hostId: curr.hostId,
                hostName: curr.hostName,
                createdAt: curr.createdAt,
                totalCards: 0
            };
        }
        acc[curr.hostId].totalCards += 1;
        // Keep the latest date
        if (new Date(curr.createdAt) > new Date(acc[curr.hostId].createdAt)) {
            acc[curr.hostId].createdAt = curr.createdAt;
        }
        return acc;
    }, {}));

    // Stats Calculation
    const totalDesigns = designs.length;
    const totalHosts = uniqueHosts.length;
    // Assuming 'active' implies hosts with > 0 cards (all in this list) or recently updated. 
    // Let's just count total designs created this month for 'New Designs'
    const currentMonth = new Date().getMonth();
    const newDesignsCount = designs.filter(d => new Date(d.createdAt).getMonth() === currentMonth).length;

    const stats = [
        { label: "Total Designs", value: totalDesigns, icon: <FaLayerGroup />, color: "primary" },
        { label: "Active Hosts", value: totalHosts, icon: <FaUser />, color: "success" },
        { label: "New (This Month)", value: newDesignsCount, icon: <FaCrown />, color: "warning" }
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
                                <FaIdCard className="me-2 text-primary" />
                                Membership Card Designs
                            </h2>
                            <p className="text-muted mb-0">Manage membership templates created by hosts</p>
                        </div>
                        <Badge bg="white" text="dark" className="border shadow-sm p-2 rounded-pill fw-normal">
                             <FaClock className="me-1 text-secondary" /> {new Date().toLocaleDateString()}
                        </Badge>
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

                    {/* Designs Table */}
                    <div className="modern-card shadow-sm border-0 overflow-hidden">
                        <div className="card-header-modern bg-white">
                            <span className="d-flex align-items-center">
                                <FaIdCard className="me-2 text-primary" /> All Designs
                            </span>
                        </div>
                        <Table responsive hover className="modern-table mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">#</th>
                                    <th>Host Name</th>
                                    <th>Total Cards</th>
                                    <th>Latest Update</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : uniqueHosts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            <FaExclamationTriangle className="mb-2 text-warning display-6" />
                                            <p>No membership card designs found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    uniqueHosts.map((host, index) => (
                                        <motion.tr
                                            key={host.hostId}
                                            variants={tableRowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td className="ps-4 fw-bold text-muted">#{index + 1}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-light rounded-circle p-2 me-3 text-secondary">
                                                        <FaUser size={14} />
                                                    </div>
                                                    <div>
                                                        <span className="fw-bold text-dark">{host.hostName}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg="info" className="bg-opacity-10 text-info border border-info rounded-pill px-3">
                                                    {host.totalCards} Designs
                                                </Badge>
                                            </td>
                                            <td className="text-muted">
                                                <FaClock className="me-1 text-secondary" size={12} />
                                                {new Date(host.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="text-end pe-4">
                                                <Button
                                                    variant="light"
                                                    className="btn-outline-modern btn-sm shadow-sm"
                                                    onClick={() => handleViewDetails(host.hostId)}
                                                    title="View All Cards"
                                                >
                                                    <FaEye className="text-primary" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>

                    {/* View Details Modal */}
                    <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered contentClassName="border-0 shadow-lg" className="fade-modal">
                        <Modal.Header closeButton className="bg-light border-0">
                            <Modal.Title className="fw-bold text-dark d-flex align-items-center">
                                <FaIdCard className="me-2 text-primary" />
                                {hostDesigns.length > 0 ? `${hostDesigns[0].hostName}'s Designs` : 'Design Details'}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="bg-light p-4">
                            <Row>
                                {hostDesigns.map((design) => (
                                    <Col md={6} lg={4} key={design.id} className="mb-4">
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white p-3 rounded-lg shadow-sm h-100 position-relative border"
                                        >
                                            {/* Card Preview */}
                                            <div style={{
                                                background: design.backgroundGradient || 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                                color: '#fff',
                                                padding: '1.5rem 1.75rem',
                                                borderRadius: '20px',
                                                height: '250px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                marginBottom: '15px',
                                                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.25)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                border: '1px solid rgba(255,255,255,0.15)'
                                            }}>
                                                {/* Decorative Elements */}
                                                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', zIndex: 0 }} />
  
                                                <div className="relative z-2 d-flex justify-content-between align-items-start">
                                                    <div style={{ maxWidth: '70%', overflow: 'hidden' }}>
                                                        <p className="mb-0 fw-600 text-uppercase tracking-wider opacity-80" style={{ fontSize: '0.65rem' }}>{design.propertyName || design.property_name || design.hostName || "Emerald Estates"}</p>
                                                        <h3 className="fw-900 mb-1 mt-0 text-truncate" style={{ fontSize: '1.5rem' }}>{design.cardName}</h3>
                                                        <div className="d-inline-block px-2 py-0 rounded-pill" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.6rem', fontWeight: '800' }}>{design.cardLevel} Tier</div>
                                                    </div>
                                                    <div className="rounded-2" style={{ width: '42px', height: '32px', background: 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)', opacity: 0.9, position: 'relative', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}></div>
                                                </div>
                                                
                                                {/* Number - Single Line Fix */}
                                                <div className="relative z-2 w-100 text-center my-auto">
                                                    <div className="font-monospace fw-600 text-center" style={{ fontSize: '1.3rem', letterSpacing: '0.15rem', whiteSpace: 'nowrap', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                                        {(() => {
                                                            const id = design.id;
                                                            const seed = parseInt(id) || 0;
                                                            const part1 = "5829";
                                                            const part2 = (Math.abs(Math.sin(seed + 1) * 9999)).toFixed(0).padStart(4, '0');
                                                            const part3 = (Math.abs(Math.cos(seed + 2) * 9999)).toFixed(0).padStart(4, '0');
                                                            const part4 = id.toString().padStart(4, '0');
                                                            return `${part1} ${part2} ${part3} ${part4.padStart(4, '0')}`;
                                                        })()}
                                                    </div>
                                                </div>

                                                {/* Footer - No Clipping Fix */}
                                                <div className="relative z-2 d-flex justify-content-end align-items-end w-100 mt-auto">
                                                    <div className="text-end pb-1">
                                                        <p className="mb-0 text-uppercase fw-700 opacity-60" style={{ fontSize: '0.55rem', letterSpacing: '0.05rem' }}>Valid Thru</p>
                                                        <p className="fw-bold mb-0" style={{ fontSize: '1.05rem', lineHeight: '1' }}>
                                                             {(() => {
                                                                const date = new Date();
                                                                date.setDate(date.getDate() + (design.validityDays || 365));
                                                                return `${(date.getMonth() + 1).toString().padStart(2, '0')} / ${date.getFullYear()}`;
                                                             })()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '45%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)', zIndex: 0 }} />
                                            </div>

                                            {/* Details */}
                                            <div className="px-1 pb-5">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <h6 className="fw-bold text-dark mb-0">{design.cardName}</h6>
                                                    <Badge bg="secondary" className="bg-opacity-10 text-secondary border">{design.cardLevel}</Badge>
                                                </div>
                                                
                                                <div className="border-top pt-2 mt-2">
                                                    <strong className="text-xs text-muted text-uppercase d-block mb-1" style={{fontSize: '0.75rem'}}>Benefits</strong>
                                                    <p className="small text-muted mb-0" style={{
                                                        whiteSpace: "pre-wrap",
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden",
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        {design.benefits || "No benefits listed"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="position-absolute bottom-0 start-0 w-100 p-3 pt-0">
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    className="w-100 d-flex align-items-center justify-content-center"
                                                    onClick={() => handleDeleteClick(design.id, design.hostId)}
                                                >
                                                    <FaTrash className="me-2" size={12} /> Delete Design
                                                </Button>
                                            </div>
                                        </motion.div>
                                    </Col>
                                ))}
                            </Row>
                        </Modal.Body>
                        <Modal.Footer className="bg-white border-top-0">
                            <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                                Close
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
                            <h5 className="mb-3">Are you sure?</h5>
                            <p className="text-muted">
                                Do you really want to delete this membership card design? This process cannot be undone.
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

export default AdminMembershipList;
