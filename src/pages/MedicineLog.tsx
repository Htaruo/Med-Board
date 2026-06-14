// MedicineLog.tsx — Route: /medicine-log
// Timestamped log of every medicine administration event.
// Nurses can filter by patient, date range, or medicine name.

export default function MedicineLog() {
  // TODO: fetch log entries from API
  // TODO: useState for filters: patientId, dateRange, medicineName

  return (
    <div className="page-wrapper">

      <div className="page-header">
        <div>
          <h1 className="page-title">Medicine Log</h1>
          <p className="page-subtitle">Full administration history · Ward B</p>
        </div>
        {/* TODO: <ExportButton /> */}
        <button className="btn-ghost">Export PDF</button>
      </div>

      {/* ── Filters ── */}
      {/* TODO: extract into <LogFilterBar /> */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input placeholder="Search medicine..." style={{ maxWidth: 220 }} />
        <select style={{ maxWidth: 200 }}>
          <option value="">All patients</option>
          {/* TODO: map patients from context */}
        </select>
        <input type="date" style={{ maxWidth: 160 }} />
      </div>

      {/* ── Log table ── */}
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">All entries</span>
          {/* TODO: entry count badge */}
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient</th>
              <th>Medicine</th>
              <th>Dose</th>
              <th>Route</th>
              <th>Given by</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {/* TODO: logEntries.map(entry => <LogRow key={entry.id} {...entry} />) */}
            <tr>
              <td colSpan={7} style={{ textAlign: "center", color: "var(--text-secondary)", padding: 40 }}>
                No entries yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}