function validRates(rows){
 if(!Array.isArray(rows))return null;
 const result=[];
 for(const quote of ['TWD','USD']){
  const row=rows.find(r=>r&&r.base==='EUR'&&r.quote===quote);
  if(!row||typeof row.rate!=='number'||!Number.isFinite(row.rate)||row.rate<=0||!/^\d{4}-\d{2}-\d{2}$/.test(row.date)||!Number.isFinite(Date.parse(row.date)))return null;
  result.push({base:'EUR',quote,rate:row.rate,date:row.date});
 }
 return result;
}
function convertAmount(amount,from,to,rows){
 const rates={EUR:1,...Object.fromEntries(rows.map(r=>[r.quote,r.rate]))};
 return amount/rates[from]*rates[to];
}
function initCurrency(){
 const input=document.getElementById('currency-amount'),base=document.getElementById('currency-base');
 const error=document.getElementById('amount-error'),status=document.getElementById('rate-status'),refresh=document.getElementById('refresh-rates');
 let cached=null;try{cached=validRates(JSON.parse(saved('iberia.rates','null')))}catch{}
 let rows=cached||validRates(RATE_SNAPSHOT),source=cached?'ratesCached':'ratesSnapshot';
 function render(){
  const amount=parseAmount(input.value);
  error.textContent=amount===null?t('invalidAmount'):'';
  input.setAttribute('aria-invalid',String(amount===null));
  if(amount!==null)save('iberia.amount',amount);
  for(const code of CURRENCIES){
   const card=document.querySelector(`.currency-result[data-currency="${code}"]`);
   card.classList.toggle('is-base',code===currency);
   const converted=amount!==null&&rows?convertAmount(amount,currency,code,rows):null;
   const valid=converted!==null&&Number.isFinite(converted);
   document.getElementById(`result-${code}`).textContent=valid?money(converted,code):'—';
   card.querySelector('.currency-result-note').textContent=code===currency?t('sameCurrency'):valid?t('convertedAmount',{amount:money(converted,code)}):'';
  }
  document.getElementById('rate-dates').textContent=rows?t('ratesUpdated')+' · '+rows.map(r=>t('rateDate',{currency:`EUR → ${r.quote}`,date:fullDate(r.date)})).join(' · '):t('rateUnavailable');
 }
 function updateCurrency(){
  currency=base.value;save('iberia.currency',currency);
  const next=new URL(location.href);next.searchParams.set('currency',currency);history.replaceState(null,'',next.href);
  document.querySelectorAll('a[href]').forEach(link=>{const u=new URL(link.href,location.href);if(u.origin===location.origin&&u.searchParams.has('page')){u.searchParams.set('currency',currency);link.href=u.href}});
  render();
 }
 async function updateRates(){
  refresh.disabled=true;status.textContent=t('ratesLoading');
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
  try{
   const response=await fetch('https://api.frankfurter.dev/v2/rates?base=EUR&quotes=USD,TWD',{credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});
   if(!response.ok)throw new Error('Rate request failed');
   const fresh=validRates(await response.json());if(!fresh)throw new Error('Invalid rates');
   rows=fresh;cached=fresh;save('iberia.rates',JSON.stringify(fresh));source='ratesLive';
  }catch{source=cached?'ratesCached':'ratesSnapshot'}
  finally{clearTimeout(timeout);refresh.disabled=false;status.textContent=t(source);render()}
 }
 input.addEventListener('input',render);base.addEventListener('change',updateCurrency);refresh.addEventListener('click',updateRates);
 render();
 if(params.has('amount')){const next=new URL(location.href);next.searchParams.delete('amount');history.replaceState(null,'',next.href)}
 updateRates();
}
