import {
  SolidButton,
  SolidIcon,
  SolidInput,
  SolidSpinner,
} from "@solidxai/core-ui";
import { useMemo, useState } from "react";
import {
  type ActivityRecord,
  type ActivitySummaryGroup,
  useGetSummaryQuery,
  useLazyGetActivityQuery,
  useLazyExportActivityQuery,
  useGetUsersQuery,
} from "../api/leadActivityReportApi";
import "./lead-activity-report.css";

type LeadActivityGroup = {
  key: string;
  name: string;
  company: string | null;
  records: ActivityRecord[];
};

type RepresentativeActivityGroup = {
  key: string;
  name: string;
  email: string | null;
  leads: LeadActivityGroup[];
};

type DateRange = { startDate: string; endDate: string };
type Preset =
  | "today"
  | "yesterday"
  | "last7"
  | "thisWeek"
  | "thisMonth"
  | "lastMonth"
  | "custom";

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toLocalDate = (value: string, endOfDay = false) =>
  new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`).toISOString();

const currentMonthRange = (): DateRange => {
  const now = new Date();
  return {
    startDate: toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    endDate: toInputDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
};

const rangeForPreset = (preset: Exclude<Preset, "custom">): DateRange => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (preset === "today")
    return { startDate: toInputDate(today), endDate: toInputDate(today) };
  if (preset === "yesterday") {
    const day = new Date(today);
    day.setDate(day.getDate() - 1);
    return { startDate: toInputDate(day), endDate: toInputDate(day) };
  }
  if (preset === "last7") {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { startDate: toInputDate(start), endDate: toInputDate(today) };
  }
  if (preset === "thisWeek") {
    const start = new Date(today);
    const mondayOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - mondayOffset);
    return { startDate: toInputDate(start), endDate: toInputDate(today) };
  }
  if (preset === "lastMonth") {
    return {
      startDate: toInputDate(
        new Date(now.getFullYear(), now.getMonth() - 1, 1),
      ),
      endDate: toInputDate(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  }
  return currentMonthRange();
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const errorMessage = (error: unknown) => {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object" && "message" in data)
      return String((data as { message: unknown }).message);
  }
  return "Unable to load the activity report. Please try again.";
};

const eventLabel: Record<ActivityRecord["type"], string> = {
  lead_added: "Lead added",
  lead_changed: "Lead changed",
  task_completed: "Task completed",
  note_posted: "Note posted",
};

const eventDescription = (record: ActivityRecord) => {
  if (record.type === "lead_added") return "New lead added";
  if (record.type === "task_completed") {
    return `Follow-up completed${record.channel ? ` via ${record.channel}` : ""}`;
  }
  if (record.type === "note_posted") return record.message || "Note added";
  const stageChange = record.changes.find(
    (change) => change.fieldName === "stage",
  );
  if (stageChange) {
    return `Stage moved from ${stageChange.oldValueDisplay ?? stageChange.oldValue ?? "empty"} to ${stageChange.newValueDisplay ?? stageChange.newValue ?? "empty"}`;
  }
  return "Lead details updated";
};

export default function LeadActivityReportPage() {
  const initialRange = useMemo(() => currentMonthRange(), []);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [preset, setPreset] = useState<Preset>("thisMonth");
  const [submittedRange, setSubmittedRange] = useState({
    startDate: toLocalDate(initialRange.startDate),
    endDate: toLocalDate(initialRange.endDate, true),
  });
  const [selectedUserId, setSelectedUserId] = useState("");
  const [activityActorId, setActivityActorId] = useState<number | undefined>();
  const [collapsedRepresentativeKeys, setCollapsedRepresentativeKeys] =
    useState<Set<string>>(() => new Set());

  const users = useGetUsersQuery();
  const summary = useGetSummaryQuery(submittedRange, {
    refetchOnMountOrArgChange: true,
  });
  const [loadActivity, activity] = useLazyGetActivityQuery();
  const [exportActivity, exportState] = useLazyExportActivityQuery();
  const groups = summary.data?.groups ?? [];
  const selectedGroup = groups.find(
    (group) => (group.id ?? 0) === (activityActorId ?? -1),
  );
  const representativeGroups = useMemo(
    () => groupRecordsByRepresentative(activity.data?.records ?? []),
    [activity.data?.records],
  );
  const invalidRange = !startDate || !endDate || startDate > endDate;

  const runReport = (range = { startDate, endDate }) => {
    if (!range.startDate || !range.endDate || range.startDate > range.endDate)
      return;
    const actorId = selectedUserId ? Number(selectedUserId) : undefined;
    const nextQuery = {
      startDate: toLocalDate(range.startDate),
      endDate: toLocalDate(range.endDate, true),
      ...(actorId === undefined ? {} : { actorId }),
    };
    setActivityActorId(actorId);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setSubmittedRange(nextQuery);
    void loadActivity({
      ...nextQuery,
      ...(actorId === undefined ? {} : { actorId }),
      page: 1,
      pageSize: 100,
    });
  };

  const selectActor = (group: ActivitySummaryGroup) => {
    const actorId = group.id ?? 0;
    setActivityActorId(actorId);
    void loadActivity({ ...submittedRange, actorId, page: 1, pageSize: 100 });
  };

  const downloadCsv = async () => {
    try {
      const blob = await exportActivity({
        ...submittedRange,
        ...(activityActorId !== undefined ? { actorId: activityActorId } : {}),
      }).unwrap();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "leadtrack-team-activity-report.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // The query state displays the inline error.
    }
  };

  const refreshReport = () => {
    void summary.refetch();
    if (activityActorId !== undefined) {
      void loadActivity({
        ...submittedRange,
        actorId: activityActorId,
        page: 1,
        pageSize: 100,
      });
    }
  };

  const userLabel = (user: {
    fullName?: string;
    email?: string | null;
    username?: string | null;
  }) => user.fullName || user.email || user.username || "Unnamed user";

  return (
    <main className="solid-list-page-wrapper">
      <div className="solid-list-content">
        <div className="solid-list-surface">
          <div className="lead-activity-report">
            <header className="lead-activity-report__header page-header solid-list-toolbar">
              <div>
                <p className="lead-activity-report__eyebrow">LeadTrack Reports</p>
                <h1>Team activity report</h1>
                <p>Review work completed by the team for the selected period.</p>
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

      <section
        className="lead-activity-report__filters"
        aria-label="Activity report filters"
      >
        <div
          className="lead-activity-report__presets"
          role="group"
          aria-label="Date presets"
        >
          {(
            [
              "today",
              "yesterday",
              "last7",
              "thisWeek",
              "thisMonth",
              "lastMonth",
            ] as const
          ).map((value) => (
            <button
              className={preset === value ? "is-selected" : ""}
              key={value}
              type="button"
              onClick={() => {
                setPreset(value);
                runReport(rangeForPreset(value));
              }}
            >
              {value === "last7"
                ? "Last 7 days"
                : value === "thisWeek"
                  ? "This week"
                  : value === "thisMonth"
                    ? "This month"
                    : value === "lastMonth"
                      ? "Last month"
                      : value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
          <button
            className={preset === "custom" ? "is-selected" : ""}
            type="button"
            onClick={() => setPreset("custom")}
          >
            Custom
          </button>
        </div>
        <label className="lead-activity-report__user-filter">
          Representative
          <select
            value={selectedUserId}
            onChange={(event) => {
              setSelectedUserId(event.target.value);
              setActivityActorId(undefined);
            }}
            disabled={users.isLoading}
          >
            <option value="">All representatives</option>
            {(users.data ?? []).map((user) => (
              <option value={user.id} key={user.id}>
                {userLabel(user)}
              </option>
            ))}
          </select>
        </label>
        <label>
          From
          <SolidInput
            type="date"
            value={startDate}
            onChange={(event) => {
              setPreset("custom");
              setStartDate(event.target.value);
            }}
          />
        </label>
        <label>
          To
          <SolidInput
            type="date"
            value={endDate}
            onChange={(event) => {
              setPreset("custom");
              setEndDate(event.target.value);
            }}
          />
        </label>
        <SolidButton
          variant="primary"
          size="sm"
          icon="si-search"
          label="Run report"
          onClick={() => runReport()}
          disabled={invalidRange}
        />
      </section>

      {invalidRange && (
        <p className="lead-activity-report__validation">
          Choose a valid date range.
        </p>
      )}
      {summary.isError && (
        <p className="lead-activity-report__error">
          {errorMessage(summary.error)}
        </p>
      )}
      {exportState.isError && (
        <p className="lead-activity-report__error">
          {errorMessage(exportState.error)}
        </p>
      )}

      <section className="lead-activity-report__panel" aria-live="polite">
        <div className="lead-activity-report__section-heading">
          <div>
            <h2>Summary per representative</h2>
            <p>
              {summary.data?.totalActions ?? 0} report activities in the
              selected period
            </p>
          </div>
          {summary.isFetching && <SolidSpinner size={16} />}
        </div>
        {summary.isLoading ? (
          <div className="lead-activity-report__empty">
            <SolidSpinner />
          </div>
        ) : groups.length === 0 ? (
          <div className="lead-activity-report__empty">
            <SolidIcon name="si-inbox" size={24} aria-hidden />
            <span>No activity found for this period.</span>
          </div>
        ) : (
          <div className="lead-activity-report__table-wrap">
            <table className="lead-activity-report__table">
              <thead>
                <tr>
                  <th>Representative</th>
                  <th>Leads added</th>
                  <th>Tasks completed</th>
                  <th>Stage advances</th>
                  <th>Meetings set</th>
                  <th>Opportunities</th>
                  <th>Dead / wrong</th>
                  <th>Overdue</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  const selected = (group.id ?? 0) === activityActorId;
                  const representativeName =
                    group.fullName || group.email || "Unknown representative";
                  return (
                    <tr
                      className={selected ? "is-selected" : ""}
                      key={group.id ?? "system"}
                    >
                      <td>
                        <button
                          className="lead-activity-report__rep-button"
                          type="button"
                          onClick={() => selectActor(group)}
                        >
                          <strong>{representativeName}</strong>
                          <small>{group.email ?? "System activity"}</small>
                        </button>
                      </td>
                      <td>{group.leadsAdded}</td>
                      <td>
                        {group.tasksCompleted}
                        <small className="lead-activity-report__channel-summary">
                          {formatChannels(group.tasksCompletedByChannel)}
                        </small>
                      </td>
                      <td>{group.stageAdvances}</td>
                      <td>{group.meetingsSet}</td>
                      <td>{group.opportunitiesGenerated}</td>
                      <td>{group.deadOrWrong}</td>
                      <td>{group.overdueFollowUps}</td>
                      <td>{group.notesPosted}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="lead-activity-report__panel lead-activity-report__detail-panel">
        <div className="lead-activity-report__section-heading">
          <div>
            <h2>Detail</h2>
            <p>
              {activityActorId === undefined
                ? "Showing activity grouped by representative, then lead."
                : selectedGroup
                ? `Showing activity for ${selectedGroup.fullName}, grouped by lead.`
                : "Select a representative above to view activity grouped by lead."}
            </p>
          </div>
          {activity.isFetching && <SolidSpinner size={16} />}
        </div>
        {activity.isError && (
          <p className="lead-activity-report__error">
            {errorMessage(activity.error)}
          </p>
        )}
        {activity.isUninitialized ? (
          <div className="lead-activity-report__empty">
            <span>Select a representative to inspect their activity.</span>
          </div>
        ) : !activity.isFetching && representativeGroups.length === 0 ? (
          <div className="lead-activity-report__empty">
            <span>No detailed activity found.</span>
          </div>
        ) : (
          <div className="lead-activity-report__representative-groups">
            {representativeGroups.map((representative) => {
              const isExpanded = !collapsedRepresentativeKeys.has(
                representative.key,
              );
              const contentId = `representative-activity-${representative.key}`;

              return (
                <section
                  className="lead-activity-report__representative-group"
                  key={representative.key}
                >
                  <button
                    className="lead-activity-report__representative-heading"
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={contentId}
                    onClick={() => {
                      setCollapsedRepresentativeKeys((current) => {
                        const next = new Set(current);
                        if (isExpanded) next.add(representative.key);
                        else next.delete(representative.key);
                        return next;
                      });
                    }}
                  >
                    <SolidIcon
                      name={isExpanded ? "si-chevron-up" : "si-chevron-down"}
                      size={15}
                      aria-hidden
                    />
                    <span className="lead-activity-report__representative-label">
                      <strong>{representative.name}</strong>
                      {representative.email && <span>{representative.email}</span>}
                    </span>
                  </button>
                  {isExpanded && (
                    <div
                      className="lead-activity-report__lead-groups"
                      id={contentId}
                    >
                      {representative.leads.map((group) => (
                        <div
                          className="lead-activity-report__lead-group"
                          key={group.key}
                        >
                          <div className="lead-activity-report__lead-heading">
                            <strong>{group.name}</strong>
                            {group.company && <span>{group.company}</span>}
                          </div>
                          <div className="lead-activity-report__table-wrap">
                            <table className="lead-activity-report__table lead-activity-report__detail-table">
                              <thead>
                                <tr>
                                  <th>Time</th>
                                  <th>Activity</th>
                                  <th>Channel</th>
                                  <th>Update</th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.records.map((record) => (
                                  <tr key={record.id}>
                                    <td>{formatDateTime(record.occurredAt)}</td>
                                    <td>
                                      <span
                                        className={`lead-activity-report__event lead-activity-report__event--${record.type}`}
                                      >
                                        {eventLabel[record.type]}
                                      </span>
                                    </td>
                                    <td>{record.channel ?? "—"}</td>
                                    <td>
                                      <p className="lead-activity-report__event-message">
                                        {eventDescription(record)}
                                      </p>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function formatChannels(
  channels: ActivitySummaryGroup["tasksCompletedByChannel"],
) {
  return (
    Object.entries(channels)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => `${key}: ${value}`)
      .join(" · ") || "No channel split"
  );
}

function groupRecordsByRepresentative(records: ActivityRecord[]) {
  const representatives = new Map<string, RepresentativeActivityGroup>();

  for (const record of records) {
    const representativeKey = String(
      record.actor.id ??
        `system-${record.actor.email ?? record.actor.fullName ?? "unknown"}`,
    );
    const representative = representatives.get(representativeKey) ?? {
      key: representativeKey,
      name: record.actor.fullName || record.actor.email || "Unknown representative",
      email: record.actor.email,
      leads: [],
    };
    const leadKey = String(
      record.lead.id ?? `${record.lead.name}-${record.entityId}`,
    );
    let lead = representative.leads.find((item) => item.key === leadKey);
    if (!lead) {
      lead = {
        key: leadKey,
        name: record.lead.name,
        company: record.lead.company,
        records: [],
      };
      representative.leads.push(lead);
    }
    lead.records.push(record);
    representatives.set(representativeKey, representative);
  }

  return Array.from(representatives.values());
}
