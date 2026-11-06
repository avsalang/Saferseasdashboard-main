import test from 'node:test';import assert from 'node:assert/strict';import{reviewQueue}from'../src/data/workQueues.js';
test('review queue separates actionable work from corrections and sorts by receipt/update rather than occurrence',()=>{
 const rows=[{id:'old-occurrence',date:'2020-01-01',status:'resubmitted',updatedAt:'2026-11-06T10:00:00+08:00'},{id:'recent-occurrence',date:'2026-11-05',status:'submitted',updatedAt:'2026-11-06T00:30:00Z'},{id:'waiting',status:'correction_requested',updatedAt:'2026-11-06T12:00:00+08:00'},{id:'closed',status:'validated'}];
 assert.deepEqual(reviewQueue(rows).map(e=>e.id),['old-occurrence','recent-occurrence']);assert.deepEqual(reviewQueue(rows,'waiting').map(e=>e.id),['waiting']);assert.equal(reviewQueue(rows,'all').length,3);assert.equal(rows.length,4);
});
