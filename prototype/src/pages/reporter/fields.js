export const incidentTypes = ['Grounding','Collision','Allision','Engine trouble','Mechanical failure','Hull failure','Steering failure','Capsizing','Listing','Flooding','Sinking','Fire','Explosion','Man overboard','Occupational accident','Other','Unknown']
export const seriousnessOptions = [{label:'Less serious',value:'less_serious'},{label:'Serious',value:'serious'},{label:'Very serious',value:'very_serious'},{label:'Unknown / under assessment',value:'unknown'}]
export const editableStatuses = ['draft','correction_requested']
export const numberOrNull = value => value === '' || value === null || value === undefined ? null : Number(value)
export const display = value => value === null || value === undefined || value === '' ? 'Unknown / not supplied' : value
export const vesselGroups = [
 {title:'Identity and registration',fields:[['name','Vessel name'],['formerNames','Former names'],['officialNumber','Official number'],['imoNumber','IMO number'],['registrationStatus','Registration status'],['type','Vessel / service type'],['rigType','Rig type'],['flag','Flag']]},
 {title:'Construction and dimensions',fields:[['grossTonnage','Gross tonnage (GT)','number'],['netTonnage','Net tonnage','number'],['yearBuilt','Year built','number'],['hull','Hull material'],['sizeClass','Size class'],['classificationSociety','Classification society'],['length','Length (m)','number'],['breadth','Breadth (m)','number'],['depth','Depth (m)','number'],['deadweight','Deadweight (t)','number'],['buildPlace','Place built'],['sternType','Stern type']]},
 {title:'Ownership and operation',fields:[['owner','Registered owner'],['operator','Operator'],['ownerContact','Owner contact'],['operatorAddress','Operator address'],['homeport','Homeport office'],['cpc','CPC office'],['masterName','Master name'],['masterLicense','Master licence']]},
 {title:'Propulsion',fields:[['engineCount','Engine count','number'],['engineMake','Engine make'],['enginePower','Engine power','number'],['enginePowerUnit','Power unit']]},
]
