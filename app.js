'use strict';
const PROMO_END = Date.parse('2026-09-26T00:00:00-06:00');
const ENROLLMENT_END = Date.parse('2026-10-05T00:00:00-06:00');
const plans = { Inicia: { promo:29, regular:49, months:2 }, Avanza: { promo:49, regular:69, months:4 }, Domina: { promo:69, regular:89, months:6 } };
// PayPal URLs stay the same; prices are managed in the PayPal backend.
const PAYPAL_CHECKOUT = {
 Inicia: { promo: 'https://www.paypal.com/ncp/payment/HYN84QU7YQPZE', regular: 'https://www.paypal.com/ncp/payment/HYN84QU7YQPZE' },
 Avanza: { promo: 'https://www.paypal.com/ncp/payment/5TXZKLTZ7DHZE', regular: 'https://www.paypal.com/ncp/payment/5TXZKLTZ7DHZE' },
 Domina: { promo: 'https://www.paypal.com/ncp/payment/SA7LETMGYMA9A', regular: 'https://www.paypal.com/ncp/payment/SA7LETMGYMA9A' }
};
function checkoutFor(name, now=Date.now()) {
 const state=offerState(now);
 if(!state.open) return null;
 return PAYPAL_CHECKOUT[name]?.[state.promo ? 'promo' : 'regular'] || null;
}
let lang = 'es';
let selectedPlan = 'Avanza';
const translations = [...document.querySelectorAll('[data-en]')].map(el => ({el,es:el.innerHTML,en:el.dataset.en}));
const dialog = document.querySelector('#enrollment');
function offerState(now=Date.now()) { return { promo: now < PROMO_END, open: now < ENROLLMENT_END, remaining: Math.max(0, Math.floor((PROMO_END-now)/1000)) }; }
function refreshOffer(now=Date.now()) {
 const state=offerState(now), en=lang==='en';
 document.querySelector('.promo').hidden=!state.promo;
 document.body.classList.toggle('promo-ended',!state.promo);
 const units=[Math.floor(state.remaining/86400),Math.floor(state.remaining%86400/3600),Math.floor(state.remaining%3600/60),state.remaining%60];
 ['days','hours','minutes','seconds'].forEach((id,i)=>document.getElementById(id).textContent=String(units[i]).padStart(2,'0'));
 document.querySelector('.clock').hidden=!state.promo;
 document.querySelector('#promo-subtitle').hidden=!state.promo;
 document.querySelector('.clock').setAttribute('aria-label',en?'Time remaining in the launch promotion':'Tiempo restante de la promoción');
 document.querySelectorAll('[data-price]').forEach(el=>el.textContent='$'+(state.promo?el.dataset.price:el.dataset.regular));
 document.querySelectorAll('.regular').forEach(el=>el.hidden=!state.promo);
 if(!state.promo){
  document.querySelector('#promo-label').textContent=en?'Launch promotion ended · Regular pricing now applies':'La promoción de lanzamiento terminó · Precios regulares vigentes';
  document.querySelector('#expiry').textContent=en?'Enrollment closes October 4, 2026, at 11:59 p.m., Guatemala time. The course starts October 5.':'Las inscripciones cierran el 4 de octubre de 2026 a las 11:59 p. m., hora de Guatemala. El curso empieza el 5 de octubre.';
 }
 if(!state.open){
  document.querySelector('#promo-label').textContent=en?'Enrollment for the October group is closed':'Inscripciones cerradas para el grupo de octubre';
  document.querySelector('#closing-copy').textContent=en?'Enrollment for the October 2026 group has closed. Contact us to ask about the next group.':'Las inscripciones para el grupo de octubre de 2026 han cerrado. Escríbenos para consultar por el siguiente grupo.';
  document.querySelectorAll('[data-plan]').forEach(el=>el.textContent=en?'Ask about the next group':'Consultar próximo grupo');
 }
}
function refreshDialog(){
 const en=lang==='en',state=offerState(),plan=plans[selectedPlan];
 document.querySelector('#dialog-title').textContent=state.open?(en?'Choose ':'Elegir ')+selectedPlan:(en?'Ask about the next group':'Consultar próximo grupo');
 document.querySelector('#plan-summary').textContent=state.open?`${selectedPlan} · $${state.promo?plan.promo:plan.regular} USD · ${plan.months} ${en?'months of access':'meses de acceso'}`:'';
 const subject=state.open?(en?'Enrollment request — ':'Solicitud de inscripción — ')+selectedPlan:(en?'Next Hello Education group':'Próximo grupo de Hello Education');
 const body=state.open?(en?`Hello! I would like to enroll in the ${selectedPlan} plan ($${state.promo?plan.promo:plan.regular} USD) for the group starting October 5, 2026. Please send payment instructions. Thank you.`:`¡Hola! Quiero inscribirme en el plan ${selectedPlan} ($${state.promo?plan.promo:plan.regular} USD) para el grupo que empieza el 5 de octubre de 2026. Por favor, envíenme las instrucciones de pago. Gracias.`):(en?'Hello! Please let me know the dates and plans for your next group.':'¡Hola! Quisiera conocer las fechas y planes del próximo grupo.');
 document.querySelector('#enrollment-email').href=`mailto:support@helloeducation.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
 document.querySelector('#copy-status').textContent='';
}
function setLanguage(value){
 lang=value==='en'?'en':'es';
 document.documentElement.lang=lang;
 translations.forEach(({el,es,en})=>el.innerHTML=lang==='en'?en:es);
 document.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===lang)));
 document.querySelectorAll('[data-alt-en]').forEach(el=>{if(!el.dataset.altEs)el.dataset.altEs=el.alt;el.alt=lang==='en'?el.dataset.altEn:el.dataset.altEs;});
 document.title=lang==='en'?'Game creation course for kids and teens | Hello Education':'Curso de videojuegos para niños y adolescentes | Hello Education';
 document.querySelector('meta[name="description"]').content=lang==='en'?'Create an interactive story with Ren’Py and Python fundamentals. An 8-week course with recorded lessons, weekly feedback and Discord support.':'Aprende a crear una historia interactiva con Ren’Py y fundamentos de Python. Curso de 8 semanas, clases grabadas, revisión semanal y soporte en Discord.';
 refreshOffer();if(dialog.open)refreshDialog();
}
document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
document.querySelectorAll('[data-plan]').forEach(button=>button.addEventListener('click',()=>{selectedPlan=button.dataset.plan;const checkout=checkoutFor(selectedPlan);if(checkout){window.location.assign(checkout);return;}refreshDialog();dialog.showModal();}));
document.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
document.querySelector('#copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('support@helloeducation.net');document.querySelector('#copy-status').textContent=lang==='en'?'Email copied.':'Correo copiado.';}catch{document.querySelector('#copy-status').textContent='support@helloeducation.net';}});
let previousOffer=JSON.stringify({promo:offerState().promo,open:offerState().open});
refreshOffer();setInterval(()=>{refreshOffer();const state=offerState();const current=JSON.stringify({promo:state.promo,open:state.open});if(current!==previousOffer&&dialog.open)refreshDialog();previousOffer=current;},1000);
