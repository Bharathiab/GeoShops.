import React, { useState, useEffect } from "react";
import { Modal, Button, Alert, Spinner, Card, Badge, Form } from "react-bootstrap";
import { FaIdCard, FaMapMarkerAlt, FaCheckCircle, FaFilter, FaStar } from "react-icons/fa";
import { fetchAllProperties, createMembershipRequest, fetchDepartments } from "../../api";

const MembershipRequestModal = ({ show, onHide, userId }) => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    if (show) {
      loadData();
    }
  }, [show]);

  useEffect(() => {
    if (selectedDepartment === "All") {
      setFilteredProperties(properties);
    } else {
      setFilteredProperties(
        properties.filter(property => property.department === selectedDepartment)
      );
    }
  }, [selectedDepartment, properties]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [allProperties, allDepartments] = await Promise.all([
        fetchAllProperties(),
        fetchDepartments()
      ]);
      setProperties(allProperties);
      setFilteredProperties(allProperties);
      setDepartments(allDepartments);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMembership = async () => {
    if (!selectedProperty) {
      setError("Please select a property first.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const requestData = {
        userId: userId,
        hostId: selectedProperty.hostId,
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.company
      };

      await createMembershipRequest(requestData);
      setSuccess("Membership request submitted successfully!");
      setSelectedProperty(null);

      // Close modal after 2 seconds
      setTimeout(() => {
        onHide();
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Error submitting membership request:", err);
      setError("Failed to submit membership request. You may have already requested membership for this property.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedProperty(null);
    setSelectedDepartment("All");
    setError("");
    setSuccess("");
    onHide();
  };

  const getDepartmentColor = (department) => {
    const colors = {
      Hotel: "#FF6B6B",
      Salon: "#4ECDC4",
      Hospital: "#45B7D1",
      Cab: "#FFA07A",
      default: "#95E1D3"
    };
    return colors[department] || colors.default;
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header
        closeButton
        className="border-0"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white"
        }}
      >
        <Modal.Title className="d-flex align-items-center">
          <FaIdCard className="me-2" />
          Request Membership
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "600px", overflowY: "auto", backgroundColor: "#f8f9fa" }}>
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible className="shadow-sm">
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="d-flex align-items-center shadow-sm">
            <FaCheckCircle className="me-2" />
            {success}
          </Alert>
        )}

        {/* Department Filter */}
        <Card className="mb-3 border-0 shadow-sm">
          <Card.Body className="p-3">
            <div className="d-flex align-items-center mb-2">
              <FaFilter className="me-2 text-primary" size={18} />
              <h6 className="mb-0 fw-bold">Filter by Department</h6>
            </div>
            <Form.Select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={{
                borderRadius: "8px",
                border: "2px solid #e0e0e0",
                padding: "8px 12px"
              }}
            >
              <option value="All">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </Form.Select>
            <div className="mt-2 text-muted small">
              Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
            </div>
          </Card.Body>
        </Card>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-5">
            <FaIdCard size={50} className="mb-3 text-muted pulse-animation" />
            <h5>No Properties Available</h5>
            <p className="text-muted">
              {selectedDepartment === "All"
                ? "There are currently no properties available for membership requests."
                : `No properties found in ${selectedDepartment} department.`
              }
            </p>
            {selectedDepartment !== "All" && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setSelectedDepartment("All")}
              >
                View All Departments
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-3 text-secondary">
              Select a property below to request membership:
            </p>
            <div className="properties-list">
              {filteredProperties.map((property) => (
                <Card
                  key={property.id}
                  className={`mb-3 property-card ${selectedProperty?.id === property.id ? "selected" : ""}`}
                  onClick={() => setSelectedProperty(property)}
                  style={{
                    cursor: "pointer",
                    border: selectedProperty?.id === property.id ? "2px solid #667eea" : "1px solid #dee2e6",
                    borderRadius: "12px",
                    transition: "all 0.3s ease"
                  }}
                >
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-2 fw-bold" style={{ color: "#2d3748" }}>
                          {property.company}
                        </h6>
                        <div className="d-flex align-items-center text-muted small mb-2">
                          <FaMapMarkerAlt className="me-1 text-danger" size={12} />
                          <span>{property.location}</span>
                        </div>
                        {property.description && (
                          <div className="text-muted small mt-2" style={{ lineHeight: "1.5" }}>
                            {property.description.length > 80
                              ? property.description.substring(0, 80) + "..."
                              : property.description}
                          </div>
                        )}
                      </div>
                      <div className="text-end ms-3">
                        <Badge
                          className="mb-2"
                          style={{
                            backgroundColor: getDepartmentColor(property.department),
                            fontSize: "11px",
                            padding: "4px 10px",
                            borderRadius: "12px"
                          }}
                        >
                          {property.department}
                        </Badge>
                        {selectedProperty?.id === property.id && (
                          <div className="mt-2">
                            <FaCheckCircle className="text-primary" size={24} />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 bg-light">
        <Button variant="outline-secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleRequestMembership}
          disabled={!selectedProperty || submitting || loading}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            padding: "8px 24px"
          }}
        >
          {submitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Submitting...
            </>
          ) : (
            <>
              <FaIdCard className="me-2" />
              Request Membership
            </>
          )}
        </Button>
      </Modal.Footer>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .pulse-animation {
          animation: pulse 2s ease-in-out infinite;
        }

        .property-card {
          transition: all 0.3s ease;
        }

        .property-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .property-card.selected {
          background-color: rgba(102, 126, 234, 0.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }
      `}</style>
    </Modal>
  );
};

export default MembershipRequestModal;
