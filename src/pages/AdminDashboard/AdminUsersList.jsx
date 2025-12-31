import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Badge, Form } from "react-bootstrap";
import { 
  FaEye, 
  FaUserSlash, 
  FaSearch, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaIdCard, 
  FaCalendarAlt, 
  FaCheckCircle,
  FaDownload,
  FaFileCsv
} from "react-icons/fa";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { fetchAllUsers, fetchBookings, fetchHostById } from "../../api";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import "../../components/admin/AdminDashboardModern.css";

const AdminUsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [showHostModal, setShowHostModal] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      const data = await fetchAllUsers();
      // Add mock status if missing, default to Active
      const usersWithStatus = data.map(u => ({ ...u, status: u.status || 'Active' }));
      setUsers(usersWithStatus);
      setFilteredUsers(usersWithStatus);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    try {
      const bookings = await fetchBookings(user.id);
      setUserBookings(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      setUserBookings([]);
    }
    setShowModal(true);
  };

  const handleViewHost = async (hostId) => {
    try {
      const host = await fetchHostById(hostId);
      setSelectedHost(host);
      setShowHostModal(true);
    } catch (error) {
      console.error("Error fetching host details:", error);
    }
  };

  // Stats calculation
  const stats = [
    { title: "Total Users", value: users.length, color: "#4f46e5", icon: <FaUser />, bg: "bg-indigo-soft" },
    { title: "Active Users", value: users.length, color: "#10b981", icon: <FaCheckCircle />, bg: "bg-green-soft" }, // Assuming all active for now
    { title: "New This Month", value: users.filter(u => {
        if (!u.createdAt) return false;
        const date = new Date(u.createdAt);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length, color: "#f59e0b", icon: <FaCalendarAlt />, bg: "bg-yellow-soft" }
  ];

  const exportToCSV = () => {
    const headers = ["ID", "First Name", "Last Name", "Email", "Phone", "Aadhaar", "Joined Date", "Status"];
    const rows = filteredUsers.map(user => [
      user.id,
      user.firstName,
      user.lastName,
      user.email,
      user.phoneNumber || "",
      user.aadhaarNumber || "",
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "",
      user.status || "Active"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="dashboard-container">
        <AdminNavbar />
        
        <Container fluid className="px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header & Stats */}
            <div className="mb-5">
              <h2 className="fw-bold text-dark mb-4">Users Management</h2>
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

            {/* Search & Actions */}
            <Row className="mb-4 align-items-center justify-content-between g-3">
               <Col md={12} lg={5}>
                  <div className="position-relative">
                     <FaSearch className="position-absolute top-50 translate-middle-y ms-3 text-secondary" />
                     <Form.Control
                       type="text"
                       placeholder="Search users by name, email..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="form-control-lg border-0 shadow-sm ps-5"
                       style={{ borderRadius: "50px", fontSize: "0.95rem" }}
                     />
                  </div>
               </Col>
               <Col md={12} lg={7} className="text-lg-end">
                  <Button
                    variant="white"
                    className="btn-white text-success rounded-pill px-4 py-2 shadow-sm border fw-bold d-inline-flex align-items-center"
                    onClick={exportToCSV}
                  >
                    <FaFileCsv className="me-2" /> Export CSV
                  </Button>
               </Col>
            </Row>

            {/* Users Table */}
            <Card className="modern-card border-0 shadow-sm overflow-hidden mb-5">
              <Card.Header className="bg-white border-0 py-4 px-4">
                 <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold text-dark mb-0">Registered Users</h5>
                    <Badge bg="light" text="primary" className="fw-bold fs-6 border px-3 py-2 rounded-pill">
                       {filteredUsers.length} Records
                    </Badge>
                 </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="modern-table align-middle mb-0">
                    <thead className="bg-light text-secondary">
                      <tr>
                        <th className="py-3 ps-4 border-0 text-uppercase small fw-bold">User Details</th>
                        <th className="py-3 border-0 text-uppercase small fw-bold">Contact Info</th>
                        <th className="py-3 border-0 text-uppercase small fw-bold">Joined Date</th>
                        <th className="py-3 border-0 text-uppercase small fw-bold">Status</th>
                        <th className="py-3 pe-4 border-0 text-uppercase small fw-bold text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <motion.tr 
                            key={user.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.5)" }}
                            className="border-bottom"
                          >
                            <td className="ps-4">
                              <div className="d-flex align-items-center">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm fw-bold border"
                                  style={{ 
                                    width: "45px", 
                                    height: "45px", 
                                    fontSize: "1.2rem",
                                    background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)",
                                    color: "white"
                                  }}
                                >
                                  {user.firstName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <div className="fw-bold text-dark">{user.firstName} {user.lastName}</div>
                                  <div className="small text-muted">ID: #{user.id}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex flex-column gap-1">
                                <div className="d-flex align-items-center text-dark small"><FaEnvelope className="me-2 text-secondary opacity-50" size={12}/> {user.email}</div>
                                <div className="d-flex align-items-center text-muted small"><FaPhone className="me-2 text-secondary opacity-50" size={12}/> {user.phoneNumber || 'N/A'}</div>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center text-secondary small">
                                <FaCalendarAlt className="me-2 opacity-50" />
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                }) : 'N/A'}
                              </div>
                            </td>
                            <td>
                              <Badge 
                                bg={user.status === 'Active' ? 'success' : 'danger'} 
                                className={`px-3 py-2 rounded-pill fw-medium ${user.status === 'Active' ? 'bg-opacity-10 text-success' : 'bg-opacity-10 text-danger'}`}
                                text={user.status === 'Active' ? 'success' : 'danger'} // Specific for bootstrap badge
                              >
                                {user.status || 'Active'}
                              </Badge>
                            </td>
                            <td className="text-end pe-4">
                              <Button
                                variant="light"
                                className="btn-icon rounded-circle shadow-sm border-0 text-primary"
                                onClick={() => handleViewUser(user)}
                                title="View Details"
                                style={{width: '32px', height: '32px', padding: 0}}
                              >
                                <FaEye size={14} />
                              </Button>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-5 text-muted">
                            <div className="mb-3 opacity-50 display-1"><FaUserSlash /></div>
                            <h5 className="fw-bold">No Users Found</h5>
                            <p className="small">Try adjusting your search criteria.</p>
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

      {/* User Details Modal - Clean & Modern */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
        <Modal.Header closeButton style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)" }} className="border-0 text-white">
          <Modal.Title className="fw-bold"><FaUser className="me-2 mb-1" /> User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-light">
          {selectedUser && (
            <>
              {/* Personal Info */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                   <h6 className="text-uppercase text-muted small fw-bold mb-3 border-bottom pb-2">Information</h6>
                   <Row className="g-4">
                      <Col md={6}>
                         <div className="d-flex align-items-center mb-2">
                            <div className="text-secondary small fw-bold text-uppercase w-25">Full Name</div>
                            <div className="fw-bold text-dark">{selectedUser.firstName} {selectedUser.lastName}</div>
                         </div>
                         <div className="d-flex align-items-center mb-2">
                            <div className="text-secondary small fw-bold text-uppercase w-25">Email</div>
                            <div className="fw-medium text-dark">{selectedUser.email}</div>
                         </div>
                         <div className="d-flex align-items-center">
                            <div className="text-secondary small fw-bold text-uppercase w-25">Phone</div>
                            <div className="fw-medium text-dark">{selectedUser.phoneNumber || "N/A"}</div>
                         </div>
                      </Col>
                      <Col md={6}>
                         <div className="d-flex align-items-center mb-2">
                            <div className="text-secondary small fw-bold text-uppercase w-25">Joined</div>
                            <div className="fw-medium text-dark">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</div>
                         </div>
                         <div className="d-flex align-items-center mb-2">
                            <div className="text-secondary small fw-bold text-uppercase w-25">Aadhaar</div>
                            <div className="fw-medium text-dark">{selectedUser.aadhaarNumber || "N/A"}</div>
                         </div>
                      </Col>
                   </Row>
                </Card.Body>
              </Card>

              {/* Booking History */}
              <h6 className="text-uppercase text-muted small fw-bold mb-3 ms-1">Booking History</h6>
              <Card className="border-0 shadow-sm overflow-hidden">
                <Card.Body className="p-0">
                  {userBookings.length > 0 ? (
                    <Table hover className="modern-table mb-0 align-middle">
                      <thead className="bg-light text-secondary">
                        <tr>
                          <th className="py-2 ps-4 border-0 small fw-bold">Property</th>
                          <th className="py-2 border-0 small fw-bold">Department</th>
                          <th className="py-2 border-0 small fw-bold">Date</th>
                          <th className="py-2 border-0 small fw-bold">Status</th>
                          <th className="py-2 pe-4 border-0 small fw-bold text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userBookings.map((booking) => (
                          <tr key={booking.id}>
                            <td className="ps-4 fw-medium text-dark">{booking.propertyName}</td>
                            <td><Badge bg="light" text="dark" className="border">{booking.department}</Badge></td>
                            <td className="small text-muted">{booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}</td>
                            <td>
                               <Badge bg={booking.status === 'Confirmed' ? 'success' : booking.status === 'Pending' ? 'warning' : 'danger'} 
                                      className="bg-opacity-25 text-body rounded-pill px-2">
                                  {booking.status}
                               </Badge>
                            </td>
                            <td className="text-end pe-4">
                               <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => {
                                  if (booking.propertyId || booking.property_id) {
                                     setShowModal(false);
                                     navigate(`/admin/property/${booking.propertyId || booking.property_id}`);
                                  }
                               }}>View</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 text-muted small">No bookings found for this user.</div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light pb-4 justify-content-center">
            <Button variant="white" onClick={() => setShowModal(false)} className="rounded-pill px-4 text-secondary fw-bold bg-white border shadow-sm">Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Host Modal - Styles Fix */}
       <Modal show={showHostModal} onHide={() => setShowHostModal(false)} centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold">Host Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedHost ? (
             <div className="bg-light p-4 rounded-3">
                 <Row className="mb-2">
                    <Col xs={4} className="text-secondary fw-bold small text-uppercase">Company</Col>
                    <Col xs={8} className="fw-medium text-dark">{selectedHost.company_name}</Col>
                 </Row>
                 <Row className="mb-2">
                    <Col xs={4} className="text-secondary fw-bold small text-uppercase">Email</Col>
                    <Col xs={8} className="fw-medium text-dark">{selectedHost.email}</Col>
                 </Row>
                 <Row className="mb-2">
                    <Col xs={4} className="text-secondary fw-bold small text-uppercase">Phone</Col>
                    <Col xs={8} className="fw-medium text-dark">{selectedHost.phone_number}</Col>
                 </Row>
                 <hr className="my-3"/>
                 <div className="text-secondary fw-bold small text-uppercase mb-1">Address</div>
                 <div className="text-dark small">{selectedHost.business_address}</div>
             </div>
          ) : (
            <div className="text-center py-4">Loading...</div>
          )}
        </Modal.Body>
      </Modal>

    </>
  );
};

export default AdminUsersList;
