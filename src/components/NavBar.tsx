// NavBar.tsx
// Sticky top nav: logo, ward selector, user name, avatar → user profile link.
// Reads logged-in user from localStorage (set during login).

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const WARDS = ["Ward A", "Ward B", "Ward C", "Ward D"];

export default function NavBar() {
  const navigate  = useNavigate();

  // Read user from localStorage (saved on login)
  const stored    = localStorage.getItem("user");
  const user      = stored ? JSON.parse(stored) : { name: "User", role: "nurse" };

  // Derive initials from name
  function initials(name: string) {
    return name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  // Ward dropdown state
  const [selectedWard,  setSelectedWard]  = useState("Ward B");
  const [wardDropOpen,  setWardDropOpen]  = useState(false);

  // User dropdown state
  const [userDropOpen,  setUserDropOpen]  = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <nav style={{
      background:    "var(--bg-surface)",
      borderBottom:  "1px solid var(--border)",
      padding:       "0 32px",
      height:        56,
      display:       "flex",
      alignItems:    "center",
      justifyContent: "space-between",
      position:      "sticky",
      top:           0,
      zIndex:        100,
    }}>

      {/* ── Logo ── */}
      <Link to="/" style={{
        fontSize: 17, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 8,
        textDecoration: "none", color: "inherit",
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "var(--color-stable)", display: "inline-block",
        }} />
        MedBoard
      </Link>

      <Link to="/patients" style={{
        fontSize: 17, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 8,
        textDecoration: "none", color: "inherit",
      }}>Patients</Link>
      {/* ── Right side ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>

        {/* ── Ward dropdown ── */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setWardDropOpen(o => !o); setUserDropOpen(false); }}
            style={{
              background: "var(--bg-stable)", color: "var(--color-stable)",
              fontSize: 11, fontWeight: 600, padding: "3px 10px",
              borderRadius: 20, letterSpacing: ".3px",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            {selectedWard}
            <span style={{ fontSize: 9 }}>▼</span>
          </button>

          {wardDropOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: 8, overflow: "hidden",
              boxShadow: "var(--shadow-md)",
              minWidth: 130, zIndex: 200,
            }}>
              {WARDS.map(ward => (
                <div
                  key={ward}
                  onClick={() => { setSelectedWard(ward); setWardDropOpen(false); }}
                  style={{
                    padding: "9px 14px",
                    fontSize: 13,
                    cursor: "pointer",
                    background: ward === selectedWard ? "var(--bg-subtle)" : "transparent",
                    fontWeight: ward === selectedWard ? 600 : 400,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-subtle)")}
                  onMouseLeave={e => (e.currentTarget.style.background =
                    ward === selectedWard ? "var(--bg-subtle)" : "transparent")}
                >
                  {ward}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── User name ── */}
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {user.name}
        </span>

        {/* ── Avatar → user dropdown ── */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => { setUserDropOpen(o => !o); setWardDropOpen(false); }}
            title="Account"
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--color-stable)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 12, fontWeight: 600,
              cursor: "pointer", userSelect: "none",
            }}
          >
            {initials(user.name)}
          </div>

          {userDropOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: 8, overflow: "hidden",
              boxShadow: "var(--shadow-md)",
              minWidth: 180, zIndex: 200,
            }}>
              {/* User info header */}
              <div style={{
                padding: "12px 14px",
                borderBottom: "1px solid var(--border)",
              }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                <div className="mono" style={{ marginTop: 2 }}>{user.role}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  {user.email}
                </div>
              </div>

              {/* Menu items */}
              <Link
                to="/profile"
                onClick={() => setUserDropOpen(false)}
                style={{
                  display: "block", padding: "9px 14px",
                  fontSize: 13, color: "var(--text-primary)",
                  textDecoration: "none",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-subtle)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                👤 My Profile
              </Link>

              <div
                onClick={handleLogout}
                style={{
                  padding: "9px 14px", fontSize: 13,
                  color: "var(--color-critical)", cursor: "pointer",
                  borderTop: "1px solid var(--border)",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-critical)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                🚪 Sign out
              </div>
            </div>
          )}
        </div>

        {/* Close dropdowns when clicking outside */}
        {(wardDropOpen || userDropOpen) && (
          <div
            onClick={() => { setWardDropOpen(false); setUserDropOpen(false); }}
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
          />
        )}

      </div>
    </nav>
  );
}