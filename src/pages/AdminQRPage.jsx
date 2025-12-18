import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminQRPage.css";

export default function AdminQRPage() {
  return (
    <div className="qr-page">
      <div className="row g-0 min-vh-100">
        {/* Sidebar */}
        <aside className="col-md-3 col-lg-2 sidebar p-4">
          <h5 className="fw-bold mb-4">Restaurant Admin</h5>
          <ul className="nav flex-column gap-2">
            <li className="nav-item">
              <a className="nav-link" href="#">Dashboard</a>
            </li>
            <li className="nav-item active">
              <a className="nav-link" href="#">QR Code</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Menu</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Orders</a>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="col-md-9 col-lg-10 main-content">
          <div className="mb-5">
            <h2 className="fw-bold">Your Restaurant's QR Code</h2>
            <p>
              Download the QR code for your customers to scan and access your digital menu.
            </p>
          </div>

          {/* QR Card */}
          <div className="qr-card-container">
            <div className="qr-card">
              <div className="qr-box">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvYgZ5MoZEuYORDQ_p0qVILjHvPxEBlC50TeFH7E_o8f41ByERgT1wbIGOLJ46acwoq6FFeDVf8NC0P4uGCaB_RM6kbhRbo9HnPQoyjv9VJSskbVmAXwOLYnaWXe4XytXybwq_Gp6N0ewGSSpCvbtZHKhA105PkNenRQxE24oJcNDR473x0tdye1ja4kcemzv-QAJBz6sqcycJE6qT1I6x3AARSYOyyWF3turr15n8KCWVRaxVmEIVuBu1cP0JdkwayfeDRC28YUny"
                  alt="QR Code"
                />
              </div>
              <div className="d-flex gap-3 justify-content-center mt-3">
                <button className="btn-download">Download PNG</button>
                <button className="btn-download">Download PDF</button>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <h5 className="fw-bold mb-3 mt-5">How to Use Your QR Code</h5>
          <div className="row g-4">
            {["Download", "Print & Display", "Scan"].map((step, i) => (
              <div key={i} className="col-md-4">
                <div className="step-card">
                  <i className={`bi bi-${i === 0 ? "download" : i === 1 ? "printer" : "qr-code-scan"} fs-3`}></i>
                  <h6 className="fw-bold mt-3">Step {i + 1}: {step}</h6>
                  <p className="small mb-0">
                    {i === 0 ? "Download the QR code in your preferred format."
                     : i === 1 ? "Print and place it where customers can see it."
                     : "Customers scan to access your digital menu."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
