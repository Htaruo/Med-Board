// Dashboard.tsx — Route: /
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StatusCard from "../components/StatusCard";
import LiveClock from "../components/LiveClock";
import MedSchedule from "../components/MedSchedule";
import { usePatients } from "../context/PatientContext";
import type { Status } from "../components/StatusCard";

export default function Dashboard() {
  const { patients, loading, error } = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  // Derive stat counts from real data
  const statusCounts = patients.reduce<Record<Status, number>>(
    (counts, patient) => {
      const s = patient.status as Status;
      counts[s] = (counts[s] || 0) + 1;
      return counts;
    },
    { stable: 0, monitoring: 0, critical: 0, recovery: 0 }
  );

  // Default to first patient once data loads
  const activePatientId = selectedPatientId ?? patients[0]?.id ?? "";

  // Filter patients by search
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.patient_code ?? p.id).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ padding: 48, textAlign: "center", color: "var(--text-secondary)" }}>
      Loading patients...
    </div>
  );

  if (error) return (
    <div style={{ padding: 48, textAlign: "center", color: "var(--color-critical)" }}>
      ❌ {error}
    </div>
  );

  return (
    <div className="page-wrapper">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Dashboard</h1>
          <p className="page-subtitle">{patients.length} active patients · Ward B</p>
        </div>
        <LiveClock />
      </div>

      {/* ── Stat cards ── */}
      <div className="grid-4" style={{marginBottom: 28}}>
        <div className="stat-card">
          <div className="stat-label">Stable</div>
          <div className="stat-value" style={{ color: "var(--color-stable)" }}>
            {statusCounts.stable}
          </div>
          <div className="stat-sub">patients on track</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monitoring</div>
          <div className="stat-value" style={{ color: "var(--color-watch)" }}>
            {statusCounts.monitoring}
          </div>
          <div className="stat-sub">watch closely</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Critical</div>
          <div className="stat-value" style={{ color: "var(--color-critical)" }}>
            {statusCounts.critical}
          </div>
          <div className="stat-sub">needs attention</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Compliance</div>
          <div className="stat-value" style={{ color: "var(--color-info)" }}>84%</div>
          <div className="stat-sub">medicine intake today</div>
        </div>
      </div>

      {/* ── Patient table + Medicine schedule ── */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Patient Status</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: 140, fontSize: 12, padding: "4px 8px" }}
              />
              <Link to="/patients" className="btn-link">View all →</Link>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Medicines</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 24, color: "var(--text-secondary)" }}>
                    No patients found
                  </td>
                </tr>
              )}
              {filtered.map(p => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/patient/${p.id}`)}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div className="mono">{p.patient_code ?? p.id}</div>
                  </td>
                  <td><span className="tag">{p.condition}</span></td>
                  <td><StatusCard status={p.status as Status} /></td>
                  <td>
                    {/* Medicine count badge */}
                    {p.medicines && p.medicines.length > 0 ? (
                      <span style={{
                        fontSize: 11, fontFamily: "var(--font-mono)",
                        background: "var(--bg-info)", color: "var(--color-info)",
                        padding: "2px 8px", borderRadius: 20,
                      }}>
                        {p.medicines.length} med{p.medicines.length > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="mono">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {activePatientId ? (
          <MedSchedule patientId={activePatientId} />
        ) : (
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Medicine Intake</span>
            </div>
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>
              Select a patient to view their schedule
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom panels ── */}
      <div className="grid-3">
        <div className="panel">
          <div className="panel-head"><span className="panel-title">Upcoming Doses</span></div>
          <div style={{ padding: 24, color: "var(--text-secondary)", fontSize: 13 }}>Coming soon</div>
        </div>
        <div className="panel">
          <div className="panel-head"><span className="panel-title">Alerts</span></div>
          <div style={{ padding: 24, color: "var(--text-secondary)", fontSize: 13 }}>Coming soon</div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Nurse Notes</span>
            <button className="btn-link">+ Add</button>
          </div>
          <div style={{ padding: 24, color: "var(--text-secondary)", fontSize: 13 }}>Coming soon</div>
        </div>
      </div>

    </div>
  );
}