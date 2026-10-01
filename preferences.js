const LANGUAGES={'zh-TW':'繁體中文',en:'English',es:'Español',pt:'Português'};
const LOCALE_TAGS={'zh-TW':'zh-TW',en:'en-GB',es:'es-ES',pt:'pt-PT'};
const CURRENCIES=['TWD','USD','EUR'];
const params=new URLSearchParams(location.search);
const saved=(key,fallback)=>{try{return localStorage.getItem(key)??fallback}catch{return fallback}};
const save=(key,value)=>{try{localStorage.setItem(key,String(value))}catch{}};
const requestedLanguage=params.get('lang')||saved('iberia.language','zh-TW');
const lang=Object.hasOwn(LANGUAGES,requestedLanguage)?requestedLanguage:'zh-TW';
const locale=LOCALE_TAGS[lang];
const requestedCurrency=params.get('currency')||saved('iberia.currency','EUR');
let currency=CURRENCIES.includes(requestedCurrency)?requestedCurrency:'EUR';
save('iberia.language',lang);save('iberia.currency',currency);
const catalog=HANDBOOK_LOCALES[lang];
const UI=catalog.ui;
const t=(key,values={})=>String(UI[key]??HANDBOOK_LOCALES['zh-TW'].ui[key]??key).replace(/\{(\w+)\}/g,(m,k)=>values[k]??m);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isoDate=s=>s.length===10?s:'2026-'+s.replace('/','-');
const dateObject=s=>new Date(isoDate(s)+'T12:00:00Z');
const intlDate=(s,options)=>new Intl.DateTimeFormat(locale,{timeZone:'UTC',...options}).format(dateObject(s));
const date=s=>lang==='zh-TW'?isoDate(s).slice(5).replace('-','/'):intlDate(s,{month:'short',day:'numeric'});
const fullDate=s=>intlDate(s,{year:'numeric',month:'short',day:'numeric'});
const weekday=(s,style='short')=>intlDate(s,{weekday:style});
const dateRange=(start,end)=>`${date(start)}–${date(end)}`;
const rangeLabel=s=>{const parts=s.split('–');return parts.length===2?dateRange(parts[0],parts[1]):s};
function pageUrl(page='overview',hash='',personPath=''){
 const query=new URLSearchParams({page,lang,currency});
 return `${personPath}?${query}${hash?'#'+hash:''}`;
}
function parseAmount(value){
 let s=String(value).trim();
 if(!s||/[^\d.,\s\u00a0\u202f]/.test(s))return null;
 const comma=lang==='es'||lang==='pt';
 const spaced=/^\d{1,3}(?:[\s\u00a0\u202f]\d{3})+(?:[.,]\d+)?$/;
 if(/[\s\u00a0\u202f]/.test(s)){if(!spaced.test(s))return null;s=s.replace(/[\s\u00a0\u202f]/g,'');}
 if(comma){
  if(/^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(s))s=s.replace(/\./g,'').replace(',','.');
  else if(/^\d+(?:,\d+)?$/.test(s))s=s.replace(',','.');
  else if(!/^\d+(?:\.\d+)?$/.test(s))return null;
 }else{
  if(/^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(s))s=s.replace(/,/g,'');
  else if(!/^\d+(?:\.\d+)?$/.test(s))return null;
 }
 const n=Number(s);return Number.isFinite(n)&&n>=0?n:null;
}
const money=(amount,code)=>({TWD:'NT$',USD:'US$',EUR:'€'}[code]+' '+new Intl.NumberFormat(locale,{minimumFractionDigits:2,maximumFractionDigits:2}).format(amount));
