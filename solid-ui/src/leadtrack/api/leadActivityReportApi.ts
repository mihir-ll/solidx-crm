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

export type ActivitySummaryGroup = ActivityActor & {
  total: number;
  created: number;
  updated: number;
  deleted: number;
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
  action: "Created" | "Updated" | "Deleted";
  entity: string;
  entityName: string;
  record: string;
  entityId: number;
  message: string;
  changes: ActivityChange[];
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

export const leadActivityReportApi = createApi({
  reducerPath: "leadActivityReportApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getSummary: builder.query<{
      range: { startDate: string; endDate: string };
      groups: ActivitySummaryGroup[];
      totalActions: number;
    }, Pick<LeadActivityReportQuery, "startDate" | "endDate">>({
      query: (query) => `/leadtrack-report/activity/summary?${queryString(query)}`,
      transformResponse: (response: any) => response?.data ?? response,
    }),
    getActivity: builder.query<{
      range: { startDate: string; endDate: string };
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
      records: ActivityRecord[];
    }, LeadActivityReportQuery>({
      query: (query) => `/leadtrack-report/activity?${queryString(query)}`,
      transformResponse: (response: any) => response?.data ?? response,
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
} = leadActivityReportApi;
