import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { fetchPatients, updatePatientStatus } from "../utils/api";

export type Status = "stable" | "monitoring" | "critical" | "recovery";

export interface Patient {
  id:           string;
  patient_code?: string;
  name:         string;
  age:          number;
  ward:         string;
  bed:          string;
  condition:    string;
  status:       Status;
  admittedOn:   string;
  doctor:    string;
  doctor_id?: number
  medicines?:   any[];
  status_id?:   number;
}

interface PatientContextType {
  patients:     Patient[];
  loading:      boolean;
  error:        string | null;
  getPatient:   (id: string) => Patient | undefined;
  updateStatus: (id: string, status: Status) => Promise<void>;
  refetch:      () => void;
}

const PatientContext = createContext<PatientContextType | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  async function loadPatients() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPatients();

      const mapped: Patient[] = data.map((p: any) => {
  const rawStatus = p.status ?? p.status_label ?? "stable";
  console.log("id:", p.id, "| name:", p.fullName, "| raw status:", rawStatus, "| status_id:", p.status_id);
  
  return {
    id:           String(p.id),
    patient_code: p.patient_code,
    name:         p.fullName ?? `${p.first_name} ${p.last_name}`,
    age:          p.age,
    ward:         p.ward_bed ?? p.ward ?? "—",
    bed:          p.ward_bed ?? p.bed  ?? "—",
    condition:    p.condition ?? "—",
    status:       rawStatus.toLowerCase() as Status,
    admittedOn:   p.admitted_at ?? p.admittedOn ?? "—",
    doctor:    p.doctor   ?? "—",
    doctor_id:    p.doctor_id ?? null,
    medicines:    p.medicines   ?? [],
    status_id:    p.status_id,
  };
});

      setPatients(mapped);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPatients(); }, []);

  function getPatient(id: string) {
    return patients.find(p => p.id === id);
  }

  async function updateStatus(id: string, status: Status) {
    // Map status string → status_id for your backend
    const statusMap: Record<Status, number> = {
      stable:   1,
      monitoring:2,
      critical: 3,
      recovery: 4,
    };

    // Optimistic update
    setPatients(prev => prev.map(p =>
      p.id === id ? { ...p, status, status_id: statusMap[status] } : p
    ));

    try {
      await updatePatientStatus(id, String(statusMap[status]));
    } catch {
      loadPatients(); // revert on failure
    }
  }

  return (
    <PatientContext.Provider value={{
      patients, loading, error,
      getPatient, updateStatus,
      refetch: loadPatients,
    }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatients must be used inside <PatientProvider>");
  return ctx;
}