"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap"
import { useAuth } from "../context/AuthContext"
import { getRestaurantById, updateRestaurant } from "../services/restaurant.service"
import AdminNavbar from "../components/AdminNavbar"
import "./AdminPage.css"

export default function AdminPage() {
  const { currentUser } = useAuth()
  const [restaurantId, setRestaurantId] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    cuisineType: "",
  })
  const [logoFile, setLogoFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const storedRestaurantId = localStorage.getItem("selectedRestaurantId")
    if (storedRestaurantId) {
      setRestaurantId(storedRestaurantId)
      loadRestaurant(storedRestaurantId)
    } else {
      setLoading(false)
    }
  }, [])

  const loadRestaurant = async (restId) => {
    const result = await getRestaurantById(restId)
    if (result.success) {
      setRestaurant(result.restaurant)
      setFormData({
        name: result.restaurant.name || "",
        address: result.restaurant.address || "",
        phone: result.restaurant.phone || "",
        email: result.restaurant.email || "",
        description: result.restaurant.description || "",
        cuisineType: result.restaurant.cuisineType || "",
      })
    }
    setLoading(false)
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const result = await updateRestaurant(restaurantId, formData, logoFile, coverFile)

    if (result.success) {
      alert("Restaurant updated successfully!")
      await loadRestaurant(restaurantId)
      setLogoFile(null)
      setCoverFile(null)
    } else {
      alert("Error updating restaurant: " + result.error)
    }

    setSaving(false)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!restaurantId) {
    return (
      <>
        <AdminNavbar />
        <Container className="py-5">
          <Card className="text-center">
            <Card.Body>
              <h3>No Restaurant Selected</h3>
              <p>Please select a restaurant from the restaurant management page.</p>
              <Button href="/admin/restaurants">Go to Restaurants</Button>
            </Card.Body>
          </Card>
        </Container>
      </>
    )
  }

  return (
    <>
      <AdminNavbar />
      <div className="admin-root">
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
                  {restaurant?.logo ? (
                    <img
                      src={restaurant.logo || "/placeholder.svg"}
                      alt="Logo"
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginBottom: "1rem",
                      }}
                    />
                  ) : (
                    <div className="logo-circle" />
                  )}
                  <Form.Control type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                  <Form.Text className="text-muted">Square image recommended</Form.Text>
                </Card.Body>
              </Card>
            </Col>

            {/* Form Section */}
            <Col md={8}>
              <Card className="card-alt">
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Restaurant Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter restaurant name"
                      />
                    </Form.Group>

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

                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your restaurant"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter address"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="restaurant@example.com"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Cover Image</Form.Label>
                      <Form.Control type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} />
                      <Form.Text className="text-muted">16:9 ratio recommended for best display</Form.Text>
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-3 flex-wrap">
                      <Button variant="secondary" href="/admin/restaurants">
                        Cancel
                      </Button>
                      <Button type="submit" className="btn-save" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  )
}
