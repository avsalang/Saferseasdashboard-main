const roles = ['reporter','reviewer','investigator']
const pages = import.meta.glob('./*Page.vue')
export const dataRoutes = [
 ['/admin/imports','ImportsPage','Import batches','D01','analyze'],
 ['/admin/imports/new','ImportsPage','Import wizard','D02','analyze'],
 ['/admin/imports/:id','ImportsPage','Import detail','D03','analyze'],
 ['/admin/reconciliation','ImportsPage','Source reconciliation','D03','analyze'],
 ['/admin/map','MapPage','GIS workspace','D04','analyze'],
 ['/admin/locations','MapPage','Location review','D05','investigate'],
 ['/admin/analytics','AnalyticsPage','Analytics','D06','analyze'],
 ['/admin/reports','ReportsPage','Reports','D07','export'],
 ['/admin/reports/build/:outputId','ReportsPage','Prepare report','D08','export'],
 ['/admin/exports','ReportsPage','Generated files','D09','export'],
 ['/admin/risk','RiskPolicyPage','Risk assessments','D10','analyze'],
 ['/admin/risk/:id','RiskPolicyPage','Assessment detail','D10','analyze'],
 ['/admin/policy','RiskPolicyPage','Policy review','D11','analyze']
].map(([path,component,title,screenId,permission])=>({path,component:pages[`./${component}.vue`],meta:{roles,title,screenId,permission}}))
