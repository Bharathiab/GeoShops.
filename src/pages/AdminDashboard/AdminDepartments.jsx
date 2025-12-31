import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  Badge,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaFileExport,
  FaFilter,
  FaEye,
  FaSearch,
  FaHotel,
  FaUsers,
  FaUserTie,
  FaChartLine,
  FaRupeeSign,
  FaCheckCircle,
  FaClock,
  FaTimesCircle
} from "react-icons/fa";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { fetchAllBookings } from "../../api";
import { motion } from "framer-motion";
import "../../components/admin/AdminDashboardModern.css";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminDepartments = () => {
  const { department } = useParams();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const filters = ['All', 'Pending', 'Confirmed', 'Cancelled', 'Cancelled by Customer', 'Completed'];
  const dateFilters = ['Today', 'This Week', 'This Month', 'All Time'];

  useEffect(() => {
    loadBookings();
  }, [department]);

  useEffect(() => {
    filterBookings();
  }, [activeFilter, dateFilter, searchTerm, bookings]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const allBookings = await fetchAllBookings();
      
      // Filter bookings for this specific department
      const deptBookings = department 
        ? allBookings.filter(b => b.department === department)
        : allBookings;
      
      // Map bookings to include necessary fields
      const mappedBookings = deptBookings.map(b => ({
        id: b.id,
        userName: b.userName || b.user_name || 'N/A',
        propertyName: b.propertyName || b.property_name || 'N/A',
        department: b.department || b.propertyType || 'N/A',
        checkInDate: b.check_in_date,
        appointmentDate: b.appointment_date,
        couponCode: b.coupon_code,
        totalPrice: b.total_price || b.estimated_price || 0,
        finalPrice: b.final_price || b.total_price || b.estimated_price || 0,
        status: b.status || 'Pending'
      }));
      
      setBookings(mappedBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Filter by status
    if (activeFilter !== 'All') {
      filtered = filtered.filter(b => b.status === activeFilter);
    }

    // Filter by date range
    if (dateFilter !== 'All Time') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.checkInDate || b.appointmentDate);
        
        if (dateFilter === 'Today') {
          return bookingDate >= today && bookingDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        } else if (dateFilter === 'This Week') {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          return bookingDate >= weekStart && bookingDate < weekEnd;
        } else if (dateFilter === 'This Month') {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          return bookingDate >= monthStart && bookingDate < monthEnd;
        }
        return true;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id?.toString().includes(searchTerm)
      );
    }

    setFilteredBookings(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const exportToCSV = () => {
    const headers = ['Booking ID', 'User Name', 'Property', 'Department', 'Date', 'Coupon', 'Original Price', 'Final Price', 'Status'];
    const rows = filteredBookings.map(b => [
      b.id,
      b.userName,
      b.propertyName,
      b.department,
      formatDate(b.checkInDate || b.appointmentDate),
      b.couponCode || 'None',
      b.totalPrice,
      b.finalPrice,
      b.status
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${department || 'All'}_bookings_${dateFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const totalRevenue = bookings
    .filter(b => b.status === 'Completed')
    .reduce((sum, b) => sum + b.finalPrice, 0);

  // Helper for department icons/colors
  const getDeptInfo = (deptName) => {
    switch(deptName) {
      case 'Hotel': return { icon: <FaHotel />, color: 'primary' };
      case 'Hospital': return { icon: <FaUsers />, color: 'danger' };
      case 'Cab': return { icon: <FaUserTie />, color: 'success' };
      case 'Salon': return { icon: <FaChartLine />, color: 'warning' };
      default: return { icon: <FaCalendarAlt />, color: 'secondary' };
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Confirmed': return <Badge bg="success" className="px-3 py-2 rounded-pill"><FaCheckCircle className="me-1"/> Confirmed</Badge>;
      case 'Pending': return <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill"><FaClock className="me-1"/> Pending</Badge>;
      case 'Completed': return <Badge bg="info" className="px-3 py-2 rounded-pill"><FaCheckCircle className="me-1"/> Completed</Badge>;
      case 'Cancelled': return <Badge bg="danger" className="px-3 py-2 rounded-pill"><FaTimesCircle className="me-1"/> Cancelled</Badge>;
      case 'Cancelled by Customer': return <Badge bg="secondary" className="px-3 py-2 rounded-pill"><FaTimesCircle className="me-1"/> Customer Cancelled</Badge>;
      default: return <Badge bg="secondary" className="px-3 py-2 rounded-pill">{status}</Badge>;
    }
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
            {/* Header Section */}
            <div className="mb-4 d-flex justify-content-between align-items-center">
              <div>
                <Button
                    variant="link"
                    onClick={() => navigate("/admin/departments")}
                    className="mb-2 p-0 text-decoration-none text-secondary fw-bold d-flex align-items-center"
                >
                    <div className="bg-white shadow-sm rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '32px', height: '32px'}}>
                        <FaArrowLeft className="text-primary small" />
                    </div>
                    Back to Departments
                </Button>
                <div className="d-flex align-items-center">
                    <div 
                        className={`rounded-circle p-3 me-3 d-flex align-items-center justify-content-center shadow-sm bg-${department ? getDeptInfo(department).color : 'primary'} bg-opacity-10`}
                        style={{ width: "64px", height: "64px", fontSize: "2rem" }}
                    >
                         <span className={`text-${department ? getDeptInfo(department).color : 'primary'}`}>
                             {department ? getDeptInfo(department).icon : <FaCalendarAlt />}
                         </span>
                    </div>
                    <div>
                        <h2 className="mb-0 fw-bold text-dark">
                            {department ? `${department} Bookings` : 'All Bookings'}
                        </h2>
                        <p className="text-muted mb-0">Manage bookings and transactions</p>
                    </div>
                </div>
              </div>
              <div className="d-flex gap-2">
                 <Button 
                    variant="success" 
                    onClick={exportToCSV} 
                    className="shadow-sm border-0 d-flex align-items-center px-4 rounded-pill"
                    style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                >
                    <FaFileExport className="me-2" /> Export CSV
                 </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <Row className="g-4 mb-4">
              <Col md={3}>
                <Card className="modern-card border-0 shadow-sm h-100">
                  <Card.Body className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                        <FaCalendarAlt className="text-primary fs-3" />
                    </div>
                    <div>
                        <h3 className="mb-0 fw-bold text-dark">{bookings.length}</h3>
                        <div className="text-muted small">Total Bookings</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                 <Card className="modern-card border-0 shadow-sm h-100">
                  <Card.Body className="d-flex align-items-center">
                    <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                        <FaClock className="text-warning fs-3" />
                    </div>
                    <div>
                        <h3 className="mb-0 fw-bold text-dark">{bookings.filter(b => b.status === 'Pending').length}</h3>
                        <div className="text-muted small">Pending</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                 <Card className="modern-card border-0 shadow-sm h-100">
                  <Card.Body className="d-flex align-items-center">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                        <FaCheckCircle className="text-success fs-3" />
                    </div>
                    <div>
                        <h3 className="mb-0 fw-bold text-dark">{bookings.filter(b => b.status === 'Confirmed').length}</h3>
                        <div className="text-muted small">Confirmed</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                 <Card className="modern-card border-0 shadow-sm h-100">
                  <Card.Body className="d-flex align-items-center">
                    <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                        <FaRupeeSign className="text-info fs-3" />
                    </div>
                    <div>
                        <h3 className="mb-0 fw-bold text-dark">₹{totalRevenue.toFixed(2)}</h3>
                        <div className="text-muted small">Total Revenue</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Filters and Table */}
            <Card className="modern-card border-0 shadow-sm overflow-hidden">
              <Card.Header className="bg-white border-bottom p-4">
                 <Row className="g-3 align-items-center justify-content-between">
                    <Col lg={7}>
                        <div className="d-flex flex-wrap gap-2">
                             {filters.map(filter => (
                                <Button
                                    key={filter}
                                    variant={activeFilter === filter ? 'primary' : 'light'}
                                    size="sm"
                                    onClick={() => setActiveFilter(filter)}
                                    className={`rounded-pill px-3 fw-medium ${activeFilter === filter ? 'shadow-sm' : 'text-secondary'}`}
                                >
                                    {filter} <span className="opacity-75 ms-1">({bookings.filter(b => filter === 'All' || b.status === filter).length})</span>
                                </Button>
                             ))}
                        </div>
                    </Col>
                    <Col lg={5}>
                        <div className="d-flex gap-2">
                            <Form.Select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="form-select-sm border-0 bg-light shadow-sm rounded-pill px-3"
                                style={{maxWidth: '150px'}}
                            >
                                {dateFilters.map(df => (
                                <option key={df} value={df}>{df}</option>
                                ))}
                            </Form.Select>
                            <div className="position-relative flex-grow-1">
                                <FaSearch className="position-absolute top-50 translate-middle-y ms-3 text-secondary small" />
                                <Form.Control
                                    type="text"
                                    placeholder="Search bookings..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-control-sm border-0 bg-light shadow-sm rounded-pill ps-5 w-100"
                                />
                            </div>
                            {(activeFilter !== 'All' || dateFilter !== 'All Time' || searchTerm) && (
                                <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    className="rounded-pill px-3"
                                    onClick={() => {
                                      setActiveFilter('All');
                                      setDateFilter('All Time');
                                      setSearchTerm('');
                                    }} 
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </Col>
                 </Row>
              </Card.Header>

              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="modern-table mb-0 align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 text-uppercase small text-secondary fw-bold px-4 py-3">ID</th>
                        <th className="border-0 text-uppercase small text-secondary fw-bold py-3">User</th>
                        <th className="border-0 text-uppercase small text-secondary fw-bold py-3">Property</th>
                        <th className="border-0 text-uppercase small text-secondary fw-bold py-3">Dept</th>
                        <th className="border-0 text-uppercase small text-secondary fw-bold py-3">Date</th>
                        <th className="border-0 text-uppercase small text-secondary fw-bold py-3">Coupon</th>
                        <th className="border-0 text-uppercase small text-secondary fw-bold py-3">Price</th>
                        <th className="border-0 text-uppercase small text-secondary fw-bold py-3">Final</th>
                        <th className="border-0 text-uppercase small text-secondary fw-bold py-3">Status</th>
                        <th className="border-0 text-uppercase small text-secondary fw-bold px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="10" className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="text-center py-5 text-muted">
                             <div className="mb-2"><FaSearch className="display-6 text-secondary opacity-25"/></div>
                             No bookings found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((booking) => (
                          <motion.tr 
                             key={`${booking.department}-${booking.id}`}
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                          >
                            <td className="px-4 fw-bold text-primary">#{booking.id}</td>
                            <td className="fw-medium text-dark">{booking.userName}</td>
                            <td className="text-secondary">{booking.propertyName}</td>
                            <td>
                              <Badge bg="light" text="dark" className="border fw-normal">
                                {booking.department}
                              </Badge>
                            </td>
                            <td className="text-secondary small">{formatDate(booking.checkInDate || booking.appointmentDate)}</td>
                            <td>
                              {booking.couponCode ? (
                                <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill">{booking.couponCode}</Badge>
                              ) : (
                                <span className="text-muted small">-</span>
                              )}
                            </td>
                            <td className="text-muted text-decoration-line-through small">₹{booking.totalPrice.toFixed(2)}</td>
                            <td className="fw-bold text-dark">₹{booking.finalPrice.toFixed(2)}</td>
                            <td>
                              {getStatusBadge(booking.status)}
                            </td>
                            <td className="px-4">
                              <Button 
                                variant="light" 
                                size="sm" 
                                className="btn-icon rounded-circle shadow-sm"
                                onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                                title="View Details"
                                style={{width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
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
              </Card.Body>
              {filteredBookings.length > 0 && (
                 <Card.Footer className="bg-white border-top-0 py-3 text-center text-muted small">
                    Showing {filteredBookings.length} of {bookings.length} bookings
                 </Card.Footer>
              )}
            </Card>
          </motion.div>
        </Container>
      </div>
    </>
  );
};

export default AdminDepartments;
