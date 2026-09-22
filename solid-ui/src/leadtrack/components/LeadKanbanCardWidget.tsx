import {
  SolidIcon,
  type SolidKanbanCardWidgetProps,
} from "@solidxai/core-ui";
import "./lead-kanban-card.css";

const displayText = (value: unknown, fallback = "Not set") =>
  typeof value === "string" && value.trim() ? value : fallback;

const formatUpdatedDate = (value: unknown) => {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export default function LeadKanbanCardWidget({
  rowData,
}: SolidKanbanCardWidgetProps) {
  const owner =
    rowData?.owner?.fullName ?? rowData?.owner?.email ?? "Unassigned";
  const leadName = displayText(rowData?.name, "Unnamed lead");
  const company = displayText(rowData?.company, "Independent");
  const industry = displayText(rowData?.industry, "Unknown industry");
  const leadType = displayText(rowData?.leadType, "");
  const updatedDate = formatUpdatedDate(rowData?.updatedAt);

  return (
    <div className="lead-kanban-card-shell">
      <article className="lead-kanban-card">
        <div className="lead-kanban-card__body">
          <div className="lead-kanban-card__heading">
            <h3 title={leadName}>{leadName}</h3>
          </div>

          <div className="lead-kanban-card__context">
            <span title={company}>{company}</span>
            <span className="lead-kanban-card__context-dot" aria-hidden>•</span>
            <span title={industry}>{industry}</span>
          </div>

          <div className="lead-kanban-card__assignment-row">
            <span className="lead-kanban-card__owner" title={owner}>
              <SolidIcon name="si-user" size={13} aria-hidden />
              <span>{owner}</span>
            </span>
            {leadType && (
              <span className="lead-kanban-card__lead-type">{leadType}</span>
            )}
          </div>

          {updatedDate && (
            <footer className="lead-kanban-card__footer">
              <span>Updated</span>
              <time dateTime={String(rowData?.updatedAt)}>{updatedDate}</time>
            </footer>
          )}
        </div>
      </article>
    </div>
  );
}
