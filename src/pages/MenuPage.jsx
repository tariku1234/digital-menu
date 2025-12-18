import { Container, Row, Col, Nav, Navbar, Form, FormControl, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../img/addisMenu.jpg";
import "./MenuPage.css";

export default function MenuPage() {
  return (
    <div className="menu-root">
      {/* ===== TOP NAVBAR ===== */}
      <Navbar expand="lg" className="menu-navbar sticky-top">
        <Container fluid>
          <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold">
            <div className="logo-box"></div>
            Addis Menu
          </Navbar.Brand>

          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="mx-auto menu-links">
              <Nav.Link href="#drinks">🍹 Drinks</Nav.Link>
              <Nav.Link href="#breakfast">🍳 Breakfast</Nav.Link>
              <Nav.Link href="#lunch">🥗 Lunch</Nav.Link>
              <Nav.Link href="#dinner">🍽️ Dinner</Nav.Link>
              <Nav.Link href="#desserts">🍰 Desserts</Nav.Link>
            </Nav>

            <Form className="d-flex menu-search">
              <FormControl
                type="search"
                placeholder="Search dishes..."
                className="search-input"
              />
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* ===== SCROLLABLE CONTENT WRAPPER ===== */}
      <div className="menu-content-wrapper">
        <Container fluid className="menu-body">
          <Row className="g-4">
            <Col lg={6} id="breakfast">
              <div className="menu-card">
                <h2>Breakfast</h2>
                <p className="text-muted">Freshly prepared to start your day right.</p>

                <MenuItem name="Classic Pancakes" price="$12.50" />
                <MenuItem name="Avocado Toast" price="$14.00" />
                <MenuItem name="Full English Breakfast" price="$18.00" />
                <MenuItem name="Berry Smoothie Bowl" price="$11.50" />
              </div>
            </Col>

            <Col lg={6} id="lunch">
              <div className="menu-card">
                <h2>Lunch</h2>
                <p className="text-muted">Delicious and satisfying midday meals.</p>

                <MenuItem name="Quinoa & Veggie Salad" price="$15.00" />
                <MenuItem name="Margherita Pizza" price="$16.50" />
                <MenuItem name="Grilled Chicken Sandwich" price="$17.00" />
              </div>
            </Col>
          </Row>

          <div className="text-center mt-5">
            {/* Only style the button locally for Menu page */}
            <Link to="/payment">
              <Button className="primary-btn-menu">Proceed to Payment</Button>
            </Link>
          </div>
        </Container>
      </div>
    </div>
  );
}

function MenuItem({ name, price }) {
  return (
    <div className="menu-item">
      <div>
        <strong>{name}</strong>
        <div className="price">{price}</div>
      </div>
      <Button className="add-btn">+</Button>
    </div>
  );
}
