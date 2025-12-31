import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { FaCog, FaInfoCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Toast from "../../components/common/Toast";
import "./AdminDashboardModern.css";

const AdminSystemSettings = () => {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <AdminNavbar />
      <div className="dashboard-container">
        <Container fluid>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="d-flex align-items-center mb-4">
              <div className="icon-box-lg bg-primary-soft text-primary rounded-circle me-3">
                <FaCog size={24} />
              </div>
              <div>
                <h2 className="dashboard-title mb-1">General System Settings</h2>
                <p className="text-muted mb-0">Manage global system configurations</p>
              </div>
            </div>

            <Row>
              <Col lg={8}>
                <Card className="modern-card shadow-sm mb-4">
                  <Card.Header className="bg-white border-bottom p-4">
                    <h5 className="mb-0 font-weight-bold">System Configuration</h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Alert variant="info" className="d-flex align-items-start">
                      <FaInfoCircle className="me-2 mt-1" />
                      <div>
                        <strong>Configuration Options</strong>
                        <p className="mb-0 mt-1">
                          General system settings will be available here. For template management, 
                          please use the <strong>Templates</strong> section under System Settings menu.
                        </p>
                      </div>
                    </Alert>

                    {/* Placeholder for future system settings */}
                    <div className="text-center py-5">
                      <FaCog size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">No general settings configured yet</h5>
                      <p className="text-muted small">
                        Additional system configuration options will be added here in future updates.
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col lg={4}>
                <Card className="modern-card shadow-sm bg-primary-soft border-0">
                  <Card.Body className="p-4">
                    <h5 className="text-primary font-weight-bold mb-3">
                      <FaInfoCircle className="me-2" />Quick Links
                    </h5>
                    <ul className="small text-muted ps-3 mb-0">
                      <li className="mb-2">
                        <strong>Templates:</strong> Manage property description templates for different departments
                      </li>
                      <li className="mb-2">
                        <strong>Departments:</strong> Add or manage service departments
                      </li>
                      <li className="mb-2">
                        <strong>Subscriptions:</strong> Configure subscription plans and pricing
                      </li>
                      <li>
                        <strong>Offers & Coupons:</strong> Create promotional offers and discount codes
                      </li>
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </motion.div>
        </Container>
      </div>
    </>
  );
};

export default AdminSystemSettings;
