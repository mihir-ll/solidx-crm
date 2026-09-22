import {
  SolidIcon,
  type SolidKanbanCardWidgetProps,
} from "@solidxai/core-ui";
import "./lead-kanban-card.css";

const formatMoney = (value: unknown, currency = "INR") => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Not set";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

const displayText = (value: unknown, fallback = "Not set") =>
  typeof value === "string" && value.trim() ? value : fallback;

export default function LeadKanbanCardWidget({
  rowData,
}: SolidKanbanCardWidgetProps) {
  const source = displayText(rowData?.source, "Other");
  const owner =
    rowData?.owner?.fullName ?? rowData?.owner?.email ?? "Unassigned";
  const leadName = displayText(rowData?.name, "Unnamed lead");
  const company = displayText(rowData?.company, "Independent");
  const industry = displayText(rowData?.industry, "Unknown industry");
  const designation = displayText(rowData?.designation, "");
  const leadType = displayText(rowData?.leadType, "");
  const phone = displayText(rowData?.phone, "No phone");
  const email = displayText(rowData?.email, "No email");
  const value = formatMoney(rowData?.dealValue, rowData?.currency);

  return (
    <div className="lead-kanban-card-shell">
      <article className="lead-kanban-card">
        <div className="lead-kanban-card__body">
          <div className="lead-kanban-card__heading">
            <h3 title={leadName}>{leadName}</h3>
            <span className="lead-kanban-card__heading-separator" aria-hidden />
            <span className="lead-kanban-card__owner" title={owner}>
              <SolidIcon name="si-user" size={13} aria-hidden />
              <span>{owner}</span>
            </span>
          </div>

          <div className="lead-kanban-card__context">
            <span title={company}>{company}</span>
          </div>

          <div className="lead-kanban-card__context">
            <span title={industry}>{industry}</span>
            {designation && (
              <>
                <span className="lead-kanban-card__context-dot" aria-hidden>•</span>
                <span title={designation}>{designation}</span>
              </>
            )}
          </div>

          {leadType && (
            <div className="lead-kanban-card__type-row">
              <span className="lead-kanban-card__lead-type">{leadType}</span>
            </div>
          )}

          <div className="lead-kanban-card__meta">
            <div
              className="lead-kanban-card__meta-item"
              aria-label={`Value: ${value}`}
              title={`Value: ${value}`}
            >
              <span className="lead-kanban-card__meta-icon material-symbols-outlined" aria-hidden>
                payments
              </span>
              <strong>{value}</strong>
            </div>
            <div
              className="lead-kanban-card__meta-item"
              aria-label={`Source: ${source}`}
              title={`Source: ${source}`}
            >
              <span className="lead-kanban-card__meta-icon material-symbols-outlined" aria-hidden>
                campaign
              </span>
              <strong>{source}</strong>
            </div>
            <div
              className="lead-kanban-card__meta-item"
              aria-label={`Phone: ${phone}`}
              title={`Phone: ${phone}`}
            >
              <span className="lead-kanban-card__meta-icon material-symbols-outlined" aria-hidden>
                call
              </span>
              <strong>{phone}</strong>
            </div>
            <div
              className="lead-kanban-card__meta-item"
              aria-label={`Email: ${email}`}
              title={`Email: ${email}`}
            >
              <span className="lead-kanban-card__meta-icon material-symbols-outlined" aria-hidden>
                mail
              </span>
              <strong>{email}</strong>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
