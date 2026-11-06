import {createSeed} from './seed.js';
import {rolePermissions,operationalPermissions,clone} from './domain.js';

// Keep browser edits and historical actor IDs when upgrading the original demo.
export function migrateAccountModel(snapshot){
  if(![1,2,3].includes(snapshot?.schemaVersion))return createSeed();
  const next=clone(snapshot),fresh=createSeed();
  next.roles=fresh.roles.map(role=>{
    if(snapshot.schemaVersion<3||role.id==='investigator')return role;
    const saved=snapshot.roles?.find(item=>item.id===role.id);
    return saved?{...saved,id:role.id,name:role.name,permissions:(saved.permissions||role.permissions).filter(p=>operationalPermissions.includes(p))}:role;
  });
  next.users=next.users.map(user=>{
    if(!Object.hasOwn(rolePermissions,user.role))return {...user,legacyRole:user.role,role:'investigator',status:'suspended',scope:'all'};
    return {...user,scope:user.role==='investigator'?'all':snapshot.schemaVersion<3?(user.role==='reviewer'?'office':'own'):(user.scope||(user.role==='reviewer'?'office':'own'))};
  });
  if(!next.users.some(user=>user.id==='u-investigator'))next.users.push(fresh.users.find(user=>user.id==='u-investigator'));
  next.schemaVersion=3;if(snapshot.schemaVersion<3)next.sessionUserId=null;
  return next;
}
