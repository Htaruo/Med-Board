# Med Board — Frontend

A patient monitoring dashboard for hospital wards, built for nurses, doctors, and admins to track patient status, medicine intake, and ward assignments in real time.

## Overview

Med Board gives clinical staff a single dashboard to see who's stable, who needs monitoring, and who's critical at a glance. Patients are organized by ward, each with their condition, status, assigned doctor, and medicine schedule. Status updates made by any user are reflected instantly across the dashboard, patient list, and individual patient profiles.

## Features

- **Dashboard** — live ward overview with patient counts by status (Stable, Monitoring, Critical, Recovery), a searchable patient table, and a medicine intake schedule for the selected patient
- **Patient List** — grid view of all patients with avatar initials, condition tags, status badges, and search/filter by status
- **Patient Profile** — detailed view per patient including ward/bed, condition, admission date, assigned physician, and an editable status dropdown
- **Add Patient** — modal form to admit new patients with condition selected from a live database-backed dropdown
- **Ward Switching** — navbar dropdown to filter the entire dashboard by ward
- **Role-based Views** — doctors only see their assigned patients; nurses see all patients; admins can assign doctors to patients
- **Authentication** — JWT-based login with persistent sessions via localStorage
- **User Menu** — avatar dropdown for profile access and sign out

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **React Router v6** for routing and protected routes
- **Context API** for global patient and ward state
- **CSS Variables** for a centralized design token system (colors, spacing, radius)

## Project Structure

```
src/
├── components/
│   ├── NavBar.tsx          # Top navigation with ward and user dropdowns
│   ├── StatusCard.tsx       # Status badge component
│   ├── MedSchedule.tsx      # Medicine intake checklist
│   ├── LiveClock.tsx        # Real-time clock display
│   └── components.css       # Shared component styles
├── pages/
│   ├── Dashboard.tsx        # Main ward overview
│   ├── PatientList.tsx      # All patients grid with Add Patient modal
│   ├── PatientProfile.tsx   # Individual patient detail view
│   ├── MedicineLog.tsx      # Medicine administration history
│   ├── Login.tsx            # Authentication page
│   └── pages.css            # Shared page layout styles
├── context/
│   └── PatientContext.tsx   # Global patient data and ward filtering
├── utils/
│   └── api.ts                # API client functions
├── App.tsx                   # Route definitions
├── main.tsx                  # App entry point
└── index.css                 # Design tokens and global styles
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- The [Med Board backend](#) running locally or deployed

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/medboard-frontend.git
cd medboard-frontend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

Replace with your deployed backend URL in production.

### Running Locally

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Output is generated in the `dist/` folder.

## Test Credentials

| Role  | Email | Password |
|-------|-------|----------|
| Nurse | nurse@medboard.ph | password123 |
| Doctor | doctor@medboard.ph | password123 |

> Change these credentials before deploying to production.

## Roles and Permissions

| Action | Nurse | Doctor | Admin |
|---|---|---|---|
| View all patients | ✅ | Own patients only | ✅ |
| Admit new patient | ✅ | ❌ | ✅ |
| Update patient status | ✅ | ✅ | ✅ |
| Assign doctor to patient | ❌ | ❌ | ✅ |

## Deployment

This project is deployed on [Vercel](https://vercel.com). Set the `VITE_API_URL` environment variable in your Vercel project settings to point to your deployed backend.

## License

This project was built for educational purposes.