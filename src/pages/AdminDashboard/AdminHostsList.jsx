import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Table,
  Dropdown,
  Badge
} from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaSearch,
  FaUserTie,
  FaEllipsisV,
  FaFileAlt,
  FaIdCard,
  FaBuilding,
  FaEnvelope,
  FaPhoneAlt,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Toast from "../../utils/toast";
import { fetchHosts, fetchHostProperties, updateHostStatus, registerHost } from "../../api";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import "../../components/admin/AdminDashboardModern.css";

const AdminHostsList = () => {
  const navigate = useNavigate();
  const [hosts, setHosts] = useState([]);
  const [filteredHosts, setFilteredHosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedHost, setSelectedHost] = useState(null);
  const [hostToDelete, setHostToDelete] = useState(null);
  const [newHost, setNewHost] = useState({
    company: "",
    owner: "",
    phone: "",
    email: "",
    password: ""
  });


  const handleDelete = (id) => {
    const host = hosts.find(h => h.id === id);
    setHostToDelete(host);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (hostToDelete) {
      // Implement delete API call if needed
      setHosts(hosts.filter((h) => h.id !== hostToDelete.id));
      Toast.success("Host deleted successfully");
      setShowDeleteModal(false);
      setHostToDelete(null);
    }
  };


  // Load registered hosts from API on component mount
  useEffect(() => {
    loadHosts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = hosts.filter(
        (host) =>
          host.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          host.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHosts(filtered);
    } else {
      setFilteredHosts(hosts);
    }
  }, [searchTerm, hosts]);

  const loadHosts = async () => {
    try {
      // Fetch all hosts from API
      const allHosts = await fetchHosts();

      // Map to frontend format
      let updatedHosts = allHosts.map((host) => ({
        id: host.id,
        company: host.companyName,
        owner: host.companyName, // Assuming company name as owner for now or add owner field to DB if needed
        phone: host.phoneNumber,
        email: host.email,
        status: host.action || "Active",
        properties: 0,
        gstNumber: host.gstNumber,
        businessAddress: host.businessAddress,
        businessType: host.businessType,
        panNumber: host.panNumber,
        aadhaarNumber: host.aadhaarNumber
      }));

      // Fetch properties count for all hosts
      const propertyCountPromises = updatedHosts.map(async (host) => {
        try {
          const properties = await fetchHostProperties(host.id);
          return { hostId: host.id, count: properties.length };
        } catch (err) {
          console.error(`Error fetching properties for host ${host.id}:`, err);
          return { hostId: host.id, count: 0 };
        }
      });

      const propertyCounts = await Promise.all(propertyCountPromises);

      // Update hosts with property counts
      updatedHosts = updatedHosts.map((host) => {
        const countData = propertyCounts.find(pc => pc.hostId === host.id);
        return { ...host, properties: countData ? countData.count : 0 };
      });

      setHosts(updatedHosts);
      setFilteredHosts(updatedHosts);
    } catch (error) {
      console.error("Error loading hosts:", error);
      setHosts([]);
    }
  };

  const handleEdit = (host) => {
    setSelectedHost(host);
    setShowEditModal(true);
  };



  const handleSaveEdit = () => {
    // Implement update API call
    setHosts(hosts.map((h) => (h.id === selectedHost.id ? selectedHost : h)));
    setShowEditModal(false);
    Toast.success("Host details updated");
  };

  const handleAddHost = async () => {
    if (!newHost.company || !newHost.owner || !newHost.phone || !newHost.email || !newHost.password) {
      Toast.error("Please fill in all fields");
      return;
    }

    try {
      const payload = {
        companyName: newHost.company,
        ownerName: newHost.owner,
        phoneNumber: newHost.phone,
        email: newHost.email,
        password: newHost.password
      };

      await registerHost(payload);
      
      Toast.success("New host added successfully");
      setShowAddModal(false);
      setNewHost({ company: "", owner: "", phone: "", email: "", password: "" });
      loadHosts();
    } catch (error) {
      console.error("Error registering host:", error);
      Toast.error(error.message || "Failed to add host");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateHostStatus(id, newStatus);
      setHosts(hosts.map((h) => (h.id === id ? { ...h, status: newStatus } : h)));
      Toast.success(`Host marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating host status:", error);
      Toast.error("Failed to update status");
    }
  };

  const handleShowDetails = (host) => {
    setSelectedHost(host);
    setShowDetailsModal(true);
  };

  const handleShowDocs = (host) => {
    setSelectedHost(host);
    setShowDocsModal(true);
  };

  const stats = [
    { title: "Total Hosts", value: hosts.length, color: "#4f46e5", icon: <FaUserTie />, bg: "bg-indigo-soft" },
    { title: "Active Hosts", value: hosts.filter(h => h.status === "Active").length, color: "#10b981", icon: <FaCheckCircle />, bg: "bg-green-soft" },
    { title: "Total Properties", value: hosts.reduce((acc, curr) => acc + (curr.properties || 0), 0), color: "#f59e0b", icon: <FaBuilding />, bg: "bg-yellow-soft" }
  ];

  return (
    <>
      <div className="admin-main-content">
      <AdminNavbar />
        <Container fluid className="px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4"
          >
          {/* Header & Stats */}
          <div className="mb-5">
            <h2 className="fw-bold text-dark mb-4">Hosts Management</h2>
            <Row className="g-4">
              {stats.map((stat, idx) => (
                <Col key={idx} md={4}>
                  <Card className="border-0 shadow-sm h-100 overflow-hidden" style={{borderRadius: '16px'}}>
                    <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                       <div>
                          <p className="text-secondary text-uppercase small fw-bold mb-1">{stat.title}</p>
                          <h2 className="fw-bold mb-0 text-dark">{stat.value}</h2>
                       </div>
                       <div className="rounded-circle p-3 d-flex align-items-center justify-content-center" 
                            style={{width: '60px', height: '60px', backgroundColor: `${stat.color}15`, color: stat.color, fontSize: '1.5rem'}}>
                          {stat.icon}
                       </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Search & Add Action */}
          <Row className="mb-4 align-items-center justify-content-between g-3">
             <Col md={12} lg={5}>
                <div className="position-relative">
                   <FaSearch className="position-absolute top-50 translate-middle-y ms-3 text-secondary" />
                   <Form.Control
                     type="text"
                     placeholder="Search hosts by company, owner..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="form-control-lg border-0 shadow-sm ps-5"
                     style={{ borderRadius: "50px", fontSize: "0.95rem" }}
                   />
                </div>
             </Col>
             <Col md={12} lg={7} className="text-lg-end">
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="btn-vibrant-primary rounded-pill px-4 py-2 shadow-sm border-0 fw-bold d-inline-flex align-items-center"
                  style={{ background: "linear-gradient(135deg, #de5c06 0%, #f97316 100%)" }}
                >
                  <FaPlus className="me-2" /> Add New Host
                </Button>
             </Col>
          </Row>

          {/* Hosts Table */}
          <Card className="modern-card border-0 shadow-sm overflow-hidden mb-5">
             <Card.Header className="bg-white border-0 py-4 px-4">
                <div className="d-flex justify-content-between align-items-center">
                   <h5 className="fw-bold text-dark mb-0">Registered Host Companies</h5>
                   <Badge bg="light" text="primary" className="fw-bold fs-6 border px-3 py-2 rounded-pill">
                      {filteredHosts.length} Records
                   </Badge>
                </div>
             </Card.Header>
             <Card.Body className="p-0">
               <div className="table-responsive">
                 <Table hover className="modern-table align-middle mb-0">
                    <thead className="bg-light text-secondary">
                       <tr>
                          <th className="py-3 ps-4 border-0 text-uppercase small fw-bold">Company / Owner</th>
                          <th className="py-3 border-0 text-uppercase small fw-bold">Contact Info</th>
                          <th className="py-3 border-0 text-uppercase small fw-bold">Status</th>
                          <th className="py-3 border-0 text-uppercase small fw-bold text-center">Properties</th>
                          <th className="py-3 pe-4 border-0 text-uppercase small fw-bold text-end">Actions</th>
                       </tr>
                    </thead>
                    <tbody>
                       {filteredHosts.length > 0 ? (
                         filteredHosts.map((host) => (
                           <tr key={host.id} className="border-bottom">
                              <td className="ps-4">
                                 <div className="d-flex align-items-center">
                                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3 fw-bold border" 
                                         style={{width: '45px', height: '45px', fontSize: '1.2rem'}}>
                                       {host.company.charAt(0)}
                                    </div>
                                    <div>
                                       <div className="fw-bold text-dark">{host.company}</div>
                                       <small className="text-muted d-block">{host.owner}</small>
                                    </div>
                                 </div>
                              </td>
                              <td>
                                 <div className="d-flex flex-column gap-1">
                                    <div className="d-flex align-items-center text-dark small"><FaPhoneAlt className="me-2 text-secondary opacity-50" size={12}/> {host.phone}</div>
                                    <div className="d-flex align-items-center text-muted small"><FaEnvelope className="me-2 text-secondary opacity-50" size={12}/> {host.email}</div>
                                 </div>
                              </td>
                              <td>
                                 <Form.Select
                                   size="sm"
                                   value={host.status}
                                   onChange={(e) => handleStatusChange(host.id, e.target.value)}
                                   className={`border-0 rounded-pill px-3 py-1 fw-medium ${host.status === 'Active' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}
                                   style={{ width: "auto", cursor: 'pointer', boxShadow: 'none' }}
                                 >
                                   <option value="Active">Active</option>
                                   <option value="Inactive">Inactive</option>
                                 </Form.Select>
                              </td>
                              <td className="text-center">
                                 <Badge bg="light" text="dark" className="border fw-normal rounded-pill px-3">
                                    {host.properties} Properties
                                 </Badge>
                              </td>
                              <td className="text-end pe-4">
                                 <div className="d-flex justify-content-end gap-2">
                                    <Button
                                      variant="light"
                                      className="btn-icon rounded-circle shadow-sm border-0 text-primary"
                                      onClick={() => navigate("/admin/host-properties", { state: { host } })}
                                      title="View Properties"
                                      style={{width: '32px', height: '32px', padding: 0}}
                                    >
                                      <FaBuilding size={14} />
                                    </Button>
                                    <Button
                                      variant="light"
                                      className="btn-icon rounded-circle shadow-sm border-0 text-info"
                                      onClick={() => handleEdit(host)}
                                      title="Edit Host"
                                      style={{width: '32px', height: '32px', padding: 0}}
                                    >
                                      <FaEdit size={14} />
                                    </Button>
                                    
                                    <Dropdown>
                                      <Dropdown.Toggle variant="light" className="btn-icon rounded-circle shadow-sm border-0 text-secondary no-arrow" style={{width: '32px', height: '32px', padding: 0}}>
                                        <FaEllipsisV size={12} />
                                      </Dropdown.Toggle>
                                      <Dropdown.Menu align="end" className="border-0 shadow-lg rounded-3">
                                        <Dropdown.Item onClick={() => handleShowDetails(host)} className="py-2 small">
                                          <FaUserTie className="me-2 text-primary" /> Registration Details
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleShowDocs(host)} className="py-2 small">
                                          <FaFileAlt className="me-2 text-info" /> View Documents
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item onClick={() => handleDelete(host.id)} className="py-2 small text-danger">
                                          <FaTrash className="me-2" /> Delete Host
                                        </Dropdown.Item>
                                      </Dropdown.Menu>
                                    </Dropdown>
                                 </div>
                              </td>
                           </tr>
                         ))
                       ) : (
                          <tr>
                             <td colSpan="5" className="text-center py-5 text-muted">
                                <div className="mb-3 opacity-50 display-1"><FaUserTie /></div>
                                <h5 className="fw-bold">No Hosts Found</h5>
                                <p className="small">Try adjusting search criteria.</p>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </Table>
               </div>
             </Card.Body>
          </Card>

          </motion.div>
        </Container>
      </div>

       {/* Edit Host Modal */}
       <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
            <Modal.Header closeButton style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)" }} className="border-0 text-white">
              <Modal.Title className="fw-bold"><FaEdit className="me-2 mb-1" /> Edit Host Details</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
              {selectedHost && (
                <Form>
                  <Card className="border-0 shadow-sm mb-3">
                    <Card.Body>
                      <h6 className="text-uppercase text-muted small fw-bold mb-3 border-bottom pb-2">Business Info</h6>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-bold text-muted">Company Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={selectedHost.company}
                              onChange={(e) => setSelectedHost({ ...selectedHost, company: e.target.value })}
                              className="border-0 bg-light-subtle shadow-sm"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-bold text-muted">Owner Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={selectedHost.owner}
                              onChange={(e) => setSelectedHost({ ...selectedHost, owner: e.target.value })}
                              className="border-0 bg-light-subtle shadow-sm"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-bold text-muted">Phone</Form.Label>
                            <Form.Control
                              type="text"
                              value={selectedHost.phone}
                              onChange={(e) => setSelectedHost({ ...selectedHost, phone: e.target.value })}
                              className="border-0 bg-light-subtle shadow-sm"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-bold text-muted">Email</Form.Label>
                            <Form.Control
                              type="email"
                              value={selectedHost.email}
                              onChange={(e) => setSelectedHost({ ...selectedHost, email: e.target.value })}
                              className="border-0 bg-light-subtle shadow-sm"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer className="border-0 bg-light pb-4">
              <Button variant="white" onClick={() => setShowEditModal(false)} className="rounded-pill px-4 text-secondary fw-bold bg-white border shadow-sm me-2">Cancel</Button>
              <Button onClick={handleSaveEdit} className="rounded-pill px-4 shadow-sm border-0 fw-bold" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)" }}>Save Changes</Button>
            </Modal.Footer>
          </Modal>

        {/* Add Host Modal */}
          <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
            <Modal.Header closeButton style={{ background: "linear-gradient(135deg, #de5c06 0%, #f97316 100%)" }} className="border-0 text-white">
              <Modal.Title className="fw-bold"><FaPlus className="me-2 mb-1" /> Add New Host</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                <Form>
                  <Card className="border-0 shadow-sm mb-3">
                    <Card.Body>
                      <h6 className="text-uppercase text-muted small fw-bold mb-3 border-bottom pb-2">Business Info</h6>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-bold text-muted">Company Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={newHost.company}
                              onChange={(e) => setNewHost({ ...newHost, company: e.target.value })}
                              className="border-0 bg-light-subtle shadow-sm"
                              placeholder="Enter company name"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-bold text-muted">Owner Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={newHost.owner}
                              onChange={(e) => setNewHost({ ...newHost, owner: e.target.value })}
                              className="border-0 bg-light-subtle shadow-sm"
                              placeholder="Enter owner name"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-bold text-muted">Phone</Form.Label>
                            <Form.Control
                              type="text"
                              value={newHost.phone}
                              onChange={(e) => setNewHost({ ...newHost, phone: e.target.value })}
                              className="border-0 bg-light-subtle shadow-sm"
                              placeholder="Enter phone number"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-bold text-muted">Email</Form.Label>
                            <Form.Control
                              type="email"
                              value={newHost.email}
                              onChange={(e) => setNewHost({ ...newHost, email: e.target.value })}
                              className="border-0 bg-light-subtle shadow-sm"
                              placeholder="Enter email address"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-bold text-muted">Password</Form.Label>
                            <Form.Control
                              type="password"
                              value={newHost.password}
                              onChange={(e) => setNewHost({ ...newHost, password: e.target.value })}
                              className="border-0 bg-light-subtle shadow-sm"
                              placeholder="Enter password"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Form>
            </Modal.Body>
            <Modal.Footer className="border-0 bg-light pb-4">
              <Button variant="white" onClick={() => setShowAddModal(false)} className="rounded-pill px-4 text-secondary fw-bold bg-white border shadow-sm me-2">Cancel</Button>
              <Button onClick={handleAddHost} className="rounded-pill px-4 shadow-sm border-0 fw-bold" style={{ background: "linear-gradient(135deg, #de5c06 0%, #f97316 100%)" }}>Add Host</Button>
            </Modal.Footer>
          </Modal>

          {/* Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
            <Modal.Header closeButton className="border-bottom-0 pb-0">
              <Modal.Title className="fw-bold text-primary"><FaUserTie className="me-2" /> Host Details</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              {selectedHost && (
                <div className="bg-light p-4 rounded-3">
                   <Row className="mb-2">
                      <Col xs={4} className="text-secondary fw-bold small text-uppercase">Company</Col>
                      <Col xs={8} className="fw-medium text-dark">{selectedHost.company}</Col>
                   </Row>
                   <Row className="mb-2">
                      <Col xs={4} className="text-secondary fw-bold small text-uppercase">Owner</Col>
                      <Col xs={8} className="fw-medium text-dark">{selectedHost.owner}</Col>
                   </Row>
                   <Row className="mb-2">
                      <Col xs={4} className="text-secondary fw-bold small text-uppercase">Email</Col>
                      <Col xs={8} className="fw-medium text-dark">{selectedHost.email}</Col>
                   </Row>
                   <Row className="mb-2">
                      <Col xs={4} className="text-secondary fw-bold small text-uppercase">Phone</Col>
                      <Col xs={8} className="fw-medium text-dark">{selectedHost.phone}</Col>
                   </Row>
                   <hr className="my-3"/>
                   <Row className="mb-2">
                       <Col xs={4} className="text-secondary fw-bold small text-uppercase">Address</Col>
                       <Col xs={8} className="fw-medium text-dark small">{selectedHost.businessAddress || "N/A"}</Col>
                   </Row>
                   <Row className="mb-0">
                       <Col xs={4} className="text-secondary fw-bold small text-uppercase">Type</Col>
                       <Col xs={8} className="fw-medium text-dark">{selectedHost.businessType || "N/A"}</Col>
                   </Row>
                </div>
              )}
            </Modal.Body>
          </Modal>

          {/* Documents Modal */}
          <Modal show={showDocsModal} onHide={() => setShowDocsModal(false)} centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
            {/* ... Content same as before ... */}
            <Modal.Header closeButton className="border-bottom-0 pb-0">
              <Modal.Title className="fw-bold text-info"><FaFileAlt className="me-2" /> Verified Documents</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              {selectedHost && (
                <div className="d-flex flex-column gap-3">
                  <div className="p-3 bg-white border rounded shadow-sm d-flex justify-content-between align-items-center">
                     <div>
                        <div className="small fw-bold text-uppercase text-secondary mb-1">Aadhaar Number</div>
                        <div className={`fw-bold ${selectedHost.aadhaarNumber ? "text-success" : "text-danger"}`}>
                           {selectedHost.aadhaarNumber || "Not Uploaded"}
                        </div>
                     </div>
                     <FaIdCard className="text-secondary opacity-25" size={24} />
                  </div>
                   <div className="p-3 bg-white border rounded shadow-sm d-flex justify-content-between align-items-center">
                     <div>
                        <div className="small fw-bold text-uppercase text-secondary mb-1">GST Number</div>
                        <div className="fw-bold text-dark">
                           {selectedHost.gstNumber || "N/A"}
                        </div>
                     </div>
                     <FaFileAlt className="text-secondary opacity-25" size={24} />
                  </div>
                  <div className="p-3 bg-white border rounded shadow-sm d-flex justify-content-between align-items-center">
                     <div>
                        <div className="small fw-bold text-uppercase text-secondary mb-1">PAN Number</div>
                        <div className="fw-bold text-dark">
                           {selectedHost.panNumber || "N/A"}
                        </div>
                     </div>
                     <FaFileAlt className="text-secondary opacity-25" size={24} />
                  </div>
                </div>
              )}
            </Modal.Body>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
            <Modal.Header closeButton style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }} className="border-0 text-white">
              <Modal.Title className="fw-bold"><FaTrash className="me-2 mb-1" /> Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light text-center">
              <div className="mb-3">
                 <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                    <FaTrash className="text-danger" size={32} />
                 </div>
                 <h5 className="fw-bold text-dark">Delete Host?</h5>
                 <p className="text-muted">
                    Are you sure you want to delete <span className="fw-bold text-dark">{hostToDelete?.company}</span>? This action cannot be undone.
                 </p>
              </div>
            </Modal.Body>
            <Modal.Footer className="border-0 bg-light pb-4 justify-content-center">
              <Button variant="white" onClick={() => setShowDeleteModal(false)} className="rounded-pill px-4 text-secondary fw-bold bg-white border shadow-sm me-2">Cancel</Button>
              <Button onClick={confirmDelete} className="rounded-pill px-4 shadow-sm border-0 fw-bold bg-danger">Delete Host</Button>
            </Modal.Footer>
          </Modal>

    </>
  );
};

export default AdminHostsList;
