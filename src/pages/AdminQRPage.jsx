"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Button, Card, Spinner, Alert } from "react-bootstrap"
import { useAuth } from "../context/AuthContext"
import { getRestaurantById } from "../services/restaurant.service"
import { generateQRCode, getQRCode, downloadQRCode } from "../services/qrcode.service"
import AdminNavbar from "../components/AdminNavbar"
import "./AdminQRPage.css"

export default function AdminQRPage() {
  const { currentUser } = useAuth()
  const [restaurantId, setRestaurantId] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

    // Load existing QR code
    const qrResult = await getQRCode(restId)
    if (qrResult.success) {
      setQrCode(qrResult.qrCode)
    }

    setLoading(false)
  }

  const handleGenerateQR = async () => {
    if (!restaurant) return

    setGenerating(true)
    setError("")
    setSuccess("")

    const result = await generateQRCode(restaurantId, restaurant.name)

    if (result.success) {
      setSuccess("QR Code generated successfully!")
      setQrCode({
        qrCodeUrl: result.qrCodeUrl,
        qrCodeDataUrl: result.qrCodeDataUrl,
        menuUrl: result.menuUrl,
      })
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(result.error)
    }

    setGenerating(false)
  }

  const handleDownloadPNG = () => {
    if (qrCode?.qrCodeDataUrl) {
      downloadQRCode(qrCode.qrCodeDataUrl, restaurant.name)
    }
  }

  const handleDownloadPDF = async () => {
    if (!qrCode?.qrCodeDataUrl) return

    // Create a simple PDF with the QR code
    const { jsPDF } = await import("jspdf")
    const pdf = new jsPDF()

    // Add title
    pdf.setFontSize(20)
    pdf.text(restaurant.name, 105, 30, { align: "center" })

    pdf.setFontSize(14)
    pdf.text("Scan to View Menu", 105, 45, { align: "center" })

    // Add QR code image
    const qrImage = qrCode.qrCodeDataUrl
    pdf.addImage(qrImage, "PNG", 55, 60, 100, 100)

    // Add URL at bottom
    pdf.setFontSize(10)
    pdf.text(qrCode.menuUrl, 105, 175, { align: "center" })

    // Download
    pdf.save(`${restaurant.name}-qr-code.pdf`)
  }

  const handleCopyLink = () => {
    if (qrCode?.menuUrl) {
      navigator.clipboard.writeText(qrCode.menuUrl)
      setSuccess("Menu link copied to clipboard!")
      setTimeout(() => setSuccess(""), 3000)
    }
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

          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              {qrCode ? (
                <Card className="qr-card shadow">
                  <Card.Body className="text-center p-5">
                    <h3 className="mb-4">Your Restaurant QR Code</h3>

                    {/* QR Code Display */}
                    <div className="qr-code-display mb-4">
                      <img
                        src={qrCode.qrCodeDataUrl || qrCode.qrCodeUrl || "/placeholder.svg"}
                        alt="QR Code"
                        className="qr-code-image"
                      />
                    </div>

                    {/* Menu URL */}
                    <div className="mb-4">
                      <small className="text-muted">Menu URL:</small>
                      <div className="d-flex align-items-center justify-content-center gap-2 mt-1">
                        <code className="bg-light p-2 rounded">{qrCode.menuUrl}</code>
                        <Button variant="outline-secondary" size="sm" onClick={handleCopyLink}>
                          <i className="bi bi-clipboard"></i>
                        </Button>
                      </div>
                    </div>

                    {/* Download Buttons */}
                    <div className="d-flex gap-3 justify-content-center mb-4">
                      <Button variant="primary" onClick={handleDownloadPNG}>
                        <i className="bi bi-download me-2"></i>
                        Download PNG
                      </Button>
                      <Button variant="outline-primary" onClick={handleDownloadPDF}>
                        <i className="bi bi-file-pdf me-2"></i>
                        Download PDF
                      </Button>
                    </div>

                    {/* Regenerate Button */}
                    <Button variant="outline-secondary" size="sm" onClick={handleGenerateQR} disabled={generating}>
                      {generating ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-arrow-clockwise me-2"></i>
                          Regenerate QR Code
                        </>
                      )}
                    </Button>

                    {/* Stats */}
                    {qrCode.scans !== undefined && (
                      <div className="mt-4 pt-4 border-top">
                        <div className="d-flex justify-content-around">
                          <div>
                            <h4 className="mb-0">{qrCode.scans}</h4>
                            <small className="text-muted">Total Scans</small>
                          </div>
                          {qrCode.lastScannedAt && (
                            <div>
                              <small className="text-muted d-block">Last Scanned</small>
                              <small>{new Date(qrCode.lastScannedAt.seconds * 1000).toLocaleDateString()}</small>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ) : (
                <Card className="text-center py-5">
                  <Card.Body>
                    <div className="mb-4">
                      <i className="bi bi-qr-code" style={{ fontSize: "4rem", color: "#6c757d" }}></i>
                    </div>
                    <h3>No QR Code Yet</h3>
                    <p className="text-muted mb-4">
                      Generate a QR code for your restaurant so customers can easily access your digital menu.
                    </p>
                    <Button variant="primary" size="lg" onClick={handleGenerateQR} disabled={generating}>
                      {generating ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-qr-code me-2"></i>
                          Generate QR Code
                        </>
                      )}
                    </Button>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>

          {/* How to Use Section */}
          <Row className="mt-5">
            <Col>
              <h4 className="text-center mb-4">How to Use Your QR Code</h4>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center step-card">
                <Card.Body>
                  <div className="step-icon mb-3">
                    <i className="bi bi-download"></i>
                  </div>
                  <h5>1. Download</h5>
                  <p className="text-muted">Download the QR code in PNG or PDF format for printing.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center step-card">
                <Card.Body>
                  <div className="step-icon mb-3">
                    <i className="bi bi-printer"></i>
                  </div>
                  <h5>2. Print & Display</h5>
                  <p className="text-muted">Print and place the QR code on tables, counters, or entrance.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center step-card">
                <Card.Body>
                  <div className="step-icon mb-3">
                    <i className="bi bi-phone"></i>
                  </div>
                  <h5>3. Customers Scan</h5>
                  <p className="text-muted">Customers scan with their phone to view your digital menu instantly.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  )
}
