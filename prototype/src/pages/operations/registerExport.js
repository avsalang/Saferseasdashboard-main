import { clone, display } from './common.js'

// Retain the same artifact shape used by the report builder and output history.
// Clone before projecting so event snapshots and table rows cannot follow later edits.
export function createIncidentSnapshot(events, selection, { review = false, asOf = new Date().toISOString().slice(0, 10) } = {}) {
  const retainedEvents = clone(events)
  const retainedSelection = clone(selection)
  const title = review ? 'Incident review queue' : 'Incident register'
  const rows = retainedEvents.map(e => ({
    Reference: e.ref,
    Date: e.dateUnknown ? 'Unknown' : display(e.date),
    Time: e.timeUnknown ? 'Unknown' : display(e.time),
    Type: e.type,
    Seriousness: e.seriousness,
    Status: e.status,
    AOR: display(e.aor),
    Homeport: display(e.homeport),
    CPC: display(e.cpc),
    IssuingOffice: display(e.issuingOffice),
    Vessels: e.vessels?.length ?? 0,
    Fatalities: display(e.consequences?.fatalities),
    Missing: display(e.consequences?.missing),
    Injured: display(e.consequences?.injured),
    Rescued: display(e.consequences?.rescued),
    Location: display(e.place),
  }))
  return {
    title,
    subtitle: 'Incident-level register · Fictional demonstration',
    rows,
    events: retainedEvents,
    sections: [
      { title: 'Counting and source notes', content: 'One row per incident. Vessel involvements are counted separately. Consequences are event totals; report revisions and involved vessels do not multiply casualty counts. Unknown values remain unknown.' },
      { title: 'Retained selection', content: `${review ? 'Review queue statuses only: submitted, resubmitted, under review and correction requested.' : 'All matching incident review statuses.'}\n${JSON.stringify(retainedSelection)}` },
    ],
    metadata: {
      'Output family': 'incident-register',
      'Counting grain': 'Distinct incident',
      'Selected events': retainedEvents.length,
      'Vessel involvements': retainedEvents.reduce((n, e) => n + (e.vessels?.length ?? 0), 0),
      'As of': asOf,
      Selection: JSON.stringify(retainedSelection),
      'Queue filter': review ? 'Review queue' : 'All matching incidents',
      Template: 'Demonstration v1',
      Notes: 'Browser-local fictional data; retained rows and event snapshots preserve the exported population.',
    },
  }
}
