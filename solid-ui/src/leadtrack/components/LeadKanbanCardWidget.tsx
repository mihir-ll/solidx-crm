import {
  SolidIcon,
  type SolidKanbanCardWidgetProps,
} from "@solidxai/core-ui";
import "./lead-kanban-card.css";

const displayText = (value: unknown, fallback = "Not set") =>
  typeof value === "string" && value.trim() ? value : fallback;

const selectionDisplayText = (
  value: unknown,
  fieldMetadata: { selectionStaticValues?: unknown } | undefined,
) => {
  const rawValue = displayText(value, "");
  if (!rawValue) return "";

  const labelMap = Array.isArray(fieldMetadata?.selectionStaticValues)
    ? fieldMetadata.selectionStaticValues.reduce<Record<string, string>>((map, entry) => {
        const [raw, ...labelParts] = String(entry).split(":");
        const key = raw.trim();
        if (key) map[key] = labelParts.join(":").trim() || key;
        return map;
      }, {})
    : {};

  return labelMap[rawValue] ?? rawValue;
};
const formatDate = (value: unknown) => {
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
  solidFieldsMetadata,
}: SolidKanbanCardWidgetProps) {
  const owner =
    rowData?.owner?.fullName ?? rowData?.owner?.email ?? "Unassigned";
  const leadName = displayText(rowData?.name, "Unnamed lead");
  const company = displayText(rowData?.company, "Independent");
  const leadType = selectionDisplayText(
    rowData?.leadType,
    solidFieldsMetadata?.leadType,
  );
  const cardDate = formatDate(rowData?.updatedAt);

  return (
    <div className="lead-kanban-card-shell">
      <article className="lead-kanban-card">
        <div className="lead-kanban-card__body">
          <div className="lead-kanban-card__heading">
            <h3 title={leadName}>{leadName}</h3>
          </div>

          <div className="lead-kanban-card__context">
            <span title={company}>{company}</span>
            {cardDate && (
              <>
                <span className="lead-kanban-card__context-dot" aria-hidden>•</span>
                <time dateTime={String(rowData?.updatedAt)}>{cardDate}</time>
              </>
            )}
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
        </div>
      </article>
    </div>
  );
}
