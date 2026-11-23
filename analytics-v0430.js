const bamtiAnalytics = (() => {
 const consent=document.getElementById('analyticsConsent');
 const setting=document.getElementById('analyticsSettings');
 const consentKey='bamti-analytics-photo-consent';
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
 async function sendFailurePhoto(id,image){
  if(!enabled())return;
  const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
  canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  const jpeg=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.84));
  if(!jpeg || jpeg.size>2*1024*1024 || !enabled())return;
  await fetch(analyticsEndpoint.replace(/\/$/,'')+'/'+id+'/photo',{
   method:'POST',credentials:'omit',referrerPolicy:'no-referrer',
   headers:{'Content-Type':'image/jpeg'},body:jpeg
  });
 }
 function record(kind,result,outcome,image){
  if(!enabled() || !globalThis.crypto?.randomUUID)return;
  const id=crypto.randomUUID();
  const sent=send({id,device:installationForToday(),kind,outcome,version:'0.4.30',
   map:result?.filter?.map??null, lord:result?.filter?.lord??null});
  if(kind==='first' && outcome!=='confirmed' && image){
   sent.then(ok=>{if(ok)return sendFailurePhoto(id,image);}).catch(()=>{});
  }
 }
 consent.addEventListener('change',()=>{if(!consent.checked)daily=null;});
 return {record};
})();
