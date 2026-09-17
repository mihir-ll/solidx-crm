import type { SolidKanbanCardWidgetProps } from "@solidxai/core-ui";
import "./lead-kanban-card.css";

const stageLabels: Record<string, string> = {
  FirstContactPending: "First Contact Pending",
  FollowUp: "Follow up",
  MeetingSet: "Meeting Set",
  MeetingPending: "Meeting Pending",
  OpportunityGenerated: "Opportunity Generated",
  WrongLeadInfo: "Wrong Lead Info",
};

const formatMoney = (value: unknown, currency = "INR") => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Value not set";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
};

export default function LeadKanbanCardWidget({ rowData }: SolidKanbanCardWidgetProps) {
  const owner = rowData?.owner?.fullName ?? rowData?.owner?.email ?? "Unassigned";
  const stage = stageLabels[rowData?.stage] ?? rowData?.stage ?? "New";

  return (
    <article className={`lead-card lead-card--${String(rowData?.stage ?? "new").toLowerCase()}`}>
      <div className="lead-card__header">
        <span className="lead-card__stage">{stage}</span>
        <span className="lead-card__source">{rowData?.source ?? "Other"}</span>
      </div>
      <h3>{rowData?.name ?? "Unnamed lead"}</h3>
      <p className="lead-card__company">{rowData?.company ?? "Independent"}</p>
      <div className="lead-card__value">{formatMoney(rowData?.dealValue, rowData?.currency)}</div>
      <footer>
        <span>{owner}</span>
        <span>{rowData?.expectedCloseDate ?? "No close date"}</span>
      </footer>
    </article>
  );
}
