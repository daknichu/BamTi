const bamtiAnalytics = (() => {
 const consent=document.getElementById('analyticsConsent');
 const setting=document.getElementById('analyticsSettings');
 const consentKey='bamti-analytics-consent';
 const dailyKey='bamti-analytics-daily';
 setting.hidden=!analyticsEndpoint;
 try{consent.checked=localStorage.getItem(consentKey)==='yes';}catch{}
 consent.onchange=()=>{
  try{
   localStorage.setItem(consentKey,consent.checked?'yes':'no');
   if(!consent.checked)localStorage.removeItem(dailyKey);
  }catch{}
 };
 function enabled(){return Boolean(analyticsEndpoint && consent.checked);}
 let daily;
 function installationForToday(){
  const day=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
  if(daily?.day===day)return daily.id;
  try{daily=JSON.parse(localStorage.getItem(dailyKey));}catch{}
  if(daily?.day===day)return daily.id;
  daily={day,id:crypto.randomUUID()};
  try{localStorage.setItem(dailyKey,JSON.stringify(daily));}catch{}
  return daily.id;
 }
 async function send(payload){
  try{
   const response=await fetch(analyticsEndpoint,{
    method:'POST',credentials:'omit',keepalive:true,referrerPolicy:'no-referrer',
    headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)
   });
   return response.ok;
  }catch{return false;}
 }
 function record(kind,result,outcome){
  if(!enabled() || !globalThis.crypto?.randomUUID)return null;
  const id=crypto.randomUUID();
  const sent=send({id,device:installationForToday(),kind,outcome,version:'0.4.28',
   map:result?.filter?.map??null, lord:result?.filter?.lord??null});
  return {id,sent};
 }
 consent.addEventListener('change',()=>{if(!consent.checked)daily=null;});
 return {
  enabled,record,
  async feedback(event,verdict){
   if(!enabled() || !await event.sent || !enabled())return false;
   return send({id:event.id,verdict});
  }
 };
})();
