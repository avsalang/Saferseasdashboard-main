import test from 'node:test'
import assert from 'node:assert/strict'
import {applyIncidentWeatherSuggestions,buildIncidentWeatherRequests,createIncidentEnvironment,createIncidentWeatherLookup,describeEnvironmentField,ensureIncidentEnvironment,incidentWeatherInput,lookupIncidentWeather,nearestWeatherHour,validIncidentPosition,weatherRequestKey,windForceFromKmh} from '../src/data/incidentWeather.js'
const NOW='2026-11-06T04:00:00.000Z'
const event=patch=>({id:'new-event',date:'2026-11-06',time:'08:15',dateUnknown:false,timeUnknown:false,lat:0,lon:0,positionQuality:'approximate',...patch})
const response=(body,status=200)=>({ok:status>=200&&status<300,status,json:async()=>body})
function payload(service,{date='2026-11-06',wave=0,wind=0,visibility=0,code=0}={}){
 const start=Date.parse(date+'T00:00:00+08:00')/1000
 return {latitude:0,longitude:0,timezone:'Asia/Manila',utc_offset_seconds:28800,generationtime_ms:1,hourly:{time:Array.from({length:24},(_,i)=>start+i*3600),...(service==='marine'?{wave_height:Array(24).fill(wave)}:{wind_speed_10m:Array(24).fill(wind),visibility:Array(24).fill(visibility),weather_code:Array(24).fill(code)})},hourly_units:service==='marine'?{wave_height:'m'}:{wind_speed_10m:'km/h',visibility:'m',weather_code:'wmo code'}}
}
const service=url=>new URL(url).searchParams.get('hourly')==='wave_height'?'marine':'weather'
const fetchValues=options=>async url=>response(payload(service(url),options))
test('defaults preserve entered zero and add separate observation time and field sources',()=>{
 const model={environment:{waveHeightM:0,windForce:0,source:'Master statement'}}
 const env=ensureIncidentEnvironment(model)
 assert.equal(env.waveHeightM,0);assert.equal(env.windForce,0);assert.equal(env.observedAt,'');assert.deepEqual(env.fieldSources,{})
 assert.equal(env.source,'Master statement');assert.equal(env.lookup,null)
 const first=createIncidentEnvironment(),second=createIncidentEnvironment();first.fieldSources.x={};assert.deepEqual(second.fieldSources,{})
})
test('zero coordinates are valid and blank, partial, Boolean and out-of-range coordinates are not',()=>{
 assert.equal(validIncidentPosition(0,'0'),true)
 for(const [lat,lon] of [[null,0],['',0],[false,0],[90.1,0],[0,-180.1],['junk',0]])assert.equal(validIncidentPosition(lat,lon),false)
})
test('unknown date/time and invalid calendar date are rejected before fetch',async()=>{
 for(const patch of [{dateUnknown:true},{timeUnknown:true},{date:'2026-02-30'},{time:'24:00'},{positionQuality:'unknown'}]){
  let calls=0;await assert.rejects(lookupIncidentWeather(event(patch),{now:()=>new Date(NOW),fetchImpl:async()=>{calls++;return response({})}}));assert.equal(calls,0)
 }
})
test('incident time is interpreted in Asia/Manila independent of host timezone',()=>{
 const input=incidentWeatherInput(event(),{now:NOW})
 assert.equal(input.timezone,'Asia/Manila');assert.equal(input.targetEpochMs,Date.parse('2026-11-06T00:15:00Z'))
})
test('mode cutoff uses the Manila calendar day even when UTC is on previous day',()=>{
 const now='2026-11-05T18:00:00Z'
 assert.equal(incidentWeatherInput(event({date:'2026-11-01'}),{now}).mode,'forecast')
 assert.equal(incidentWeatherInput(event({date:'2026-10-31'}),{now}).mode,'historical_forecast')
})
test('recent and historical marine URLs follow official endpoint/model mode contracts',()=>{
 const recent=buildIncidentWeatherRequests(incidentWeatherInput(event(),{now:NOW}))
 assert.equal(new URL(recent.weather).origin,'https://api.open-meteo.com');assert.equal(new URL(recent.marine).pathname,'/v1/marine')
 const old=buildIncidentWeatherRequests(incidentWeatherInput(event({date:'2025-01-02'}),{now:NOW}))
 assert.equal(new URL(old.weather).origin,'https://historical-forecast-api.open-meteo.com')
 const marine=new URL(old.marine);assert.equal(marine.pathname,'/v1/forecast');assert.equal(marine.searchParams.get('models'),'marine_best_match')
 assert.equal(marine.searchParams.get('timezone'),'Asia/Manila');assert.equal(marine.searchParams.get('latitude'),'0');assert.equal(marine.searchParams.get('timeformat'),'unixtime')
})
test('lookup retains real zero values and request/returned provenance without mutating entered fields',async()=>{
 const model=event({environment:{source:'Master report',windForce:4}})
 const result=await lookupIncidentWeather(model,{fetchImpl:fetchValues(),now:()=>new Date(NOW)})
 assert.equal(result.status,'complete');assert.deepEqual(result.suggestions,{waveHeightM:0,windForce:0,visibility:'0 m',weatherDescription:'Clear sky',seaState:'',currentTide:''})
 assert.equal(model.environment.windForce,4);assert.equal(model.environment.lookup,undefined)
 assert.equal(result.request.requestedAt,NOW);assert.equal(result.returnedAt,NOW);assert.deepEqual(result.responses.marine.returnedLocation,{lat:0,lon:0})
 assert.equal(result.responses.weather.matchedTime,'2026-11-06T00:00:00.000Z');assert.ok(result.responses.marine.url.includes('wave_height'))
})
test('missing marine data preserves usable weather and never invents zero for missing wind',async()=>{
 const fetchImpl=async url=>response(payload(service(url),{wave:null,wind:null,visibility:null,code:0}))
 const result=await lookupIncidentWeather(event(),{fetchImpl,now:()=>new Date(NOW)})
 assert.equal(result.status,'partial');assert.equal(result.suggestions.waveHeightM,null);assert.equal(result.suggestions.windForce,null);assert.equal(result.suggestions.visibility,'');assert.equal(result.suggestions.weatherDescription,'Clear sky')
 assert.equal(result.errors[0].service,'marine')
})
test('historical marine HTTP failure does not discard successful historical weather',async()=>{
 const fetchImpl=async url=>service(url)==='marine'?response({error:true,reason:'Historical marine model unavailable'},400):response(payload('weather',{date:'2025-01-02',wind:18,visibility:12000,code:3}))
 const result=await lookupIncidentWeather(event({date:'2025-01-02'}),{fetchImpl,now:()=>new Date(NOW)})
 assert.equal(result.status,'partial');assert.equal(result.suggestions.windForce,3);assert.equal(result.suggestions.visibility,'12000 m');assert.equal(result.suggestions.weatherDescription,'Overcast');assert.equal(result.suggestions.waveHeightM,null)
 assert.match(result.errors[0].message,/Historical marine model unavailable/)
})
test('weather network failure preserves successful sea model data',async()=>{
 const fetchImpl=async url=>{if(service(url)==='weather')throw Error('Network unavailable');return response(payload('marine',{wave:2.75}))}
 const result=await lookupIncidentWeather(event(),{fetchImpl,now:()=>new Date(NOW)})
 assert.equal(result.status,'partial');assert.equal(result.suggestions.waveHeightM,2.75);assert.equal(result.suggestions.windForce,null);assert.equal(result.responses.weather.ok,false)
})
test('unreadable and out-of-hour responses remain visible failures',async()=>{
 const fetchImpl=async url=>service(url)==='weather'?{ok:true,status:200,json:async()=>{throw Error('bad JSON')}}:response(payload('marine',{date:'2020-01-01'}))
 const result=await lookupIncidentWeather(event(),{fetchImpl,now:()=>new Date(NOW)})
 assert.equal(result.status,'unavailable');assert.equal(result.errors.length,2);assert.equal(result.suggestions.waveHeightM,null);assert.equal(result.suggestions.visibility,'')
})
test('matching accepts local ISO hour strings and rejects distant data',()=>{
 const target=Date.parse('2026-11-06T00:15:00Z')
 assert.equal(nearestWeatherHour(['2026-11-06T08:00','2026-11-06T09:00:00'],target),0)
 assert.equal(nearestWeatherHour(['2025-11-06T08:00'],target),-1)
})
test('Beaufort conversion preserves calm zero, rejects missing/negative, and limits the scale',()=>{
 assert.equal(windForceFromKmh(0),0);assert.equal(windForceFromKmh(null),null);assert.equal(windForceFromKmh(''),null);assert.equal(windForceFromKmh(-1),null);assert.equal(windForceFromKmh(200),12)
})
test('explicit apply fills only blank values, retains manual source and captures per-field provenance',async()=>{
 const model=event({environment:{waveHeightM:0,windForce:6,visibility:'',weatherDescription:'',source:'Master statement',seaState:'Rough',currentTide:'Ebb',observedAt:'2026-11-06T08:20'}})
 const result=await lookupIncidentWeather(model,{fetchImpl:fetchValues({wave:1.4}),now:()=>new Date(NOW)})
 const applied=applyIncidentWeatherSuggestions(model,result,{now:NOW})
 assert.deepEqual(applied,['visibility','weatherDescription']);assert.equal(model.environment.waveHeightM,0);assert.equal(model.environment.windForce,6);assert.equal(model.environment.source,'Master statement');assert.equal(model.environment.observedAt,'2026-11-06T08:20')
 const metadata=model.environment.fieldSources.visibility
 assert.equal(metadata.kind,'modelled');assert.equal(metadata.appliedValue,'0 m');assert.equal(metadata.modelTime,'2026-11-06T00:00:00.000Z');assert.equal(metadata.request.timezone,'Asia/Manila');assert.ok(metadata.providerUrl.includes('open-meteo.com'))
 assert.equal(describeEnvironmentField(model.environment,'waveHeightM'),'0 (entered value)');assert.match(describeEnvironmentField(model.environment,'visibility'),/modelled context; Open-Meteo/)
 assert.equal(describeEnvironmentField(model.environment,'unset'),'Unknown')
})
test('applied per-field provenance survives later lookups and changed manual values become neutral',async()=>{
 const model=event();const first=await lookupIncidentWeather(model,{fetchImpl:fetchValues({wave:1.4}),now:()=>new Date(NOW)});applyIncidentWeatherSuggestions(model,first,{now:NOW})
 const retained=JSON.parse(JSON.stringify(model.environment.fieldSources.waveHeightM))
 model.time='09:15';model.environment.lookup=await lookupIncidentWeather(model,{fetchImpl:fetchValues({wave:4}),now:()=>new Date(NOW)})
 assert.deepEqual(model.environment.fieldSources.waveHeightM,retained);assert.match(describeEnvironmentField(model.environment,'waveHeightM'),/08:15 Asia\/Manila/)
 model.environment.waveHeightM=2;assert.equal(describeEnvironmentField(model.environment,'waveHeightM'),'2 (entered value)')
 assert.equal(model.environment.fieldSources.windForce.kind,'modelled')
})
test('first draft ID assignment does not invalidate weather for identical time and position',async()=>{
 const model=event({id:''}),key=weatherRequestKey(model),result=await lookupIncidentWeather(model,{fetchImpl:fetchValues(),now:()=>new Date(NOW)})
 model.id='persisted-event';assert.equal(weatherRequestKey(model),key);assert.equal(applyIncidentWeatherSuggestions(model,result,{now:NOW}).length,4)
})
test('changed date/time/coordinates or unknown flags prevent applying stale suggestions',async()=>{
 for(const patch of [{time:'09:00'},{date:'2026-11-05'},{lat:1},{timeUnknown:true},{positionQuality:'unknown'}]){
  const model=event(),result=await lookupIncidentWeather(model,{fetchImpl:fetchValues(),now:()=>new Date(NOW)});Object.assign(model,patch)
  assert.throws(()=>applyIncidentWeatherSuggestions(model,result,{now:NOW}),/changed/);assert.equal(model.environment,undefined)
 }
})
test('latest lookup wins when older request resolves after a new request',async()=>{
 const pending=[],fetchImpl=url=>new Promise(resolve=>pending.push({url,resolve})),runner=createIncidentWeatherLookup({fetchImpl,now:()=>new Date(NOW)}),model=event()
 const older=runner.run(model);model.time='09:15';const newer=runner.run(model)
 pending.slice(2).forEach(item=>item.resolve(response(payload(service(item.url),{wave:7}))))
 assert.equal((await newer).suggestions.waveHeightM,7)
 pending.slice(0,2).forEach(item=>item.resolve(response(payload(service(item.url),{wave:1}))))
 assert.equal(await older,null)
})
test('in-flight coordinate change and explicit invalidation discard results even if fetch ignores abort',async()=>{
 for(const cancel of [false,true]){
  const pending=[],runner=createIncidentWeatherLookup({now:()=>new Date(NOW),fetchImpl:url=>new Promise(resolve=>pending.push({url,resolve}))}),model=event(),promise=runner.run(model)
  if(cancel)runner.invalidate();else model.lon=1
  pending.forEach(item=>item.resolve(response(payload(service(item.url)))))
  assert.equal(await promise,null)
 }
})
