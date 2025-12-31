import React from "react";
import { Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUserShield, FaUserTie, FaUser } from "react-icons/fa";

const UNSPLASH_IMAGE =
  "https://www.lademeureduparc.fr/wp-content/uploads/2024/05/Voyage-solo-en-securite-astuces-indispensables-pour-profiter-pleinement.png";

const BACKGROUND_IMAGE =
  "https://static.vecteezy.com/system/resources/previews/046/046/343/non_2x/wooden-deck-overlooking-ocean-free-photo.jpeg";

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const styles = `
.role-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 6px 22px rgba(0,0,0,0.2);
  transition: 0.3s ease;
}
`;

const SignIn = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{styles}</style>

      <div
        style={{
          backgroundImage: `linear-gradient(
            rgba(0, 0, 0, 0.35),
            rgba(0, 0, 0, 0.35)
          ), url(${BACKGROUND_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <Card className="shadow p-0 rounded-4" style={{ border: "none" }}>
                <div className="d-flex flex-row" style={{ minHeight: "420px" }}>
                  {/* LEFT IMAGE */}
                  <div
                    className="d-none d-md-block"
                    style={{ flex: 1, background: "#f7eee7" }}
                  >
                    <img
                      className="img-animate"
                      src={UNSPLASH_IMAGE}
                      alt="Hotel"
                      style={imageStyle}
                    />
                  </div>

                  {/* RIGHT SIDE */}
                  <div
                    style={{
                      flex: 1,
                      padding: "30px",
                      background: "white",
                    }}
                  >
                    <h2
                      className="text-center mb-3"
                      style={{ fontWeight: "700", color: "#482b1b" }}
                    >
                      Select Your Role
                    </h2>

                    <Row className="mt-4 g-3">
                      {/* ADMIN */}
                      <Col xs={12}>
                        <Card
                          className="role-card p-3 rounded-3"
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate("/admin-login")}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <FaUserShield size={40} color="#de5c06ff" />
                            <div>
                              <h5 className="mb-0">Admin</h5>
                              <small>System controlS & management</small>
                            </div>
                          </div>
                        </Card>
                      </Col>

                      {/* HOST */}
                      <Col xs={12}>
                        <Card
                          className="role-card p-3 rounded-3"
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate("/host-login")}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <FaUserTie size={40} color="#de5c06ff" />
                            <div>
                              <h5 className="mb-0">Host</h5>
                              <small>Manage your hotel listings</small>
                            </div>
                          </div>
                        </Card>
                      </Col>

                      {/* USER */}
                      <Col xs={12}>
                        <Card
                          className="role-card p-3 rounded-3"
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate("/user-login")}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <FaUser size={40} color="#de5c06ff" />
                            <div>
                              <h5 className="mb-0">User</h5>
                              <small>Continue to booking</small>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default SignIn;
