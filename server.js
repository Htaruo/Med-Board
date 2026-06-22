import express from "express";
import cors from "cors";
import fs from "fs";
import path from "url";
import { fileURLToPath } from "url";
import pathLib from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathLib.dirname(__filename);
const DB_PATH = pathLib.join(__dirname, "mock-db.json");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Helper function to read from DB
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file:", err);
    return { users: [], statuses: [], conditions: [], doctors: [], patients: [], intakeLogs: [] };
  }
}

// Helper function to write to DB
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing to database file:", err);
  }
}

// Helper function to perform lookups and map a patient object
function mapPatient(patient, db) {
  const condition = db.conditions.find(c => c.id === patient.condition_id);
  const statusObj = db.statuses.find(s => s.id === patient.status_id);
  const doctorObj = db.doctors.find(d => d.id === patient.doctor_id);

  return {
    ...patient,
    id: patient.id,
    fullName: patient.fullName ?? `${patient.first_name} ${patient.last_name}`,
    condition: condition ? condition.condition_name : "—",
    status_label: statusObj ? statusObj.status_label : "Stable",
    status: statusObj ? statusObj.status_label.toLowerCase() : "stable",
    doctor: doctorObj ? `Dr. ${doctorObj.first_name} ${doctorObj.last_name}` : null,
    medicines: patient.medicines ?? [],
    status_id: patient.status_id,
    doctor_id: patient.doctor_id ?? null
  };
}

// Simple authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized access - Token missing" });
  }
  const token = authHeader.split(" ")[1];
  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({ error: "Unauthorized access - Invalid token" });
  }
  // For mock purpose, check if it's our mock prefix
  if (token.startsWith("mock-jwt-token-")) {
    const userId = token.replace("mock-jwt-token-", "");
    const db = readDB();
    const user = db.users.find(u => String(u.id) === userId);
    if (user) {
      req.user = user;
      return next();
    }
  }
  return res.status(401).json({ error: "Unauthorized access - Token invalid" });
}

// ── Auth ──────────────────────────────────────────────────
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Generate a mock token using the user's ID
  const token = `mock-jwt-token-${user.id}`;
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

// ── Patients ──────────────────────────────────────────────
app.get("/patients", authenticate, (req, res) => {
  const db = readDB();
  const mappedPatients = db.patients.map(p => mapPatient(p, db));
  res.json(mappedPatients);
});

app.get("/patients/statuses", authenticate, (req, res) => {
  const db = readDB();
  res.json(db.statuses);
});

app.get("/patients/conditions", authenticate, (req, res) => {
  const db = readDB();
  res.json(db.conditions);
});

app.get("/patients/:id", authenticate, (req, res) => {
  const db = readDB();
  const patient = db.patients.find(p => String(p.id) === String(req.params.id));
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }
  res.json(mapPatient(patient, db));
});

app.post("/patients", authenticate, (req, res) => {
  const { patient_code, first_name, last_name, age, ward_id, condition_id, status_id, admitted_at } = req.body;

  if (!patient_code || !first_name || !last_name || age === undefined) {
    return res.status(400).json({ error: "Patient code, first name, last name, and age are required." });
  }

  const db = readDB();

  // Simple validation for duplicate patient code
  if (db.patients.some(p => p.patient_code.toLowerCase() === patient_code.toLowerCase())) {
    return res.status(400).json({ error: "A patient with this Patient Code already exists." });
  }

  const nextId = db.patients.length > 0 ? Math.max(...db.patients.map(p => p.id)) + 1 : 1;
  const wardName = ward_id === 1 || String(ward_id) === "1" ? "Ward A" : "Ward B";
  const bedNum = Math.floor(Math.random() * 20) + 1;

  const newPatient = {
    id: nextId,
    patient_code,
    first_name,
    last_name,
    age: Number(age),
    ward_bed: `${wardName} - Bed ${bedNum}`,
    condition_id: Number(condition_id),
    status_id: Number(status_id),
    admitted_at: admitted_at || new Date().toISOString().split("T")[0],
    doctor_id: null,
    medicines: [
      { id: "m1", name: "Amoxicillin", dose: "500 mg", route: "oral", time: "08:00 AM", given: false },
      { id: "m4", name: "Paracetamol", dose: "1 g", route: "oral", time: "06:00 PM", given: false }
    ]
  };

  db.patients.push(newPatient);
  writeDB(db);

  res.status(201).json(mapPatient(newPatient, db));
});

app.patch("/patients/:id/status", authenticate, (req, res) => {
  const { status_id } = req.body;
  if (status_id === undefined) {
    return res.status(400).json({ error: "status_id is required" });
  }

  const db = readDB();
  const patientIndex = db.patients.findIndex(p => String(p.id) === String(req.params.id));
  if (patientIndex === -1) {
    return res.status(404).json({ error: "Patient not found" });
  }

  db.patients[patientIndex].status_id = Number(status_id);
  writeDB(db);

  res.json(mapPatient(db.patients[patientIndex], db));
});

app.patch("/patients/:id/assign-doctor", authenticate, (req, res) => {
  const { doctor_id } = req.body;
  if (doctor_id === undefined) {
    return res.status(400).json({ error: "doctor_id is required" });
  }

  const db = readDB();
  const patientIndex = db.patients.findIndex(p => String(p.id) === String(req.params.id));
  if (patientIndex === -1) {
    return res.status(404).json({ error: "Patient not found" });
  }

  // Ensure doctor exists or is null (if unassigning)
  if (doctor_id !== null && !db.doctors.some(d => d.id === Number(doctor_id))) {
    return res.status(400).json({ error: "Invalid doctor ID" });
  }

  db.patients[patientIndex].doctor_id = doctor_id ? Number(doctor_id) : null;
  writeDB(db);

  res.json(mapPatient(db.patients[patientIndex], db));
});

// ── Doctors ────────────────────────────────────────────────
app.get("/doctors", authenticate, (req, res) => {
  const db = readDB();
  res.json(db.doctors);
});

// ── Intake ────────────────────────────────────────────────
app.get("/intake", authenticate, (req, res) => {
  const { patientId } = req.query;
  const db = readDB();
  let logs = db.intakeLogs;
  if (patientId) {
    logs = logs.filter(l => String(l.patientId) === String(patientId));
  }
  res.json(logs);
});

app.post("/intake", authenticate, (req, res) => {
  const { patientId, medicineId, notes } = req.body;
  if (!patientId || !medicineId) {
    return res.status(400).json({ error: "patientId and medicineId are required" });
  }

  const db = readDB();
  const patient = db.patients.find(p => String(p.id) === String(patientId));
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }

  let medicineName = "Medicine";
  let dose = "—";
  let route = "—";

  if (patient.medicines) {
    const med = patient.medicines.find(m => String(m.id) === String(medicineId));
    if (med) {
      medicineName = med.name;
      dose = med.dose;
      route = med.route;
      med.given = true; // Mark as given when logged
    }
  }

  const nextLogId = db.intakeLogs.length > 0 ? Math.max(...db.intakeLogs.map(l => l.id)) + 1 : 1;
  const newLog = {
    id: nextLogId,
    patientId: String(patientId),
    medicineId: String(medicineId),
    medicineName,
    dose,
    route,
    givenBy: req.user ? req.user.name : "Nurse Joy",
    notes: notes || "",
    timestamp: new Date().toISOString()
  };

  db.intakeLogs.push(newLog);
  writeDB(db);

  res.status(201).json(newLog);
});

app.listen(PORT, () => {
  console.log(`Mock Medical API running at http://localhost:${PORT}`);
});
