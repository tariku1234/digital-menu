"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Badge, Button, Alert, Modal, Form, Spinner } from "react-bootstrap"
import { useAuth } from "../context/AuthContext"
import { updateOrderStatus } from "../services/order.service"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "../services/firebase.service"
import AdminNavbar from "../components/AdminNavbar"
import "./OrderManagementPage.css"

export default function OrderManagementPage() {
  const { userProfile, createKitchenManager } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [updating, setUpdating] = useState(null)
  const [showAddKitchenManager, setShowAddKitchenManager] = useState(false)
  const [kitchenManagerForm, setKitchenManagerForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [creatingManager, setCreatingManager] = useState(false)

  const restaurantId = localStorage.getItem("selectedRestaurantId")

  useEffect(() => {
    if (restaurantId) {
      setLoading(true)
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, where("restaurantId", "==", restaurantId), orderBy("createdAt", "desc"))

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedOrders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setOrders(fetchedOrders)
          setLoading(false)
        },
        (err) => {
          console.error("Error listening to restaurant orders:", err)
          setError("Failed to load orders in real-time.")
          setLoading(false)
        },
      )

      return () => unsubscribe()
    }
  }, [restaurantId])

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId)
    const result = await updateOrderStatus(orderId, newStatus)
    if (result.success) {
      // Real-time update handled by onSnapshot, no need to reload orders
    } else {
      setError("Failed to update order: " + result.error)
    }
    setUpdating(null)
  }

  const handleAddKitchenManager = async (e) => {
    e.preventDefault()

    if (kitchenManagerForm.password !== kitchenManagerForm.confirmPassword) {
      setError("Passwords do not match!")
      return
    }

    setCreatingManager(true)
    setError(null)

    const result = await createKitchenManager(
      kitchenManagerForm.email,
      kitchenManagerForm.password,
      {
        fullName: kitchenManagerForm.fullName,
        phone: kitchenManagerForm.phone,
      },
      restaurantId,
    )

    if (result.success) {
      alert("Kitchen manager created successfully!")
      setKitchenManagerForm({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      })
      setShowAddKitchenManager(false)
    } else {
      setError("Failed to create kitchen manager: " + result.error)
    }

    setCreatingManager(false)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning">Pending</Badge>
      case "preparing":
        return <Badge bg="info">Preparing</Badge>
      case "completed":
        return <Badge bg="success">Completed</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: "preparing",
      preparing: "completed",
      completed: null,
    }
    return statusFlow[currentStatus]
  }

  const filteredOrders = filterStatus === "all" ? orders : orders.filter((order) => order.status === filterStatus)

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="order-mgmt-root">
          <Container className="py-5 text-center">
            <Spinner animation="border" />
            <p className="mt-3">Loading orders...</p>
          </Container>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminNavbar />
      <div className="order-mgmt-root">
        <Container className="py-5">
          {/* Header */}
          <Row className="mb-4">
            <Col md={8}>
              <h1>Order Management</h1>
              <p>Monitor and manage all incoming orders</p>
            </Col>
            <Col md={4} className="d-flex align-items-end justify-content-end">
              <Button className="btn-add-manager" onClick={() => setShowAddKitchenManager(true)}>
                + Add Kitchen Manager
              </Button>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}

          {/* Filter Tabs */}
          <Row className="mb-4">
            <Col>
              <div className="filter-tabs">
                <Button
                  variant={filterStatus === "all" ? "dark" : "light"}
                  onClick={() => setFilterStatus("all")}
                  className="filter-btn"
                >
                  All Orders ({orders.length})
                </Button>
                <Button
                  variant={filterStatus === "pending" ? "dark" : "light"}
                  onClick={() => setFilterStatus("pending")}
                  className="filter-btn"
                >
                  Pending ({orders.filter((o) => o.status === "pending").length})
                </Button>
                <Button
                  variant={filterStatus === "preparing" ? "dark" : "light"}
                  onClick={() => setFilterStatus("preparing")}
                  className="filter-btn"
                >
                  Preparing ({orders.filter((o) => o.status === "preparing").length})
                </Button>
                <Button
                  variant={filterStatus === "completed" ? "dark" : "light"}
                  onClick={() => setFilterStatus("completed")}
                  className="filter-btn"
                >
                  Completed ({orders.filter((o) => o.status === "completed").length})
                </Button>
              </div>
            </Col>
          </Row>

          {filteredOrders.length === 0 ? (
            <Card className="card-alt text-center">
              <Card.Body className="py-5">
                <h5>No orders found</h5>
                <p className="text-muted">Orders will appear here when customers place them.</p>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {filteredOrders.map((order) => (
                <Col lg={6} className="mb-4" key={order.id}>
                  <Card className="card-alt order-card">
                    <Card.Body>
                      {/* Order Header */}
                      <div className="order-header mb-3">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h6 className="order-id mb-0">Order #{order.id.slice(-6).toUpperCase()}</h6>
                            {order.tableNumber && (
                              <Badge bg="primary" className="table-badge">
                                <i className="bi bi-table me-1"></i>
                                Table {order.tableNumber}
                              </Badge>
                            )}
                          </div>
                          <small className="text-muted">{new Date(order.createdAt?.toDate?.()).toLocaleString()}</small>
                        </div>
                        <div>{getStatusBadge(order.status)}</div>
                      </div>

                      {/* Items */}
                      <div className="order-items mb-3">
                        <h6 className="mb-2">Items:</h6>
                        {order.items && order.items.length > 0 ? (
                          <ul className="items-list">
                            {order.items.map((item, idx) => (
                              <li key={idx}>
                                <span>{item.name || item.itemName}</span>
                                <span className="item-qty">x{item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">No items specified</p>
                        )}
                      </div>

                      {/* Customer Info */}
                      {order.customerInfo && (
                        <div className="customer-info mb-3">
                          <h6>Customer:</h6>
                          <p className="mb-1">
                            <strong>{order.customerInfo.name || "Guest"}</strong>
                          </p>
                          <p className="mb-0 text-muted">{order.customerInfo.phone || "N/A"}</p>
                        </div>
                      )}

                      {/* Special Instructions */}
                      {order.specialInstructions && (
                        <div className="order-notes mb-3">
                          <h6>Notes:</h6>
                          <p className="notes-text">{order.specialInstructions}</p>
                        </div>
                      )}

                      {/* Action Button */}
                      {order.status !== "completed" && getNextStatus(order.status) && (
                        <div className="order-actions">
                          <Button
                            className="btn-update-status"
                            onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status))}
                            disabled={updating === order.id}
                          >
                            {updating === order.id ? (
                              <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Updating...
                              </>
                            ) : (
                              `Mark as ${getNextStatus(order.status).charAt(0).toUpperCase() + getNextStatus(order.status).slice(1)}`
                            )}
                          </Button>
                        </div>
                      )}

                      {order.status === "completed" && (
                        <div className="order-completed">
                          <p className="text-success">✓ Order Completed</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>

      {/* Add Kitchen Manager Modal */}
      <Modal show={showAddKitchenManager} onHide={() => setShowAddKitchenManager(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Kitchen Manager</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddKitchenManager}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={kitchenManagerForm.fullName}
                onChange={(e) =>
                  setKitchenManagerForm({
                    ...kitchenManagerForm,
                    fullName: e.target.value,
                  })
                }
                placeholder="Enter full name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={kitchenManagerForm.email}
                onChange={(e) =>
                  setKitchenManagerForm({
                    ...kitchenManagerForm,
                    email: e.target.value,
                  })
                }
                placeholder="kitchen.manager@example.com"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                value={kitchenManagerForm.phone}
                onChange={(e) =>
                  setKitchenManagerForm({
                    ...kitchenManagerForm,
                    phone: e.target.value,
                  })
                }
                placeholder="Enter phone number"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={kitchenManagerForm.password}
                onChange={(e) =>
                  setKitchenManagerForm({
                    ...kitchenManagerForm,
                    password: e.target.value,
                  })
                }
                placeholder="Enter password"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={kitchenManagerForm.confirmPassword}
                onChange={(e) =>
                  setKitchenManagerForm({
                    ...kitchenManagerForm,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm password"
                required
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={() => setShowAddKitchenManager(false)}>
                Cancel
              </Button>
              <Button className="btn-save" type="submit" disabled={creatingManager}>
                {creatingManager ? "Creating..." : "Create Manager"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )
}
