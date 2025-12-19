import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children, requiredRole }) => {
  // 1. Get userProfile from useAuth()
  const { currentUser, userRole, userProfile, loading } = useAuth()

  // 2. Show loading spinner while authentication state is being determined
  // This is crucial to ensure userRole and userProfile are populated
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  // 3. If no user is authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // 4. Handle restaurant owner specific approval status BEFORE checking requiredRole
  // This ensures a pending/rejected owner can't access ANY owner-specific routes
  if (userRole === "restaurant_owner") {
    // We expect userProfile to be available if userRole is restaurant_owner and currentUser is set
    // A null userProfile here could indicate a data inconsistency, but generally
    // fetchUserProfile should have set it by the time loading is false.
    if (userProfile && userProfile.status === "pending") {
      // Redirect pending owners to the pending approval page
      return <Navigate to="/pending-approval" replace />
    }
    if (userProfile && userProfile.status === "rejected") {
      // Redirect rejected owners to an unauthorized page (or a specific rejection page)
      return <Navigate to="/unauthorized" replace />
    }
    // If status is "active" or not explicitly "pending"/"rejected", they can proceed
  }

  // 5. Check if user has the required role for this specific route
  // This check applies to both super_admin and *active* restaurant_owner
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  // 6. If all checks pass, render the children component (the protected page)
  return children
}

export default ProtectedRoute