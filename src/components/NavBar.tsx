// NavBar.tsx
// Sticky top nav: logo, ward selector, user name, avatar → user profile link.
// Reads logged-in user from localStorage (set during login).

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const WARDS = ["Ward A", "Ward B", "Ward C", "Ward D"];

export default function NavBar() {
  const navigate = useNavigate();

  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : { name: "User", role: "nurse" };

  function initials(name: string) {
    return name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  const [selectedWard, setSelectedWard] = useState("Ward B");
  const [wardDropOpen, setWardDropOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function closeMenus() {
    setWardDropOpen(false);
    setUserDropOpen(false);
    setMobileMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo-link" onClick={closeMenus}>
          <img
            src="/logo.png"
            alt="MedBoard logo"
            className="navbar-logo-img"
          />
          <span className="navbar-logo-text">MedBoard</span>
        </Link>

        <Link to="/patients" className="navbar-patients-link" onClick={closeMenus}>
          Patients
        </Link>
      </div>

      <div className="navbar-right">
        <button
          type="button"
          className="navbar-menu-button"
          onClick={() => setMobileMenuOpen(open => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="navbar-menu-icon" />
        </button>

        <div className="navbar-desktop-actions">
          <div className="dropdown">
            <button
              type="button"
              onClick={() => {
                setWardDropOpen(open => !open);
                setUserDropOpen(false);
              }}
              className="ward-badge"
              aria-expanded={wardDropOpen}
              aria-haspopup="menu"
            >
              {selectedWard}
              <span className="navbar-caret">▼</span>
            </button>

            {wardDropOpen && (
              <div className="dropdown-menu dropdown-menu-left">
                {WARDS.map(ward => (
                  <div
                    key={ward}
                    onClick={() => {
                      setSelectedWard(ward);
                      setWardDropOpen(false);
                    }}
                    className={ward === selectedWard ? "dropdown-item active" : "dropdown-item"}
                  >
                    {ward}
                  </div>
                ))}
              </div>
            )}
          </div>

          <span className="navbar-user-name">{user.name}</span>

          <div className="dropdown">
            <button
              type="button"
              onClick={() => {
                setUserDropOpen(open => !open);
                setWardDropOpen(false);
              }}
              className="avatar avatar-stable avatar-sm navbar-avatar-button"
              title="Account"
              aria-expanded={userDropOpen}
              aria-haspopup="menu"
            >
              {initials(user.name)}
            </button>

            {userDropOpen && (
              <div className="dropdown-menu dropdown-menu-right navbar-user-menu">
                <div className="dropdown-header">
                  <div className="navbar-user-menu-name">{user.name}</div>
                  <div className="mono" style={{ marginTop: 2 }}>{user.role}</div>
                  <div className="navbar-user-menu-email">{user.email}</div>
                </div>

                <Link to="/profile" onClick={closeMenus} className="dropdown-item navbar-menu-link">
                  👤 My Profile
                </Link>

                <div onClick={handleLogout} className="dropdown-item danger">
                  🚪 Sign out
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <div className="navbar-mobile-backdrop" onClick={() => setMobileMenuOpen(false)} />
          <div className="navbar-mobile-panel" role="menu" aria-label="Navigation menu">
            <Link to="/patients" className="navbar-mobile-link" onClick={closeMenus}>
              Patients
            </Link>

            <div className="navbar-mobile-section">
              <div className="navbar-mobile-label">Ward</div>
              <div className="navbar-mobile-chips">
                {WARDS.map(ward => (
                  <button
                    key={ward}
                    type="button"
                    className={ward === selectedWard ? "ward-badge ward-badge-active" : "ward-badge"}
                    onClick={() => setSelectedWard(ward)}
                  >
                    {ward}
                  </button>
                ))}
              </div>
            </div>

            <div className="navbar-mobile-section">
              <div className="navbar-mobile-label">Account</div>
              <div className="navbar-mobile-account">
                <div className="navbar-mobile-account-name">{user.name}</div>
                <div className="mono">{user.role}</div>
                <div className="navbar-mobile-account-email">{user.email}</div>
              </div>
              <Link to="/profile" className="navbar-mobile-link" onClick={closeMenus}>
                My Profile
              </Link>
              <button type="button" className="navbar-mobile-signout" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}