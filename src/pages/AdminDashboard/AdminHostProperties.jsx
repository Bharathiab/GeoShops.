import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Table, Form, Badge } from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaBuilding,
  FaHotel,
  FaUserTie,
  FaHeartbeat,
  FaCut,
  FaArrowLeft,
  FaSearch,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";
import { fetchHostProperties, fetchAllBookings } from "../../api";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Toast from "../../utils/toast";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import "../../components/admin/AdminDashboardModern.css";

const AdminHostProperties = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const host = location.state?.host;
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);

  const handleToggleStatus = (id) => {
    // TODO: Add API call to update property status in database
    const updatedProperties = properties.map((p) =>
      p.id === id
        ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" }
        : p
    );
    setProperties(updatedProperties);
    Toast.success("Property status updated");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      const updatedProperties = properties.filter((p) => p.id !== id);
      setProperties(updatedProperties);
      Toast.success("Property deleted successfully");
    }
  };

  useEffect(() => {
    if (!host) {
      navigate("/admin/hosts");
      return;
    }

    const loadData = async () => {
      try {
        // Fetch properties
        const hostProperties = await fetchHostProperties(host.id);

        // Fetch all bookings
        const allBookings = await fetchAllBookings();
        setBookings(allBookings);

        // Map DB fields to frontend fields and add booking counts
        const mappedProperties = hostProperties.map(p => {
          const propertyBookings = allBookings.filter(b => b.property_id === p.id);
          const completedBookings = propertyBookings.filter(b => b.status === "Completed");
          const revenue = completedBookings.reduce((sum, b) => {
            const price = b.final_price || b.total_price || b.estimated_price || 0;
            return sum + price;
          }, 0);

          return {
            ...p,
            hostId: p.host_id,
            locationUrl: p.location_url,
            gstNumber: p.gst_number,
            imageUrl: p.image_url,
            status: 'Active',
            bookings: propertyBookings.length,
            completedBookings: completedBookings.length,
            revenue: revenue
          };
        });
        setProperties(mappedProperties);
      } catch (error) {
        console.error("Error loading data:", error);
        setProperties([]);
        setBookings([]);
      }
    };

    loadData();
  }, [host, navigate]);

  if (!host) {
    return null;
  }

  const departments = [
    { name: "Hotel", icon: <FaHotel />, color: "#3B82F6", gradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" },
    { name: "Cab", icon: <FaUserTie />, color: "#10B981", gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)" },
    { name: "Hospital", icon: <FaHeartbeat />, color: "#8B5CF6", gradient: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" },
    { name: "Salon", icon: <FaCut />, color: "#F59E0B", gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" },
  ];

  const filteredProperties = properties.filter((p) => {
    const matchDept = selectedDepartment ? p.department === selectedDepartment : true;
    const matchSearch = searchTerm === "" || 
      p.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDept && matchSearch;
  });

  const stats = [
    {
      title: "Total Properties",
      value: properties.length,
      icon: <FaBuilding />,
      color: "#3B82F6",
      gradient: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      iconBg: "bg-primary" 
    },
    {
      title: "Active Properties",
      value: properties.filter((p) => p.status === "Active").length,
      icon: <FaCheckCircle />,
      color: "#10B981",
      gradient: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
      iconBg: "bg-success"
    },
    {
      title: "Total Revenue",
      value: "₹" + properties.reduce((sum, p) => sum + (p.revenue || 0), 0).toLocaleString(),
      icon: <FaBuilding />,
      color: "#F59E0B",
      gradient: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
      iconBg: "bg-warning"
    },
  ];

  return (
    <div className="dashboard-container">
      <AdminNavbar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ flex: 1 }}
      >
        <Container fluid className="py-4">
          {/* Header Section */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
             <div>
                <Button
                  variant="link"
                  onClick={() => navigate("/admin/hosts")}
                  className="p-0 text-decoration-none text-secondary mb-2 fw-medium d-flex align-items-center"
                >
                  <FaArrowLeft className="me-2" size={14} /> Back to Hosts List
                </Button>
                <h2 className="fw-bold text-dark mb-1 d-flex align-items-center">
                  <span className="me-2">{host.company}</span>
                  <Badge bg="light" text="secondary" className="fs-6 border fw-normal">Properties</Badge>
                </h2>
                <p className="text-secondary mb-0">Manage all registered properties for this host.</p>
             </div>
             <div>
               <div className="bg-white p-2 rounded-pill shadow-sm border px-4 py-2 d-flex align-items-center">
                   <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3 text-primary">
                      <FaUserTie />
                   </div>
                   <div>
                      <small className="text-uppercase text-muted fw-bold d-block" style={{fontSize: '0.7rem'}}>Owner</small>
                      <span className="fw-bold text-dark">{host.owner || 'N/A'}</span>
                   </div>
               </div>
             </div>
          </div>

          {/* Stats Row */}
          <Row className="mb-5 g-4">
            {stats.map((stat, index) => (
              <Col key={index} md={4}>
                <motion.div whileHover={{ translateY: -5 }}>
                  <Card className="modern-card border-0 h-100 overflow-hidden">
                    <div className="card-body p-4 d-flex align-items-center">
                       <div className={`p-3 rounded-4 me-4 text-white shadow-sm ${stat.iconBg} bg-opacity-75`} style={{fontSize: '1.5rem'}}>
                          {stat.icon}
                       </div>
                       <div>
                          <h6 className="text-secondary text-uppercase small fw-bold mb-1">{stat.title}</h6>
                          <h2 className="fw-bold mb-0 text-dark">{stat.value}</h2>
                       </div>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          {/* Filters & Actions */}
          <Row className="mb-4 align-items-center justify-content-between g-3">
             <Col md={12} lg={4}>
                <div className="d-flex gap-2 bg-white p-1 rounded-pill shadow-sm border overflow-auto">
                   <Button 
                      variant={selectedDepartment === "" ? "primary" : "light"}
                      className={`rounded-pill px-4 fw-medium border-0 ${selectedDepartment === "" ? "shadow-sm" : "text-secondary"}`}
                      onClick={() => setSelectedDepartment("")}
                   >
                     All
                   </Button>
                   {departments.map(dept => (
                      <Button
                        key={dept.name}
                        variant={selectedDepartment === dept.name ? "primary" : "light"}
                        className={`rounded-pill px-3 fw-medium border-0 d-flex align-items-center ${selectedDepartment === dept.name ? "bg-primary text-white shadow-sm" : "text-secondary bg-transparent"}`}
                        onClick={() => setSelectedDepartment(dept.name === selectedDepartment ? "" : dept.name)}
                        style={selectedDepartment === dept.name ? { background: dept.gradient } : {}}
                      >
                         <span className="me-2">{dept.icon}</span> {dept.name}
                      </Button>
                   ))}
                </div>
             </Col>

             <Col md={12} lg={4}>
                <div className="position-relative">
                   <FaSearch className="position-absolute top-50 translate-middle-y ms-3 text-secondary" />
                   <Form.Control
                     type="text"
                     placeholder="Search properties, location..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="form-control-lg border-0 shadow-sm ps-5"
                     style={{ borderRadius: "50px", fontSize: "0.95rem" }}
                   />
                </div>
             </Col>
          </Row>

          {/* Properties Table Card */}
          <Card className="modern-card border-0 shadow-sm overflow-hidden mb-5">
             <Card.Header className="bg-white border-0 py-4 px-4">
                <div className="d-flex justify-content-between align-items-center">
                   <h5 className="fw-bold text-dark mb-0">
                      {selectedDepartment ? `${selectedDepartment} Properties` : "All Properties List"}
                   </h5>
                   <Badge bg="light" text="primary" className="fw-bold fs-6 border px-3 py-2 rounded-pill">
                      {filteredProperties.length} Found
                   </Badge>
                </div>
             </Card.Header>
             <Card.Body className="p-0">
                <div className="table-responsive">
                   <Table hover className="modern-table align-middle mb-0">
                      <thead className="bg-light text-secondary">
                         <tr>
                            <th className="py-3 ps-4 border-0 text-uppercase small fw-bold">Company / Owner</th>
                            <th className="py-3 border-0 text-uppercase small fw-bold">Contact</th>
                            <th className="py-3 border-0 text-uppercase small fw-bold">Location</th>
                            <th className="py-3 border-0 text-uppercase small fw-bold">Dept</th>
                            <th className="py-3 border-0 text-uppercase small fw-bold">Status</th>
                            <th className="py-3 border-0 text-uppercase small fw-bold text-center">Bookings</th>
                            <th className="py-3 pe-4 border-0 text-uppercase small fw-bold text-end">Actions</th>
                         </tr>
                      </thead>
                      <tbody>
                         {filteredProperties.length > 0 ? (
                             filteredProperties.map((property) => (
                               <tr key={property.id} className="border-bottom">
                                  <td className="ps-4">
                                     <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3 text-primary border" style={{width: '40px', height: '40px'}}>
                                           <FaBuilding />
                                        </div>
                                        <div>
                                           <div className="fw-bold text-dark">{property.company}</div>
                                           <small className="text-secondary">{property.owner}</small>
                                        </div>
                                     </div>
                                  </td>
                                  <td>
                                     <div className="d-flex flex-column gap-1">
                                        <div className="d-flex align-items-center text-dark small"><FaPhoneAlt className="me-2 text-secondary" size={12}/> {property.phone}</div>
                                        <div className="d-flex align-items-center text-muted small"><FaEnvelope className="me-2 text-secondary" size={12}/> {property.email}</div>
                                     </div>
                                  </td>
                                  <td>
                                     <a href={property.locationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-light rounded-pill border px-3 text-secondary small fw-medium d-inline-flex align-items-center text-decoration-none">
                                        <FaMapMarkerAlt className="me-2 text-danger" /> View Map
                                     </a>
                                  </td>
                                  <td>
                                     <Badge bg="light" text="dark" className="border fw-normal rounded-pill px-3 py-2">
                                        {property.department}
                                     </Badge>
                                  </td>
                                  <td>
                                     <Badge 
                                        className={`rounded-pill px-3 py-2 fw-medium ${property.status === 'Active' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`}
                                     >
                                        <span className={`me-1 rounded-circle d-inline-block ${property.status === 'Active' ? 'bg-success' : 'bg-secondary'}`} style={{width: '6px', height: '6px'}}></span>
                                        {property.status}
                                     </Badge>
                                  </td>
                                  <td className="text-center">
                                     <span className="fw-bold text-dark">{property.bookings || 0}</span>
                                  </td>
                                  <td className="text-end pe-4">
                                     <div className="d-flex justify-content-end gap-2">
                                        <Button
                                          variant="light"
                                          className="btn-icon rounded-circle shadow-sm border-0 text-primary"
                                          onClick={() => navigate(`/admin/property/${property.id}`)}
                                          title="View Details"
                                          style={{width: '32px', height: '32px', padding: 0}}
                                        >
                                          <FaEye size={14} />
                                        </Button>
                                        <Button
                                          variant="light"
                                          className="btn-icon rounded-circle shadow-sm border-0 text-info"
                                          onClick={() => Toast.info(`Edit property ${property.id}`)}
                                          title="Edit"
                                          style={{width: '32px', height: '32px', padding: 0}}
                                        >
                                          <FaEdit size={14} />
                                        </Button>
                                        <Button
                                          variant="light"
                                          className={`btn-icon rounded-circle shadow-sm border-0 ${property.status === 'Active' ? 'text-warning' : 'text-success'}`}
                                          onClick={() => handleToggleStatus(property.id)}
                                          title={property.status === "Active" ? "Deactivate" : "Activate"}
                                          style={{width: '32px', height: '32px', padding: 0}}
                                        >
                                          {property.status === "Active" ? <FaTimesCircle size={14} /> : <FaCheckCircle size={14}/>}
                                        </Button>
                                        <Button
                                          variant="light"
                                          className="btn-icon rounded-circle shadow-sm border-0 text-danger"
                                          onClick={() => handleDelete(property.id)}
                                          title="Delete"
                                          style={{width: '32px', height: '32px', padding: 0}}
                                        >
                                          <FaTrash size={14} />
                                        </Button>
                                     </div>
                                  </td>
                               </tr>
                             ))
                         ) : (
                            <tr>
                               <td colSpan="7" className="text-center py-5 text-muted">
                                  <div className="mb-3 opacity-50 display-1"><FaBuilding /></div>
                                  <h5 className="fw-bold">No Properties Found</h5>
                                  <p className="small">Try adjusting search or select a different department.</p>
                               </td>
                            </tr>
                         )}
                      </tbody>
                   </Table>
                </div>
             </Card.Body>
          </Card>
        </Container>
      </motion.div>
    </div>
  );
};

export default AdminHostProperties;
