import React from "react";
import { Check } from "lucide-react";
export default function Metric({ title, value, icon: Icon, foot, warning }) {
  return (
    <section className={"metric " + (warning ? "warning" : "")}>
      <div className="metric-top">
        <span>{title}</span>
        <Icon size={18} />
      </div>
      <strong>{value}</strong>
      <div className="metric-foot">
        {warning ? (
          <span className="warning-dot" />
        ) : (
          <span className="metric-check">
            <Check size={12} />
          </span>
        )}
        {foot}
      </div>
    </section>
  );
}
