// StatusCard.tsx
// Coloured badge for a patient's current status.
// Props:
//   status: "stable" | "watch" | "critical" | "recovery"

export type Status = "stable" | "monitoring" | "critical" | "recovery";

const CONFIG: Record<Status, { label: string; cls: string }> = {
  stable:     { label: "Stable",      cls: "badge badge-stable" },
  monitoring: { label: "Monitoring",  cls: "badge badge-watch" },  // ← was "watch"
  critical:   { label: "Critical",    cls: "badge badge-critical" },
  recovery:   { label: "Recovery",    cls: "badge badge-info" },
};

interface Props { status: Status; }

export default function StatusCard({ status }: Props) {
  const { label, cls } = CONFIG[status] ?? CONFIG.stable;
  return <span className={cls}>{label}</span>;
}
