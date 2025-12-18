import "bootstrap/dist/css/bootstrap.min.css";
import "./adminDashboard.css";

export default function AdminDashboard() {
  return (
    <div className="admin-root">
      <div className="d-flex h-100">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div>
            <div className="brand">
              <img src="" alt="" />
              <div>
                <h6>Addis Menu</h6>
                <small>Admin Panel</small>
              </div>
            </div>

            <nav className="nav flex-column mt-4">
              <a className="nav-link active"><i className="bi bi-grid"></i>Dashboard</a>
              <a className="nav-link"><i className="bi bi-list"></i>Menus</a>
              <a className="nav-link"><i className="bi bi-qr-code"></i>QR Codes</a>
              <a className="nav-link"><i className="bi bi-bar-chart"></i>Analytics</a>
              <a className="nav-link"><i className="bi bi-chat-left-text"></i>Feedback</a>
              <a className="nav-link"><i className="bi bi-credit-card"></i>Payments</a>
              <a className="nav-link"><i className="bi bi-gear"></i>Settings</a>
            </nav>
          </div>

          <div className="help">
            <i className="bi bi-question-circle"></i> Help & Support
          </div>
        </aside>

        {/* MAIN */}
        <main className="main-content">

          {/* TOP BAR */}
          <div className="topbar">
            <div className="search">
              <i className="bi bi-search"></i>
              <input placeholder="Search menu items..." />
            </div>
            <div className="top-icons">
              <i className="bi bi-bell"></i>
              <div className="avatar">A</div>
            </div>
          </div>

          {/* HEADER */}
          <div className="header">
            <div>
              <h2>Welcome back, The Gourmet Place!</h2>
              <p>Here's a summary of your restaurant's activity.</p>
            </div>
            <div className="actions">
              <button className="btn btn-download">
                <i className="bi bi-qr-code-scan"></i> Generate New QR
              </button>
              <button className="btn btn-download">
                <i className="bi bi-pencil"></i> Edit Menu
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="row g-4">
            <Stat title="Today's Menu Views" value="1,204" meta="+5.2% vs yesterday" color="green" />
            <Stat title="Total QR Scans" value="8,921" meta="-1.8% vs last week" color="red" />
            <Stat title="New Feedback" value="15" meta="Needs review" color="orange" />
            <Stat title="Menu Status" value="● Published" meta="Last updated: 2h ago" color="green" />
          </div>

          {/* LOWER */}
          <div className="row g-4 mt-1">
            <div className="col-lg-8">
              <div className="card-alt">
                <h6>Menu Views (Last 7 Days)</h6>
                <img
                  src="https://us.123rf.com/450wm/yuliia988/yuliia9882302/yuliia988230200069/198854025-vector-isolated-illustration-of-progress-graph-achieving-financial-success-over-a-period-of-time.jpg?ver=6"
                  className="chart-img"
                />
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card-alt">
                <div className="d-flex justify-content-between">
                  <h6>Recent Feedback</h6>
                  <span className="link">View All</span>
                </div>

                <Feedback rating={4} text="The new pasta dish was amazing, but the service was a bit slow." user="John D." />
                <Feedback rating={5} text="Absolutely delicious! The QR menu is so convenient." user="Sarah L." />
                <Feedback rating={3} text="The music was a bit too loud for dinner." user="Mike R." />
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

function Stat({ title, value, meta, color }) {
  return (
    <div className="col-md-6 col-lg-3">
      <div className="card-alt">
        <small>{title}</small>
        <h3>{value}</h3>
        <span className={color}>{meta}</span>
      </div>
    </div>
  );
}

function Feedback({ rating, text, user }) {
  return (
    <div className="feedback">
      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <i key={i} className={`bi ${i < rating ? "bi-star-fill" : "bi-star"}`}></i>
        ))}
        <span>{rating}/5</span>
      </div>
      <p>"{text}"</p>
      <small>— {user}</small>
    </div>
  );
}
