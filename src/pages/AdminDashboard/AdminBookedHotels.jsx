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
  Badge
} from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaSearch,
  FaBuilding,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaArrowRight
} from "react-icons/fa";
import { FaHotel, FaUsers, FaUserTie, FaChartLine } from "react-icons/fa";
import { fetchAllBookings, fetchHosts, fetchHostProperties, updateBookingStatus, deleteBooking } from "../../api";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Toast from "../../utils/toast";
import { motion } from "framer-motion";
import "../../components/admin/AdminDashboardModern.css";

const AdminBookedHotels = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch all bookings from API
        const allBookings = await fetchAllBookings();

        // Map API fields to frontend fields
        const mappedBookings = allBookings.map(b => ({
          ...b,
          userName: b.userName || b.user_name || 'N/A',
          propertyName: b.propertyName || b.property_name || 'N/A',
          id: b.id,
          userId: b.user_id,
          propertyId: b.department === 'Hotel' ? b.hotel_id :
            b.department === 'Salon' ? b.saloon_id :
              b.department === 'Hospital' ? b.hospital_id :
                b.department === 'Cab' ? b.cab_id : null,
          checkInDate: b.check_in_date,
          checkOutDate: b.check_out_date,
          appointmentDate: b.appointment_date,
          appointmentTime: b.appointment_time,
          pickUpLocation: b.pickup_location,
          dropOffLocation: b.dropoff_location,
          bookingDate: b.created_at ? new Date(b.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          status: b.status || 'Pending'
        }));
        setBookings(mappedBookings);

        // Fetch all properties from all hosts
        const allHosts = await fetchHosts();
        let allProperties = [];

        for (const host of allHosts) {
          try {
            const hostProps = await fetchHostProperties(host.id);
            const mappedProps = hostProps.map(p => ({
              ...p,
              id: p.id,
              hostId: p.host_id,
              locationUrl: p.location_url,
              gstNumber: p.gst_number,
              imageUrl: p.image_url,
              status: 'Active'
            }));
            allProperties = [...allProperties, ...mappedProps];
          } catch (err) {
            console.error(`Error fetching properties for host ${host.id}:`, err);
          }
        }
        setProperties(allProperties);
      } catch (error) {
        console.error("Error loading data:", error);
        setBookings([]);
        setProperties([]);
      }
    };

    loadData();

    // Reload data every 30 seconds to keep it fresh
    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, []);

  const departments = [
    { name: "Hotel", icon: <FaHotel />, color: "#007bff" },
    { name: "Cab", icon: <FaUserTie />, color: "#28a745" },
    { name: "Hospital", icon: <FaUsers />, color: "#6f42c1" },
    { name: "Salon", icon: <FaChartLine />, color: "#fd7e14" },
  ];

  // Define table columns for each department
  const getTableColumns = (department) => {
    const baseColumns = [
      {
        key: "sno",
        header: "S.No",
        render: (booking, index) => <span className="text-secondary fw-bold">#{index + 1}</span>,
      },
      {
        key: "userName",
        header: "User Name",
        render: (booking) => (
          <div>
            <div className="fw-bold text-dark">{booking.userName}</div>
            <div className="small text-muted">{booking.phone || 'N/A'}</div>
          </div>
        ),
      },
      {
        key: "service",
        header: "Service/Hotel",
        render: (booking) => (
           <div className="d-flex align-items-center">
             <div className="rounded p-1 bg-light me-2 text-primary">
               {department === 'Hotel' ? <FaHotel /> : department === 'Cab' ? <FaUserTie /> : department === 'Hospital' ? <FaUsers /> : <FaChartLine />}
             </div>
             <span className="fw-medium text-dark">{booking.propertyName}</span>
           </div>
        ),
      },
      {
        key: "bookingDate",
        header: "Booking Date",
        render: (booking) => (
          <div className="text-secondary">
            <FaCalendarAlt className="me-1 opacity-50" />
            {booking.bookingDate}
          </div>
        ),
      },
    ];

    const statusColumn = {
      key: "status",
      header: "Status",
      render: (booking) => (
        <Form.Select
          size="sm"
          value={booking.status}
          onChange={(e) => handleStatusChange(booking, e.target.value)}
          style={{ width: "130px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600" }}
          className={`border-0 shadow-sm ${
            booking.status === 'Confirmed' ? 'text-success bg-success bg-opacity-10' :
            booking.status === 'Completed' ? 'text-primary bg-primary bg-opacity-10' :
            booking.status === 'Cancelled' ? 'text-danger bg-danger bg-opacity-10' :
            'text-warning bg-warning bg-opacity-10'
          }`}
          disabled={booking.status === "Cancelled by Customer" || booking.status === "Completed"}
        >
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Cancelled by Customer">Cancelled by Customer</option>
        </Form.Select>
      ),
    };

    const actionsColumn = {
      key: "actions",
      header: "Actions",
      render: (booking) => (
        <div className="d-flex gap-2">
          <Button
            variant="light"
            size="sm"
            className="btn-outline-modern rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{ width: "32px", height: "32px" }}
            onClick={() => handleEdit(booking)}
            disabled={booking.status === "Completed"}
            title="Edit Booking"
          >
            <FaEdit className="text-secondary" />
          </Button>
          <Button 
            variant="light" 
            size="sm" 
            className="btn-outline-modern rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{ width: "32px", height: "32px" }}
            onClick={() => navigate(`/admin/bookings/${booking.id}`)}
             title="View Details"
          >
            <FaEye className="text-primary" />
          </Button>
          <Button
            variant="light"
            size="sm"
            className="btn-outline-modern rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{ width: "32px", height: "32px" }}
            onClick={() => handleDelete(booking)}
             title="Delete Booking"
          >
            <FaTrash className="text-danger" />
          </Button>
        </div>
      ),
    };

    switch (department) {
      case "Hotel":
        return [
          ...baseColumns,
          {
            key: "checkInDate",
            header: "Check-in",
            render: (booking) => booking.checkInDate || "N/A",
          },
          {
            key: "checkOutDate",
            header: "Check-out",
            render: (booking) => booking.checkOutDate || "N/A",
          },
          statusColumn,
          actionsColumn,
        ];
      case "Cab":
        return [
          ...baseColumns,
          {
            key: "pickUpLocation",
            header: "Pick-up",
            render: (booking) => (
              <div className="d-flex align-items-center" title={booking.pickUpLocation}>
                <FaMapMarkerAlt className="text-success me-1" />
                <span className="text-truncate" style={{ maxWidth: "120px" }}>{booking.pickUpLocation || "N/A"}</span>
              </div>
            ),
          },
          {
            key: "dropOffLocation",
            header: "Drop-off",
            render: (booking) => (
               <div className="d-flex align-items-center" title={booking.dropOffLocation}>
                <FaMapMarkerAlt className="text-danger me-1" />
                <span className="text-truncate" style={{ maxWidth: "120px" }}>{booking.dropOffLocation || "N/A"}</span>
              </div>
            ),
          },
          statusColumn,
          actionsColumn,
        ];
      case "Hospital":
      case "Salon":
        return [
          ...baseColumns,
          {
            key: "appointmentDate",
            header: "Date",
            render: (booking) => booking.appointmentDate || "N/A",
          },
          {
            key: "appointmentTime",
            header: "Time",
            render: (booking) => booking.appointmentTime || "N/A",
          },
          statusColumn,
          actionsColumn,
        ];
      default:
        return [
          ...baseColumns,
          {
            key: "checkInDate",
            header: "Check-in",
            render: (booking) => booking.checkInDate || "N/A",
          },
          statusColumn,
          actionsColumn,
        ];
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.propertyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = selectedDepartment
      ? booking.department === selectedDepartment
      : true;

    const matchesStatus = selectedStatus
      ? booking.status === selectedStatus
      : true;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  const handleDelete = (booking) => {
    setBookingToDelete(booking);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!bookingToDelete) return;
    
    try {
      await deleteBooking(bookingToDelete.department, bookingToDelete.id);
      // Refresh bookings after delete
      const allBookings = await fetchAllBookings();
      const mappedBookings = allBookings.map(b => ({
        ...b,
        id: b.id,
        userId: b.user_id,
        propertyId: b.department === 'Hotel' ? b.hotel_id :
          b.department === 'Salon' ? b.saloon_id :
            b.department === 'Hospital' ? b.hospital_id :
              b.department === 'Cab' ? b.cab_id : null,
        checkInDate: b.check_in_date,
        checkOutDate: b.check_out_date,
        appointmentDate: b.appointment_date,
        appointmentTime: b.appointment_time,
        pickUpLocation: b.pickup_location,
        dropOffLocation: b.dropoff_location,
        bookingDate: b.created_at ? new Date(b.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: b.status || 'Pending'
      }));
      setBookings(mappedBookings);
      Toast.success("Booking deleted successfully");
      setShowDeleteModal(false);
      setBookingToDelete(null);
    } catch (error) {
      console.error("Error deleting booking:", error);
      Toast.error("Failed to delete booking. Please try again.");
    }
  };

  const handleSaveEdit = () => {
    const updatedBookings = bookings.map((b) =>
      b.id === selectedBooking.id ? selectedBooking : b
    );
    setBookings(updatedBookings);
    setShowEditModal(false);
  };

  const handleStatusChange = async (booking, newStatus) => {
    try {
      await updateBookingStatus(booking.department, booking.id, newStatus);
      // Update local state
      const updatedBookings = bookings.map((b) =>
        b.id === booking.id ? { ...b, status: newStatus } : b
      );
      setBookings(updatedBookings);
    } catch (error) {
      console.error("Error updating booking status:", error);
      Toast.error("Failed to update booking status. Please try again.");
    }
  };

  return (
    <div className="dashboard-container">
      <AdminNavbar />
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <Container fluid className="pb-4">
          <Row className="mb-4">
            <Col md={8}>
              <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>
                Booked Hotels Management
              </h2>
              <p className="text-secondary mb-0">
                Manage and monitor all hotel and service bookings.
              </p>
            </Col>
            <Col md={4} className="text-md-end d-flex align-items-center justify-content-md-end mt-3 mt-md-0">
               <div className="bg-white p-2 rounded-pill shadow-sm d-flex align-items-center px-3 border">
                  <FaCalendarAlt className="text-primary me-2" />
                  <span className="fw-bold text-dark">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
               </div>
            </Col>
          </Row>

          {/* Department Selection */}
          <Row className="mb-4 g-4">
            {departments.map((dept) => (
              <Col key={dept.name} md={6} lg={3}>
                <motion.div whileHover={{ translateY: -5 }}>
                  <Card
                    className={`modern-card border-0 h-100 ${selectedDepartment === dept.name ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedDepartment(dept.name)}
                    style={{
                      cursor: "pointer",
                      borderTop: `4px solid ${dept.color}`,
                       background: selectedDepartment === dept.name ? "linear-gradient(to bottom right, #ffffff, #f8fafc)" : "#ffffff"
                    }}
                  >
                    <Card.Body className="d-flex align-items-center p-4">
                      <div
                        className="rounded-circle p-3 me-3 d-flex align-items-center justify-content-center shadow-sm"
                        style={{
                          backgroundColor: `${dept.color}15`,
                          color: dept.color,
                          width: "60px",
                          height: "60px",
                          fontSize: "1.5rem",
                        }}
                      >
                        {dept.icon}
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1 text-dark">{dept.name}</h6>
                        <span className="text-muted small fw-medium">
                          {bookings.filter((b) => b.department === dept.name).length} Active Bookings
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          {/* Search, Filter & Actions */}
          <Row className="mb-4 align-items-center justify-content-between g-3">
             <Col md={6} lg={5}>
               <div className="position-relative">
                  <FaSearch className="position-absolute top-50 translate-middle-y ms-3 text-secondary" />
                  <Form.Control
                    type="text"
                    placeholder="Search by user, property..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control-lg border-0 shadow-sm ps-5"
                    style={{ borderRadius: "50px", fontSize: "0.95rem" }}
                  />
               </div>
             </Col>
             <Col md={6} lg={7} className="d-flex gap-3 justify-content-md-end">
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="form-control-lg border-0 shadow-sm"
                  style={{ borderRadius: "50px", maxWidth: "200px", fontSize: "0.95rem", cursor: "pointer"  }}
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>
             </Col>
          </Row>

          {/* Bookings Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="modern-card border-0 shadow-sm overflow-hidden">
               <Card.Header className="card-header-modern bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                 <div className="d-flex align-items-center">
                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 me-2">
                       Total: {filteredBookings.length}
                    </span>
                 </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="modern-table mb-0 align-middle">
                    <thead className="bg-light">
                      <tr>
                        {getTableColumns(selectedDepartment).map((column) => (
                          <th key={column.key} className="border-0 py-3 ps-4 text-secondary text-uppercase small text-start">
                             {column.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking, index) => (
                          <motion.tr 
                             key={booking.id}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ duration: 0.3 }}
                             whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.8)" }}
                          >
                            {getTableColumns(selectedDepartment).map((column) => (
                              <td key={column.key} className="ps-4 py-3 text-start">
                                {column.render(booking, index)}
                              </td>
                            ))}
                          </motion.tr>
                        ))
                      ) : (
                         <tr>
                            <td colSpan={getTableColumns(selectedDepartment).length} className="text-center py-5">
                               <div className="text-muted d-flex flex-column align-items-center">
                                  <div className="bg-light rounded-circle p-3 mb-3">
                                     <FaSearch className="fs-3 text-secondary opacity-50" />
                                  </div>
                                  <h6 className="fw-bold text-dark">No bookings found</h6>
                                   <p className="small mb-0">Try adjusting your filters or search terms.</p>
                               </div>
                            </td>
                         </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </motion.div>

          {/* Edit Booking Modal - Modernized */}
          {/* Edit Booking Modal */}
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg" contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
            <Modal.Header closeButton style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)" }} className="border-0 text-white">
              <Modal.Title className="fw-bold">
                <FaEdit className="me-2 mb-1" /> Edit Booking Details
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
              {selectedBooking && (
                <Form>
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <h6 className="text-secondary fw-bold text-uppercase small mb-3 border-bottom pb-2">User & Property</h6>
                        <Row className="g-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="text-muted small fw-bold text-uppercase">User Name</Form.Label>
                              <Form.Control
                                type="text"
                                value={selectedBooking.userName}
                                onChange={(e) => setSelectedBooking({ ...selectedBooking, userName: e.target.value })}
                                className="form-control-lg bg-light border-0 fs-6 shadow-sm"
                              />
                            </Form.Group>
                          </Col>
                           <Col md={6}>
                            <Form.Group>
                              <Form.Label className="text-muted small fw-bold text-uppercase">Phone</Form.Label>
                              <Form.Control
                                type="text"
                                value={selectedBooking.phone}
                                onChange={(e) => setSelectedBooking({ ...selectedBooking, phone: e.target.value })}
                                className="form-control-lg bg-light border-0 fs-6 shadow-sm"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={12}>
                            <Form.Group>
                              <Form.Label className="text-muted small fw-bold text-uppercase">Service/Hotel</Form.Label>
                              <Form.Control
                                type="text"
                                value={selectedBooking.propertyName}
                                onChange={(e) => setSelectedBooking({ ...selectedBooking, propertyName: e.target.value })}
                                className="form-control-lg bg-light border-0 fs-6 shadow-sm"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                    </div>
                </div>

                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                        <h6 className="text-secondary fw-bold text-uppercase small mb-3 border-bottom pb-2">Schedule</h6>
                        <Row className="g-3">
                           <Col md={6}>
                            <Form.Group>
                              <Form.Label className="text-muted small fw-bold text-uppercase">Booking Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={selectedBooking.bookingDate}
                                onChange={(e) => setSelectedBooking({ ...selectedBooking, bookingDate: e.target.value })}
                                className="form-control-lg bg-light border-0 fs-6 shadow-sm"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label className="text-muted small fw-bold text-uppercase">Check-in Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={selectedBooking.checkInDate}
                                onChange={(e) => setSelectedBooking({ ...selectedBooking, checkInDate: e.target.value })}
                                className="form-control-lg bg-light border-0 fs-6 shadow-sm"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                    </div>
                </div>
                </Form>
              )}
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0 pb-4 bg-light">
              <Button variant="white" onClick={() => setShowEditModal(false)} className="rounded-pill px-4 text-secondary fw-bold bg-white border shadow-sm me-2">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                className="rounded-pill px-4 shadow-sm border-0 fw-bold"
                style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)" }}
              >
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
            <Modal.Header closeButton style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }} className="border-0 text-white">
              <Modal.Title className="fw-bold">
                <FaTrash className="me-2 mb-1" /> Delete Booking
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
                 Do you really want to delete this booking? This process cannot be undone.
               </p>

               {bookingToDelete && (
                 <div className="card border-0 bg-light shadow-sm text-start mx-auto" style={{maxWidth: '350px'}}>
                    <div className="card-body p-3">
                       <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                           <span className="text-secondary small fw-bold text-uppercase">BOOKING ID</span>
                           <span className="badge bg-white text-dark border shadow-sm">#{bookingToDelete.id}</span>
                       </div>
                       <div className="d-flex justify-content-between align-items-center">
                           <span className="text-secondary small fw-bold text-uppercase">USER NAME</span>
                           <span className="fw-bold text-dark text-truncate" style={{maxWidth: '150px'}}>{bookingToDelete.userName}</span>
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
      </motion.div>
    </div>
  );
};

export default AdminBookedHotels;
