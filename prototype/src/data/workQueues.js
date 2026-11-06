const ready=['submitted','resubmitted','under_review'];
export function reviewQueue(events,view='ready'){
  const statuses=view==='waiting'?['correction_requested']:view==='all'?[...ready,'correction_requested']:ready;
  const received=e=>Date.parse(e.updatedAt||e.createdAt||e.receivedDate||'')||0;
  return events.filter(e=>statuses.includes(e.status)).sort((a,b)=>received(b)-received(a));
}
