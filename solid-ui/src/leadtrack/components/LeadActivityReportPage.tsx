import {
  SolidButton,
  SolidIcon,
  SolidInput,
  SolidSpinner,
} from "@solidxai/core-ui";
import { useEffect, useMemo, useState } from "react";
import {
  type ActivityRecord,
  type ActivitySummaryGroup,
  useGetSummaryQuery,
  useLazyGetActivityQuery,
  useLazyExportActivityQuery,
} from "../api/leadActivityReportApi";
import "./lead-activity-report.css";

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toLocalDate = (value: string, endOfDay = false) => {
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`);
  return date.toISOString();
};

const currentMonthRange = () => {
  const now = new Date();
  return {
    startDate: toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    endDate: toInputDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const changeValue = (display: string | null | undefined, raw: string | null | undefined) =>
  display ?? raw ?? "—";

const errorMessage = (error: unknown) => {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object" && "message" in data) {
      return String((data as { message: unknown }).message);
    }
  }
  return "Unable to load activity. Please try again.";
};

export default function LeadActivityReportPage() {
  const initialRange = useMemo(currentMonthRange, []);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [submittedRange, setSubmittedRange] = useState({
    startDate: toLocalDate(initialRange.startDate),
    endDate: toLocalDate(initialRange.endDate, true),
  });
  const [expandedActorId, setExpandedActorId] = useState<number | null | undefined>(undefined);
  const [activityActorId, setActivityActorId] = useState<number | undefined>();

  const summary = useGetSummaryQuery(submittedRange, { refetchOnMountOrArgChange: true });
  const [loadActivity, activity] = useLazyGetActivityQuery();
  const [exportActivity, exportState] = useLazyExportActivityQuery();

  useEffect(() => {
    setExpandedActorId(undefined);
    setActivityActorId(undefined);
  }, [submittedRange]);

  const runReport = () => {
    if (!startDate || !endDate || startDate > endDate) return;
    setSubmittedRange({
      startDate: toLocalDate(startDate),
      endDate: toLocalDate(endDate, true),
    });
  };

  const toggleActor = (group: ActivitySummaryGroup) => {
    const actorId = group.id ?? 0;
    if (expandedActorId === actorId) {
      setExpandedActorId(undefined);
      setActivityActorId(undefined);
      return;
    }

    setExpandedActorId(actorId);
    setActivityActorId(actorId);
    void loadActivity({ ...submittedRange, actorId, page: 1, pageSize: 25 });
  };

  const downloadCsv = async () => {
    try {
      const blob = await exportActivity({ ...submittedRange, ...(activityActorId !== undefined ? { actorId: activityActorId } : {}) }).unwrap();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "leadtrack-activity-report.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // RTK Query exposes the error through exportState for the inline error state.
    }
  };

  const groups = summary.data?.groups ?? [];
  const invalidRange = !startDate || !endDate || startDate > endDate;
  const visibleActivity = activity.data?.records ?? [];
  const refreshReport = () => {
    void summary.refetch();
    if (activityActorId !== undefined) {
      void loadActivity({ ...submittedRange, actorId: activityActorId, page: activity.data?.page ?? 1, pageSize: 25 });
    }
  };

  return (
    <main className="lead-activity-report">
      <header className="lead-activity-report__header">
        <div>
          <p className="lead-activity-report__eyebrow">LeadTrack Reports</p>
          <h1>Activity Report</h1>
          <p>Review lead and follow-up actions performed during a selected period.</p>
        </div>
        <div className="lead-activity-report__actions">
          <SolidButton
            variant="outline"
            size="sm"
            icon="si-refresh"
            label="Refresh"
            onClick={refreshReport}
            disabled={summary.isFetching}
          />
          <SolidButton
            variant="primary"
            size="sm"
            icon="si-download"
            label="Export CSV"
            onClick={() => void downloadCsv()}
            loading={exportState.isFetching}
            disabled={invalidRange || summary.isLoading}
          />
        </div>
      </header>

      <section className="lead-activity-report__filters" aria-label="Activity report filters">
        <label>
          Start date
          <SolidInput type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </label>
        <label>
          End date
          <SolidInput type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </label>
        <SolidButton
          variant="primary"
          size="sm"
          icon="si-search"
          label="Run report"
          onClick={runReport}
          disabled={invalidRange}
        />
      </section>

      {invalidRange && <p className="lead-activity-report__validation">Choose a valid start and end date.</p>}
      {summary.isError && <p className="lead-activity-report__error">{errorMessage(summary.error)}</p>}
      {exportState.isError && <p className="lead-activity-report__error">{errorMessage(exportState.error)}</p>}

      <section className="lead-activity-report__summary" aria-live="polite">
        <div className="lead-activity-report__summary-heading">
          <div>
            <h2>Actions by user</h2>
            <p>{summary.data?.totalActions ?? 0} actions in the selected period</p>
          </div>
          {summary.isFetching && <SolidSpinner size={16} />}
        </div>

        {summary.isLoading ? (
          <div className="lead-activity-report__empty"><SolidSpinner /></div>
        ) : groups.length === 0 ? (
          <div className="lead-activity-report__empty">
            <SolidIcon name="si-inbox" size={24} aria-hidden />
            <span>No activity found for this period.</span>
          </div>
        ) : (
          <div className="lead-activity-report__groups">
            {groups.map((group) => {
              const actorId = group.id ?? 0;
              const isExpanded = expandedActorId === actorId;
              return (
                <article className={`lead-activity-report__group${isExpanded ? " is-expanded" : ""}`} key={actorId}>
                  <button className="lead-activity-report__group-toggle" type="button" onClick={() => toggleActor(group)} aria-expanded={isExpanded}>
                    <span className="lead-activity-report__group-person">
                      <span className="lead-activity-report__avatar"><SolidIcon name="si-user" size={16} aria-hidden /></span>
                      <span>
                        <strong>{group.fullName}</strong>
                        <small>{group.email ?? "System activity"}</small>
                      </span>
                    </span>
                    <span className="lead-activity-report__counts">
                      <span><strong>{group.total}</strong><small>Total</small></span>
                      <span><strong>{group.created}</strong><small>Created</small></span>
                      <span><strong>{group.updated}</strong><small>Updated</small></span>
                      <span><strong>{group.deleted}</strong><small>Deleted</small></span>
                    </span>
                    <SolidIcon name={isExpanded ? "si-chevron-up" : "si-chevron-down"} size={16} aria-hidden />
                  </button>

                  {isExpanded && (
                    <div className="lead-activity-report__details">
                      {activity.isFetching && <div className="lead-activity-report__detail-loading"><SolidSpinner size={16} /></div>}
                      {activity.isError && <p className="lead-activity-report__error">{errorMessage(activity.error)}</p>}
                      {!activity.isFetching && !activity.isError && visibleActivity.length === 0 && <p className="lead-activity-report__detail-empty">No detailed actions found.</p>}
                      {!activity.isFetching && visibleActivity.map((record) => <ActivityRow key={record.id} record={record} />)}
                      {(activity.data?.totalPages ?? 0) > 1 && (
                        <div className="lead-activity-report__pagination">
                          <span>Page {activity.data?.page} of {activity.data?.totalPages}</span>
                          <SolidButton
                            variant="outline"
                            size="sm"
                            label="Next"
                            disabled={activity.isFetching || (activity.data?.page ?? 1) >= (activity.data?.totalPages ?? 1)}
                            onClick={() => void loadActivity({ ...submittedRange, actorId, page: (activity.data?.page ?? 1) + 1, pageSize: 25 })}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function ActivityRow({ record }: { record: ActivityRecord }) {
  return (
    <div className="lead-activity-report__record">
      <div className="lead-activity-report__record-heading">
        <span className={`lead-activity-report__action lead-activity-report__action--${record.action.toLowerCase()}`}>{record.action}</span>
        <strong>{record.entity}</strong>
        <span className="lead-activity-report__record-key">{record.record}</span>
        <time dateTime={record.occurredAt}>{formatDateTime(record.occurredAt)}</time>
      </div>
      <p>{record.message}</p>
      {record.changes.length > 0 && (
        <div className="lead-activity-report__changes">
          {record.changes.map((change) => (
            <div className="lead-activity-report__change" key={`${record.id}-${change.fieldName}`}>
              <span>{change.fieldDisplayName ?? change.fieldName}</span>
              <del>{changeValue(change.oldValueDisplay, change.oldValue)}</del>
              <SolidIcon name="si-arrow-right" size={13} aria-hidden />
              <ins>{changeValue(change.newValueDisplay, change.newValue)}</ins>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
