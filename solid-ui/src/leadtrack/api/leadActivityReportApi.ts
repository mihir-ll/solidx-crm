import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@solidxai/core-ui";

export type LeadActivityReportQuery = {
  startDate: string;
  endDate: string;
  actorId?: number;
  page?: number;
  pageSize?: number;
};

export type ActivityActor = {
  id: number | null;
  fullName: string;
  email: string | null;
};

export type ReportUser = {
  id: number;
  fullName?: string;
  email?: string | null;
  username?: string | null;
};

export type ActivitySummaryGroup = ActivityActor & {
  leadsAdded: number;
  tasksCompleted: number;
  tasksCompletedByChannel: Record<
    "Call" | "Email" | "LinkedIn" | "WhatsApp" | "Meeting" | "Other",
    number
  >;
  stageAdvances: number;
  meetingsSet: number;
  opportunitiesGenerated: number;
  deadOrWrong: number;
  overdueFollowUps: number;
  notesPosted: number;
};

export type ActivityChange = {
  fieldName: string;
  fieldDisplayName?: string;
  oldValue?: string | null;
  oldValueDisplay?: string | null;
  newValue?: string | null;
  newValueDisplay?: string | null;
};

export type ActivityRecord = {
  id: number;
  actor: ActivityActor;
  occurredAt: string;
  type: "lead_added" | "lead_changed" | "task_completed" | "note_posted";
  entity: string;
  entityName: string;
  record: string;
  entityId: number;
  lead: {
    id: number | null;
    name: string;
    company: string | null;
  };
  message: string;
  channel?: string | null;
  changes: ActivityChange[];
};

type SummaryResponse = {
  range: { startDate: string; endDate: string };
  groups: ActivitySummaryGroup[];
  totalActions: number;
};

type ActivityResponse = {
  range: { startDate: string; endDate: string };
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  records: ActivityRecord[];
};

type UserListResponse = {
  records: ReportUser[];
};

const queryString = (query: LeadActivityReportQuery) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  return params.toString();
};

const unwrapResponse = <T>(response: T | { data?: T }) => {
  if (typeof response === "object" && response !== null && "data" in response) {
    return response.data ?? (response as T);
  }
  return response as T;
};

export const leadActivityReportApi = createApi({
  reducerPath: "leadActivityReportApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getSummary: builder.query<
      SummaryResponse,
      Pick<LeadActivityReportQuery, "startDate" | "endDate" | "actorId">
    >({
      query: (query) =>
        `/leadtrack-report/activity/summary?${queryString(query)}`,
      transformResponse: (
        response: SummaryResponse | { data?: SummaryResponse },
      ) => unwrapResponse<SummaryResponse>(response),
    }),
    getActivity: builder.query<ActivityResponse, LeadActivityReportQuery>({
      query: (query) => `/leadtrack-report/activity?${queryString(query)}`,
      transformResponse: (
        response: ActivityResponse | { data?: ActivityResponse },
      ) => unwrapResponse<ActivityResponse>(response),
    }),
    getUsers: builder.query<ReportUser[], void>({
      query: () => "/user?limit=100&offset=0&sort=fullName",
      transformResponse: (
        response: UserListResponse | { data?: UserListResponse },
      ) => unwrapResponse<UserListResponse>(response).records ?? [],
    }),
    exportActivity: builder.query<Blob, LeadActivityReportQuery>({
      query: (query) => ({
        url: `/leadtrack-report/activity/export?${queryString(query)}`,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetSummaryQuery,
  useLazyGetActivityQuery,
  useLazyExportActivityQuery,
  useGetUsersQuery,
} = leadActivityReportApi;
