import Dashboard from './Dashboard.vue'
import ReportList from './ReportList.vue'
import IncidentForm from './IncidentForm.vue'
import IncidentDetail from './IncidentDetail.vue'
import VesselDirectory from './VesselDirectory.vue'
import Documents from './Documents.vue'
const route = (path,component,title,screenId,props) => ({path,component,props,meta:{roles:['reporter'],title,screenId}})
export const reporterRoutes = [
 route('/reporter',Dashboard,'Reporting workspace','R01'),
 route('/reporter/reports',ReportList,'My reports','R02'),
 route('/reporter/reports/new',IncidentForm,'New spot report','R03'),
 route('/reporter/reports/:id/edit',IncidentForm,'Edit report','R05'),
 route('/reporter/reports/:id',IncidentDetail,'Report tracking','R04'),
 route('/reporter/drafts',ReportList,'Draft reports','R06',{drafts:true}),
 route('/reporter/vessels',VesselDirectory,'My vessels','R07'),
 route('/reporter/documents',Documents,'Evidence and documents','R08'),
]
