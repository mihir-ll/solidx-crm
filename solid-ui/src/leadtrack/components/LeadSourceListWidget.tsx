type LeadSourceListWidgetProps = {
  rowData: Record<string, unknown>;
  fieldMetadata?: { name: string; selectionStaticValues?: unknown[] };
};

const readValues = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Older records may contain comma-separated values.
  }

  return value.split(",").map((item) => item.trim()).filter(Boolean);
};

export default function LeadSourceListWidget({
  rowData,
  fieldMetadata,
}: LeadSourceListWidgetProps) {
  const labelMap = new Map<string, string>();
  for (const entry of fieldMetadata?.selectionStaticValues ?? []) {
    const [value, ...labelParts] = String(entry).split(":");
    if (value) labelMap.set(value.trim(), labelParts.join(":").trim() || value.trim());
  }

  const values = readValues(rowData[fieldMetadata?.name ?? "source"]);
  return <span>{values.map((value) => labelMap.get(value) ?? value).join(", ")}</span>;
}
