// Doctor's Orders.tsx
// Today's medicine schedule for one patient.
// Nurses click the circle checkbox to mark a dose as given.
// Props:
//   patientId: string — used to fetch schedule from API

import { useState } from "react";

interface MedItem {
  id: string;
  name: string;
  dose: string;
  route: string;
  time: string;
  given: boolean;
}

// TODO: replace with real fetch(patientId)
const MOCK: MedItem[] = [
  { id: "m1", name: "Amoxicillin", dose: "500 mg", route: "oral", time: "08:00 AM", given: true },
  { id: "m2", name: "Ketorolac",   dose: "30 mg",  route: "IV",   time: "08:45 AM", given: false },
  { id: "m3", name: "Omeprazole",  dose: "20 mg",  route: "oral", time: "12:00 PM", given: false },
  { id: "m4", name: "Paracetamol", dose: "1 g",    route: "oral", time: "06:00 PM", given: false },
];

interface Props { patientId: string; }

export default function MedSchedule({ patientId }: Props) {
  const [items, setItems] = useState<MedItem[]>(MOCK);

  function toggle(id: string) {
    // TODO: POST administration event to API, then update state
    setItems(prev => prev.map(m => m.id === id ? { ...m, given: !m.given } : m));
  }

  const doneCount = items.filter(m => m.given).length;

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">Doctor's Orders</span>
        <span className="mono">{patientId}</span>
      </div>

      {items.map(med => (
        <div key={med.id} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "11px 18px", borderBottom: "1px solid var(--border)",
        }}>
          {/* Icon pill */}
          <div style={{
            width: 34, height: 34, borderRadius: 8, flexShrink: 0,
            background: "var(--bg-subtle)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
          }}>
            💊
          </div>

          {/* Name + dose */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{med.name}</div>
            <div className="mono">{med.dose} · {med.route}</div>
          </div>

          {/* Time + status */}
          <div style={{ textAlign: "right", flexShrink: 0, fontSize: 11, color: "var(--text-secondary)" }}>
            {med.time}
            <div style={{ color: med.given ? "var(--color-stable)" : "var(--text-muted)", marginTop: 2 }}>
              {med.given ? "✓ given" : "pending"}
            </div>
          </div>

          {/* Checkbox circle */}
          <div
            onClick={() => toggle(med.id)}
            title={med.given ? "Mark as not given" : "Mark as given"}
            style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
              border: `1.5px solid ${med.given ? "var(--color-stable)" : "var(--border)"}`,
              background: med.given ? "var(--color-stable)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 11,
            }}
          >
            {med.given && "✓"}
          </div>
        </div>
      ))}

      <div style={{ padding: "10px 18px", fontSize: 12, color: "var(--text-secondary)" }}>
        {doneCount} of {items.length} doses given today
      </div>
    </div>
  );
}