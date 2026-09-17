import { ExtensionComponentTypes, type SolidUiModule } from "@solidxai/core-ui";
import LeadKanbanCardWidget from "./components/LeadKanbanCardWidget";

const crmUiModule = {
  name: "crm",
  extensionComponents: [{ name: "LeadKanbanCardWidget", component: LeadKanbanCardWidget, type: ExtensionComponentTypes.kanbanCardWidget }],
  extensionFunctions: [],
  reducers: {},
  middlewares: [],
} satisfies SolidUiModule;

export default crmUiModule;
