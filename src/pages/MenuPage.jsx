"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Spinner, Alert, Navbar, Nav } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { getAllRestaurants } from "../services/restaurant.service"
import logo from "../img/addisMenu.jpg"
import "./MenuPage.css"

export default function MenuPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    loadRestaurants()
  }, [])

  const loadRestaurants = async () => {
    setLoading(true)
    setError("")
    try {
      const result = await getAllRestaurants()
      if (result.success) {
        // Filter only active restaurants
        const activeRestaurants = result.restaurants.filter((r) => r.status === "active")
        setRestaurants(activeRestaurants)
      } else {
        setError("Failed to load restaurants")
      }
    } catch (err) {
      console.error("Error loading restaurants:", err)
      setError("An error occurred while loading restaurants")
    } finally {
      setLoading(false)
    }
  }

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/menu/${restaurantId}`)
  }

  return (
    <div className="menu-root">
      {/* ===== TOP NAVBAR ===== */}
      <Navbar expand="lg" className="menu-navbar sticky-top">
        <Container fluid>
          <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold">
            <div className="logo-box">
              <img
                src={logo || "/placeholder.svg"}
                alt="Addis Menu"
                style={{ width: "40px", height: "40px", borderRadius: "4px" }}
              />
            </div>
            Addis Menu
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link href="#about" className="text-dark">
              About
            </Nav.Link>
            <Nav.Link href="#contact" className="text-dark">
              Contact
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      {/* ===== HERO SECTION ===== */}
      <div className="hero-section">
        <Container>
          <div className="text-center hero-content">
            <h1 className="hero-title">Welcome to Addis Menu</h1>
            <p className="hero-subtitle">Discover delicious meals from your favorite restaurants</p>
          </div>
        </Container>
      </div>

      {/* ===== RESTAURANTS SECTION ===== */}
      <div className="restaurants-section">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">Browse Restaurants</h2>
            <p className="section-description">Scan a QR code or select a restaurant below to view their menu</p>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
              <Spinner animation="border" variant="primary" />
            </div>
          ) : error ? (
            <Alert variant="danger" className="text-center">
              <Alert.Heading>Error Loading Restaurants</Alert.Heading>
              <p>{error}</p>
            </Alert>
          ) : restaurants.length === 0 ? (
            <Alert variant="info" className="text-center">
              <p className="mb-0">No restaurants available at the moment. Please check back later.</p>
            </Alert>
          ) : (
            <Row className="g-4">
              {restaurants.map((restaurant) => (
                <Col key={restaurant.id} md={6} lg={4}>
                  <Card
                    className="restaurant-card h-100 cursor-pointer"
                    onClick={() => handleRestaurantClick(restaurant.id)}
                    style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                  >
                    {restaurant.coverImage && (
                      <div
                        className="restaurant-card-image"
                        style={{ backgroundImage: `url(${restaurant.coverImage})` }}
                      />
                    )}

                    {!restaurant.coverImage && <div className="restaurant-card-image-placeholder" />}

                    <Card.Body>
                      <div className="d-flex align-items-start gap-2 mb-3">
                        {restaurant.logo && (
                          <img
                            src={restaurant.logo || "/placeholder.svg"}
                            alt={restaurant.name}
                            className="restaurant-card-logo"
                          />
                        )}
                        <div className="flex-grow-1">
                          <h5 className="card-title mb-1">{restaurant.name}</h5>
                          {restaurant.cuisineType && <p className="cuisine-badge">{restaurant.cuisineType}</p>}
                        </div>
                      </div>

                      {restaurant.description && <p className="card-description">{restaurant.description}</p>}

                      <div className="restaurant-info-footer">
                        {restaurant.address && (
                          <div className="info-item">
                            <i className="bi bi-geo-alt"></i>
                            <span>{restaurant.address}</span>
                          </div>
                        )}
                        {restaurant.phone && (
                          <div className="info-item">
                            <i className="bi bi-telephone"></i>
                            <span>{restaurant.phone}</span>
                          </div>
                        )}
                      </div>
                    </Card.Body>

                    <Card.Footer className="bg-transparent border-top">
                      <button className="view-menu-btn w-100">View Menu</button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="menu-footer">
        <Container>
          <div className="text-center">
            <p className="mb-2">
              <strong>Addis Menu</strong>
            </p>
            <p className="small text-muted">Your gateway to dining at the best restaurants in town</p>
            <p className="small text-muted mt-3">Powered by MenuFlow</p>
          </div>
        </Container>
      </footer>
    </div>
  )
}
