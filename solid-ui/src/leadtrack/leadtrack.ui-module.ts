import { ExtensionComponentTypes, ExtensionFunctionTypes, type SolidUiModule } from "@solidxai/core-ui";
import { createElement } from "react";
import LeadKanbanCardWidget from "./components/LeadKanbanCardWidget";
import LeadActivityReportPage from "./components/LeadActivityReportPage";
import FollowUpDueDateListWidget from "./components/FollowUpDueDateListWidget";
import LeadFutureDateFormWidget from "./components/LeadFutureDateFormWidget";
import LeadSourceListWidget from "./components/LeadSourceListWidget";
import { leadActivityReportApi } from "./api/leadActivityReportApi";

const LEADTRACK_DASHBOARD_PATH = "/admin/core/leadtrack/dashboard/leadtrack-overview";

function leadTrackRoleLanding(event: { user?: { roles?: string[] } }) {
  const roles = event?.user?.roles ?? [];
  const isSalesRepresentative = roles.includes("SalesRepresentative");
  const isAdmin = roles.includes("Admin");

  if (window.location.pathname === "/admin" && isSalesRepresentative && !isAdmin) {
    window.location.replace(LEADTRACK_DASHBOARD_PATH);
  }
}

const leadTrackUiModule = {
  name: "leadtrack",
  routes: {
    extraAdminRoutes: [
      {
        path: "/admin/core/leadtrack/reports/activity",
        element: createElement(LeadActivityReportPage),
      },
    ],
  },
  extensionComponents: [
    { name: "LeadKanbanCardWidget", component: LeadKanbanCardWidget, type: ExtensionComponentTypes.kanbanCardWidget },
    { name: "FollowUpDueDateListWidget", component: FollowUpDueDateListWidget, type: ExtensionComponentTypes.listFieldWidget },
    { name: "LeadFutureDateFormWidget", component: LeadFutureDateFormWidget, type: ExtensionComponentTypes.formFieldEditWidget },
    { name: "LeadSourceListWidget", component: LeadSourceListWidget, type: ExtensionComponentTypes.listFieldWidget },
  ],
  extensionFunctions: [
    {
      name: "leadTrackRoleLanding",
      fn: leadTrackRoleLanding,
      type: ExtensionFunctionTypes.onApplicationMount,
    },
  ],
  reducers: { [leadActivityReportApi.reducerPath]: leadActivityReportApi.reducer },
  middlewares: [leadActivityReportApi.middleware],
} satisfies SolidUiModule;

export default leadTrackUiModule;
