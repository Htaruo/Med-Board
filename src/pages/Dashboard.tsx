// Dashboard.tsx — Route: /
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StatusCard from "../components/StatusCard";
import LiveClock from "../components/LiveClock";
//import MedSchedule from "../components/MedSchedule";
import { usePatients } from "../context/PatientContext";
import type { Status } from "../components/StatusCard";

export default function Dashboard() {
  const { patients, loading, error } = usePatients();
  //const [selectedPatientId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on new search
  }, [search]);

  const statusCounts = patients.reduce<Record<Status, number>>(
    (counts, patient) => {
      const s = patient.status as Status;
      counts[s] = (counts[s] || 0) + 1;
      return counts;
    },
    { stable: 0, monitoring: 0, critical: 0, recovery: 0 }
  );

  // Default to first patient once data loads
  //const activePatientId = selectedPatientId ?? patients[0]?.id ?? "";

  // Filter patients by search
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.patient_code ?? p.id).toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const paginatedPatients = filtered.slice(startIndex, Math.min(startIndex + patientsPerPage, filtered.length));

  const renderPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5){
      for(let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages.map((page, idx) => (
      <span key={idx} onClick={() => typeof page === 'number' && setCurrentPage(page)} style={{cursor: page === '...' ? "default" : "pointer",
          padding: "4px 8px",
          background: currentPage === page ? "var(--bg-surface)" : "transparent",
          color: currentPage === page ? "var(--text-primary)" : "var(--text-secondary)",
          border: currentPage === page ? "1px solid var(--border)" : "1px solid transparent",
          borderRadius: 4,
          fontWeight: currentPage === page ? 600 : 400,
          fontSize: 12}}> {page} </span>
    ));
  };

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
          <div className="stat-label">Recovery</div>
          <div className="stat-value" style={{ color: "var(--color-info)" }}>
            {statusCounts.recovery}
          </div>
          <div className="stat-sub">recovering patients</div>
        </div>
      </div>

      {/* ── Patient table + Medicine schedule ── */}
    <div style={{ marginBottom: 20 }}>
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

        <div className="table-responsive">
          
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Doctor</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 24, color: "var(--text-secondary)" }}>
                    No patients found
                  </td>
                </tr>
              )}
              {paginatedPatients.map(p => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/patient/${p.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div className="mono">{p.patient_code ?? p.id}</div>
                  </td>
                  <td><span className="tag">{p.condition}</span></td>
                  <td><StatusCard status={p.status as Status} /></td>
                  <td>
                    <span style={{
                      fontSize: 11, fontFamily: "var(--font-mono)",
                      background: "var(--bg-info)", color: "var(--color-info)",
                      padding: "2px 8px", borderRadius: 20,
                    }}>{p.doctor}</span>
                  </td>   
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pannel-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-surface)"}}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ background: "transparent", border: "none",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.4 : 1,
                color: "var(--text-secondary)",
                fontWeight: 600
              }}>
                &larr; Prev
            </button>

            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {renderPageNumbers()}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{background: "transparent", border: "none",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                opacity: currentPage === totalPages ? 0.4 : 1,
                color: "var(--text-secondary)",
                fontWeight: 600}}
              > Next &rarr;</button>
          </div>
        )}
      </div>
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