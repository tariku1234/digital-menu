"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import {
  createRestaurant,
  getRestaurantsByOwner,
  updateRestaurant,
  deleteRestaurant,
} from "../services/restaurant.service"
import { Container, Row, Col, Button, Card, Modal, Form, Alert, Spinner } from "react-bootstrap"
import "./RestaurantManagePage.css"

export default function RestaurantManagePage() {
  const { currentUser, userProfile } = useAuth()
  const navigate = useNavigate()

  console.log("[v0] RestaurantManagePage - Component Rendering")
  console.log("[v0] RestaurantManagePage - currentUser:", currentUser?.uid)
  console.log("[v0] RestaurantManagePage - userProfile:", userProfile)

  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    cuisineType: "",
  })
  const [logoFile, setLogoFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Load restaurants on mount
  useEffect(() => {
    console.log("[v0] RestaurantManagePage - useEffect triggered")
    if (currentUser) {
      loadRestaurants()
    } else {
      console.log("[v0] RestaurantManagePage - No currentUser, setting loading to false")
      setLoading(false)
    }
  }, [currentUser])

  const loadRestaurants = async () => {
    try {
      console.log("[v0] RestaurantManagePage - loadRestaurants called for user:", currentUser?.uid)
      setLoading(true)
      const result = await getRestaurantsByOwner(currentUser.uid)

      console.log("[v0] RestaurantManagePage - getRestaurantsByOwner result:", result)

      if (result.success) {
        console.log("[v0] RestaurantManagePage - Successfully loaded", result.restaurants.length, "restaurants")
        setRestaurants(result.restaurants)
      } else {
        console.error("[v0] RestaurantManagePage - Error loading restaurants:", result.error)
        setError(result.error || "Failed to load restaurants")
      }
    } catch (err) {
      console.error("[v0] RestaurantManagePage - Exception in loadRestaurants:", err)
      setError("An unexpected error occurred while loading restaurants")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (restaurant = null) => {
    console.log("[v0] RestaurantManagePage - Opening modal, editing:", restaurant?.id)
    if (restaurant) {
      setEditingRestaurant(restaurant)
      setFormData({
        name: restaurant.name || "",
        description: restaurant.description || "",
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        email: restaurant.email || "",
        cuisineType: restaurant.cuisineType || "",
      })
    } else {
      setEditingRestaurant(null)
      setFormData({
        name: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        cuisineType: "",
      })
    }
    setLogoFile(null)
    setCoverFile(null)
    setShowModal(true)
    setError("")
    setSuccess("")
  }

  const handleCloseModal = () => {
    console.log("[v0] RestaurantManagePage - Closing modal")
    setShowModal(false)
    setEditingRestaurant(null)
    setError("")
    setSuccess("")
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    console.log("[v0] RestaurantManagePage - Submitting form:", {
      ...formData,
      hasLogo: !!logoFile,
      hasCover: !!coverFile,
    })

    try {
      let result

      if (editingRestaurant) {
        console.log("[v0] RestaurantManagePage - Updating restaurant:", editingRestaurant.id)
        result = await updateRestaurant(editingRestaurant.id, formData, logoFile, coverFile)
      } else {
        console.log("[v0] RestaurantManagePage - Creating new restaurant")
        result = await createRestaurant(currentUser.uid, formData, logoFile, coverFile)
      }

      console.log("[v0] RestaurantManagePage - Submit result:", result)

      if (result.success) {
        setSuccess(editingRestaurant ? "Restaurant updated successfully!" : "Restaurant created successfully!")
        await loadRestaurants()
        setTimeout(() => {
          handleCloseModal()
        }, 1500)
      } else {
        setError(result.error || "Failed to save restaurant")
      }
    } catch (err) {
      console.error("[v0] RestaurantManagePage - Error in handleSubmit:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (restaurantId) => {
    if (!window.confirm("Are you sure you want to delete this restaurant? This action cannot be undone.")) {
      return
    }

    console.log("[v0] RestaurantManagePage - Deleting restaurant:", restaurantId)

    try {
      const result = await deleteRestaurant(restaurantId)

      if (result.success) {
        setSuccess("Restaurant deleted successfully!")
        await loadRestaurants()
      } else {
        setError(result.error || "Failed to delete restaurant")
      }
    } catch (err) {
      console.error("[v0] RestaurantManagePage - Error deleting restaurant:", err)
      setError("An error occurred while deleting the restaurant")
    }
  }

  const handleSelectRestaurant = (restaurantId) => {
    console.log("[v0] RestaurantManagePage - Selecting restaurant:", restaurantId)
    localStorage.setItem("selectedRestaurantId", restaurantId)
    navigate("/admin/dashboard")
  }

  console.log("[v0] RestaurantManagePage - Current state:", { loading, restaurantCount: restaurants.length, error })

  if (loading) {
    console.log("[v0] RestaurantManagePage - Rendering loading spinner")
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading restaurants...</span>
        </Spinner>
      </div>
    )
  }

  console.log("[v0] RestaurantManagePage - Rendering main content")

  return (
    <div className="restaurant-manage-page">
      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1>My Restaurants</h1>
                <p className="text-muted">Manage your restaurant profiles and create new branches</p>
              </div>
              <Button variant="primary" size="lg" onClick={() => handleOpenModal()}>
                + Add Restaurant
              </Button>
            </div>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" onClose={() => setSuccess("")} dismissible>
            {success}
          </Alert>
        )}

        {restaurants.length === 0 ? (
          <Card className="text-center py-5">
            <Card.Body>
              <h3>No Restaurants Yet</h3>
              <p className="text-muted">Get started by adding your first restaurant or branch location</p>
              <Button variant="primary" size="lg" onClick={() => handleOpenModal()}>
                Create Your First Restaurant
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {restaurants.map((restaurant) => (
              <Col md={6} lg={4} key={restaurant.id} className="mb-4">
                <Card className="restaurant-card h-100">
                  {restaurant.coverImage && (
                    <div className="restaurant-cover" style={{ backgroundImage: `url(${restaurant.coverImage})` }} />
                  )}
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      {restaurant.logo ? (
                        <img
                          src={restaurant.logo || "/placeholder.svg"}
                          alt={restaurant.name}
                          className="restaurant-logo"
                        />
                      ) : (
                        <div className="restaurant-logo-placeholder">{restaurant.name.charAt(0).toUpperCase()}</div>
                      )}
                      <div className="ms-3 flex-grow-1">
                        <h5 className="mb-1">{restaurant.name}</h5>
                        <small className="text-muted">{restaurant.cuisineType || "Restaurant"}</small>
                      </div>
                    </div>

                    {restaurant.description && <p className="text-muted small mb-3">{restaurant.description}</p>}

                    <div className="mb-3">
                      {restaurant.address && <small className="text-muted d-block mb-1">📍 {restaurant.address}</small>}
                      {restaurant.phone && <small className="text-muted d-block">📞 {restaurant.phone}</small>}
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <span className={`badge ${restaurant.status === "active" ? "bg-success" : "bg-secondary"}`}>
                        {restaurant.status || "active"}
                      </span>
                      {restaurant.subscriptionStatus && (
                        <span className="badge bg-info">{restaurant.subscriptionStatus}</span>
                      )}
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-white">
                    <div className="d-flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => handleSelectRestaurant(restaurant.id)}
                      >
                        Manage Menu
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => handleOpenModal(restaurant)}>
                        Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(restaurant.id)}>
                        Delete
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Add/Edit Restaurant Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingRestaurant ? "Edit Restaurant" : "Add New Restaurant"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Restaurant Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Pizza Palace - Downtown Branch"
                required
              />
              <Form.Text className="text-muted">Include branch location if you have multiple locations</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your restaurant and what makes it special"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cuisine Type</Form.Label>
                  <Form.Control
                    type="text"
                    name="cuisineType"
                    value={formData.cuisineType}
                    onChange={handleInputChange}
                    placeholder="e.g., Italian, Chinese, Ethiopian"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St, City, State, ZIP"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@restaurant.com"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Logo</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                  <Form.Text className="text-muted">Square image recommended (200x200px+)</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cover Image</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} />
                  <Form.Text className="text-muted">Wide image recommended (800x450px+)</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Saving...
                  </>
                ) : editingRestaurant ? (
                  "Update Restaurant"
                ) : (
                  "Create Restaurant"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}
