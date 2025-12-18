import React from "react";
import { Container, Row, Col, Form, Button, Card, Navbar, Nav } from "react-bootstrap";
import "./AdminPage.css";

export default function AdminPage() {
  return (
    <div className="admin-root">
      
      {/* Top Navbar */}
      <Navbar expand="lg" className="px-4 navbar-custom">
        <Navbar.Brand href="/" className="fw-bold">
          MenuFlow Admin
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="ms-auto">
            <Nav.Link href="/">Menu</Nav.Link>
            <Nav.Link href="/admin">Admin</Nav.Link>
            <Nav.Link href="#">Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* Page Content */}
      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <h1>Restaurant Profile Settings</h1>
            <p>Manage your restaurant information and branding.</p>
          </Col>
        </Row>

        <Row>
          {/* Logo Section */}
          <Col md={4} className="mb-4">
            <Card className="card-alt h-100">
              <Card.Body className="text-center">
                <h5 className="mb-3">Restaurant Logo</h5>
                <div className="logo-circle" />
                <Button className="btn-upload">
                  Upload Logo
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Form Section */}
          <Col md={8}>
            <Card className="card-alt">
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Restaurant Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter restaurant name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter address"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="Enter phone number"
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-3 flex-wrap">
                    <Button className="btn-cancel">Cancel</Button>
                    <Button className="btn-save">Save Changes</Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
