import { ExtensionComponentTypes, type SolidUiModule } from "@solidxai/core-ui";
import { createElement } from "react";
import LeadKanbanCardWidget from "./components/LeadKanbanCardWidget";
import LeadActivityReportPage from "./components/LeadActivityReportPage";
import FollowUpDueDateListWidget from "./components/FollowUpDueDateListWidget";
import { leadActivityReportApi } from "./api/leadActivityReportApi";

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
  ],
  extensionFunctions: [],
  reducers: { [leadActivityReportApi.reducerPath]: leadActivityReportApi.reducer },
  middlewares: [leadActivityReportApi.middleware],
} satisfies SolidUiModule;

export default leadTrackUiModule;
