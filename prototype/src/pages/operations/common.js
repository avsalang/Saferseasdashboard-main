export const today = () => new Date().toISOString().slice(0, 10)
export const clone = (value) => JSON.parse(JSON.stringify(value))
export const display = (value) => value === null || value === undefined || value === '' ? 'Unknown' : value
export const label = (value) => String(value ?? 'unknown').replaceAll('_', ' ')
export const incidentOptions = (events) => events.map(e => ({ label: `${e.ref} · ${e.type} · ${e.place || 'Location unknown'}`, value: e.id }))
export const officeOptions = (store) => store.state.offices.map(o => ({ label: `${o.code || o.id} · ${o.name}`, value: o.id }))
export const investigatorOptions = store => store.state.users.filter(u=>u.status==='active'&&u.role==='investigator').map(u=>({label:`${u.name} · MARINA Investigator`,value:u.id}));
export const userOptions = (store) => store.state.users.filter(u => u.status === 'active').map(u => ({ label: `${u.name} · ${u.role}`, value: u.id }))
export const eventColumns = [
  { name: 'ref', label: 'Incident', field: 'ref', align: 'left', sortable: true },
  { name: 'date', label: 'Occurrence', field: r => r.dateUnknown ? 'Unknown date' : (r.date || 'Unknown date'), align: 'left', sortable: true },
  { name: 'type', label: 'Incident type', field: 'type', align: 'left', sortable: true },
  { name: 'place', label: 'Location', field: 'place', align: 'left' },
  { name: 'seriousness', label: 'Seriousness', field: r => label(r.seriousness), align: 'left', sortable: true },
  { name: 'status', label: 'Review status', field: 'status', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'id', align: 'right' },
]
