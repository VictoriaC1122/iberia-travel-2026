const person=document.body.dataset.person||'andy';
const shortTrip=person==='victoria';
const name=shortTrip?'Victoria':'Andy';
const tabs=Object.fromEntries(['overview','days','flights','transport','tickets','stays','notes','currency'].map(k=>[k,t(k)]));
const page=Object.hasOwn(tabs,params.get('page'))?params.get('page'):'overview';
const data=lang==='zh-TW'?{DAYS,TRAINS,TICKETS,SPLIT_FLIGHTS,FULL_FLIGHTS,VICTORIA_EUROPE_STAYS}:catalog;
const days=(shortTrip?catalog.shortDays:data.DAYS).map(d=>[...d]);
const routes=shortTrip?catalog.routesShort:catalog.routesFull;
const pill=s=>`<span class="pill ${s.startsWith(t('booked'))?'booked':'pending'}">${esc(s)}</span>`;
const map=s=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s)}`;
const alertBox=(title,body)=>`<div class="notice"><strong>${esc(title)}</strong><p>${esc(body)}</p></div>`;
const card=(title,body)=>`<article class="card"><h3>${esc(title)}</h3>${body}</article>`;
const heading=(title,note='')=>`<header class="section-head"><h2>${esc(title)}</h2>${note?`<p>${esc(note)}</p>`:''}</header>`;
const chapterNames={'11-03':t('portugal'),'11-10':t('andalucia'),'11-19':t('madridToledo'),'11-25':t('barcelona')};
const chapterTones={'11-03':'atlantic','11-10':'terracotta','11-19':'ochre','11-25':'glass'};
const cityPhotos={
 '11-03':{src:'assets/lisbon.jpg',alt:t('lisbonAlt'),caption:'LISBOA · PORTUGAL'},
 '11-25':{src:'assets/barcelona.jpg',alt:t('barcelonaAlt'),caption:'PARK GÜELL · BARCELONA'}
};
function placePhoto(key,className='place-photo'){
 const p=cityPhotos[key];return p?`<figure class="${className}"><img src="${p.src}" alt="${esc(p.alt)}" loading="lazy" decoding="async" width="1200" height="800"><figcaption>${p.caption}</figcaption></figure>`:'';
}
const timePrefixes={
 'zh-TW':['抵達後','待安排','待確認','上午','下午','中午','晚上','傍晚','白天'],
 en:['After arrival','Late afternoon','To arrange','To confirm','Morning','Afternoon','Evening','Midday','Daytime'],
 es:['A la llegada','Durante el día','Por la mañana','Por la noche','Por la tarde','Al atardecer','A mediodía','Por organizar','Por confirmar'],
 pt:['Após a chegada','Durante o dia','Fim da tarde','Por organizar','Por confirmar','Meio-dia','Manhã','Tarde','Noite']
};
function splitEvent(s){
 const numeric=s.match(/^\d{1,2}:\d{2}(?=\s)/);
 const prefix=numeric?.[0]||timePrefixes[lang].find(p=>s.startsWith(p+' '));
 if(prefix)return [prefix,s.slice(prefix.length).trim()];
 const i=s.indexOf(' ');return i<0?['',s]:[s.slice(0,i),s.slice(i+1)];
}
function dayView(d){
 const month=lang==='zh-TW'?`${Number(d[0].slice(0,2))} 月`:intlDate(d[0],{month:'short'});
 return `<article class="day-card" id="day-${d[0]}" aria-labelledby="title-${d[0]}"><header><time class="day-stamp" datetime="2026-${d[0]}" aria-label="${esc(intlDate(d[0],{year:'numeric',month:'long',day:'numeric',weekday:'long'}))}"><span>${esc(month)}</span><strong>${d[0].slice(3)}</strong><span>${esc(weekday(d[0]))}</span></time><div class="day-heading"><span class="city">${esc(d[1])}</span><h3 id="title-${d[0]}">${esc(d[2])}</h3></div></header>${placePhoto(d[0]==='11-27'?'11-25':d[0]==='11-25'?'':d[0],'day-photo')}<ol class="timeline">${d[3].split('|').map(s=>{const [time,text]=splitEvent(s);return `<li><time>${esc(time)}</time><div>${esc(text)}</div></li>`}).join('')}</ol>${d[4]?`<p class="day-note">${esc(d[4])}</p>`:''}</article>`;
}
function europeCalendar(){
 const dayMs=86400000,utc=s=>Date.parse(`${s}T00:00:00Z`);
 const periods=data.VICTORIA_EUROPE_STAYS.map(s=>({...s,nights:(utc(s.leave)-utc(s.arrival))/dayMs}));
 const totalDays=periods.reduce((n,s)=>n+s.nights+1,0),totalNights=periods.reduce((n,s)=>n+s.nights,0);
 const dates=Array.from({length:42},(_,i)=>new Date(utc('2026-10-26')+i*dayMs).toISOString().slice(0,10));
 const weeks=Array.from({length:6},(_,w)=>{
  const row=dates.slice(w*7,w*7+7);
  const cells=row.map((iso,col)=>{
   const stay=periods.find(s=>iso>=s.arrival&&iso<=s.leave),departure=periods.find(s=>iso===s.departure);
   const returning=stay&&iso===stay.leave,arriving=stay&&iso===stay.arrival;
   const note=departure?t('calendarDepartureShort'):returning?t('calendarReturnShort'):arriving?t('calendarArrivalShort'):'';
   const fullNote=departure?t('calendarDeparture'):returning?t('calendarReturn'):arriving?t('calendarArrival'):'';
   const month=Number(iso.slice(5,7)),day=Number(iso.slice(8));
   const number=month===11?String(day):intlDate(iso,{month:'numeric',day:'numeric'});
   const label=`${intlDate(iso,{month:'long',day:'numeric',weekday:'long'})} · ${departure?t('flyingTo',{place:departure.place}):stay?`${stay.place}${fullNote?' · '+fullNote:''}`:t('outsideEurope')}`;
   const inner=`<time datetime="${iso}" class="calendar-number">${esc(number)}</time><span class="calendar-day-note">${esc(note)}</span>`;
   return `<div role="cell" class="calendar-cell ${month!==11?'outside-month':''} ${stay?'in-europe':''}" data-date="${iso}" ${stay?`data-stay="${stay.tone}"`:''} style="grid-column:${col+1}">${stay||departure?`<a class="calendar-date" href="${pageUrl('days','day-'+iso.slice(5))}" aria-label="${esc(label)}">${inner}</a>`:`<div class="calendar-date" aria-label="${esc(label)}">${inner}</div>`}</div>`;
  }).join('');
  const bands=periods.map(s=>{
   const from=s.arrival>row[0]?s.arrival:row[0],to=s.leave<row[6]?s.leave:row[6];if(from>to)return '';
   const start=row.indexOf(from)+1,span=(utc(to)-utc(from))/dayMs+1;
   return `<span aria-hidden="true" class="calendar-band ${s.tone}" style="grid-column:${start} / span ${span}">${span>1?esc(s.place):''}</span>`;
  }).join('');
  const outbound=periods.filter(s=>row.includes(s.departure)).map(s=>`<span aria-hidden="true" class="calendar-flight" style="grid-column:${row.indexOf(s.departure)+1}">✈︎</span>`).join('');
  return `<div role="row" class="calendar-week">${cells}${bands}${outbound}</div>`;
 }).join('');
 const periodCards=periods.map(s=>`<a class="calendar-period ${s.tone}" href="${pageUrl('days','day-'+s.arrival.slice(5))}"><h3>${esc(s.place)}</h3><p class="period-dates">${esc(dateRange(s.arrival,s.leave))}</p><p class="period-count">${esc(t('periodDaysNights',{days:s.nights+1,nights:s.nights}))}</p></a>`).join('');
 const weekdayHeads=dates.slice(0,7).map(d=>`<span role="columnheader" aria-label="${esc(weekday(d,'long'))}">${esc(weekday(d))}</span>`).join('');
 return `<section class="travel-calendar" id="europe-calendar" aria-labelledby="europe-calendar-title"><header class="calendar-intro"><div><span class="calendar-kicker">VICTORIA · 2026</span><h2 id="europe-calendar-title">${esc(t('europeCalendar'))}</h2></div><p class="calendar-total"><strong>${totalDays}</strong><span>${esc(t('dayUnit'))}<small>${esc(t('totalNights',{count:totalNights}))}</small></span></p></header><div class="calendar-layout"><div class="calendar-month"><div class="calendar-month-head"><h3>${esc(intlDate('11-01',{year:'numeric',month:'long'}))}</h3><span>${esc(t('includesDecember'))}</span></div><div class="calendar-table" role="table" aria-label="${esc(t('calendarLabel'))}"><div class="calendar-weekdays" role="row">${weekdayHeads}</div>${weeks}</div><div class="calendar-legend"><span><i class="portugal" aria-hidden="true"></i>${esc(t('portugal'))}</span><span><i class="barcelona" aria-hidden="true"></i>${esc(t('barcelona'))}</span><span><i class="flight-mark" aria-hidden="true">✈︎</i>${esc(t('flying'))}</span></div></div><aside class="calendar-periods" aria-label="${esc(t('twoStays'))}">${periodCards}<p class="calendar-count-note">${esc(t('calendarCountNote'))}</p></aside></div></section>`;
}
function overview(){return (shortTrip?europeCalendar():'')+heading(t('chapters'))+
 `<div class="overview-grid"><div><div class="route-list">${routes.map(r=>`<a class="route ${cityPhotos[r[4]]?'has-photo':''}" data-tone="${chapterTones[r[4]]}" href="${pageUrl('days','day-'+r[4])}">${placePhoto(r[4],'route-photo')}<div class="route-copy"><div class="route-meta"><span class="route-num">${r[0]}</span><small>${esc(rangeLabel(r[1]))}</small></div><span class="chapter-name">${esc(chapterNames[r[4]])}</span><h3>${esc(r[2])}</h3><p>${esc(r[3])}</p><span class="route-action">${esc(t('viewDays'))}</span></div></a>`).join('')}</div></div><aside class="trip-summary"><span class="summary-label">${name} · 2026</span><h3>${esc(t(shortTrip?'portugalBarcelona':'portugalSpain'))}</h3><dl><div><dt>${esc(t('departure'))}</dt><dd>${esc(fullDate('11-02'))}</dd></div><div><dt>${esc(t('returnArrival'))}</dt><dd>${esc(fullDate(shortTrip?'12-02':'12-03'))} · ${esc(t(shortTrip?'philadelphia':'kaohsiung'))}</dd></div><div><dt>${esc(t('together'))}</dt><dd>${esc(t('portugalBarcelona'))}</dd></div></dl><p>${esc(t(shortTrip?'outsideTrip':'soloTrip'))}</p></aside></div>`+
 heading(t('pendingPlans'))+`<div class="grid">${card(t('returnLisbonTitle'),`<p>${esc(t('returnLisbonNote'))}</p>`)}${card(t('gaudiTitle'),`<p>${esc(t('gaudiNote'))}</p>`)}${card(t('staysTickets'),`<p>${esc(t('staysTicketsNote'))}</p>`)}</div><div class="actions"><a class="button" href="${pageUrl('days')}">${esc(t('days'))}</a><a class="button secondary" href="${pageUrl('flights')}">${esc(t('flights'))}</a></div>`;
}
function itinerary(){return heading(t('days'))+`<div class="itinerary"><aside class="day-picker"><div class="date-label">${esc(t('date'))}</div><div class="mobile-date-jump"><label for="journey-date">${esc(t('date'))}</label><select id="journey-date">${days.map(d=>`<option value="${d[0]}">${esc(date(d[0]))} (${esc(weekday(d[0]))}) · ${esc(d[1])}</option>`).join('')}</select></div><div class="date-list" role="navigation" aria-label="${esc(t('itineraryDates'))}">${days.map(d=>`<a href="#day-${d[0]}" aria-label="${esc(date(d[0])+' '+d[1])}"><span>${esc(date(d[0]))}</span><span class="date-city">${esc(d[1])}</span></a>`).join('')}</div></aside><div class="day-stack">${days.map(dayView).join('')}</div></div>`;}
function flightFares(){return FLIGHT_FARES.filter(f=>f.person===person).map(f=>{
 const query=new URLSearchParams({page:'currency',lang,currency:f.original.currency,amount:String(f.original.amount)});
 return `<section class="airfare" aria-labelledby="fare-title-${f.to}"><header class="airfare-heading"><div><span class="airfare-kicker">${esc(name)} · ${f.from} ⇄ ${f.to}</span><h3 id="fare-title-${f.to}">${esc(t('roundTripFare'))}</h3></div><p>${esc(dateRange(f.departure,f.return))}</p></header><dl class="airfare-amounts"><div><dt>${esc(t('originalFare'))}</dt><dd>${esc(money(f.original.amount,f.original.currency))}</dd></div><div><dt>${esc(t('cardNotificationAmount'))}${f.cardNotification.currency?'':` <span class="fare-currency-note">· ${esc(t('currencyPending'))}</span>`}</dt><dd>${esc(f.cardNotification.currency?money(f.cardNotification.amount,f.cardNotification.currency):'$ '+new Intl.NumberFormat(locale,{minimumFractionDigits:2,maximumFractionDigits:2}).format(f.cardNotification.amount))}</dd></div></dl><a class="text-link" href="?${query}">${esc(t('convertFare'))} →</a></section>`;
}).join('');}
function flights(){return heading(t('flightInfo'),t('localTimes'))+flightFares()+`<div class="grid flights">${(shortTrip?data.SPLIT_FLIGHTS:data.FULL_FLIGHTS).map(f=>`<article class="card flight"><div class="flight-top"><span>${esc(fullDate(f[0]))}</span><strong>${esc(f[1])}</strong></div><div class="flight-route"><div><b>${f[4]}</b><span>${esc(f[2])}</span></div><span class="plane" aria-hidden="true">✈︎</span><div><b>${f[5]}</b><span>${esc(f[3])}</span></div></div><p>${esc(f[6])}</p></article>`).join('')}</div>`;}
function transport(){const list=data.TRAINS.filter(x=>!shortTrip||x[5].includes('Victoria'));return heading(t('intercity'))+(shortTrip?alertBox(t('portoLisbon'),t('trainPending')):'')+`<div class="grid">${list.map(x=>card(`${date(x[0])} · ${x[1]}`,`${pill(x[4])}<p class="strong">${esc(x[3])}</p><p>${esc(x[2])}</p><p class="caption">${esc(x[5])}</p><a class="text-link" href="${map(x[2].split(' → ')[0].split(' ⇄ ')[0])}" target="_blank" rel="noopener noreferrer">${esc(t('stationMap'))}</a>`)).join('')}</div>`+heading(t('localTransfers'))+`<div class="grid">${card(t('lisbonPorto'),`<p>${esc(t('transferNote'))}</p>`)}${card(t('reunion'),`<p>${esc(t('reunionNote'))}</p>`)}</div>`;}
function tickets(){return heading(t('tickets'))+(shortTrip?alertBox(t('bolsaTitle'),t('bolsaNote')):'')+`<div class="grid">${data.TICKETS.filter(x=>!shortTrip||x[5]==='both').map(x=>card(`${date(x[0])} · ${x[1]}`,`${pill(x[3])}<p class="strong">${esc(x[2])}</p><p>${esc(x[4])}</p>`)).join('')}</div>`;}
function stays(){const rows=shortTrip?catalog.staysShort:catalog.staysFull;return heading(t('stays'))+`<div class="grid">${rows.map(r=>card(r.city,`<div class="stay-meta"><strong>${esc(r.end?dateRange(r.start,r.end):t('fromDate',{date:date(r.start)}))}</strong><span>${esc(r.nights===null?t('unconfirmed'):t('nights',{count:r.nights}))}</span></div>${pill(t('hotelPending'))}<p>${esc(r.note)}</p>`)).join('')}</div>`;}
function notes(){return heading(t('notes'))+`<div class="grid">${card(t('packing'),`<ul>${UI.packingList.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`)}${card(t('portugueseFood'),`<p>${esc(t('portugueseFoodNote'))}</p>`)}${card(t('spanishFood'),`<p>${esc(t('spanishFoodNote'))}</p><p>${esc(t('vinitusNote'))}</p>`)}</div>`;}
function currencyView(){
 const requestedAmount=params.get('amount');
 const storedAmount=Number(requestedAmount&&/^\d+(?:\.\d+)?$/.test(requestedAmount)?requestedAmount:saved('iberia.amount','100'));
 const initial=Number.isFinite(storedAmount)&&storedAmount>=0?storedAmount:100;
 const value=new Intl.NumberFormat(locale,{useGrouping:false,maximumFractionDigits:6}).format(initial);
 return heading(t('currency'),t('convertNote'))+`<section class="currency-panel" aria-label="${esc(t('currency'))}"><div class="currency-inputs"><label for="currency-amount">${esc(t('amount'))}<input id="currency-amount" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="${value}" aria-describedby="amount-error"></label><label for="currency-base">${esc(t('amountCurrency'))}<select id="currency-base">${CURRENCIES.map(c=>`<option value="${c}" ${currency===c?'selected':''}>${c} · ${esc(t(c.toLowerCase()))}</option>`).join('')}</select></label></div><p id="amount-error" class="amount-error" aria-live="polite"></p><div class="currency-results" aria-live="polite" aria-atomic="true">${CURRENCIES.map(c=>`<article class="currency-result" data-currency="${c}"><span class="currency-code">${c}</span><h3>${esc(t(c.toLowerCase()))}</h3><output id="result-${c}" for="currency-amount currency-base">—</output><span class="currency-result-note"></span></article>`).join('')}</div><div class="currency-rate-meta"><p id="rate-status" role="status">${esc(t('ratesLoading'))}</p><button id="refresh-rates" type="button">${esc(t('refreshRates'))}</button></div><p id="rate-dates" class="rate-dates"></p><p class="currency-source">${esc(t('rateSource'))}：<a href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer">Frankfurter</a></p><p class="currency-disclaimer">${esc(t('referenceRates'))}</p></section>`;
}
function renderShell(){
 document.documentElement.lang=lang==='zh-TW'?'zh-Hant':locale;
 document.body.dataset.lang=lang;document.body.dataset.page=page;
 document.title=`${name}｜${t('siteTitle')}｜${tabs[page]}`;
 document.querySelector('meta[name="description"]').content=t('metaDescription');
 document.querySelector('.skip').textContent=t('skip');
 const wordmark=document.querySelector('.wordmark');wordmark.href=pageUrl();wordmark.innerHTML=`${esc(t('wordmark'))}<span>${esc(t('journal'))}</span>`;
 document.getElementById('current-handbook').textContent=t('handbook',{name});document.getElementById('current-handbook').href=pageUrl();
 document.querySelector('.masthead .eyebrow').textContent=t('season');
 document.querySelector('.masthead h1').innerHTML=`<span>${esc(t('portugal'))}</span><span>${esc(t('spain'))}</span>`;
 document.querySelector('.cover-owner').textContent=t('owner',{name});
 document.querySelector('.masthead img').alt=t('coverAlt');
 document.getElementById('trip-dates').innerHTML=shortTrip?`<span>${esc(dateRange('11-02','11-09'))}</span> <span>＋ ${esc(dateRange('11-24','12-02'))}</span>`:`<span>${esc(dateRange('11-02','12-03'))} · ${esc(t('fullTrip'))}</span>`;
 document.getElementById('preferences').innerHTML=`<label for="language-select">${esc(t('language'))}<select id="language-select">${Object.entries(LANGUAGES).map(([code,label])=>`<option value="${code}" ${code===lang?'selected':''}>${label}</option>`).join('')}</select></label><a class="currency-shortcut" href="${pageUrl('currency')}"><span>${esc(t('currencyShort'))}</span><small>TWD · USD · EUR</small></a>`;
 const nav=document.getElementById('nav');nav.setAttribute('aria-label',t('navigation'));nav.innerHTML=Object.entries(tabs).map(([k,v])=>`<a href="${pageUrl(k)}" ${page===k?'aria-current="page"':''}>${esc(v)}</a>`).join('');
 document.getElementById('main').innerHTML=({overview,days:itinerary,flights,transport,tickets,stays,notes,currency:currencyView}[page])();
 document.getElementById('footer-info').innerHTML=`${esc(t('footerTitle',{name}))}<br>${esc(t('updated',{date:fullDate('2026-10-02')}))}`;
 if(!shortTrip)document.getElementById('footer-info').innerHTML+=`<br><a id="other" class="text-link" href="${pageUrl('overview','','victoria.html')}">${esc(t('otherHandbook',{name:'Victoria'}))}</a>`;
 document.querySelector('.credits summary').textContent=t('photoCredits');
 document.getElementById('credit-sagrada').textContent=t('sagrada')+': ';
 document.getElementById('credit-lisbon').textContent=t('lisbon')+': ';
 document.getElementById('credit-guell').textContent=t('parkGuell')+': ';
 document.getElementById('credit-crop').textContent=t('photoCrop');
 document.getElementById('language-select').addEventListener('change',e=>{save('iberia.language',e.target.value);const next=new URL(location.href);next.searchParams.set('lang',e.target.value);next.searchParams.set('currency',currency);location.assign(next.href)});
}
renderShell();
function markDate(day=location.hash.slice(5)){
 const hash=`#day-${day}`;
 document.querySelectorAll('.date-list a').forEach(a=>{if(a.getAttribute('href')===hash)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
 const select=document.getElementById('journey-date');if(select&&days.some(d=>d[0]===day))select.value=day;
}
const nav=document.getElementById('nav'),activeNav=nav.querySelector('[aria-current="page"]');
function revealActiveNav(){if(activeNav)nav.scrollLeft=activeNav.offsetLeft-nav.offsetLeft-(nav.clientWidth-activeNav.offsetWidth)/2}
revealActiveNav();new ResizeObserver(revealActiveNav).observe(nav);
const navShell=document.querySelector('.nav-shell');
function updateNavHeight(){document.documentElement.style.setProperty('--nav-height',`${navShell.getBoundingClientRect().height}px`)}
updateNavHeight();new ResizeObserver(updateNavHeight).observe(navShell);
if(page==='days'){
 const requested=location.hash.startsWith('#day-')?location.hash.slice(5):params.get('day');
 markDate(requested||days[0][0]);
 const dayCards=[...document.querySelectorAll('.day-card')],datePicker=document.querySelector('.day-picker');
 function updateDateHeight(){document.documentElement.style.setProperty('--date-height',`${datePicker.getBoundingClientRect().height}px`)}
 updateDateHeight();new ResizeObserver(updateDateHeight).observe(datePicker);
 if(days.some(d=>d[0]===requested))requestAnimationFrame(()=>document.getElementById(`day-${requested}`).scrollIntoView({block:'start',behavior:'instant'}));
 window.addEventListener('hashchange',()=>markDate());
 document.getElementById('journey-date').addEventListener('change',e=>{const day=e.target.value,hash=`#day-${day}`;if(location.hash!==hash)history.pushState(null,'',hash);document.getElementById(`day-${day}`).scrollIntoView({block:'start',behavior:'instant'});markDate(day)});
 let scrollPending=false;
 function syncVisibleDay(){const offset=parseFloat(getComputedStyle(dayCards[0]).scrollMarginTop)||96;let current=dayCards[0];for(const card of dayCards){if(card.getBoundingClientRect().top<=offset+24)current=card;else break}if(window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-2)current=dayCards.at(-1);markDate(current.id.slice(4));scrollPending=false}
 window.addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(syncVisibleDay)}},{passive:true});
}
if(page==='currency')initCurrency();
