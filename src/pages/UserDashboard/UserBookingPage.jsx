import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Badge } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendar, FaClock, FaCheckCircle, FaUser, FaBuilding, FaPhone, FaArrowLeft, FaIdCard, FaMapMarkerAlt, FaCreditCard, FaUserTie } from 'react-icons/fa';
import { fetchProperties, createBooking, fetchSpecialistsByProperty, fetchServicesByProperty } from '../../api';
import UserNavbar from '../../components/user/UserNavbar';
import Toast from '../../utils/toast';

const UserBookingPage = () => {
    const { department, id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [property, setProperty] = useState(null);
    const [specialists, setSpecialists] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [selectedSpecialist, setSelectedSpecialist] = useState(location.state?.selectedSpecialist || null);
    const [selectedService, setSelectedService] = useState(location.state?.selectedService || null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form States
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointmentTime, setAppointmentTime] = useState("");
    const [pickUpLocation, setPickUpLocation] = useState("");
    const [dropOffLocation, setDropOffLocation] = useState("");
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Ensure department is capitalized (e.g., 'hotel' -> 'Hotel')
                const formattedDept = department.charAt(0).toUpperCase() + department.slice(1).toLowerCase();
                const properties = await fetchProperties(formattedDept);
                
                // More robust property matching (check both ID and department)
                const foundProperty = properties.find(p => p.id.toString() === id);
                
                if (foundProperty) {
                    setProperty(foundProperty);
                    console.log("Loading services for property:", foundProperty.id);
                    const [specs, svcs] = await Promise.all([
                        fetchSpecialistsByProperty(foundProperty.id),
                        fetchServicesByProperty(foundProperty.id)
                    ]);
                    console.log("Specs loaded:", specs.length, "Services loaded:", svcs.length);
                    setSpecialists(specs);
                    setAvailableServices(svcs);
                } else {
                    console.warn("Property with ID", id, "not found in department", formattedDept);
                }
            } catch (error) {
                console.error("Error loading property for booking:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [department, id]);

    const handleConfirmBooking = async () => {
        const userLoginData = JSON.parse(localStorage.getItem("userLoginData") || "{}");
        if (!userLoginData.userId) {
            navigate("/user-login");
            return;
        }

        if (property.status !== 'Active') {
            Toast.error('This asset is currently not available for booking.');
            return;
        }

        const deptLower = department?.toLowerCase();

        // New Validations
        if (deptLower === "hotel") {
            if (!checkInDate || !checkOutDate) {
                Toast.error("Please select check-in and check-out dates.");
                return;
            }
        } else {
            if (!appointmentDate || !appointmentTime) {
                Toast.error("Please select a date and time for your appointment.");
                return;
            }
        }

        if (specialists.length > 0 && !selectedSpecialist) {
            Toast.error("Please select a professional to proceed.");
            return;
        }

        if (availableServices.length > 0 && !selectedService) {
            Toast.error("Please select a service to proceed.");
            return;
        }

        setSubmitting(true);
        const basePrice = parseFloat(property.price) || 0;
        const servicePrice = selectedService ? parseFloat(selectedService.price) : 0;
        const totalPrice = basePrice + servicePrice;

        const bookingData = {
            userId: userLoginData.userId,
            hotelId: deptLower === "hotel" ? property.id : undefined,
            saloonId: deptLower === "salon" ? property.id : undefined,
            hospitalId: deptLower === "hospital" ? property.id : undefined,
            cabId: deptLower === "cab" ? property.id : undefined,
            
            checkInDate: deptLower === "hotel" ? checkInDate : undefined,
            checkOutDate: deptLower === "hotel" ? checkOutDate : undefined,
            numberOfGuests: deptLower === "hotel" ? 1 : undefined,
            roomType: deptLower === "hotel" ? "Standard" : undefined,
            finalPrice: totalPrice,
            selectedServiceName: selectedService ? selectedService.name : undefined,
            couponCode: "",

            appointmentDate: (deptLower !== "hotel") && appointmentDate && appointmentTime
                ? `${appointmentDate}T${appointmentTime}:00` : undefined,
            serviceName: selectedService ? selectedService.name : (deptLower === "salon" ? "General Service" : undefined),

            reason: deptLower === "hospital" ? reason : undefined,
            doctorCategory: deptLower === "hospital" ? "General" : undefined,
            doctorName: deptLower === "hospital" ? "Dr. Available" : undefined,

            pickupLocation: deptLower === "cab" ? pickUpLocation : undefined,
            dropoffLocation: deptLower === "cab" ? dropOffLocation : undefined,
            vehicleType: deptLower === "cab" ? "Sedan" : undefined,
            distance: deptLower === "cab" ? 10 : undefined,
            estimatedPrice: property.price,

            specialistId: selectedSpecialist?.id,
            specialistName: selectedSpecialist?.name,
            department: department
        };

        try {
            const response = await createBooking(department, bookingData);
            
            // Robust extraction of booking ID from any possible response structure
            const bId = response.bookingId || 
                        response.data?.bookingId || 
                        response.data?.id || 
                        response.id || 
                        response.hotelBooking?.id || 
                        response.saloonBooking?.id || 
                        response.hospitalBooking?.id || 
                        response.cabBooking?.id ||
                        (response.data && typeof response.data === 'number' ? response.data : null);

            if (!bId) {
                console.error("Booking created but ID not found in response:", response);
                Toast.error("Booking confirmed, but failed to retrieve transaction ID. Please check 'My Bookings'.");
                return;
            }
            
            navigate('/user/booking-payment', { 
                state: { 
                    bookingId: bId,
                    amount: totalPrice,
                    propertyName: property.company,
                    department: department
                } 
            });
        } catch (error) {
            console.error("Error creating booking:", error);
            alert("Failed to create booking. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <Spinner animation="border" variant="success" />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <h3 className="text-muted mb-4">Property not found for booking</h3>
                <Button variant="success" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <UserNavbar selectedDepartment={department} onDepartmentChange={(dept) => navigate(`/user/${dept.toLowerCase()}`)} />
            
            {/* Dark Header */}
            <div style={{ background: 'linear-gradient(135deg, #001A14 0%, #002C22 100%)', padding: '40px 0 80px', color: 'white' }}>
                <Container>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="d-flex align-items-center gap-2 mb-4 cursor-pointer"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft /> <span className="fw-bold text-uppercase smallest tracking-widest opacity-70">Back to Property</span>
                    </motion.div>
                    <h2 className="fw-900 mb-1 font-heading">Complete Your <span className="text-gold">Booking</span></h2>
                    <p className="opacity-60 mb-0">Secure your elite experience at {property.company}</p>
                </Container>
            </div>

            <Container style={{ marginTop: '-40px' }} className="pb-5">
                <Row className="g-4">
                    {/* Booking Form */}
                    <Col lg={8}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-5 shadow-sm p-4 p-md-5 border border-light">
                            <h5 className="fw-900 mb-4 d-flex align-items-center gap-3">
                                <div className="bg-success bg-opacity-10 p-2 rounded-3 text-success">
                                    <FaCalendar size={18} />
                                </div>
                                Select Your Schedule
                            </h5>

                            <Form>
                                {department === "Hotel" && (
                                    <Row className="g-4 mb-4">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold smallest text-muted text-uppercase tracking-widest mb-2">Check-in Date</Form.Label>
                                                <Form.Control 
                                                    type="date" 
                                                    className="rounded-4 py-3 border-light bg-light focus-ring-success"
                                                    value={checkInDate} 
                                                    onChange={(e) => setCheckInDate(e.target.value)} 
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold smallest text-muted text-uppercase tracking-widest mb-2">Check-out Date</Form.Label>
                                                <Form.Control 
                                                    type="date" 
                                                    className="rounded-4 py-3 border-light bg-light focus-ring-success"
                                                    value={checkOutDate} 
                                                    onChange={(e) => setCheckOutDate(e.target.value)} 
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}

                                {(department === "Hospital" || department === "Salon" || department === "Cab") && (
                                    <Row className="g-4 mb-4">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold smallest text-muted text-uppercase tracking-widest mb-2">Service Date</Form.Label>
                                                <Form.Control 
                                                    type="date" 
                                                    className="rounded-4 py-3 border-light bg-light focus-ring-success"
                                                    value={appointmentDate} 
                                                    onChange={(e) => setAppointmentDate(e.target.value)} 
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold smallest text-muted text-uppercase tracking-widest mb-2">Preferred Time</Form.Label>
                                                <Form.Control 
                                                    type="time" 
                                                    className="rounded-4 py-3 border-light bg-light focus-ring-success"
                                                    value={appointmentTime} 
                                                    onChange={(e) => setAppointmentTime(e.target.value)} 
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}

                                {department === "Cab" && (
                                    <Row className="g-4 mb-4">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold smallest text-muted text-uppercase tracking-widest mb-2">Pick-up Location</Form.Label>
                                                <Form.Control 
                                                    type="text" 
                                                    placeholder="Enter exact address"
                                                    className="rounded-4 py-3 border-light bg-light focus-ring-success"
                                                    value={pickUpLocation} 
                                                    onChange={(e) => setPickUpLocation(e.target.value)} 
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold smallest text-muted text-uppercase tracking-widest mb-2">Drop-off Location</Form.Label>
                                                <Form.Control 
                                                    type="text" 
                                                    placeholder="Enter destination"
                                                    className="rounded-4 py-3 border-light bg-light focus-ring-success"
                                                    value={dropOffLocation} 
                                                    onChange={(e) => setDropOffLocation(e.target.value)} 
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}

                                {department === "Hospital" && (
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold smallest text-muted text-uppercase tracking-widest mb-2">Reason for Visit</Form.Label>
                                        <Form.Control 
                                            as="textarea" 
                                            rows={3} 
                                            placeholder="Briefly describe your medical requirement..."
                                            className="rounded-4 py-3 border-light bg-light focus-ring-success"
                                            value={reason} 
                                            onChange={(e) => setReason(e.target.value)} 
                                        />
                                    </Form.Group>
                                )}

                                {/* Specialist Selection in Booking Flow */}
                                {specialists.length > 0 && (
                                    <Row className="g-4 mb-4">
                                        <Col md={12}>
                                            <Form.Label className="fw-bold d-flex align-items-center gap-2 mb-3">
                                                <FaUserTie className="text-primary" /> Select Preferred Professional
                                            </Form.Label>
                                            <div className="d-flex flex-wrap gap-2">
                                                {specialists.map(spec => (
                                                    <motion.div
                                                        key={spec.id}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={`p-3 rounded-4 border transition-all cursor-pointer d-flex align-items-center gap-3 ${selectedSpecialist?.id === spec.id ? 'border-primary bg-primary bg-opacity-10' : 'bg-white'}`}
                                                        onClick={() => setSelectedSpecialist(spec)}
                                                        style={{ minWidth: '200px' }}
                                                    >
                                                        <img src={spec.imageUrl} className="rounded-circle" style={{ width: '40px', height: '40px', objectFit: 'cover' }} alt={spec.name} />
                                                        <div>
                                                            <div className="fw-bold small">{spec.name}</div>
                                                            <div className="smallest text-muted">{spec.rating} Rating</div>
                                                        </div>
                                                        {selectedSpecialist?.id === spec.id && <FaCheckCircle className="ms-auto text-primary" />}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </Col>
                                    </Row>
                                )}

                                 {/* Service Selection */}
                                 {availableServices.length > 0 && (
                                    <Row className="g-4 mb-4">
                                        <Col md={12}>
                                            <Form.Label className="fw-bold d-flex align-items-center gap-2 mb-3">
                                                <FaBuilding className="text-success" /> {selectedService ? 'Selected Service' : 'Choose a Service (Optional)'}
                                            </Form.Label>
                                            <div className="d-flex flex-wrap gap-2">
                                                {availableServices.map(svc => (
                                                    <motion.div
                                                        key={svc.id}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={`p-3 rounded-4 border transition-all cursor-pointer d-flex align-items-center gap-3 ${selectedService?.id === svc.id ? 'border-success bg-success bg-opacity-10' : 'bg-white'}`}
                                                        onClick={() => setSelectedService(selectedService?.id === svc.id ? null : svc)}
                                                        style={{ minWidth: '240px' }}
                                                    >
                                                        <img src={svc.imageUrl} className="rounded-3" style={{ width: '40px', height: '40px', objectFit: 'cover' }} alt={svc.name} onError={(e) => e.target.src = 'https://via.placeholder.com/40'} />
                                                        <div className="flex-grow-1">
                                                            <div className="fw-bold small">{svc.name}</div>
                                                            <div className="smallest text-success fw-bold">₹{svc.price}</div>
                                                        </div>
                                                        {selectedService?.id === svc.id && <FaCheckCircle className="ms-auto text-success" />}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </Col>
                                    </Row>
                                 )}
                            </Form>
                        </motion.div>
                    </Col>

                    {/* Summary Sidebar */}
                    <Col lg={4}>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky-top" style={{ top: '100px' }}>
                            <Card className="rounded-5 border-0 shadow-sm overflow-hidden mb-4">
                                <div className="p-4 bg-light border-bottom">
                                    <h6 className="fw-900 mb-0">Order Summary</h6>
                                </div>
                                <Card.Body className="p-4">
                                    <div className="d-flex align-items-center gap-3 mb-4">
                                        <img src={property.imageUrl} className="rounded-3 shadow-xs" style={{ width: '60px', height: '60px', objectFit: 'cover' }} alt="" />
                                        <div>
                                            <div className="fw-extra-bold text-dark">{property.company}</div>
                                            <div className="smallest text-muted">{property.location}</div>
                                        </div>
                                    </div>

                                     <div className="space-y-3 mb-4">
                                         <div className="d-flex justify-content-between">
                                             <span className="text-muted small">Asset Charges</span>
                                             <span className="fw-bold text-dark">₹{property.price}</span>
                                         </div>
                                         {selectedService && (
                                             <div className="d-flex justify-content-between">
                                                 <span className="text-muted small">{selectedService.name}</span>
                                                 <span className="fw-bold text-success">+ ₹{selectedService.price}</span>
                                             </div>
                                         )}
                                         <div className="d-flex justify-content-between border-top pt-3">
                                             <span className="fw-900">Total Amount</span>
                                             <span className="fw-900 text-gold-modern fs-5">
                                                 ₹{selectedService ? (parseFloat(property.price) + parseFloat(selectedService.price)) : property.price}
                                             </span>
                                         </div>
                                     </div>

                                    {/* Elite Guaranteed Badge - Booking Page Integration */}
                                    <div className="p-3 rounded-4 bg-gradient-gold text-dark text-start mb-4 shadow-xs">
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <div className="bg-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px' }}>
                                                <FaCheckCircle className="text-gold" size={14} />
                                            </div>
                                            <span className="fw-bold small">Elite Guaranteed</span>
                                        </div>
                                        <p className="mb-0 overflow-hidden" style={{ fontSize: '0.65rem', opacity: 0.8, lineHeight: '1.2' }}>
                                            Verified premises with our luxury standard checklist.
                                        </p>
                                    </div>

                                    <Button 
                                        className="btn-gold-gradient w-100 py-3 rounded-pill fw-bold shadow-lg border-0 d-flex align-items-center justify-content-center gap-2"
                                        disabled={submitting}
                                        onClick={handleConfirmBooking}
                                    >
                                        {submitting ? <Spinner animation="border" size="sm" /> : <><FaCreditCard /> PROCEED TO PAY</>}
                                    </Button>
                                </Card.Body>
                            </Card>

                            <div className="bg-white rounded-5 p-4 border border-light text-center shadow-xs">
                                <div className="d-flex align-items-center justify-content-center gap-2 text-success fw-bold small mb-0">
                                    <FaCheckCircle /> 100% Safe & Secure Booking
                                </div>
                            </div>
                        </motion.div>
                    </Col>
                </Row>
            </Container>

            <style>{`
                .focus-ring-success:focus { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
                .fw-900 { font-weight: 950; }
                .smallest { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.2em; }
                .text-gold-modern { color: #fbbf24; }
                .truncate-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
                .btn-gold-gradient { background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default UserBookingPage;
