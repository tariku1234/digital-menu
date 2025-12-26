"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Button, Card, Spinner, Alert, Form, Badge, Modal } from "react-bootstrap"
import { useAuth } from "../context/AuthContext"
import { getRestaurantById } from "../services/restaurant.service"
import {
  getRestaurantQRCodes,
  generateTableQRCodeBatch,
  deleteRestaurantQRCodes,
  downloadQRCode,
} from "../services/qrcode.service"
import AdminNavbar from "../components/AdminNavbar"
import "./AdminQRPage.css"

export default function AdminQRPage() {
  const { currentUser } = useAuth()
  const [restaurantId, setRestaurantId] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [qrCodes, setQrCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [tableCount, setTableCount] = useState(10)

  useEffect(() => {
    const storedRestaurantId = localStorage.getItem("selectedRestaurantId")
    if (storedRestaurantId) {
      setRestaurantId(storedRestaurantId)
      loadQRData(storedRestaurantId)
    } else {
      setError("Please select a restaurant first")
      setLoading(false)
    }
  }, [])

  const loadQRData = async (restId) => {
    setLoading(true)

    // Load restaurant details
    const restResult = await getRestaurantById(restId)
    if (restResult.success) {
      setRestaurant(restResult.restaurant)
    }

    const qrResult = await getRestaurantQRCodes(restId)
    if (qrResult.success) {
      setQrCodes(qrResult.qrCodes)
    }

    setLoading(false)
  }

  const handleGenerateBatch = async () => {
    if (!restaurant || tableCount < 1) return

    setGenerating(true)
    setError("")
    setSuccess("")
    setShowGenerateModal(false)

    // Delete existing QR codes first
    await deleteRestaurantQRCodes(restaurantId)

    const result = await generateTableQRCodeBatch(restaurantId, restaurant.name, tableCount)

    if (result.success) {
      setSuccess(`Successfully generated ${result.totalGenerated} QR codes!`)
      await loadQRData(restaurantId)
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(`Generated ${result.totalGenerated} QR codes, but ${result.totalFailed} failed.`)
    }

    setGenerating(false)
  }

  const handleDownloadPNG = (qrCode) => {
    if (qrCode?.qrCodeDataUrl) {
      downloadQRCode(qrCode.qrCodeDataUrl, `${restaurant.name}-Table-${qrCode.tableNumber}`)
    }
  }

  const handleDownloadAllPDF = async () => {
    if (qrCodes.length === 0) return

    const { jsPDF } = await import("jspdf")
    const pdf = new jsPDF()

    for (let i = 0; i < qrCodes.length; i++) {
      const qrCode = qrCodes[i]

      if (i > 0) {
        pdf.addPage()
      }

      // Add title
      pdf.setFontSize(20)
      pdf.text(restaurant.name, 105, 30, { align: "center" })

      pdf.setFontSize(16)
      pdf.text(`Table ${qrCode.tableNumber}`, 105, 45, { align: "center" })

      // Add QR code image
      const qrImage = qrCode.qrCodeDataUrl
      pdf.addImage(qrImage, "PNG", 55, 60, 100, 100)

      // Add URL at bottom
      pdf.setFontSize(10)
      pdf.text(qrCode.menuUrl, 105, 175, { align: "center" })
    }

    // Download
    pdf.save(`${restaurant.name}-all-tables-qr-codes.pdf`)
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" />
      </div>
    )
  }

  if (!restaurantId) {
    return (
      <>
        <AdminNavbar />
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <Alert variant="warning">
            <Alert.Heading>No Restaurant Selected</Alert.Heading>
            <p>Please go to the restaurant management page and select a restaurant.</p>
            <Button variant="primary" href="/admin/restaurants">
              Go to Restaurants
            </Button>
          </Alert>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminNavbar />
      <div className="qr-page">
        <Container className="py-5">
          <Row className="mb-4">
            <Col>
              <h1>QR Code Management</h1>
              <p className="text-muted">{restaurant?.name || "Loading..."}</p>
            </Col>
            <Col className="text-end">
              <Button variant="primary" onClick={() => setShowGenerateModal(true)} disabled={generating}>
                <i className="bi bi-plus-circle me-2"></i>
                Generate Table QR Codes
              </Button>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          {generating && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Generating QR codes... This may take a moment.</p>
            </div>
          )}

          {!generating && qrCodes.length > 0 && (
            <>
              <Row className="mb-4">
                <Col>
                  <div className="d-flex gap-3 align-items-center">
                    <Badge bg="secondary" className="px-3 py-2">
                      {qrCodes.length} Tables
                    </Badge>
                    <Button variant="outline-primary" size="sm" onClick={handleDownloadAllPDF}>
                      <i className="bi bi-download me-2"></i>
                      Download All as PDF
                    </Button>
                  </div>
                </Col>
              </Row>

              <Row className="g-4">
                {qrCodes.map((qrCode) => (
                  <Col key={qrCode.id} md={6} lg={4} xl={3}>
                    <Card className="qr-table-card shadow-sm h-100">
                      <Card.Body className="text-center">
                        <h5 className="mb-3">Table {qrCode.tableNumber}</h5>

                        {/* QR Code Display */}
                        <div className="qr-code-preview mb-3">
                          <img
                            src={qrCode.qrCodeDataUrl || qrCode.qrCodeUrl || "/placeholder.svg"}
                            alt={`Table ${qrCode.tableNumber} QR`}
                            className="img-fluid"
                            style={{ maxWidth: "200px" }}
                          />
                        </div>

                        {/* Stats */}
                        <div className="qr-stats mb-3">
                          <small className="text-muted d-block">
                            <i className="bi bi-eye me-1"></i>
                            {qrCode.scans || 0} scans
                          </small>
                        </div>

                        {/* Download Button */}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="w-100"
                          onClick={() => handleDownloadPNG(qrCode)}
                        >
                          <i className="bi bi-download me-2"></i>
                          Download PNG
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          )}

          {!generating && qrCodes.length === 0 && (
            <Card className="text-center py-5">
              <Card.Body>
                <div className="mb-4">
                  <i className="bi bi-qr-code" style={{ fontSize: "4rem", color: "#6c757d" }}></i>
                </div>
                <h3>No QR Codes Yet</h3>
                <p className="text-muted mb-4">
                  Generate QR codes for your restaurant tables so customers can easily access your digital menu.
                </p>
                <Button variant="primary" size="lg" onClick={() => setShowGenerateModal(true)}>
                  <i className="bi bi-qr-code me-2"></i>
                  Generate QR Codes
                </Button>
              </Card.Body>
            </Card>
          )}

          {/* How to Use Section */}
          <Row className="mt-5">
            <Col>
              <h4 className="text-center mb-4">How to Use Table QR Codes</h4>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center step-card">
                <Card.Body>
                  <div className="step-icon mb-3">
                    <i className="bi bi-123"></i>
                  </div>
                  <h5>1. Generate</h5>
                  <p className="text-muted">Specify how many tables you have and generate QR codes for each.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center step-card">
                <Card.Body>
                  <div className="step-icon mb-3">
                    <i className="bi bi-printer"></i>
                  </div>
                  <h5>2. Print & Place</h5>
                  <p className="text-muted">Print each QR code and place them on the corresponding tables.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center step-card">
                <Card.Body>
                  <div className="step-icon mb-3">
                    <i className="bi bi-phone"></i>
                  </div>
                  <h5>3. Track Orders</h5>
                  <p className="text-muted">
                    When customers scan, their orders will include the table number automatically.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal show={showGenerateModal} onHide={() => setShowGenerateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Generate Table QR Codes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>How many tables does your restaurant have?</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="100"
              value={tableCount}
              onChange={(e) => setTableCount(Number.parseInt(e.target.value) || 1)}
            />
            <Form.Text className="text-muted">
              We'll generate a unique QR code for each table (1 to {tableCount}).
            </Form.Text>
          </Form.Group>

          {qrCodes.length > 0 && (
            <Alert variant="warning" className="mt-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              This will replace your existing {qrCodes.length} QR codes.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleGenerateBatch} disabled={tableCount < 1}>
            Generate {tableCount} QR Codes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
