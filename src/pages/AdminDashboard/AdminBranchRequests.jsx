import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added Link
import { Container, Row, Col, Card, Button, Table, Badge, Form } from "react-bootstrap"; // Added Form
import {
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaBuilding,
  FaFilter, // Added FaFilter
  FaCodeBranch
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { fetchAdminProperties, updatePropertyStatus } from "../../api";
import Toast from "../../utils/toast";
import "../../components/admin/AdminDashboardModern.css";

const AdminBranchRequests = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Pending"); // Default to Pending
  const [searchTerm, setSearchTerm] = useState(""); // Added search term state

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await fetchAdminProperties();
      setProperties(data);
    } catch (error) {
      console.error("Error loading properties:", error);
      Toast.error("Failed to load properties");
    }
  };

  const handleAction = async (id, action, department) => {
    try {
      // action should be "Active" (Approve) or "Rejected"
      await updatePropertyStatus(department, id, action);
      Toast.success(`Property ${action === "Active" ? "Approved" : "Rejected"} successfully!`);
      loadProperties(); // Reload to refresh list
    } catch (error) {
      console.error("Error updating status:", error);
      Toast.error("Failed to update status");
    }
  };

  // Filter properties based on status (case-insensitive) and search term
  const filteredProperties = properties.filter((p) => {
    // 1. Status Filter
    const statusMatch = filterStatus === "All" 
      ? true 
      : p.status?.toLowerCase() === filterStatus.toLowerCase();

    // 2. Search Filter (Company, Owner, Phone)
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = !searchTerm 
      ? true 
      : (p.company?.toLowerCase().includes(searchLower) ||
         p.owner?.toLowerCase().includes(searchLower) ||
         p.phone?.includes(searchTerm));

    return statusMatch && searchMatch;
  });


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="dashboard-container">
      <AdminNavbar />
      <Container fluid className="pb-4">
        <motion.div
           variants={containerVariants}
           initial="hidden"
           animate="visible"
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="dashboard-title h2 mb-1">Branch Requests</h2>
              <p className="text-muted mb-0">Manage and approve new branch listings.</p>
            </div>
          </div>

          {/* Filters */}
          <Card className="modern-card mb-4 border-0 shadow-sm">
            <Card.Body className="p-3">
               <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div className="d-flex gap-2">
                    {["Pending", "Active", "Rejected", "All"].map((status) => (
                      <Button
                        key={status}
                        variant={filterStatus === status ? "primary" : "light"}
                        className={`rounded-pill px-4 fw-medium border-0 ${filterStatus === status ? "shadow-sm" : "text-secondary"}`}
                        onClick={() => setFilterStatus(status)}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                   <div className="d-flex align-items-center gap-2" style={{ maxWidth: '300px' }}>
                    <FaFilter className="text-secondary" />
                    <Form.Control
                        type="text"
                        placeholder="Search company, owner..."
                        className="border-0 bg-light rounded-pill px-3"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
               </div>
            </Card.Body>
          </Card>

           {/* Table */}
          <Card className="modern-card border-0 shadow-sm overflow-hidden">
            <Card.Header className="bg-white border-0 py-4 px-4">
               <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold text-dark mb-0">
                     {filterStatus} Requests
                  </h5>
                  <Badge bg="light" text="primary" className="fw-bold fs-6 border px-3 py-2 rounded-pill">
                     {filteredProperties.length} Properties
                  </Badge>
               </div>
            </Card.Header>
            <Table hover className="modern-table align-middle mb-0">
              <thead className="bg-light text-secondary">
                <tr>
                  <th className="py-3 ps-4 border-0 text-uppercase small fw-bold">Company Info</th>
                  <th className="py-3 border-0 text-uppercase small fw-bold">Contact</th>
                  <th className="py-3 border-0 text-uppercase small fw-bold">Location</th>
                  <th className="py-3 border-0 text-uppercase small fw-bold">Department</th>
                  <th className="py-3 border-0 text-uppercase small fw-bold">Status</th>
                  <th className="py-3 pe-4 border-0 text-uppercase small fw-bold text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredProperties.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-5 text-muted">No properties found.</td></tr>
                  ) : (
                    filteredProperties.map((property) => (
                      <motion.tr
                        key={property.id}
                        variants={itemVariants}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                         <td className="ps-4">
                           <div className="d-flex align-items-center">
                              <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3 text-primary border" style={{width: '45px', height: '45px'}}>
                                 <FaCodeBranch size={18} />
                              </div>
                              <div>
                                 <Link to={`/admin/property/${property.id}`} className="fw-bold text-dark text-decoration-none">{property.company}</Link>
                                 <div className="small text-muted">Owner: {property.owner}</div>
                              </div>
                           </div>
                        </td>
                        <td>
                           <div className="d-flex flex-column gap-1">
                              <div className="d-flex align-items-center text-dark small"><FaPhone className="me-2 text-secondary" size={12}/> {property.phone}</div>
                              <div className="d-flex align-items-center text-muted small">ID: {property.id}</div>
                           </div>
                        </td>
                        <td>
                           <div className="d-flex align-items-center gap-1 small text-secondary">
                              <FaMapMarkerAlt className="text-danger" /> 
                              <span className="text-truncate" style={{maxWidth: '150px'}} title={property.location}>{property.location || "N/A"}</span>
                           </div>
                        </td>
                         <td><Badge bg="light" text="dark" className="border fw-normal rounded-pill px-3">{property.department}</Badge></td>
                        <td>
                          <Badge 
                            className={`rounded-pill px-3 py-2 fw-medium ${
                              property.status === 'Active' ? 'bg-success bg-opacity-10 text-success' : 
                              property.status === 'Rejected' ? 'bg-danger bg-opacity-10 text-danger' :
                              'bg-warning bg-opacity-10 text-warning'
                            }`}
                          >
                           {property.status}
                          </Badge>
                        </td>
                        <td className="text-end pe-4">
                           <div className="d-flex justify-content-end gap-2">
                              {property.status !== 'Active' && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
                                  onClick={() => handleAction(property.id, "Active", property.department)}
                                >
                                  <FaCheckCircle /> Approve
                                </Button>
                              )}
                              {property.status !== 'Rejected' && (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
                                  onClick={() => handleAction(property.id, "Rejected", property.department)}
                                >
                                  <FaTimesCircle /> Reject
                                </Button>
                              )}
                           </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </Table>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
};

export default AdminBranchRequests;
