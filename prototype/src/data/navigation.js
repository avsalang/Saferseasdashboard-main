export const defaultWorkspace=user=>user?.role==='reporter'?'/reporter':user?.role==='reviewer'?'/admin/review':'/admin';
const item=(label,to,icon,permission)=>({label,to,icon,permission});
// Keep the main menu short; related tasks stay together and all tools remain reachable.
export function navigationFor(can){
  const groups=[
    {label:'Incidents',icon:'description',items:[item('Incident register','/admin/incidents','description'),item('Review queue','/admin/review','fact_check','review'),item('Record incident','/admin/incidents/new','add_circle_outline','report')]},
    {label:'Investigations',icon:'travel_explore',items:[item('Investigation register','/admin/investigations','travel_explore','investigate'),item('Recommendations','/admin/actions','checklist','investigate'),item('Cases & orders','/admin/cases','gavel','enforce')]},
    {label:'Reports & maps',icon:'summarize',items:[item('Reports','/admin/reports','summarize','export'),item('Generated files','/admin/exports','download','export'),item('Incident map','/admin/map','map','analyze'),item('Statistics','/admin/analytics','query_stats','analyze'),item('Location review','/admin/locations','pin_drop','investigate'),item('Risk assessments','/admin/risk','shield','analyze'),item('Policy review','/admin/policy','policy','analyze')]},
    {label:'Registers',icon:'directions_boat',items:[item('Vessels','/admin/vessels','directions_boat'),item('Owners & operators','/admin/companies','business'),item('Documents','/admin/documents','folder_open')]},
    {label:'System',icon:'settings',items:[item('Account management','/admin/accounts','manage_accounts','manage_accounts'),item('Roles & permissions','/admin/roles','admin_panel_settings','configure'),item('MARINA offices','/admin/offices','account_balance','configure'),item('Reference data','/admin/reference-data','category','configure'),item('Workflow & templates','/admin/workflows','account_tree','configure'),item('Historical imports','/admin/imports','upload_file','analyze'),item('Reconciliation','/admin/reconciliation','difference','analyze'),item('Audit trail','/admin/audit','history','audit'),item('System settings','/admin/settings','settings','configure')]},
  ];
  return groups.map(g=>({...g,items:g.items.filter(i=>!i.permission||can(i.permission))})).filter(g=>g.items.length);
}
export const reporterWorkTools=[
  item('Office workspace','/admin','space_dashboard'),
  item('Incident register','/admin/incidents','description'),
  item('Review queue','/admin/review','fact_check'),
  item('Investigations','/admin/investigations','travel_explore'),
  item('Cases & follow-up','/admin/cases','gavel'),
  item('Reports','/admin/reports','summarize'),
  item('Incident map','/admin/map','map'),
  item('Statistics','/admin/analytics','query_stats'),
];
