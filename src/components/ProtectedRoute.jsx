"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole, userProfile, loading } = useAuth()

  console.log("[v0] ProtectedRoute - Loading:", loading)
  console.log("[v0] ProtectedRoute - Current User:", currentUser?.uid)
  console.log("[v0] ProtectedRoute - User Role:", userRole)
  console.log("[v0] ProtectedRoute - User Profile:", userProfile)
  console.log("[v0] ProtectedRoute - Required Role:", requiredRole)
  console.log("[v0] ProtectedRoute - Current Path:", window.location.pathname)

  if (loading) {
    console.log("[v0] ProtectedRoute - Showing loading spinner")
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    console.log("[v0] ProtectedRoute - No user, redirecting to login")
    return <Navigate to="/login" replace />
  }

  if (userRole === "restaurant_owner") {
    console.log("[v0] ProtectedRoute - Restaurant owner detected")
    if (userProfile && userProfile.status === "pending") {
      console.log("[v0] ProtectedRoute - Status is pending, redirecting")
      return <Navigate to="/pending-approval" replace />
    }
    if (userProfile && userProfile.status === "rejected") {
      console.log("[v0] ProtectedRoute - Status is rejected, redirecting")
      return <Navigate to="/unauthorized" replace />
    }

    const selectedRestaurantId = localStorage.getItem("selectedRestaurantId")
    const isAdminRoute =
      window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/restaurants"

    console.log("[v0] ProtectedRoute - Selected Restaurant ID:", selectedRestaurantId)
    console.log("[v0] ProtectedRoute - Is Admin Route:", isAdminRoute)

    if (!selectedRestaurantId && isAdminRoute) {
      console.log("[v0] ProtectedRoute - No restaurant selected, redirecting to restaurant selection")
      return <Navigate to="/admin/restaurants" replace />
    }
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log("[v0] ProtectedRoute - Role mismatch, redirecting to unauthorized")
    return <Navigate to="/unauthorized" replace />
  }

  console.log("[v0] ProtectedRoute - All checks passed, rendering children")
  return children
}

export default ProtectedRoute
