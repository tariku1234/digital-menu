"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Container, Form, Button, Card, Alert } from "react-bootstrap"
import { useAuth } from "../context/AuthContext"
import "./LoginPage.css"

const LoginPage = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { login, userRole } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        const result = await login(email, password) // This will also trigger fetchUserProfile in AuthContext

        if (result.success) {
            // Use a timeout to ensure userRole state has updated after login and fetchUserProfile completes
            // This addresses potential timing issues with state updates
            setTimeout(() => {
                if (userRole === "super_admin") {
                    navigate("/super-admin/dashboard")
                } else if (userRole === "restaurant_owner") {
                    navigate("/admin/dashboard")
                } else {
                    // Handle other roles or no role, perhaps redirect to a generic user dashboard or homepage
                    navigate("/") // Or another default route
                }
            }, 100); // A small delay might be necessary for React state updates to propagate
            // You might need to adjust this or use a more robust way to wait for role to be set.
            // For example, checking `currentUser` and `userRole` in a `useEffect` inside ProtectedRoute.
        } else {
            setError(result.error || "Failed to login. Please check your credentials.")
        }

        setLoading(false)
    }
    return (
        <div className="login-page">
            <Container>
                <div className="login-wrapper">
                    <Card className="login-card shadow">
                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold">Welcome Back</h2>
                                <p className="text-muted">Sign in to your account</p>
                            </div>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="email">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading}>
                                    {loading ? "Signing in..." : "Sign In"}
                                </Button>

                                <div className="text-center">
                                    <p className="mb-0">
                                        Don't have an account?{" "}
                                        <Link to="/register" className="text-primary fw-semibold">
                                            Register Now
                                        </Link>
                                    </p>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        </div>
    )
}

export default LoginPage
