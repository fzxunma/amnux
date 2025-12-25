export const XmMetaRules = {
  XmWorkflows: {
    label: "流程",
    fields: {
      title: { type: "string", label: "流程名称", required: true },
      steps: { type: "relation", ref: "XmSteps", relation: "aggregation", ordered: true, min: 1, ui: { component: "tree" } }
    }
  },
  XmSteps: {
    label: "步骤",
    fields: {
      title: { type: "string", label: "步骤名称", required: true },
      type: { type: "enum", options: ["start","action","end"], default:"action" }
    }
  }
};
