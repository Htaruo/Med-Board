import { useEffect, useState } from "react";

export default function LiveClock() {
  const [date, setDate] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="mono">
      {date.toLocaleDateString()} {date.toLocaleTimeString()}
    </span>
  );
}
