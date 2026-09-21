import type { SolidKanbanCardWidgetProps } from "@solidxai/core-ui";
import "./lead-kanban-card.css";

const sourceLabels: Record<string, string> = {
  PhoneCall: "Phone Call",
};

const formatMoney = (value: unknown, currency = "INR") => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Not set";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (value: unknown) => {
  if (typeof value !== "string" || !value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const displayText = (value: unknown, fallback = "Not set") =>
  typeof value === "string" && value.trim() ? value : fallback;

export default function LeadKanbanCardWidget({
  rowData,
}: SolidKanbanCardWidgetProps) {
  const stageRecord =
    rowData?.stage && typeof rowData.stage === "object" ? rowData.stage : null;
  const stage = displayText(stageRecord?.name, "Unassigned stage");
  const sourceKey = displayText(rowData?.source, "Other");
  const source = sourceLabels[sourceKey] ?? sourceKey;
  const owner =
    rowData?.owner?.fullName ?? rowData?.owner?.email ?? "Unassigned";
  const leadId = rowData?.id ?? rowData?._id;

  return (
    <div className="lead-kanban-card-shell">
      <article className="lead-kanban-card">
        <div className="lead-kanban-card__status-bar">
          <span className="lead-kanban-card__status" title={stage}>
            {stage}
          </span>
        </div>

        <div className="lead-kanban-card__body">
          <div className="lead-kanban-card__heading">
            <h3 title={displayText(rowData?.name, "Unnamed lead")}>
              {displayText(rowData?.name, "Unnamed lead")}
            </h3>
            <div>
            <p className="text-sm" title={displayText(rowData?.company, "Independent")}>
              {displayText(rowData?.company, "Independent")}
            </p>
            <p className="text-xs" title={displayText(rowData?.industry, "Unknown")}>
              {displayText(rowData?.industry, "Unknown")}
            </p>
            </div>
          </div>

          <div className="lead-kanban-card__meta">
            <div className="lead-kanban-card__meta-item">
              <span>Value</span>
              <strong>
                {formatMoney(rowData?.dealValue, rowData?.currency)}
              </strong>
            </div>
            <div className="lead-kanban-card__meta-item">
              <span>Source</span>
              <strong title={source}>{source}</strong>
            </div>
            <div className="lead-kanban-card__meta-item">
              <span>Phone</span>
              <strong title={displayText(rowData?.phone)}>
                {displayText(rowData?.phone)}
              </strong>
            </div>
            <div className="lead-kanban-card__meta-item">
              <span>Close date</span>
              <strong>{formatDate(rowData?.expectedCloseDate)}</strong>
            </div>
          </div>

          <footer className="lead-kanban-card__footer">
            <span className="lead-kanban-card__owner" title={owner}>
              {owner}
            </span>
            {leadId != null && (
              <span className="lead-kanban-card__id">#{String(leadId)}</span>
            )}
          </footer>
        </div>
      </article>
    </div>
  );
}
