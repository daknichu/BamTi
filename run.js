'use strict';
function playNightBell(ctx){
 const now=ctx.currentTime;
 for(const [delay,pitch] of [[0,587.33],[0.48,440]]){
  const start=now+delay;
  for(const [ratio,level,decay] of [[1,.46,1.05],[2.4,.17,.54],[3.8,.085,.28]]){
   const voice=ctx.createOscillator(), envelope=ctx.createGain();
   voice.frequency.value=pitch*ratio;
   envelope.gain.setValueAtTime(.001,start);
   envelope.gain.exponentialRampToValueAtTime(level,start+.012);
   envelope.gain.exponentialRampToValueAtTime(.001,start+decay);
   voice.connect(envelope);
   envelope.connect(ctx.destination);
   voice.onended=()=>{voice.disconnect();envelope.disconnect();};
   voice.start(start);
   voice.stop(start+decay+.01);
  }
 }
}
const names = {trolls:'항아리 트롤',banished_knights:'땅 잃은 기사',crucible_knights:'도가니 기사',royal_revenant:'왕족의 망령',black_knife_assassin:'검은 칼날의 자객',leonine_misbegotten:'사자 혼종',ancient_hero_of_zamor:'자미엘의 옛 영웅',bell_bearing_hunter:'방울 사냥꾼',red_wolf:'붉은 늑대',grafted_scion:'접목의 귀공자',royal_carian_knight:'카리아의 왕가 기사',death_rite_bird:'죽음 의례의 새',ulcerated_tree_spirit:'문드러진 나무령',tree_sentinel:'트리 가드',erdtree_avatar:'황금 나무의 화신',ancestor_spirit:'선조령',black_blade_kindred:'흑검의 권속',magma_wyrm:'용암토룡',draconic_tree_sentinel:'용의 트리 가드'};
const $=id=>document.getElementById(id);
const sessionKey='bamti-photo-run-v1';
let session=null, audio=null, lastSecond=0;
const stages=[[270,'첫 번째 밤비 시작'],[450,'첫 번째 축소 완료'],[660,'두 번째 밤비 시작'],[840,'밤 보스 진입 예상']];
const alerts=[[240,'30초 뒤 첫 번째 밤비'],...stages,[630,'30초 뒤 두 번째 밤비']].sort((a,b)=>a[0]-b[0]);
function save(){
 try{if(session)localStorage.setItem(sessionKey,JSON.stringify(session));else localStorage.removeItem(sessionKey);}catch{}
}
function show(){
 $('home').hidden=!!session;$('run').hidden=!session;
 if(session){$('castle').textContent=session.castle;$('manual').hidden=!session.uncertain;tick();}
}
function tick(){
 if(!session)return;
 const elapsed=Math.max(0,Math.floor((Date.now()-session.start)/1000));
 const stage=stages.find(([time])=>time>elapsed);
 const left=stage?stage[0]-elapsed:elapsed-840;
 $('next').textContent=stage?stage[1]+'까지':'밤 보스 전투';
 $('time').textContent=(stage?'':'+')+Math.floor(left/60)+':'+String(left%60).padStart(2,'0');
 const cue=alerts.find(([sec])=>sec>lastSecond&&sec<=elapsed&&elapsed-sec<3);
 if(cue){$('message').textContent=cue[1];if(audio?.state==='running')playNightBell(audio);}
 else if(elapsed!==lastSecond&&!alerts.some(([sec])=>elapsed>=sec&&elapsed-sec<4))$('message').textContent='';
 lastSecond=elapsed;
}
function unlock(){
 try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});}catch{}
}
async function identify(img){
 const response=await fetch('./seeds.json');
 if(!response.ok)throw Error();
 const data=await response.json();
 let source=img;
 if(Math.abs(img.naturalWidth/img.naturalHeight-16/9)<.055){
  source=document.createElement('canvas');source.width=512;source.height=512;
  source.getContext('2d').drawImage(img,img.width*.568,img.height*.16,img.width*.386,img.height*.694,0,0,512,512);
 }
 const result=await BamTiRecognition.classifyMapScreenshot(source);
 if(!result.best||result.confidence<.34||result.scores.length!==6)throw Error();
 const map=result.best.mapType;
 const coords=data.coords[map==='Great Hollow'?'greatHollowSlots':'baseSlots'];
 const evidence=BamTiRecognition.analyzeScreenshot(result.canvas,coords,result.best);
 const points=evidence.points.filter(p=>p.score>=.78).slice(0,6);
 const matches=data.seeds.filter(s=>s.map===map&&points.every(p=>s.slots[p.id]));
 if(!matches.length)throw Error();
 const lines=[matches.length===1?'사진 추정 시드 #'+matches[0].id:'사진 추정 후보 '+matches.length+'개'];
 if(matches.every(s=>!s.castle))lines.push('이 지형에는 성채 배정 기록이 없습니다.');
 else for(const [i,title] of ['수비대','지하','옥상'].entries()){
  const values=new Set(matches.map(s=>s.castle?.[i]));
  const value=matches[0].castle?.[i];
  lines.push(title+' · '+(value&&values.size===1?(names[value]||value):'미확인'));
 }
 return {castle:lines.join('\n'),uncertain:matches.length!==1};
}
$('photo').onclick=unlock;
$('photo').onchange=async e=>{
 const file=e.target.files[0];if(!file)return;
 const start=Date.now(), url=URL.createObjectURL(file),img=new Image();
 $('photo').disabled=true;$('error').textContent='사진 확인 중…';
 try{
  img.src=url;await img.decode();
  const active={start,castle:'시드 식별 중…',uncertain:false};session=active;lastSecond=0;save();show();
  let result;
  try{result=await identify(img);}catch{result={castle:'사진에서 시드를 확인하기 어렵습니다.',uncertain:true};}
  if(session===active){Object.assign(session,result);save();show();}
 }catch{$('error').textContent='사진을 읽을 수 없습니다. 다시 촬영해 주세요.';}
 finally{if($('error').textContent==='사진 확인 중…')$('error').textContent='';URL.revokeObjectURL(url);$('photo').disabled=false;$('photo').value='';}
};
$('end').onclick=()=>{if(confirm('이번 출격을 종료할까요?')){session=null;save();$('message').textContent='';show();}};
try{
 const saved=JSON.parse(localStorage.getItem(sessionKey));
 if(saved&&Number.isFinite(saved.start)&&Date.now()-saved.start<60*60*1000){
  session=saved;lastSecond=Math.floor((Date.now()-saved.start)/1000);
  if(session.castle==='시드 식별 중…'){session.castle='사진 분석이 중단됐습니다.';session.uncertain=true;}
 }
}catch{}
document.addEventListener('click',()=>{if(session)unlock();});
show();setInterval(tick,250);
if('serviceWorker' in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
