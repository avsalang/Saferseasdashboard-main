import test from 'node:test';
import assert from 'node:assert/strict';
import {rolePermissions,roleLabels,canAccess} from '../src/data/domain.js';
import {createSeed} from '../src/data/seed.js';
import {migrateAccountModel} from '../src/data/accounts.js';

test('only the three confirmed account types are available',()=>{
  assert.deepEqual(Object.keys(rolePermissions).sort(),['investigator','reporter','reviewer']);
  assert.deepEqual(roleLabels,{reporter:'MRO Reporter',reviewer:'MRO Reviewer',investigator:'MARINA Investigator'});
  const seed=createSeed();assert.deepEqual(seed.roles.map(r=>r.id).sort(),['investigator','reporter','reviewer']);
  assert.ok(seed.users.every(u=>Object.hasOwn(rolePermissions,u.role)));
});
test('MARINA investigator has every function; MRO review and reporting remain distinct',()=>{
  const seed=createSeed(),investigator=seed.users.find(u=>u.id==='u-investigator'),reviewer=seed.users.find(u=>u.id==='u-reviewer'),reporter=seed.users.find(u=>u.id==='u-reporter');
  for(const action of ['read','report','review','investigate','enforce','analyze','export','manage_accounts','configure','audit','admin'])assert.equal(canAccess(investigator,action),true,action);
  assert.equal(investigator.scope,'all');assert.equal(reviewer.scope,'office');
  assert.equal(canAccess(reviewer,'review'),true);assert.equal(canAccess(reviewer,'investigate'),false);assert.equal(canAccess(reviewer,'manage_accounts'),false);
  assert.equal(canAccess(reporter,'report'),true);assert.equal(canAccess(reporter,'review'),false);
});
test('older demo data keeps records and attribution but retires unsupported account types',()=>{
  const old=createSeed();old.schemaVersion=1;old.sessionUserId='u-admin';old.users.push({id:'u-admin',name:'Previous demo author',role:'admin',status:'active',scope:'all',officeId:'MRO-NCR'});old.events[0].summary='Keep this browser edit';old.auditLogs.push({actorId:'u-admin',actorName:'Previous demo author',action:'Historic edit'});
  const migrated=migrateAccountModel(old);
  assert.equal(migrated.schemaVersion,2);assert.equal(migrated.sessionUserId,null);assert.equal(migrated.events[0].summary,'Keep this browser edit');
  assert.ok(migrated.users.every(u=>Object.hasOwn(rolePermissions,u.role)));assert.equal(migrated.users.find(u=>u.id==='u-admin').status,'suspended');
  assert.equal(migrated.auditLogs.at(-1).actorName,'Previous demo author');assert.equal(migrated.roles.length,3);
  assert.deepEqual(migrateAccountModel(migrated),migrated);
});
