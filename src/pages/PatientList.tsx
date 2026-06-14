// PatientList.tsx — Route: /patients
// Shows all patients from context in a responsive grid.
// Includes search, status filter, and an Add Patient modal.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusCard from "../components/StatusCard";
import { usePatients } from "../context/PatientContext";
import type { Status } from "../components/StatusCard";
import { fetchConditions, /*fetchDoctors*/ } from "../utils/api";

const AVATAR_BG: Record<Status, { bg: string; color: string }> = {
  stable:   { bg: "var(--bg-stable)",   color: "var(--color-stable)" },
  monitoring:    { bg: "var(--bg-watch)",    color: "var(--color-watch)" },
  critical: { bg: "var(--bg-critical)", color: "var(--color-critical)" },
  recovery: { bg: "var(--bg-info)",     color: "var(--color-info)" },
};

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

// ── Add Patient Modal ──────────────────────────────────────────────────────
interface AddPatientModalProps {
  onClose: () => void;
  onAdded: () => void;
}

function AddPatientModal({ onClose, onAdded }: AddPatientModalProps) {
  const [form, setForm] = useState({
    patient_code: "",
    first_name:   "",
    last_name:    "",
    age:          "",
    ward_id:      "1",
    condition_id: "1",
    status_id:    "1",
    admitted_at:  new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const [conditions, setConditions] = useState<{id: number; condition_name: string}[]>([]);
  //const [doctors, setDoctors] = useState<{id: number; first_name: string; last_name: string}[]>([]);

  useEffect(() => {
    //fetch conditions
    fetchConditions().then(setConditions).catch(console.error);
    //fetch doctors
    //fetchDoctors().then(setDoctors).catch(console.error);
  },[])


  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.first_name || !form.last_name || !form.age) {
      setError("First name, last name and age are required.");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/patients`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          age:          Number(form.age),
          ward_id:      Number(form.ward_id),
          condition_id: Number(form.condition_id),
          status_id:    Number(form.status_id),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to add patient");
      }
      onAdded();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Modal card */}
      <div
        onClick={e => e.stopPropagation()}
        className="panel"
        style={{ width: "100%", maxWidth: 480, margin: 16 }}
      >
        <div className="panel-head">
          <span className="panel-title">Add New Patient</span>
          <button className="btn-link" onClick={onClose}>✕ Close</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Patient code */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>
              Patient Code
            </label>
            <input
              name="patient_code"
              placeholder="PT-0049"
              value={form.patient_code}
              onChange={handleChange}
            />
          </div>

          {/* Name row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>
                First Name *
              </label>
              <input
                name="first_name"
                placeholder="Maria"
                value={form.first_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>
                Last Name *
              </label>
              <input
                name="last_name"
                placeholder="Reyes"
                value={form.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Age + Admitted */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>
                Age *
              </label>
              <input
                name="age"
                type="number"
                placeholder="42"
                value={form.age}
                onChange={handleChange}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>
                Admitted On
              </label>
              <input
                name="admitted_at"
                type="date"
                value={form.admitted_at}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Replace the static condition field with this */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>
              Condition
            </label>
            <select name="condition_id" value={form.condition_id} onChange={handleChange}>
              {conditions.map(c => (
                <option key={c.id} value={c.id}>{c.condition_name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>
              Initial Status
            </label>
            <select name="status_id" value={form.status_id} onChange={handleChange}>
              <option value="1">Stable</option>
              <option value="2">Monitoring</option>
              <option value="3">Critical</option>
              <option value="4">Recovery</option>
            </select>
          </div>


          {error && (
            <p className="text-danger" style={{ fontSize: 12 }}>{error}</p>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Add Patient"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function PatientList() {
  const { patients, loading, error, refetch } = usePatients();
  const navigate   = useNavigate();
  const [search,      setSearch]      = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [showModal,   setShowModal]   = useState(false);

  // Filter by search + status
  const filtered = patients.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.patient_code ?? p.id).toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
          <h1 className="page-title">All Patients</h1>
          <p className="page-subtitle">{filtered.length} of {patients.length} patients · Ward B</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Patient
        </button>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          placeholder="Search by name or code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 240, fontSize: 13 }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as Status | "all")}
          style={{ width: 160, fontSize: 13 }}
        >
          <option value="all">All statuses</option>
          <option value="stable">Stable</option>
          <option value="monitoring">Monitoring</option>
          <option value="critical">Critical</option>
          <option value="recovery">Recovery</option>
        </select>
      </div>

      {/* ── Patient grid ── */}
      {filtered.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "var(--text-secondary)" }}>
          No patients match your search.
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}>
          {filtered.map(patient => {
            const s  = (patient.status as Status) in AVATAR_BG
              ? patient.status as Status
              : "stable";
            const av = AVATAR_BG[s];
            return (
              <div
                key={patient.id}
                onClick={() => navigate(`/patient/${patient.id}`)}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "24px 16px 20px",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 12,
                  cursor: "pointer",
                  transition: "box-shadow .15s, transform .15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-md)";
                  (e.currentTarget as HTMLDivElement).style.transform  = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLDivElement).style.transform  = "translateY(0)";
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: av.bg, color: av.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 700, letterSpacing: "-.5px",
                  transition: "background .2s",
                }}>
                  {initials(patient.name)}
                </div>

                {/* Name + code */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>
                    {patient.name}
                  </div>
                  <div className="mono" style={{ marginTop: 3 }}>
                    {patient.patient_code ?? patient.id}
                  </div>
                </div>

                <span className="tag">{patient.condition}</span>
                <StatusCard status={s} />

                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {patient.ward}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Patient Modal ── */}
      {showModal && (
        <AddPatientModal
          onClose={() => setShowModal(false)}
          onAdded={() => refetch()}
        />
      )}

    </div>
  );
}