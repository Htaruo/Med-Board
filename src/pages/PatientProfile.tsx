// PatientProfile.tsx — Route: /patient/:id
// Reads from PatientContext so status changes persist across navigation.

import { useParams, useNavigate } from "react-router-dom";
import MedSchedule from "../components/MedSchedule";
import StatusCard from "../components/StatusCard";
import { usePatients } from "../context/PatientContext";
import type { Status } from "../components/StatusCard";
import { fetchDoctors, assignDoctor } from "../utils/api";
import { useState, useEffect } from "react";

const AVATAR_BG: Record<Status, string> = {
  stable:   "var(--bg-stable)",
  monitoring:    "var(--bg-watch)",
  critical: "var(--bg-critical)",
  recovery: "var(--bg-info)",
};

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

interface Doctor{
  id: number;
  first_name: string;
  last_name: string;
}

interface VitalRecord {
  name: string;
  value: string;
  unit: string;
  icon: string;
  status: "normal" | "warning" | "danger";
  statusLabel: string;
}

const getVitalsForStatus = (status: Status): VitalRecord[] => {
  switch (status) {
    case "monitoring":
      return [
        { name: "Heart Rate", value: "88", unit: "bpm", icon: "❤️", status: "warning", statusLabel: "Elevated" },
        { name: "Blood Pressure", value: "135/85", unit: "mmHg", icon: "🩺", status: "warning", statusLabel: "Prehypertension" },
        { name: "Temperature", value: "37.5", unit: "°C", icon: "🌡️", status: "normal", statusLabel: "Normal" },
        { name: "SpO2", value: "95", unit: "%", icon: "🫁", status: "warning", statusLabel: "Borderline" }
      ];
    case "critical":
      return [
        { name: "Heart Rate", value: "112", unit: "bpm", icon: "❤️", status: "danger", statusLabel: "Tachycardia" },
        { name: "Blood Pressure", value: "160/100", unit: "mmHg", icon: "🩺", status: "danger", statusLabel: "Stage 2 HTN" },
        { name: "Temperature", value: "38.9", unit: "°C", icon: "🌡️", status: "danger", statusLabel: "High Fever" },
        { name: "SpO2", value: "91", unit: "%", icon: "🫁", status: "danger", statusLabel: "Hypoxia" }
      ];
    case "recovery":
      return [
        { name: "Heart Rate", value: "68", unit: "bpm", icon: "❤️", status: "normal", statusLabel: "Normal" },
        { name: "Blood Pressure", value: "118/78", unit: "mmHg", icon: "🩺", status: "normal", statusLabel: "Normal" },
        { name: "Temperature", value: "36.5", unit: "°C", icon: "🌡️", status: "normal", statusLabel: "Normal" },
        { name: "SpO2", value: "99", unit: "%", icon: "🫁", status: "normal", statusLabel: "Normal" }
      ];
    case "stable":
    default:
      return [
        { name: "Heart Rate", value: "72", unit: "bpm", icon: "❤️", status: "normal", statusLabel: "Normal" },
        { name: "Blood Pressure", value: "120/80", unit: "mmHg", icon: "🩺", status: "normal", statusLabel: "Normal" },
        { name: "Temperature", value: "36.8", unit: "°C", icon: "🌡️", status: "normal", statusLabel: "Normal" },
        { name: "SpO2", value: "98", unit: "%", icon: "🫁", status: "normal", statusLabel: "Normal" }
      ];
  }
};

export default function PatientProfile() {
  const { id }                       = useParams<{ id: string }>();
  const navigate                     = useNavigate();
  const { getPatient, updateStatus, loading, patients, refetch } = usePatients();
  const patient                      = id ? getPatient(id) : undefined;

  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : {role : "nurse"};
  const isAdmin = user.role === "admin";

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  useEffect(() => {
    if (isAdmin) {
      fetchDoctors().then(setDoctors).catch(console.error);
    }
  }, [isAdmin]);
 
  console.log("loading:", loading, "| patients.length:", patients.length, "| id:", id, "| found:", id ? !!getPatient(id) : false);


  if (loading) return (
    <div style={{ padding: 48, textAlign: "center", color: "var(--text-secondary)" }}>
      Loading patient...
    </div>
  );

  if (!patient) return (
    <div className="page-wrapper">
      <button className="btn-ghost" onClick={() => navigate("/patients")} style={{ marginBottom: 16 }}>
        ← Back to patients
      </button>
      <p style={{ color: "var(--text-secondary)" }}>Patient not found.</p>
    </div>
  );

  const status = patient.status as Status;
  const safeBg = AVATAR_BG[status] ?? AVATAR_BG.stable;
  const vitals = getVitalsForStatus(status);

  const infoRows: [string, React.ReactNode][] = [
    ["Ward / Bed",  patient.ward],
    ["Condition",   <span className="tag">{patient.condition}</span>],
    ["Admitted",    patient.admittedOn
                      ? new Date(patient.admittedOn).toLocaleDateString("en-PH", {
                          year: "numeric", month: "short", day: "numeric"
                        })
                      : "—"],
    ["Physician",   patient.doctor ?? "—"],
  ];

  async function handleAssignDoctor(e: React.ChangeEvent<HTMLSelectElement>) {
    const doctor_val = e.target.value;
    const doctor_id = doctor_val ? Number(doctor_val) : null;

    setAssigning(true);
    setAssignError("");
    try {
      await assignDoctor(patient!.id, doctor_id);
      await refetch();
    } catch (err: any) {
      setAssignError(err.message ?? "Failed to assign doctor");
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div className="page-wrapper">

      <button
        className="btn-ghost"
        onClick={() => navigate("/patients")}
        style={{ marginBottom: 16, fontSize: 13 }}
      >
        ← Back to patients
      </button>

      {/* ── Header card ── */}
      <div className="panel" style={{ marginBottom: 20 }}>

        {/* Top row: avatar + name + status badge */}
        <div style={{ padding: "20px 24px", display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: safeBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 20,
            transition: "background .2s",
          }}>
            {initials(patient.name)}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{patient.name}</div>
            <div className="mono" style={{ marginTop: 3 }}>
              {patient.patient_code ?? patient.id} · Age {patient.age}
            </div>
          </div>

          <StatusCard status={status} />
        </div>

        {/* Info strip */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          borderTop: "1px solid var(--border)",
          padding: "14px 24px", gap: 12,
        }}>
          {/* Static info cells */}
          {infoRows.map(([label, value]) => (
            <div key={label}>
              <div className="stat-label">{label}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Status dropdown row */}
        <div style={{
          borderTop: "1px solid var(--border)",
          padding: "12px 24px",
          display: "flex", alignItems: "center", gap: 12,}}>
          <span className="stat-label" style={{ marginBottom: 0 }}>Update Status</span>
          <select
            value={status}
            onChange={e => updateStatus(patient.id, e.target.value as Status)}
            style={{
              fontSize: 12, fontWeight: 600,
              padding: "5px 12px",
              borderRadius: 20,
              border: "1.5px solid var(--border)",
              background: safeBg,
              cursor: "pointer",
              width: "auto",
              transition: "background .2s",
            }}
          >
            <option value="stable">Stable</option>
            <option value="monitoring">Monitoring</option>
            <option value="critical">Critical</option>
            <option value="recovery">Recovery</option>
          </select>
        </div>
      

      {/* Assign doctor row note: Admin Account only */}
      {isAdmin &&(
        <div style={{
          borderTop: "1px solid var(--border)",
          padding: "12px 24px",
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <span className="stat-label" style={{marginBottom: 0}}> Assign Doctor</span>
          <select
            value={patient.doctor_id ?? ""}
            onChange={handleAssignDoctor}
            disabled={assigning}
            style={{
              fontSize: 12, fontWeight: 600,
              padding: "5px 12px",
              borderRadius: 20,
              border: "1.5px solid var(--border)",
              cursor: "pointer",
              width: "auto",
            }}
          > 
            <option value="">Set Doctor</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                Dr. {d.first_name} {d.last_name}
              </option>
            ))}
          </select>

            {assigning && (
              <span style={{fontSize: 12, color: "var(--text-secondary)"}}>
                Saving…
              </span>
            )}

            {assignError && (
              <span style={{fontSize: 12, color: "var(--color-critical)"}}>
                {assignError}
              </span>
            )}

            <span style={{ fontSize: 12, color: "var(--text-secondary)"}}>
              Currently: {patient.doctor ?? " - "}
            </span>
        </div>
      )}
      </div>

      {/* ── Vitals + Medicine schedule ── */}
      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Vitals</span>
            <button className="btn-link">+ Add reading</button>
          </div>
          <div className="vitals-grid">
            {vitals.map(v => (
              <div key={v.name} className={`vital-card ${status}`}>
                <div className="vital-header">
                  <span className="vital-title">{v.name}</span>
                  <span className="vital-icon">{v.icon}</span>
                </div>
                <div className="vital-body">
                  <span className="vital-value">{v.value}</span>
                  <span className="vital-unit">{v.unit}</span>
                </div>
                <span className={`vital-status ${v.status}`}>{v.statusLabel}</span>
              </div>
            ))}
          </div>
        </div>

        <MedSchedule patientId={patient.id} />
      </div>

    </div>
  );
}