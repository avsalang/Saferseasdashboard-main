const stringify = value => JSON.stringify(value,(_key,item)=>item==null?'Unknown':item)
const display = value => value === null || value === undefined || value === '' ? 'Unknown' : typeof value === 'object' ? stringify(value) : String(value)
const escapeHTML = value => display(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]))
const columnsOf = rows => [...new Set(rows.flatMap(row => Object.keys(row)))]
function save(filename, body, type) {
  const url = URL.createObjectURL(body instanceof Blob ? body : new Blob([body], { type }))
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}
export function downloadCSV(filename, rows) {
  const columns = columnsOf(rows)
  const cell = value => { let text = display(value); if (/^[\s]*[=+@-]/.test(text) && typeof value !== 'number') text = `'${text}`; return `"${text.replace(/"/g, '""')}"` }
  save(filename, '\uFEFF' + [columns.map(cell).join(','), ...rows.map(row => columns.map(key => cell(row[key])).join(','))].join('\r\n'), 'text/csv;charset=utf-8')
}
export async function downloadXLSX(filename, sheets) {
  const module = await import('exceljs'); const ExcelJS = module.default || module; const book = new ExcelJS.Workbook()
  book.creator = 'SAFERSEAS fictional demonstration'; book.created = new Date()
  sheets.forEach((sheet, i) => {
    const tab = book.addWorksheet((sheet.name || `Sheet ${i + 1}`).replace(/[\\/*?:\[\]]/g, ' ').slice(0, 31), { views:[{ state:'frozen', ySplit:1 }] })
    const keys = columnsOf(sheet.rows); tab.columns = keys.map(key => ({ header:key, key, width:Math.min(48, Math.max(18, key.length + 4)) }))
    sheet.rows.forEach(row => tab.addRow(Object.fromEntries(keys.map(key => {
      const value=row[key]
      if(value == null || value === '')return [key,'Unknown']
      if(value instanceof Date)return [key,value]
      if(typeof value==='string' && /date|as.?of/i.test(key) && /^\d{4}-\d{2}-\d{2}$/.test(value)){
        const date=new Date(`${value}T00:00:00.000Z`);if(Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value)return [key,date]
      }
      return [key,typeof value === 'object' ? stringify(value) : value]
    }))))
    tab.getRow(1).font = { bold:true, color:{ argb:'FFFFFFFF' } }; tab.getRow(1).fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF1A365D' } }
    tab.eachRow(row => { row.alignment = { vertical:'top', wrapText:true }; row.eachCell(cell => { if (typeof cell.value === 'string') cell.numFmt = '@';else if(cell.value instanceof Date)cell.numFmt='yyyy-mm-dd' }) })
    if (keys.length) tab.autoFilter = { from:{row:1,column:1}, to:{row:Math.max(1,tab.rowCount),column:keys.length} }
    tab.pageSetup = { orientation:'landscape', fitToPage:true, fitToWidth:1, fitToHeight:0, printTitlesRow:'1:1' }
  })
  save(filename, new Blob([await book.xlsx.writeBuffer()], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}))
}
export function downloadGeoJSON(filename, events) {
  const features = events.filter(e => e.positionQuality !== 'unknown' && e.lat != null && e.lat !== '' && e.lon != null && e.lon !== '' && Number.isFinite(Number(e.lat)) && Number.isFinite(Number(e.lon)) && Math.abs(Number(e.lat)) <= 90 && Math.abs(Number(e.lon)) <= 180).map(e => ({ type:'Feature', id:e.id, geometry:{type:'Point',coordinates:[Number(e.lon),Number(e.lat)]}, properties:{reference:e.ref,date:e.date ?? 'Unknown',type:e.type,seriousness:e.seriousness,place:e.place,positionQuality:e.positionQuality,aor:e.aor,homeport:e.homeport,cpc:e.cpc,issuingOffice:e.issuingOffice,vesselInvolvements:e.vessels?.length ?? 0} }))
  save(filename, JSON.stringify({type:'FeatureCollection',metadata:{generatedAt:new Date().toISOString(),population:events.length,located:features.length,excluded:events.length-features.length,data:'Fictional demonstration'},features},null,2), 'application/geo+json')
}
export function printReport({title,subtitle,columns,rows = [],sections = [],metadata = {}}) {
  const popup = window.open('', '_blank'); if (!popup) throw new Error('Allow browser popups to open the printable report.')
  const keys = columns || columnsOf(rows).map(field => ({field,label:field}))
  const groups = keys.length > 10 ? Array.from({length:Math.ceil((keys.length-1)/7)},(_,i)=>[keys[0],...keys.slice(1+i*7,8+i*7)]) : [keys]
  const table = rows.length ? groups.map((group,i)=>`<section${i?' style="break-before:page"':''}>${groups.length>1?`<h2>Table column group ${i+1} of ${groups.length} · ${rows.length} rows</h2>`:''}<table><thead><tr>${group.map(c=>`<th>${escapeHTML(c.label)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${group.map(c=>`<td>${escapeHTML(typeof c.field === 'function' ? c.field(row) : row[c.field])}</td>`).join('')}</tr>`).join('')}</tbody></table></section>`).join('') : ''
  popup.document.write(`<!doctype html><html><head><title>${escapeHTML(title)}</title><style>@page{size:A4 landscape;margin:14mm}body{font:11px Arial;color:#18314f}h1{font-size:24px}h2{font-size:15px;margin-top:24px}p,td{white-space:pre-wrap;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccd6e1;padding:6px;text-align:left}th{background:#e9f0f7}thead{display:table-header-group}tr{break-inside:avoid}.meta{font-size:10px;color:#536176}section{break-inside:auto}button{margin:16px 0;padding:9px 18px}@media print{button{display:none}}</style></head><body><p>SAFERSEAS · FICTIONAL DEMONSTRATION</p><h1>${escapeHTML(title)}</h1><p>${escapeHTML(subtitle)}</p><p class="meta">${Object.entries(metadata).map(([k,v])=>`${escapeHTML(k)}: ${escapeHTML(v)}`).join(' · ')}</p><button onclick="window.print()">Print / Save as PDF</button>${table}${sections.map(section=>`<section><h2>${escapeHTML(section.title || section.heading)}</h2><p>${escapeHTML(section.content ?? section.body ?? section.text)}</p></section>`).join('')}<p class="meta">Browser print preview. No official signature or server-issued PDF. Generated ${escapeHTML(new Date().toISOString())}.</p></body></html>`)
  popup.document.close(); return popup
}
