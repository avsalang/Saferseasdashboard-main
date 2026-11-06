// Provider contracts verified against official docs and the official URL generator:
// https://open-meteo.com/en/docs
// https://open-meteo.com/en/docs/historical-forecast-api
// https://open-meteo.com/en/docs/marine-weather-api
// https://github.com/open-meteo/open-meteo-website/blob/main/src/lib/components/api-mode/utils.ts
// Marine historical mode uses /v1/forecast with models=marine_best_match.
export const INCIDENT_TIMEZONE = 'Asia/Manila'
export const WEATHER_DOCUMENTATION = 'https://open-meteo.com/en/docs'
export const MARINE_DOCUMENTATION = 'https://open-meteo.com/en/docs/marine-weather-api'
export const isBlankValue = value => value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
const finite = value => isBlankValue(value) || typeof value === 'boolean' || !Number.isFinite(Number(value)) ? null : Number(value)
export function validIncidentPosition(lat, lon) { const a=finite(lat), b=finite(lon);return a!==null&&b!==null&&Math.abs(a)<=90&&Math.abs(b)<=180 }
export function createIncidentEnvironment() { return {waveHeightM:null,windForce:null,visibility:'',weatherDescription:'',seaState:'',currentTide:'',source:'',observedAt:'',fieldSources:{},lookup:null} }
export function ensureIncidentEnvironment(event) {
  if(!event.environment || typeof event.environment!=='object' || Array.isArray(event.environment))event.environment=createIncidentEnvironment()
  for(const [key,value] of Object.entries(createIncidentEnvironment()))if(event.environment[key]===undefined)event.environment[key]=value
  if(!event.environment.fieldSources||typeof event.environment.fieldSources!=='object'||Array.isArray(event.environment.fieldSources))event.environment.fieldSources={}
  return event.environment
}
export function weatherRequestKey(event) {
  return JSON.stringify([event.date??'',event.time??'',Boolean(event.dateUnknown),Boolean(event.timeUnknown),finite(event.lat),finite(event.lon),event.positionQuality??''])
}
function dateString(date) {return new Intl.DateTimeFormat('en-CA',{timeZone:INCIDENT_TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(date)}
function validDate(date) {return /^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date+'T00:00:00Z'))&&new Date(date+'T00:00:00Z').toISOString().slice(0,10)===date}
export function incidentWeatherInput(event,{now=new Date()}={}) {
  if(event.dateUnknown||!validDate(String(event.date||'')))throw Error('Enter a known, valid occurrence date before looking up conditions.')
  if(event.timeUnknown||!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(event.time||'')))throw Error('Enter a known occurrence time before looking up conditions. No time is assumed for an unknown time.')
  if(event.positionQuality==='unknown'||!validIncidentPosition(event.lat,event.lon))throw Error('Enter both valid coordinates and select a known position quality before looking up conditions.')
  const current=now instanceof Date?now:new Date(now)
  if(!Number.isFinite(current.getTime()))throw Error('The current date is unavailable. Enter conditions manually.')
  const localDateTime=`${event.date}T${event.time}`,targetEpochMs=Date.parse(localDateTime+':00+08:00')
  const ageDays=(Date.parse(dateString(current)+'T00:00:00Z')-Date.parse(event.date+'T00:00:00Z'))/86400000
  return {key:weatherRequestKey(event),date:event.date,time:event.time,localDateTime,timezone:INCIDENT_TIMEZONE,targetEpochMs,lat:finite(event.lat),lon:finite(event.lon),positionQuality:event.positionQuality||'reported',mode:ageDays>5?'historical_forecast':'forecast'}
}
export function incidentWeatherIssue(event) {try{incidentWeatherInput(event);return ''}catch(error){return error.message}}
export function buildIncidentWeatherRequests(input) {
  const historical=input.mode==='historical_forecast',base={latitude:String(input.lat),longitude:String(input.lon),timezone:INCIDENT_TIMEZONE,start_date:input.date,end_date:input.date,timeformat:'unixtime'}
  const weather=new URL(historical?'https://historical-forecast-api.open-meteo.com/v1/forecast':'https://api.open-meteo.com/v1/forecast')
  weather.search=new URLSearchParams({...base,hourly:'wind_speed_10m,visibility,weather_code',wind_speed_unit:'kmh',cell_selection:'sea'}).toString()
  const marine=new URL(historical?'https://historical-forecast-api.open-meteo.com/v1/forecast':'https://marine-api.open-meteo.com/v1/marine')
  marine.search=new URLSearchParams({...base,hourly:'wave_height',cell_selection:'sea',length_unit:'metric',...(historical?{models:'marine_best_match'}:{})}).toString()
  return {weather:weather.href,marine:marine.href}
}
// Approximate force from modelled 10 m wind; the manual force remains authoritative.
// Continuous m/s band thresholds correspond to the standard Beaufort scale.
export function windForceFromKmh(speed) {
  const value=finite(speed);if(value===null||value<0)return null
  const bands=[0.3,1.6,3.4,5.5,8,10.8,13.9,17.2,20.8,24.5,28.5,32.7]
  const force=bands.findIndex(limit=>value/3.6<limit);return force===-1?12:force
}
const weatherDescriptions={0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Depositing rime fog',51:'Light drizzle',53:'Moderate drizzle',55:'Dense drizzle',56:'Light freezing drizzle',57:'Dense freezing drizzle',61:'Slight rain',63:'Moderate rain',65:'Heavy rain',66:'Light freezing rain',67:'Heavy freezing rain',71:'Slight snow',73:'Moderate snow',75:'Heavy snow',77:'Snow grains',80:'Slight rain showers',81:'Moderate rain showers',82:'Violent rain showers',85:'Slight snow showers',86:'Heavy snow showers',95:'Thunderstorm',96:'Thunderstorm with slight hail',99:'Thunderstorm with heavy hail'}
function epoch(value) {if(typeof value==='number')return Number.isFinite(value)?value*1000:NaN;if(typeof value!=='string'||!value)return NaN;return Date.parse(/[zZ]$|[+-]\d\d:\d\d$/.test(value)?value:value+'+08:00')}
export function nearestWeatherHour(times,targetEpochMs) {
  if(!Array.isArray(times))return -1
  let index=-1,difference=Infinity;times.forEach((time,i)=>{const diff=Math.abs(epoch(time)-targetEpochMs);if(diff<difference){index=i;difference=diff}})
  return difference<=3600000?index:-1
}
function nonNegative(value){const number=finite(value);return number!==null&&number>=0?number:null}
function parseResponse(data,input,service,url,receivedAt) {
  const index=nearestWeatherHour(data?.hourly?.time,input.targetEpochMs)
  if(index===-1)throw Error('No hourly model value was returned within one hour of the entered incident time.')
  const value=key=>nonNegative(data.hourly?.[key]?.[index]),values=service==='weather'?{windSpeedKmh:value('wind_speed_10m'),visibilityM:value('visibility'),weatherCode:value('weather_code')}:{waveHeightM:value('wave_height')}
  if(Object.values(values).every(item=>item===null))throw Error('The provider returned no usable values for this hour and location.')
  return {ok:true,url,receivedAt,matchedTime:new Date(epoch(data.hourly.time[index])).toISOString(),returnedLocation:{lat:finite(data.latitude),lon:finite(data.longitude)},timezone:data.timezone||null,utcOffsetSeconds:finite(data.utc_offset_seconds),values,units:{...(data.hourly_units||{})},generationTimeMs:finite(data.generationtime_ms)}
}
function stamp(now){const date=typeof now==='function'?now():now;return (date instanceof Date?date:new Date(date)).toISOString()}
export async function lookupIncidentWeather(event,{fetchImpl=globalThis.fetch,now=()=>new Date(),signal}={}) {
  const requestedAt=stamp(now),input=incidentWeatherInput(event,{now:requestedAt}),urls=buildIncidentWeatherRequests(input)
  if(typeof fetchImpl!=='function')throw Error('Weather lookup is unavailable in this browser. Enter conditions manually.')
  const services=['weather','marine']
  const results=await Promise.allSettled(services.map(async service=>{
    const response=await fetchImpl(urls[service],{signal,headers:{Accept:'application/json'}})
    let data;try{data=await response.json()}catch{throw Error(`Provider response was not readable JSON (HTTP ${response.status||'unknown'}).`)}
    if(!response.ok||data?.error)throw Error(data?.reason||`Provider request failed (HTTP ${response.status||'unknown'}).`)
    return parseResponse(data,input,service,urls[service],stamp(now))
  }))
  if(signal?.aborted){const error=Error('Lookup cancelled.');error.name='AbortError';throw error}
  const responses={},errors=[]
  results.forEach((result,index)=>{const service=services[index];if(result.status==='fulfilled')responses[service]=result.value;else{const message=result.reason?.message||'Lookup failed.';responses[service]={ok:false,url:urls[service],receivedAt:stamp(now),error:message};errors.push({service,message})}})
  const weather=responses.weather?.values||{},marine=responses.marine?.values||{}
  const suggestions={waveHeightM:marine.waveHeightM??null,windForce:windForceFromKmh(weather.windSpeedKmh),visibility:weather.visibilityM===null||weather.visibilityM===undefined?'':`${weather.visibilityM} m`,weatherDescription:weatherDescriptions[weather.weatherCode]||'',seaState:'',currentTide:''}
  return {provider:'Open-Meteo',kind:'Modelled environmental context; not observed evidence',status:errors.length===0?'complete':errors.length===2?'unavailable':'partial',request:{...input,requestedAt,urls},returnedAt:stamp(now),responses,suggestions,errors,appliedFields:[],appliedAt:null}
}
export function applyIncidentWeatherSuggestions(event,lookup,{now=new Date()}={}) {
  if(!lookup?.request||lookup.request.key!==weatherRequestKey(event))throw Error('The incident time or position changed. Look up conditions again before applying suggestions.')
  incidentWeatherInput(event,{now})
  const environment=ensureIncidentEnvironment(event),applied=[]
  for(const key of ['waveHeightM','windForce','visibility','weatherDescription']){
    const value=lookup.suggestions?.[key]
    if(isBlankValue(environment[key])&&!isBlankValue(value)){
      environment[key]=value;applied.push(key)
      const response=lookup.responses?.[key==='waveHeightM'?'marine':'weather']
      environment.fieldSources[key]={kind:'modelled',provider:lookup.provider||'Open-Meteo',appliedValue:value,appliedAt:stamp(now),request:JSON.parse(JSON.stringify(lookup.request)),returnedAt:lookup.returnedAt,modelTime:response?.matchedTime||null,returnedLocation:response?.returnedLocation?{...response.returnedLocation}:null,providerUrl:response?.url||null}
    }
  }
  if(applied.length){
    if(isBlankValue(environment.source))environment.source=`Open-Meteo modelled context; requested ${lookup.request.localDateTime} ${INCIDENT_TIMEZONE}. See retained lookup provenance.`
    lookup.appliedFields=[...new Set([...(lookup.appliedFields||[]),...applied])];lookup.appliedAt=stamp(now);environment.lookup=lookup
  }
  return applied
}
export function describeEnvironmentField(environment,key) {
  const value=environment?.[key];if(isBlankValue(value))return 'Unknown'
  const source=environment?.fieldSources?.[key]
  if(source?.kind!=='modelled'||String(source.appliedValue)!==String(value))return `${value} (entered value)`
  const modelTime=source.modelTime?`model hour ${source.modelTime} UTC`:'model hour not returned'
  const requested=source.request?.localDateTime?`; requested ${source.request.localDateTime} ${source.request.timezone||INCIDENT_TIMEZONE}`:''
  return `${value} (modelled context; ${source.provider||'Open-Meteo'}; ${modelTime}${requested})`
}
// A component may be unmounted, edited, or clicked twice while fetch is pending.
// Keep this guard outside Vue so race behaviour can be deterministically tested.
export function createIncidentWeatherLookup(options={}) {
  let version=0,controller=null
  return {
    invalidate(){version++;controller?.abort();controller=null},
    async run(event){
      const ticket=++version,key=weatherRequestKey(event);controller?.abort();const active=new AbortController();controller=active
      try{const result=await lookupIncidentWeather(event,{...options,signal:active.signal});return ticket===version&&key===weatherRequestKey(event)?result:null}
      catch(error){if(ticket!==version||active.signal.aborted)return null;throw error}
      finally{if(ticket===version)controller=null}
    }
  }
}
