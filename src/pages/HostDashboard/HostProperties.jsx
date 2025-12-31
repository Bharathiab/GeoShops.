import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Row,
  Col,
  Button,
  Modal,
  Form,
  Table,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaHome,
  FaCar,
  FaHeartbeat,
  FaCut,
  FaCheckCircle,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaUndo,
  FaTimesCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import HostNavbar from "../../components/host/HostNavbar";
import HostCreateProperty from "../../components/host/HostCreateProperty";
import { fetchHostProperties, fetchHostBookings, updatePropertyStatus, updateBookingStatus, deleteProperty } from "../../api";
import StatusModal from "../../components/common/StatusModal";
import "./HostDashboard.css";

const HostProperties = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(
    location.state?.selectedDepartment || ""
  );
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pendingStatusChanges, setPendingStatusChanges] = useState({});
  const [statusModalConfig, setStatusModalConfig] = useState({
    show: false,
    type: "success",
    message: "",
    onConfirm: null
  });

  useEffect(() => {
    const loadData = async () => {
      const loginData = localStorage.getItem("hostLoginData");
      if (!loginData) return;
      const parsedLoginData = JSON.parse(loginData);
      const hostId = parsedLoginData.hostId;

      try {
        const hostProperties = await fetchHostProperties(hostId);
        setProperties(hostProperties);
      } catch (error) {
        console.error("Error loading properties:", error);
      }

      try {
        const hostBookings = await fetchHostBookings(hostId);
        const mappedBookings = hostBookings.map(b => ({
          ...b,
          appointmentDate: b.appointmentDate ? b.appointmentDate.split('T')[0] : null,
          appointmentTime: b.appointmentDate && b.appointmentDate.includes('T') ? b.appointmentDate.split('T')[1].substring(0, 5) : null,
          pickUpLocation: b.pickupLocation,
          dropOffLocation: b.dropoffLocation,
          distance: b.distanceKm,
          bookingDate: b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          status: b.status || 'Pending'
        }));
        setBookings(mappedBookings);
      } catch (error) {
        console.error("Error loading bookings:", error);
      }
    };
    loadData();
  }, []);

  const departments = [
    { name: "Hotel", icon: <FaHome />, color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.1)" },
    { name: "Cab", icon: <FaCar />, color: "#10b981", bgColor: "rgba(16, 185, 129, 0.1)" },
    { name: "Hospital", icon: <FaHeartbeat />, color: "#8b5cf6", bgColor: "rgba(139, 92, 246, 0.1)" },
    { name: "Salon", icon: <FaCut />, color: "#ec4899", bgColor: "rgba(236, 72, 153, 0.1)" },
  ];

  const filteredProperties = selectedDepartment
    ? properties.filter((p) => p.department === selectedDepartment)
    : properties;

  const handleCreateProperty = () => setShowCreateModal(true);
  
  const handleEdit = (property) => {
    setEditingProperty(property);
    setShowCreateModal(true);
  };

  const handleDelete = (property) => {
    setStatusModalConfig({
      show: true,
      type: "confirm",
      message: `Delete "${property.company}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteProperty(property.department, property.id);
          setProperties(properties.filter(p => p.id !== property.id));
          setStatusModalConfig({
            show: true, type: "success", message: "Property deleted!",
            onConfirm: () => setStatusModalConfig(prev => ({ ...prev, show: false }))
          });
        } catch (error) {
          setStatusModalConfig({
            show: true, type: "error", message: "Failed to delete property",
            onConfirm: () => setStatusModalConfig(prev => ({ ...prev, show: false }))
          });
        }
      }
    });
  };

  const handleCancelStatus = async (property) => {
    setStatusModalConfig({
      show: true,
      type: "confirm",
      message: `Set "${property.company}" to Cancelled? Users will see it as "Not Available".`,
      onConfirm: async () => {
        try {
          await updatePropertyStatus(property.department, property.id, "Cancelled");
          setProperties(properties.map(p => p.id === property.id ? { ...p, status: "Cancelled" } : p));
          setStatusModalConfig({
            show: true, type: "success", message: "Property Cancelled!",
            onConfirm: () => setStatusModalConfig(prev => ({ ...prev, show: false }))
          });
        } catch (error) {
          setStatusModalConfig({
            show: true, type: "error", message: "Failed to cancel property",
            onConfirm: () => setStatusModalConfig(prev => ({ ...prev, show: false }))
          });
        }
      }
    });
  };

  const handleUncancelStatus = async (property) => {
    setStatusModalConfig({
      show: true,
      type: "confirm",
      message: `Set "${property.company}" to Active? It will be visible to users again.`,
      onConfirm: async () => {
        try {
          await updatePropertyStatus(property.department, property.id, "Active");
          setProperties(properties.map(p => p.id === property.id ? { ...p, status: "Active" } : p));
          setStatusModalConfig({
            show: true, type: "success", message: "Property Activated!",
            onConfirm: () => setStatusModalConfig(prev => ({ ...prev, show: false }))
          });
        } catch (error) {
          setStatusModalConfig({
            show: true, type: "error", message: "Failed to activate property",
            onConfirm: () => setStatusModalConfig(prev => ({ ...prev, show: false }))
          });
        }
      }
    });
  };

  const handleToggleStatus = async (id, currentStatus, department) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await updatePropertyStatus(department, id, newStatus);
      setProperties(properties.map(p => p.id === id ? { ...p, status: newStatus } : p));
      setStatusModalConfig({
        show: true, type: "success", message: `Property ${newStatus}!`,
        onConfirm: () => setStatusModalConfig(prev => ({ ...prev, show: false }))
      });
    } catch (error) {
      setStatusModalConfig({
        show: true, type: "error", message: "Failed to update status",
        onConfirm: () => setStatusModalConfig(prev => ({ ...prev, show: false }))
      });
    }
  };

  const handleBookingStatusChange = (bookingId, newStatus) => {
    setPendingStatusChanges(prev => ({ ...prev, [bookingId]: newStatus }));
  };

  const handleCreatePropertySubmit = async () => {
    const loginData = localStorage.getItem("hostLoginData");
    if (loginData) {
      const hostProperties = await fetchHostProperties(JSON.parse(loginData).hostId);
      setProperties(hostProperties);
    }
    setShowCreateModal(false);
    setEditingProperty(null);
    setStatusModalConfig({
      show: true, type: "success", message: "Property saved successfully!",
      onConfirm: () => setStatusModalConfig(prev => ({ ...prev, show: false }))
    });
  };

  const handleUpdateBookings = async () => {
    try {
      const promises = Object.entries(pendingStatusChanges).map(([id, status]) => {
        const booking = bookings.find(b => b.id === parseInt(id));
        return booking ? updateBookingStatus(booking.department, booking.id, status) : Promise.resolve();
      });
      await Promise.all(promises);
      setBookings(bookings.map(b => pendingStatusChanges[b.id] ? { ...b, status: pendingStatusChanges[b.id] } : b));
      setPendingStatusChanges({});
      setShowBookingsModal(false);
      setStatusModalConfig({
        show: true, type: "success", message: "Bookings updated!",
        onConfirm: () => setStatusModalConfig(prev => ({ ...prev, show: false }))
      });
    } catch (error) {
      setStatusModalConfig({
        show: true, type: "error", message: "Update failed",
        onConfirm: () => setStatusModalConfig(prev => ({ ...prev, show: false }))
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <>
      <HostNavbar />
      <div className="host-main-content">
        <motion.div 
          initial="hidden" animate="visible" variants={containerVariants}
          className="properties-container p-4"
        >
          {/* Header */}
          <header className="dashboard-header mb-4">
            <div className="header-text">
              <h1>Our Branches</h1>
              <p>Manage and monitor all your business listings.</p>
            </div>
            <Button className="btn-modern btn-primary-modern" onClick={handleCreateProperty}>
              <FaPlus /> Add New Branch
            </Button>
          </header>

          {/* Department Selector */}
          <div className="stats-grid-modern mb-5">
            {departments.map((dept) => {
              const count = properties.filter(p => p.department === dept.name).length;
              const isActive = selectedDepartment === dept.name;
              return (
                <motion.div
                  key={dept.name}
                  variants={itemVariants}
                  className={`modern-card stat-card-modern ${isActive ? 'active-dept' : ''}`}
                  onClick={() => setSelectedDepartment(isActive ? "" : dept.name)}
                  style={{ 
                    cursor: 'pointer',
                    border: isActive ? `2px solid ${dept.color}` : '2px solid transparent',
                    background: isActive ? dept.bgColor : 'white'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="stat-icon-box" style={{ color: dept.color, backgroundColor: isActive ? 'white' : dept.bgColor }}>
                    {dept.icon}
                  </div>
                  <div className="stat-details">
                    <span className="stat-label-modern">{dept.name}</span>
                    <span className="stat-value-modern" style={{ fontSize: '1.25rem' }}>{count} Branches</span>
                  </div>
                  {isActive && <FaCheckCircle className="position-absolute" style={{ top: '1rem', right: '1rem', color: dept.color }} />}
                </motion.div>
              );
            })}
          </div>

          {/* Properties Table */}
          <motion.div variants={itemVariants} className="modern-table-container border-0 shadow-sm">
            <div className="card-header-modern bg-light border-bottom px-4 pt-4 pb-3">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-box-sm bg-emerald-smooth text-white rounded-circle">
                  <FaHome size={16}/>
                </div>
                <div>
                  <h5 className="mb-0 font-weight-bold">{selectedDepartment || "All"} Branches</h5>
                  <p className="text-muted small mb-0">Total {filteredProperties.length} listings found</p>
                </div>
              </div>
            </div>
            <Table hover className="modern-table mb-0">
              <thead>
                <tr>
                  <th>Company Info</th>
                  <th>Contact Details</th>
                  <th>Location</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">No branches found in this category</td></tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredProperties.map((property) => (
                         <motion.tr 
                          key={property.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="company-logo-circle bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                              <FaGlobe className="text-muted" />
                            </div>
                            <div>
                              <div className="font-weight-bold text-dark">{property.company}</div>
                              <small className="text-muted">Owner: {property.owner}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <div className="d-flex align-items-center gap-2 small text-muted"><FaPhone size={10}/> {property.phone}</div>
                            <div className="d-flex align-items-center gap-2 small text-muted"><FaEnvelope size={10}/> {property.email}</div>
                          </div>
                        </td>
                        <td>
                          <a href={property.locationUrl} target="_blank" rel="noreferrer" className="text-primary small d-flex align-items-center gap-1">
                            {property.location}
                          </a>
                        </td>
                        <td><span className={`badge-modern ${getStatusBadgeClass(property.department)}`}>{property.department}</span></td>
                        <td>
                          <span className={`badge-modern ${
                            property.status === 'Active' ? 'badge-success' : 
                            property.status === 'Pending' ? 'badge-warning' : 
                            'badge-danger'
                          }`}>
                            {property.status}
                          </span>
                        </td>
                         <td className="text-end">
                          <div className="d-flex justify-content-end gap-2 px-2">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn-icon bg-light text-primary border-0 rounded-circle p-2" onClick={() => navigate(`/host/property/${property.id}`)} title="View Detail"><FaEye size={16}/></motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn-icon bg-light text-success border-0 rounded-circle p-2" onClick={() => handleEdit(property)} title="Edit"><FaEdit size={16}/></motion.button>
                             <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`btn-icon bg-light border-0 rounded-circle p-2 ${property.status === 'Active' ? 'text-warning' : 'text-success'}`} onClick={() => handleToggleStatus(property.id, property.status, property.department)} title={property.status === 'Active' ? 'Deactivate' : 'Activate'} disabled={property.status === 'Cancelled'}><FaCheckCircle size={16}/></motion.button>
                             {property.status === 'Cancelled' ? (
                               <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn-icon bg-light text-primary border-0 rounded-circle p-2" onClick={() => handleUncancelStatus(property)} title="Uncancel Asset"><FaUndo size={16}/></motion.button>
                             ) : (
                               <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn-icon bg-light text-danger border-0 rounded-circle p-2" onClick={() => handleCancelStatus(property)} title="Cancel Asset"><FaTimesCircle size={16}/></motion.button>
                             )}
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn-icon bg-light text-danger border-0 rounded-circle p-2" onClick={() => handleDelete(property)} title="Delete"><FaTrash size={16}/></motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </Table>
          </motion.div>
        </motion.div>
      </div>

       {/* Modals */}
      <Modal show={showCreateModal} onHide={() => { setShowCreateModal(false); setEditingProperty(null); }} size="lg" centered className="modern-modal">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-3 text-white">
            <div className="icon-box-sm bg-white text-success rounded-circle shadow-sm">
              <FaPlus size={16}/>
            </div>
            <span>{editingProperty ? 'Edit Branch' : 'Add New Branch'}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <HostCreateProperty onSubmit={handleCreatePropertySubmit} editingProperty={editingProperty}/>
        </Modal.Body>
      </Modal>

      <StatusModal
        show={statusModalConfig.show}
        onHide={() => setStatusModalConfig(prev => ({ ...prev, show: false }))}
        type={statusModalConfig.type}
        message={statusModalConfig.message}
        onConfirm={statusModalConfig.onConfirm}
      />
    </>
  );
};

const getStatusBadgeClass = (dept) => {
  const map = { Hotel: 'badge-info', Cab: 'badge-success', Hospital: 'badge-warning', Salon: 'badge-danger' };
  return map[dept] || 'badge-primary';
};

export default HostProperties;

