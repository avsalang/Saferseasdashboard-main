import {createSeed} from './seed.js';
import {rolePermissions,clone} from './domain.js';

// Keep browser edits and historical actor IDs when upgrading the original demo.
export function migrateAccountModel(snapshot){
  if(snapshot?.schemaVersion===2)return snapshot;
  if(snapshot?.schemaVersion!==1)return createSeed();
  const next=clone(snapshot),fresh=createSeed();
  next.roles=fresh.roles;
  next.users=next.users.map(user=>{
    if(!Object.hasOwn(rolePermissions,user.role))return {...user,legacyRole:user.role,role:'investigator',status:'suspended',scope:'all'};
    return {...user,scope:user.role==='reporter'?'own':user.role==='reviewer'?'office':'all'};
  });
  if(!next.users.some(user=>user.id==='u-investigator'))next.users.push(fresh.users.find(user=>user.id==='u-investigator'));
  next.schemaVersion=2;next.sessionUserId=null;
  return next;
}
