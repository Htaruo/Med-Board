import { useEffect, useState } from "react";
import {
  fetchDoctorOrders,
  createDoctorOrder,
  discontinueOrder,
} from "../utils/api";

const frequencyOptions = [
  "QD",
  "BID",
  "TID",
  "QID",
  "PRN"
];

const crucialTimingFactors = [
  "QHS",
  "AC",
  "PC",
  "STAT"
];

const intakeRoutes = [
  "Oral",
  "Sublingual",
  "Buccal",
  "Intravenous",
  "Intramuscular",
  "Subcutaneous",
  "Cutaneous",
  "Transdermal",
  "Inhalation",
  "Ophthalmic",
  "Otic",
  "Nasal",
  "Rectal",
];

interface Order {
  id: number;
  patient_id: number;
  doctor_id: number;
  medicine_name: string;
  dosage: string;
  route: string;
  frequency: string;
  timing?: string | null;
  prn_condition?: string | null;
  instructions?: string | null;
  start_date: string;
  end_date?: string | null;
  status: string;
  discontinued_at?: string | null;
  discontinued_by?: number | null;
  created_at?: string | null;
}

interface Props { patientId: string; }

export default function DocOrder({ patientId }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const isDoctor = user?.role === "doctor";
  const userId = user?.id;

  useEffect(() => {
    setLoading(true);
    fetchDoctorOrders(patientId)
      .then((data: Order[]) => setOrders(data))
      .catch(err => setError(err.message || "Failed to load orders"))
      .finally(() => setLoading(false));
  }, [patientId]);

  async function refresh() {
    setLoading(true);
    try {
      const data = await fetchDoctorOrders(patientId);
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? "Failed to refresh");
    } finally {
      setLoading(false);
    }
  }

  // Form state
  const [medicine_name, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [route, setRoute] = useState("");
  const [timing, setTiming] = useState("");
  const [frequency, setFrequency] = useState("");
  const [start_date, setStartDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [submitting, setSubmitting] = useState(false);
  // Form submission handler
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!isDoctor) return setError("Only doctors can create orders");
    if (!userId) return setError("Doctor identity not available");
    if (!medicine_name || !dosage || !route || !frequency) return setError("Please fill required fields");

    setSubmitting(true);
    setError(null);
    try {
      await createDoctorOrder(patientId, {
        user_id: Number(userId),
        medicine_name,
        dosage,
        route,
        frequency,
        start_date,
      });
      setMedicineName(""); setDosage(""); setRoute(""); setFrequency("");
      setShowForm(false);
      await refresh();
    } catch (err: any) {
      setError(err.message ?? "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  }
  // Discontinue order handler
  async function handleDiscontinue(order: Order) {
    if (!isDoctor) return setError("Only doctors can discontinue orders");
    if (!userId) return setError("Doctor identity not available");
    try {
      await discontinueOrder(order.id, Number(userId));
      await refresh();
    } catch (err: any) {
      setError(err.message ?? "Failed to discontinue");
    }
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">Doctor's Orders</span>
        <span className="mono">{patientId}</span>
      </div>

      {error && <div style={{ padding: 12, color: "var(--color-critical)" }}>{error}</div>}

      {isDoctor ? (
        <div style={{ padding: 12, borderBottom: "1px solid var(--border)", display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? "Cancel" : "New Order"}
          </button>
          <button className="btn-ghost" onClick={refresh} disabled={loading}>
            Refresh
          </button>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-secondary)" }}>{orders.length} orders</div>
        </div>
      ) : (
        <div style={{ padding: 12, borderBottom: "1px solid var(--border)", fontSize: 12, color: "var(--text-secondary)" }}>
          Read-only view for non-doctor users
        </div>
      )}

      {showForm && isDoctor && (
        <form onSubmit={handleCreate} style={{ padding: 12, borderBottom: "1px solid var(--border)", display: "grid", gap: 8 }}>
          <input placeholder="Medicine name" value={medicine_name} onChange={e => setMedicineName(e.target.value)} required />
          <input placeholder="Dosage" value={dosage} onChange={e => setDosage(e.target.value)} required />
          <label style={{ fontSize: 12 }}>
            <select value={route} onChange={e => setRoute(e.target.value)} required>
              <option value="">Select route</option>
              {intakeRoutes.map(routeOption => (
                <option key={routeOption} value={routeOption}>
                  {routeOption}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 12 }}>
            <select value={frequency} onChange={e => setFrequency(e.target.value)} required>
              <option value="">Select frequency</option>
              {frequencyOptions.map(freq => (
                <option key={freq} value={freq}>
                  {freq}
                </option>
              ))}
            </select>
          </label>
           <label style={{ fontSize: 12 }}>
            <select value={timing} onChange={e => setTiming(e.target.value)} required>
              <option value="">Select timing</option>
              {crucialTimingFactors.map(timingOption => (
                <option key={timingOption} value={timingOption}>
                  {timingOption}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 12 }}>
            Start date
            <input type="date" value={start_date} onChange={e => setStartDate(e.target.value)} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" type="submit" disabled={submitting}>Create</button>
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)} disabled={submitting}>Cancel</button>
          </div>
        </form>
      )}

      <div>
        {loading ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-secondary)" }}>Loading orders…</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "var(--text-secondary)" }}>No orders found.</div>
        ) : (
          orders.map(o => (
            <div key={o.id} style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>💊</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{o.medicine_name} <span style={{ fontWeight: 400, fontSize: 12, color: "var(--text-secondary)" }}>{o.dosage} · {o.route} · {o.frequency}</span></div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {o.start_date}{o.end_date ? ` → ${o.end_date}` : ""} · Status: {o.status}
                </div>
              </div>

              <div style={{ textAlign: "right", fontSize: 12 }}>
                {o.discontinued_at ? (
                  <div style={{ color: "var(--color-critical)" }}>Discontinued</div>
                ) : (
                  <div style={{ color: "var(--text-muted)" }}>Active</div>
                )}
                {isDoctor && !o.discontinued_at && (
                  <button className="btn-ghost" onClick={() => handleDiscontinue(o)} style={{ marginTop: 8 }}>Discontinue</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
