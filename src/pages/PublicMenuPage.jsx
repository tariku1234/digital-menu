"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert,
  Navbar,
  Nav,
  Form,
  Button,
  Modal,
  ListGroup,
} from "react-bootstrap"
import { getRestaurantById } from "../services/restaurant.service"
import { getMenuSections, getMenuItems } from "../services/restaurant.service"
import { trackQRScan } from "../services/qrcode.service"
import { createOrder } from "../services/order.service"
import { useCart } from "../context/CartContext"
import "./PublicMenuPage.css"

export default function PublicMenuPage() {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const {
    addToCart,
    cartItems,
    getCartTotal,
    updateQuantity,
    removeFromCart,
    customerName,
    setCustomerName,
    clearCart,
  } = useCart()
  const [restaurant, setRestaurant] = useState(null)
  const [sections, setSections] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeSection, setActiveSection] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCart, setShowCart] = useState(false)
  const [submittingOrder, setSubmittingOrder] = useState(false)

  useEffect(() => {
    if (restaurantId) {
      loadMenuData()
      // Track QR scan
      trackQRScan(restaurantId)
    }
  }, [restaurantId])

  const loadMenuData = async () => {
    setLoading(true)

    try {
      // Load restaurant
      const restResult = await getRestaurantById(restaurantId)
      if (restResult.success) {
        setRestaurant(restResult.restaurant)
      } else {
        setError("Restaurant not found")
        setLoading(false)
        return
      }

      // Load sections
      const sectionsResult = await getMenuSections(restaurantId)
      if (sectionsResult.success) {
        setSections(sectionsResult.sections)
        if (sectionsResult.sections.length > 0) {
          setActiveSection(sectionsResult.sections[0].id)
        }
      }

      // Load menu items
      const itemsResult = await getMenuItems(restaurantId)
      if (itemsResult.success) {
        // Filter only available items
        const availableItems = itemsResult.items.filter((item) => item.isAvailable)
        setMenuItems(availableItems)
      }
    } catch (err) {
      setError("Failed to load menu")
    }

    setLoading(false)
  }

  const getItemsForSection = (sectionId) => {
    let items = menuItems.filter((item) => item.sectionId === sectionId)

    // Apply search filter
    if (searchTerm) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return items
  }

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId)
    // Scroll to section
    const element = document.getElementById(`section-${sectionId}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      alert("Please enter your name")
      return
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty")
      return
    }

    setSubmittingOrder(true)

    try {
      const orderData = {
        restaurantId,
        customerInfo: {
          name: customerName,
        },
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: getCartTotal(),
        status: "pending",
      }

      const result = await createOrder(orderData)

      if (result.success) {
        // Store order ID in localStorage for tracking
        localStorage.setItem("currentOrderId", result.orderId)
        localStorage.setItem("currentOrderRestaurantId", restaurantId)

        // Clear cart
        clearCart()

        // Navigate to tracking page
        navigate(`/order-tracking/${result.orderId}`)
      } else {
        alert("Failed to place order: " + result.error)
      }
    } catch (err) {
      console.error("Order submission error:", err)
      alert("Failed to place order. Please try again.")
    }

    setSubmittingOrder(false)
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <Alert variant="danger">
          <Alert.Heading>Menu Not Found</Alert.Heading>
          <p>{error || "The restaurant menu you're looking for doesn't exist."}</p>
        </Alert>
      </div>
    )
  }

  return (
    <div className="public-menu-page">
      {/* Header */}
      <div className="menu-header">
        {restaurant.coverImage && (
          <div className="cover-image" style={{ backgroundImage: `url(${restaurant.coverImage})` }} />
        )}
        <Container>
          <div className="restaurant-info">
            {restaurant.logo && (
              <img src={restaurant.logo || "/placeholder.svg"} alt={restaurant.name} className="restaurant-logo" />
            )}
            <div>
              <h1 className="restaurant-name">{restaurant.name}</h1>
              {restaurant.cuisineType && <p className="cuisine-type">{restaurant.cuisineType}</p>}
              {restaurant.description && <p className="restaurant-description">{restaurant.description}</p>}
              <div className="restaurant-contact">
                {restaurant.address && (
                  <span>
                    <i className="bi bi-geo-alt me-1"></i>
                    {restaurant.address}
                  </span>
                )}
                {restaurant.phone && (
                  <span className="ms-3">
                    <i className="bi bi-telephone me-1"></i>
                    {restaurant.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Navigation Bar */}
      <Navbar bg="white" className="menu-nav sticky-top shadow-sm">
        <Container>
          <Nav className="me-auto">
            {sections.map((section) => (
              <Nav.Link
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={activeSection === section.id ? "active" : ""}
              >
                {section.name}
              </Nav.Link>
            ))}
          </Nav>
          <Form className="d-flex">
            <Form.Control
              type="search"
              placeholder="Search menu..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form>
        </Container>
      </Navbar>

      {/* Menu Content */}
      <Container className="py-4">
        {sections.length === 0 ? (
          <Alert variant="info" className="text-center">
            <p className="mb-0">Menu coming soon! Please check back later.</p>
          </Alert>
        ) : (
          sections.map((section) => {
            const sectionItems = getItemsForSection(section.id)

            // Skip empty sections when searching
            if (searchTerm && sectionItems.length === 0) {
              return null
            }

            return (
              <div key={section.id} id={`section-${section.id}`} className="menu-section mb-5">
                <div className="section-header mb-4">
                  <h2 className="section-title">{section.name}</h2>
                  {section.description && <p className="section-description text-muted">{section.description}</p>}
                </div>

                {sectionItems.length === 0 ? (
                  <p className="text-muted text-center py-3">No items available in this section</p>
                ) : (
                  <Row className="g-4">
                    {sectionItems.map((item) => (
                      <Col key={item.id} md={6} lg={4}>
                        <Card className="menu-item-card h-100 shadow-sm border-0">
                          {item.image && (
                            <div className="menu-item-image" style={{ backgroundImage: `url(${item.image})` }} />
                          )}
                          <Card.Body className="d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="item-name mb-0">{item.name}</h5>
                              <span className="item-price fw-bold text-primary">${item.price.toFixed(2)}</span>
                            </div>

                            {item.description && (
                              <p className="item-description text-muted small flex-grow-1">{item.description}</p>
                            )}

                            {/* Dietary Tags */}
                            <div className="dietary-tags mb-2">
                              {item.isVegetarian && (
                                <Badge bg="success" className="me-1">
                                  Vegetarian
                                </Badge>
                              )}
                              {item.isVegan && (
                                <Badge bg="success" className="me-1">
                                  Vegan
                                </Badge>
                              )}
                              {item.isGlutenFree && (
                                <Badge bg="info" className="me-1">
                                  Gluten Free
                                </Badge>
                              )}
                              {item.spicyLevel > 0 && (
                                <Badge bg="danger" className="me-1">
                                  {"🌶️".repeat(item.spicyLevel)}
                                </Badge>
                              )}
                            </div>

                            {/* Ingredients */}
                            {item.ingredients && item.ingredients.length > 0 && (
                              <div className="ingredients">
                                <small className="text-muted">
                                  <i className="bi bi-circle-fill me-1" style={{ fontSize: "6px" }}></i>
                                  {item.ingredients.join(", ")}
                                </small>
                              </div>
                            )}

                            {/* Add to Cart button */}
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="mt-3 w-100 rounded-pill"
                              onClick={() => addToCart(item, restaurantId)}
                            >
                              <i className="bi bi-plus-lg me-1"></i> Add to Cart
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            )
          })
        )}

        {searchTerm &&
          menuItems.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
            <Alert variant="warning" className="text-center">
              No menu items found matching "{searchTerm}"
            </Alert>
          )}
      </Container>

      {/* Floating Cart Button */}
      {cartItems.length > 0 && (
        <div className="floating-cart-btn" onClick={() => setShowCart(true)}>
          <div className="cart-badge">{cartItems.reduce((a, b) => a + b.quantity, 0)}</div>
          <i className="bi bi-cart3"></i>
          <span className="ms-2 d-none d-sm-inline">View Cart • ${getCartTotal().toFixed(2)}</span>
        </div>
      )}

      {/* Cart Modal */}
      <Modal show={showCart} onHide={() => setShowCart(false)} centered scrollable>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Your Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-4">
            <Form.Label className="small text-muted">Your Name (to call your order)</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="rounded-pill"
            />
          </Form.Group>

          <ListGroup variant="flush">
            {cartItems.map((item) => (
              <ListGroup.Item key={item.id} className="px-0 py-3 border-0 border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="mb-0">{item.name}</h6>
                    <span className="text-muted small">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Button
                      variant="light"
                      size="sm"
                      className="rounded-circle p-0"
                      style={{ width: "28px", height: "28px" }}
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <i className="bi bi-dash"></i>
                    </Button>
                    <span className="mx-3 fw-bold">{item.quantity}</span>
                    <Button
                      variant="light"
                      size="sm"
                      className="rounded-circle p-0"
                      style={{ width: "28px", height: "28px" }}
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <i className="bi bi-plus"></i>
                    </Button>
                    <Button variant="link" className="text-danger ms-2 p-0" onClick={() => removeFromCart(item.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer className="border-0 flex-column">
          <div className="d-flex justify-content-between w-100 mb-3 px-2">
            <span className="fw-bold fs-5">Total</span>
            <span className="fw-bold fs-5 text-primary">${getCartTotal().toFixed(2)}</span>
          </div>
          <Button
            variant="primary"
            className="w-100 py-2 rounded-pill fw-bold"
            disabled={!customerName || submittingOrder}
            onClick={handlePlaceOrder}
          >
            {submittingOrder ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Placing Order...
              </>
            ) : customerName ? (
              "Place Order"
            ) : (
              "Please enter your name"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Footer */}
      <footer className="menu-footer text-center py-4 bg-light mt-5">
        <Container>
          <p className="mb-2">
            <strong>{restaurant.name}</strong>
          </p>
          {restaurant.email && (
            <p className="small text-muted mb-0">
              <i className="bi bi-envelope me-1"></i>
              {restaurant.email}
            </p>
          )}
          <p className="small text-muted mt-2">Powered by MenuFlow</p>
        </Container>
      </footer>
    </div>
  )
}
