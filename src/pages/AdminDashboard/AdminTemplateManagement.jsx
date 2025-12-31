import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { FaSave, FaFileAlt, FaInfoCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Toast from "../../components/common/Toast";
import { fetchSystemSettings, saveSystemSettings, fetchDepartments } from "../../api";
import "./AdminDashboardModern.css";

const AdminTemplateManagement = () => {
  const [departments, setDepartments] = useState([]);
  const defaultDepts = ["Hotel", "Cab", "Hospital", "Salon"]; 
  const [selectedDepartment, setSelectedDepartment] = useState("Hotel");
  const [loading, setLoading] = useState(false);
  
  const [templates, setTemplates] = useState({
    template1: "",
    template2: "",
    template3: ""
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      loadSettings(selectedDepartment);
    }
  }, [selectedDepartment]);

  const loadDepartments = async () => {
    try {
      const depts = await fetchDepartments();
      if (depts && depts.length > 0) {
        setDepartments(depts.map(d => d.name));
      } else {
        setDepartments(defaultDepts);
      }
    } catch (error) {
      console.error("Error loading departments, using defaults", error);
      setDepartments(defaultDepts);
    }
  };

  const loadSettings = async (dept) => {
    setLoading(true);
    try {
      const settings = await fetchSystemSettings(dept);
      
      const newTemplates = { template1: "", template2: "", template3: "" };
      
      settings.forEach(setting => {
        if (setting.settingKey === `${dept}_desc_1`) newTemplates.template1 = setting.settingValue;
        if (setting.settingKey === `${dept}_desc_2`) newTemplates.template2 = setting.settingValue;
        if (setting.settingKey === `${dept}_desc_3`) newTemplates.template3 = setting.settingValue;
      });
      
      setTemplates(newTemplates);
    } catch (error) {
      console.error("Error loading settings:", error);
      Toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const settingsToSave = [
        { settingKey: `${selectedDepartment}_desc_1`, settingValue: templates.template1, settingType: "STRING" },
        { settingKey: `${selectedDepartment}_desc_2`, settingValue: templates.template2, settingType: "STRING" },
        { settingKey: `${selectedDepartment}_desc_3`, settingValue: templates.template3, settingType: "STRING" }
      ];

      await saveSystemSettings(settingsToSave);
      Toast.success("Templates saved successfully!");
    } catch (error) {
      console.error("Error saving templates:", error);
      Toast.error("Failed to save templates");
    } finally {
      setLoading(false);
    }
  };

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
                <FaFileAlt size={24} />
              </div>
              <div>
                <h2 className="dashboard-title mb-1">Template Management</h2>
                <p className="text-muted mb-0">Manage property description templates for each department</p>
              </div>
            </div>

            <Row>
              <Col lg={8}>
                <Card className="modern-card shadow-sm mb-4">
                  <Card.Header className="bg-white border-bottom p-4">
                    <h5 className="mb-0 font-weight-bold">Property Description Templates</h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Form>
                      <Form.Group className="mb-4">
                        <Form.Label className="font-weight-bold text-dark">Select Department</Form.Label>
                        <Form.Select 
                          value={selectedDepartment} 
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                          className="form-control-modern"
                        >
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          <FaInfoCircle className="me-1" />
                          Configure templates specifically for {selectedDepartment} properties
                        </Form.Text>
                      </Form.Group>

                      <hr className="my-4 border-light" />

                      {[1, 2, 3].map(num => (
                        <Form.Group className="mb-4" key={num}>
                          <Form.Label className="font-weight-bold">Description Template {num}</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            value={templates[`template${num}`]}
                            onChange={(e) => setTemplates({...templates, [`template${num}`]: e.target.value})}
                            placeholder={`Enter standard description text for Template ${num}...`}
                            className="form-control-modern"
                          />
                        </Form.Group>
                      ))}

                      <div className="d-flex justify-content-end mt-4">
                        <Button 
                          variant="primary" 
                          className="btn-modern btn-primary-modern px-5"
                          onClick={handleSave}
                          disabled={loading}
                        >
                          {loading ? "Saving..." : <><FaSave className="me-2" /> Save Templates</>}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col lg={4}>
                <Card className="modern-card shadow-sm bg-primary-soft border-0">
                  <Card.Body className="p-4">
                    <h5 className="text-primary font-weight-bold mb-3"><FaInfoCircle className="me-2" />Help & Tips</h5>
                    <p className="small text-muted mb-3">
                      These templates will be available to Hosts when they add a new property under the <strong>{selectedDepartment}</strong> department.
                    </p>
                    <ul className="small text-muted ps-3 mb-0">
                      <li className="mb-2">Click on a Department to load its specific templates.</li>
                      <li className="mb-2">Ensure descriptions are generic enough to be reused but specific enough to be useful.</li>
                      <li className="mb-2">Hosts can select from these templates or write custom descriptions.</li>
                      <li>Changes are applied immediately after saving.</li>
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

export default AdminTemplateManagement;
