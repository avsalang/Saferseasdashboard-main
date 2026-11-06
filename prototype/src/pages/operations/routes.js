import Dashboard from './Dashboard.vue'
import IncidentRegister from './IncidentRegister.vue'
import Workspace from './Workspace.vue'
import IncidentForm from '../reporter/IncidentForm.vue'
import Investigations from './Investigations.vue'
import Workbench from './Workbench.vue'
import Actions from './Actions.vue'
import Cases from './Cases.vue'
import Registry from './Registry.vue'

const roles = ['reviewer', 'investigator']
const route = (path, component, title, screenId, permission, props) => ({ path, component, props, meta: { roles, title, screenId, ...(permission ? { permission } : {}) } })
export const operationsRoutes = [
  route('/admin', Dashboard, 'Operations overview', 'A01'),
  route('/admin/incidents', IncidentRegister, 'Incident register', 'A02'),
  route('/admin/incidents/new', IncidentForm, 'New incident', 'A04', 'report', { staff: true }),
  route('/admin/incidents/:id/edit', IncidentForm, 'Edit incident', 'A04', 'review', { staff: true }),
  route('/admin/incidents/:id', Workspace, 'Incident workspace', 'A03'),
  route('/admin/review', IncidentRegister, 'Review queue', 'A05', 'review', { review: true }),
  route('/admin/investigations', Investigations, 'Investigations', 'A06', 'investigate'),
  route('/admin/investigations/:id', Workbench, 'Investigation workbench', 'A07–A09', 'investigate'),
  route('/admin/actions', Actions, 'Recommendation follow-up', 'A10'),
  route('/admin/cases', Cases, 'Enforcement cases', 'A11', 'enforce'),
  route('/admin/cases/:id', Cases, 'Enforcement case', 'A12', 'enforce'),
  route('/admin/vessels', Registry, 'Vessel registry', 'A13', undefined, { kind: 'vessels' }),
  route('/admin/companies', Registry, 'Owners and operators', 'A14', undefined, { kind: 'parties' }),
  route('/admin/documents', Registry, 'Evidence register', 'A15', undefined, { kind: 'evidence' }),
]
