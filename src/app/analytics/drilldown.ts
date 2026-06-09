import type { AnalyticsRecord } from "./types";

interface ExplorerDrilldownOptions {
  context: string;
  search?: string;
  type?: string;
  severity?: string;
  authority?: string;
  status?: string;
  province?: string;
}

type DrilldownRecord = Pick<AnalyticsRecord, "incidentId"> | { id: string };

function getRecordId(record: DrilldownRecord) {
  return "incidentId" in record ? record.incidentId : record.id;
}

export function buildIncidentExplorerPath(records: DrilldownRecord[], options: ExplorerDrilldownOptions) {
  const searchParams = new URLSearchParams();

  records.forEach((record) => {
    searchParams.append("id", getRecordId(record));
  });

  searchParams.set("context", options.context);

  if (options.search) {
    searchParams.set("search", options.search);
  }
  if (options.type) {
    searchParams.set("type", options.type);
  }
  if (options.severity) {
    searchParams.set("severity", options.severity);
  }
  if (options.authority) {
    searchParams.set("authority", options.authority);
  }
  if (options.status) {
    searchParams.set("status", options.status);
  }
  if (options.province) {
    searchParams.set("province", options.province);
  }

  return `/incident-explorer?${searchParams.toString()}`;
}
