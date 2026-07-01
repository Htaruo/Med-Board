const BASE = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// ── Auth ──────────────────────────────────────────────────
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  return res.json(); // { token, user }
}

// ── Patients ──────────────────────────────────────────────
export async function fetchPatients() {
  const res = await fetch(`${BASE}/patients`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
}

export async function fetchPatient(id: string) {
  const res = await fetch(`${BASE}/patients/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Patient not found");
  return res.json();
}

export async function updatePatientStatus(id: string, status_id: string) {
  const res = await fetch(`${BASE}/patients/${id}/status`, {
    method:  "PATCH",
    headers: authHeaders(),
    body:    JSON.stringify({ status_id: Number(status_id) }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export async function fetchStatuses() {
  const res = await fetch(`${BASE}/patients/statuses`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch statuses");
  return res.json();
}

// ── Intake ────────────────────────────────────────────────
export async function fetchIntakeLogs(patientId: string) {
  const res = await fetch(`${BASE}/intake?patientId=${patientId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch intake logs");
  return res.json();
}

export async function logIntake(patientId: string, medicineId: string, notes?: string) {
  const res = await fetch(`${BASE}/intake`, {
    method:  "POST",
    headers: authHeaders(),
    body:    JSON.stringify({ patientId, medicineId, notes }),
  });
  if (!res.ok) throw new Error("Failed to log intake");
  return res.json();
}

export async function fetchConditions() {
  const res = await fetch(`${BASE}/patients/conditions`, {
    headers: authHeaders(),
  });
  if(!res.ok) throw new Error("Failed to fetch conditions");
  return res.json();
}

export async function fetchDoctors() {
  const res = await fetch(`${BASE}/doctors`, {
    headers: authHeaders(),
  });
  if(!res.ok) throw new Error("Failed to fetch doctors");
  return res.json();
}

export async function assignDoctor(patientId: string, doctor_id: Number){
  const res = await fetch(`${BASE}/patients/${patientId}/assign-doctor`, {
    method: `PATCH`,
    headers: authHeaders(),
    body: JSON.stringify({doctor_id}),
  });

  if(!res.ok) throw new Error("Failed to assign doctor");
  return res.json();
}

// ── Doctor Orders ───────────────────────────────────────
export async function fetchDoctorOrders(patientId: string) {
  const res = await fetch(`${BASE}/orders/patients/${patientId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch doctor orders");
  return res.json();
}

export async function createDoctorOrder(patientId: string, payload: any) {
  const res = await fetch(`${BASE}/orders/patients/${patientId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (res.status === 201 || res.ok) return res.json();
  const text = await res.text();
  throw new Error("Failed to create doctor order: " + text);
}

export async function discontinueOrder(orderId: number, user_id: number) {
  const res = await fetch(`${BASE}/orders/${orderId}/discontinue`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ user_id }),
  });
  if (!res.ok) throw new Error("Failed to discontinue order");
  return res.json();
}
