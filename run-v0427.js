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
// Nightreign Seed Observer bossAssignments, keyed by seed ID.
const nightBosses={"000":["아인 여왕과 검사","트리 가드"],"001":["아인 여왕과 검사","트리 가드"],"002":["방울 사냥꾼","모르고트"],"003":["방울 사냥꾼","모르고트"],"004":["아인 여왕과 검사","트리 가드"],"005":["아인 여왕과 검사","모르고트"],"006":["아인 여왕과 검사","모르고트"],"007":["방울 사냥꾼","모르고트"],"008":["방울 사냥꾼","모르고트"],"009":["방울 사냥꾼","모르고트"],"010":["방울 사냥꾼","모르고트"],"011":["아인 여왕과 검사","트리 가드"],"012":["아인 여왕과 검사","트리 가드"],"013":["아인 여왕과 검사","모르고트"],"014":["방울 사냥꾼","트리 가드"],"015":["방울 사냥꾼","트리 가드"],"016":["아인 여왕과 검사","트리 가드"],"017":["방울 사냥꾼","트리 가드"],"018":["방울 사냥꾼","트리 가드"],"019":["아인 여왕과 검사","모르고트"],"020":["방울 사냥꾼","트리 가드"],"021":["방울 사냥꾼","모르고트"],"022":["아인 여왕과 검사","트리 가드"],"023":["방울 사냥꾼","모르고트"],"024":["아인 여왕과 검사","모르고트"],"025":["방울 사냥꾼","트리 가드"],"026":["아인 여왕과 검사","트리 가드"],"027":["아인 여왕과 검사","모르고트"],"028":["방울 사냥꾼","모르고트"],"029":["방울 사냥꾼","모르고트"],"030":["아인 여왕과 검사","모르고트"],"031":["아인 여왕과 검사","모르고트"],"032":["방울 사냥꾼","트리 가드"],"033":["아인 여왕과 검사","모르고트"],"034":["방울 사냥꾼","트리 가드"],"035":["아인 여왕과 검사","모르고트"],"036":["방울 사냥꾼","모르고트"],"037":["방울 사냥꾼","트리 가드"],"038":["아인 여왕과 검사","트리 가드"],"039":["아인 여왕과 검사","모르고트"],"040":["밤 기병 둘","고룡"],"041":["탐식의 드래곤","고룡"],"042":["공작의 프레이자","도가니의 기사와 황금 하마"],"043":["지렁이 얼굴","고룡"],"044":["탐식의 드래곤","고룡"],"045":["밤 기병 둘","변방의 노장"],"046":["공작의 프레이자","고룡"],"047":["탐식의 드래곤","고룡"],"048":["밤 기병 둘","변방의 노장"],"049":["공작의 프레이자","도가니의 기사와 황금 하마"],"050":["영웅의 가고일","변방의 노장"],"051":["공작의 프레이자","고룡"],"052":["밤 기병 둘","도가니의 기사와 황금 하마"],"053":["영웅의 가고일","도가니의 기사와 황금 하마"],"054":["영웅의 가고일","고룡"],"055":["지렁이 얼굴","변방의 노장"],"056":["지렁이 얼굴","고룡"],"057":["영웅의 가고일","고룡"],"058":["지렁이 얼굴","변방의 노장"],"059":["탐식의 드래곤","도가니의 기사와 황금 하마"],"060":["공작의 프레이자","고룡"],"061":["탐식의 드래곤","도가니의 기사와 황금 하마"],"062":["지렁이 얼굴","변방의 노장"],"063":["영웅의 가고일","도가니의 기사와 황금 하마"],"064":["밤 기병 둘","고룡"],"065":["영웅의 가고일","도가니의 기사와 황금 하마"],"066":["탐식의 드래곤","변방의 노장"],"067":["밤 기병 둘","고룡"],"068":["공작의 프레이자","고룡"],"069":["지렁이 얼굴","도가니의 기사와 황금 하마"],"070":["영웅의 가고일","고룡"],"071":["공작의 프레이자","변방의 노장"],"072":["지렁이 얼굴","변방의 노장"],"073":["탐식의 드래곤","고룡"],"074":["밤 기병 둘","도가니의 기사와 황금 하마"],"075":["영웅의 가고일","변방의 노장"],"076":["밤 기병 둘","고룡"],"077":["공작의 프레이자","도가니의 기사와 황금 하마"],"078":["지렁이 얼굴","변방의 노장"],"079":["탐식의 드래곤","고룡"],"080":["티비아의 배","대토룡"],"081":["용철 데몬","용인병"],"082":["용철 데몬","용인병"],"083":["전장의 노장","용의 트리 가드"],"084":["티비아의 배","용의 트리 가드"],"085":["티비아의 배","용인병"],"086":["용철 데몬","용의 트리 가드"],"087":["전장의 노장","용의 트리 가드"],"088":["문드러진 나무령","대토룡"],"089":["용철 데몬","용인병"],"090":["지네 데몬","용인병"],"091":["지네 데몬","대토룡"],"092":["전장의 노장","용인병"],"093":["문드러진 나무령","대토룡"],"094":["전장의 노장","대토룡"],"095":["문드러진 나무령","용의 트리 가드"],"096":["문드러진 나무령","대토룡"],"097":["지네 데몬","대토룡"],"098":["티비아의 배","대토룡"],"099":["지네 데몬","용의 트리 가드"],"100":["용철 데몬","용의 트리 가드"],"101":["지네 데몬","대토룡"],"102":["티비아의 배","용의 트리 가드"],"103":["전장의 노장","대토룡"],"104":["문드러진 나무령","용인병"],"105":["지네 데몬","용인병"],"106":["티비아의 배","용인병"],"107":["용철 데몬","용의 트리 가드"],"108":["문드러진 나무령","용의 트리 가드"],"109":["전장의 노장","용의 트리 가드"],"110":["용철 데몬","대토룡"],"111":["지네 데몬","대토룡"],"112":["문드러진 나무령","용인병"],"113":["티비아의 배","용의 트리 가드"],"114":["전장의 노장","용인병"],"115":["문드러진 나무령","용의 트리 가드"],"116":["지네 데몬","용인병"],"117":["전장의 노장","대토룡"],"118":["티비아의 배","대토룡"],"119":["용철 데몬","용인병"],"120":["탐식의 드래곤","신의 살갗의 두 명"],"121":["영웅의 가고일","트리 가드"],"122":["지렁이 얼굴","신의 살갗의 두 명"],"123":["탐식의 드래곤","트리 가드"],"124":["지렁이 얼굴","내리는 별의 짐승"],"125":["용철 데몬","내리는 별의 짐승"],"126":["영웅의 가고일","트리 가드"],"127":["접목의 군주","내리는 별의 짐승"],"128":["용철 데몬","트리 가드"],"129":["접목의 군주","트리 가드"],"130":["용철 데몬","내리는 별의 짐승"],"131":["탐식의 드래곤","내리는 별의 짐승"],"132":["용철 데몬","신의 살갗의 두 명"],"133":["영웅의 가고일","내리는 별의 짐승"],"134":["지렁이 얼굴","트리 가드"],"135":["탐식의 드래곤","내리는 별의 짐승"],"136":["지렁이 얼굴","신의 살갗의 두 명"],"137":["영웅의 가고일","신의 살갗의 두 명"],"138":["접목의 군주","신의 살갗의 두 명"],"139":["접목의 군주","내리는 별의 짐승"],"140":["영웅의 가고일","트리 가드"],"141":["접목의 군주","신의 살갗의 두 명"],"142":["용철 데몬","내리는 별의 짐승"],"143":["지렁이 얼굴","트리 가드"],"144":["탐식의 드래곤","내리는 별의 짐승"],"145":["지렁이 얼굴","신의 살갗의 두 명"],"146":["용철 데몬","내리는 별의 짐승"],"147":["접목의 군주","내리는 별의 짐승"],"148":["탐식의 드래곤","트리 가드"],"149":["영웅의 가고일","신의 살갗의 두 명"],"150":["지렁이 얼굴","트리 가드"],"151":["탐식의 드래곤","내리는 별의 짐승"],"152":["접목의 군주","내리는 별의 짐승"],"153":["용철 데몬","신의 살갗의 두 명"],"154":["영웅의 가고일","신의 살갗의 두 명"],"155":["접목의 군주","신의 살갗의 두 명"],"156":["탐식의 드래곤","내리는 별의 짐승"],"157":["영웅의 가고일","트리 가드"],"158":["용철 데몬","내리는 별의 짐승"],"159":["지렁이 얼굴","신의 살갗의 두 명"],"160":["전장의 노장","도가니의 기사와 황금 하마"],"161":["티비아의 배","죽음 의례의 새"],"162":["지네 데몬","죽음 의례의 새"],"163":["티비아의 배","도가니의 기사와 황금 하마"],"164":["지네 데몬","신의 살갗의 두 명"],"165":["전장의 노장","죽음 의례의 새"],"166":["공작의 프레이자","도가니의 기사와 황금 하마"],"167":["공작의 프레이자","죽음 의례의 새"],"168":["왕족의 망령","죽음 의례의 새"],"169":["티비아의 배","신의 살갗의 두 명"],"170":["왕족의 망령","죽음 의례의 새"],"171":["공작의 프레이자","죽음 의례의 새"],"172":["지네 데몬","신의 살갗의 두 명"],"173":["공작의 프레이자","죽음 의례의 새"],"174":["지네 데몬","도가니의 기사와 황금 하마"],"175":["티비아의 배","도가니의 기사와 황금 하마"],"176":["전장의 노장","신의 살갗의 두 명"],"177":["전장의 노장","죽음 의례의 새"],"178":["왕족의 망령","도가니의 기사와 황금 하마"],"179":["왕족의 망령","죽음 의례의 새"],"180":["왕족의 망령","도가니의 기사와 황금 하마"],"181":["지네 데몬","신의 살갗의 두 명"],"182":["전장의 노장","죽음 의례의 새"],"183":["공작의 프레이자","도가니의 기사와 황금 하마"],"184":["티비아의 배","죽음 의례의 새"],"185":["지네 데몬","죽음 의례의 새"],"186":["왕족의 망령","신의 살갗의 두 명"],"187":["공작의 프레이자","도가니의 기사와 황금 하마"],"188":["티비아의 배","죽음 의례의 새"],"189":["전장의 노장","도가니의 기사와 황금 하마"],"190":["공작의 프레이자","도가니의 기사와 황금 하마"],"191":["전장의 노장","도가니의 기사와 황금 하마"],"192":["지네 데몬","죽음 의례의 새"],"193":["왕족의 망령","신의 살갗의 두 명"],"194":["티비아의 배","죽음 의례의 새"],"195":["전장의 노장","신의 살갗의 두 명"],"196":["공작의 프레이자","도가니의 기사와 황금 하마"],"197":["지네 데몬","도가니의 기사와 황금 하마"],"198":["티비아의 배","죽음 의례의 새"],"199":["왕족의 망령","죽음 의례의 새"],"200":["탐식의 드래곤","이름 없는 왕"],"201":["왕족의 망령","변방의 노장"],"202":["지네 데몬","변방의 노장"],"203":["지렁이 얼굴","이름 없는 왕"],"204":["밤 기병 둘","변방의 노장"],"205":["지네 데몬","이름 없는 왕"],"206":["밤 기병 둘","용인병"],"207":["지렁이 얼굴","용인병"],"208":["지렁이 얼굴","변방의 노장"],"209":["지네 데몬","이름 없는 왕"],"210":["지네 데몬","이름 없는 왕"],"211":["탐식의 드래곤","용인병"],"212":["탐식의 드래곤","이름 없는 왕"],"213":["왕족의 망령","용인병"],"214":["밤 기병 둘","이름 없는 왕"],"215":["밤 기병 둘","이름 없는 왕"],"216":["탐식의 드래곤","용인병"],"217":["왕족의 망령","변방의 노장"],"218":["지렁이 얼굴","이름 없는 왕"],"219":["왕족의 망령","이름 없는 왕"],"220":["지렁이 얼굴","용인병"],"221":["탐식의 드래곤","변방의 노장"],"222":["왕족의 망령","이름 없는 왕"],"223":["지네 데몬","이름 없는 왕"],"224":["밤 기병 둘","용인병"],"225":["지네 데몬","변방의 노장"],"226":["왕족의 망령","용인병"],"227":["탐식의 드래곤","이름 없는 왕"],"228":["지렁이 얼굴","용인병"],"229":["밤 기병 둘","이름 없는 왕"],"230":["지네 데몬","용인병"],"231":["지렁이 얼굴","이름 없는 왕"],"232":["탐식의 드래곤","변방의 노장"],"233":["왕족의 망령","이름 없는 왕"],"234":["밤 기병 둘","변방의 노장"],"235":["지렁이 얼굴","용인병"],"236":["탐식의 드래곤","이름 없는 왕"],"237":["왕족의 망령","변방의 노장"],"238":["밤 기병 둘","이름 없는 왕"],"239":["지네 데몬","변방의 노장"],"240":["문드러진 나무령","차가운 골짜기의 무희"],"241":["문드러진 나무령","차가운 골짜기의 무희"],"242":["용철 데몬","차가운 골짜기의 무희"],"243":["접목의 군주","차가운 골짜기의 무희"],"244":["용철 데몬","용의 트리 가드"],"245":["공작의 프레이자","신의 살갗의 두 명"],"246":["접목의 군주","차가운 골짜기의 무희"],"247":["공작의 프레이자","용의 트리 가드"],"248":["티비아의 배","용의 트리 가드"],"249":["용철 데몬","차가운 골짜기의 무희"],"250":["접목의 군주","용의 트리 가드"],"251":["문드러진 나무령","차가운 골짜기의 무희"],"252":["접목의 군주","신의 살갗의 두 명"],"253":["용철 데몬","차가운 골짜기의 무희"],"254":["티비아의 배","신의 살갗의 두 명"],"255":["공작의 프레이자","용의 트리 가드"],"256":["문드러진 나무령","신의 살갗의 두 명"],"257":["공작의 프레이자","차가운 골짜기의 무희"],"258":["티비아의 배","용의 트리 가드"],"259":["티비아의 배","차가운 골짜기의 무희"],"260":["문드러진 나무령","신의 살갗의 두 명"],"261":["용철 데몬","차가운 골짜기의 무희"],"262":["접목의 군주","용의 트리 가드"],"263":["티비아의 배","차가운 골짜기의 무희"],"264":["공작의 프레이자","용의 트리 가드"],"265":["접목의 군주","차가운 골짜기의 무희"],"266":["공작의 프레이자","차가운 골짜기의 무희"],"267":["용철 데몬","신의 살갗의 두 명"],"268":["문드러진 나무령","용의 트리 가드"],"269":["티비아의 배","용의 트리 가드"],"270":["공작의 프레이자","차가운 골짜기의 무희"],"271":["용철 데몬","신의 살갗의 두 명"],"272":["티비아의 배","용의 트리 가드"],"273":["문드러진 나무령","용의 트리 가드"],"274":["접목의 군주","차가운 골짜기의 무희"],"275":["접목의 군주","신의 살갗의 두 명"],"276":["공작의 프레이자","차가운 골짜기의 무희"],"277":["티비아의 배","용의 트리 가드"],"278":["문드러진 나무령","용의 트리 가드"],"279":["용철 데몬","차가운 골짜기의 무희"],"280":["영웅의 가고일","죽음 의례의 새"],"281":["용철 데몬","대토룡"],"282":["공작의 프레이자","고룡"],"283":["영웅의 가고일","차가운 골짜기의 무희"],"284":["전장의 노장","도가니의 기사와 황금 하마"],"285":["지렁이 얼굴","모르고트"],"286":["문드러진 나무령","죽음 의례의 새"],"287":["왕족의 망령","이름 없는 왕"],"288":["아인 여왕과 검사","용의 트리 가드"],"289":["방울 사냥꾼","용인병"],"290":["밤 기병 둘","내리는 별의 짐승"],"291":["탐식의 드래곤","고룡"],"292":["지네 데몬","이름 없는 왕"],"293":["문드러진 나무령","변방의 노장"],"294":["왕족의 망령","대토룡"],"295":["접목의 군주","신의 살갗의 두 명"],"296":["티비아의 배","트리 가드"],"297":["밤 기병 둘","변방의 노장"],"298":["전장의 노장","내리는 별의 짐승"],"299":["접목의 군주","차가운 골짜기의 무희"],"300":["영웅의 가고일","대토룡"],"301":["밤 기병 둘","용인병"],"302":["티비아의 배","내리는 별의 짐승"],"303":["전장의 노장","대토룡"],"304":["지렁이 얼굴","죽음 의례의 새"],"305":["접목의 군주","도가니의 기사와 황금 하마"],"306":["방울 사냥꾼","모르고트"],"307":["왕족의 망령","용의 트리 가드"],"308":["아인 여왕과 검사","변방의 노장"],"309":["문드러진 나무령","트리 가드"],"310":["탐식의 드래곤","이름 없는 왕"],"311":["아인 여왕과 검사","고룡"],"312":["공작의 프레이자","차가운 골짜기의 무희"],"313":["용철 데몬","대토룡"],"314":["지네 데몬","모르고트"],"315":["영웅의 가고일","차가운 골짜기의 무희"],"316":["왕족의 망령","고룡"],"317":["방울 사냥꾼","내리는 별의 짐승"],"318":["문드러진 나무령","죽음 의례의 새"],"319":["접목의 군주","이름 없는 왕"],"1000":["아인 여왕과 검사","모르고트"],"1001":["아인 여왕과 검사","모르고트"],"1002":["방울 사냥꾼","트리 가드"],"1003":["아인 여왕과 검사","트리 가드"],"1004":["방울 사냥꾼","모르고트"],"1010":["영웅의 가고일","고룡"],"1011":["밤 기병 둘","도가니의 기사와 황금 하마"],"1012":["밤 기병 둘","도가니의 기사와 황금 하마"],"1013":["영웅의 가고일","도가니의 기사와 황금 하마"],"1014":["영웅의 가고일","고룡"],"1020":["문드러진 나무령","용의 트리 가드"],"1021":["문드러진 나무령","대토룡"],"1022":["문드러진 나무령","대토룡"],"1023":["전장의 노장","용의 트리 가드"],"1024":["전장의 노장","용의 트리 가드"],"1030":["영웅의 가고일","신의 살갗의 두 명"],"1031":["접목의 군주","내리는 별의 짐승"],"1032":["접목의 군주","신의 살갗의 두 명"],"1033":["영웅의 가고일","신의 살갗의 두 명"],"1034":["접목의 군주","내리는 별의 짐승"],"1040":["왕족의 망령","죽음 의례의 새"],"1041":["왕족의 망령","도가니의 기사와 황금 하마"],"1042":["왕족의 망령","도가니의 기사와 황금 하마"],"1043":["전장의 노장","도가니의 기사와 황금 하마"],"1044":["전장의 노장","죽음 의례의 새"],"1050":["왕족의 망령","변방의 노장"],"1051":["밤 기병 둘","변방의 노장"],"1052":["왕족의 망령","이름 없는 왕"],"1053":["밤 기병 둘","변방의 노장"],"1054":["왕족의 망령","이름 없는 왕"],"1060":["접목의 군주","용의 트리 가드"],"1061":["접목의 군주","용의 트리 가드"],"1062":["문드러진 나무령","차가운 골짜기의 무희"],"1063":["문드러진 나무령","차가운 골짜기의 무희"],"1064":["접목의 군주","용의 트리 가드"],"1070":["전장의 노장","트리 가드"],"1071":["밤 기병 둘","도가니의 기사와 황금 하마"],"1072":["밤 기병 둘","트리 가드"],"1073":["영웅의 가고일","용의 트리 가드"],"1074":["영웅의 가고일","도가니의 기사와 황금 하마"],"1080":["신수 전사와 주검사","모그"],"1081":["신수 전사와 주검사","모그"],"1082":["데몬들","데몬의 왕자"],"1083":["데몬들","데몬의 왕자"],"1084":["데몬들","데몬의 왕자"],"1085":["신수 전사와 주검사","모그"],"1086":["신수 전사와 주검사","모그"],"1087":["신수 전사와 주검사","모그"],"1088":["데몬들","데몬의 왕자"],"1089":["신수 전사와 주검사","모그"],"1090":["신수 전사와 주검사","모그"],"1091":["데몬들","데몬의 왕자"],"1092":["신수 전사와 주검사","모그"],"1093":["데몬들","데몬의 왕자"],"1094":["데몬들","데몬의 왕자"],"1095":["데몬들","데몬의 왕자"],"1096":["신수 전사와 주검사","모그"],"1097":["데몬들","데몬의 왕자"],"1098":["신수 전사와 주검사","모그"],"1099":["데몬들","데몬의 왕자"],"1100":["데몬들","데몬의 왕자"],"1101":["신수 전사와 주검사","모그"],"1102":["신수 전사와 주검사","모그"],"1103":["신수 전사와 주검사","모그"],"1104":["데몬들","데몬의 왕자"],"1105":["신수 전사와 주검사","모그"],"1106":["데몬들","데몬의 왕자"],"1107":["데몬들","데몬의 왕자"],"1108":["신수 전사와 주검사","모그"],"1109":["데몬들","데몬의 왕자"],"1110":["데몬들","데몬의 왕자"],"1111":["신수 전사와 주검사","모그"],"1112":["데몬들","데몬의 왕자"],"1113":["신수 전사와 주검사","모그"],"1114":["신수 전사와 주검사","모그"],"1135":["데몬들","데몬의 왕자"],"1136":["데몬들","데몬의 왕자"],"1137":["신수 전사와 주검사","모그"],"1138":["신수 전사와 주검사","모그"],"1139":["데몬들","데몬의 왕자"],"1140":["거대한 붉은곰","신수 사자무"],"1141":["거대한 붉은곰","신수 사자무"],"1142":["거대한 붉은곰","신수 사자무"],"1143":["거대한 붉은곰","신수 사자무"],"1144":["죽음의 기사들","아르토리우스"],"1145":["죽음의 기사들","아르토리우스"],"1146":["죽음의 기사들","아르토리우스"],"1147":["죽음의 기사들","신수 사자무"],"1148":["거대한 붉은곰","신수 사자무"],"1149":["죽음의 기사들","신수 사자무"],"1150":["거대한 붉은곰","아르토리우스"],"1151":["거대한 붉은곰","신수 사자무"],"1152":["죽음의 기사들","아르토리우스"],"1153":["죽음의 기사들","아르토리우스"],"1154":["죽음의 기사들","아르토리우스"],"1155":["거대한 붉은곰","신수 사자무"],"1156":["죽음의 기사들","아르토리우스"],"1157":["죽음의 기사들","아르토리우스"],"1158":["거대한 붉은곰","아르토리우스"],"1159":["거대한 붉은곰","신수 사자무"],"1160":["거대한 붉은곰","신수 사자무"],"1161":["거대한 붉은곰","아르토리우스"],"1162":["죽음의 기사들","신수 사자무"],"1163":["죽음의 기사들","아르토리우스"],"1164":["죽음의 기사들","아르토리우스"],"1165":["거대한 붉은곰","신수 사자무"],"1166":["죽음의 기사들","신수 사자무"],"1167":["죽음의 기사들","아르토리우스"],"1168":["거대한 붉은곰","신수 사자무"],"1169":["거대한 붉은곰","아르토리우스"],"1170":["죽음의 기사들","아르토리우스"],"1171":["죽음의 기사들","아르토리우스"],"1172":["죽음의 기사들","아르토리우스"],"1173":["거대한 붉은곰","신수 사자무"],"1174":["거대한 붉은곰","신수 사자무"],"1195":["거대한 붉은곰","아르토리우스"],"1196":["거대한 붉은곰","아르토리우스"],"1197":["죽음의 기사들","신수 사자무"],"1198":["거대한 붉은곰","신수 사자무"],"1199":["죽음의 기사들","신수 사자무"],"1005":["방울 사냥꾼","모르고트"],"1006":["아인 여왕과 검사","모르고트"],"1007":["방울 사냥꾼","모르고트"],"1008":["방울 사냥꾼","트리 가드"],"1009":["아인 여왕과 검사","트리 가드"],"1015":["밤 기병 둘","고룡"],"1016":["지렁이 얼굴","도가니의 기사와 황금 하마"],"1017":["밤 기병 둘","변방의 노장"],"1018":["영웅의 가고일","변방의 노장"],"1019":["영웅의 가고일","고룡"],"1025":["용철 데몬","용의 트리 가드"],"1026":["티비아의 배","대토룡"],"1027":["문드러진 나무령","용인병"],"1028":["전장의 노장","용인병"],"1029":["지네 데몬","대토룡"],"1035":["지렁이 얼굴","신의 살갗의 두 명"],"1036":["영웅의 가고일","내리는 별의 짐승"],"1037":["탐식의 드래곤","트리 가드"],"1038":["접목의 군주","내리는 별의 짐승"],"1039":["용철 데몬","신의 살갗의 두 명"],"1045":["지네 데몬","죽음 의례의 새"],"1046":["전장의 노장","도가니의 기사와 황금 하마"],"1047":["왕족의 망령","신의 살갗의 두 명"],"1048":["티비아의 배","죽음 의례의 새"],"1049":["공작의 프레이자","도가니의 기사와 황금 하마"],"1055":["밤 기병 둘","용인병"],"1056":["지렁이 얼굴","이름 없는 왕"],"1057":["탐식의 드래곤","이름 없는 왕"],"1058":["왕족의 망령","변방의 노장"],"1059":["지네 데몬","용인병"],"1065":["문드러진 나무령","차가운 골짜기의 무희"],"1066":["티비아의 배","신의 살갗의 두 명"],"1067":["접목의 군주","용의 트리 가드"],"1068":["용철 데몬","용의 트리 가드"],"1069":["공작의 프레이자","차가운 골짜기의 무희"],"1075":["지렁이 얼굴","용의 트리 가드"],"1076":["전장의 노장","도가니의 기사와 황금 하마"],"1077":["밤 기병 둘","신의 살갗의 두 명"],"1078":["티비아의 배","용인병"],"1079":["탐식의 드래곤","변방의 노장"],"1115":["신수 전사와 주검사","모그"],"1116":["데몬들","데몬의 왕자"],"1117":["신수 전사와 주검사","모그"],"1118":["신수 전사와 주검사","모그"],"1119":["신수 전사와 주검사","모그"],"1120":["신수 전사와 주검사","모그"],"1121":["데몬들","데몬의 왕자"],"1122":["데몬들","데몬의 왕자"],"1123":["데몬들","데몬의 왕자"],"1124":["신수 전사와 주검사","모그"],"1125":["신수 전사와 주검사","모그"],"1126":["데몬들","데몬의 왕자"],"1127":["데몬들","데몬의 왕자"],"1128":["데몬들","데몬의 왕자"],"1129":["데몬들","데몬의 왕자"],"1130":["데몬들","데몬의 왕자"],"1131":["신수 전사와 주검사","모그"],"1132":["데몬들","데몬의 왕자"],"1133":["신수 전사와 주검사","모그"],"1134":["신수 전사와 주검사","모그"],"1175":["죽음의 기사들","신수 사자무"],"1176":["거대한 붉은곰","신수 사자무"],"1177":["거대한 붉은곰","신수 사자무"],"1178":["죽음의 기사들","아르토리우스"],"1179":["죽음의 기사들","아르토리우스"],"1180":["죽음의 기사들","아르토리우스"],"1181":["죽음의 기사들","신수 사자무"],"1182":["거대한 붉은곰","신수 사자무"],"1183":["죽음의 기사들","신수 사자무"],"1184":["거대한 붉은곰","아르토리우스"],"1185":["죽음의 기사들","아르토리우스"],"1186":["죽음의 기사들","아르토리우스"],"1187":["거대한 붉은곰","신수 사자무"],"1188":["거대한 붉은곰","아르토리우스"],"1189":["거대한 붉은곰","신수 사자무"],"1190":["죽음의 기사들","신수 사자무"],"1191":["거대한 붉은곰","아르토리우스"],"1192":["거대한 붉은곰","신수 사자무"],"1193":["죽음의 기사들","아르토리우스"],"1194":["거대한 붉은곰","아르토리우스"]};
const pronunciationKey='bamti-boss-pronunciation-language';
const pronunciationButton=$('pronunciationLanguage');
const pronunciationLanguages=[
 {id:'ja',label:'일본어',flag:'🇯🇵',readingIndex:1},
 {id:'en',label:'영어',flag:'🇺🇸',readingIndex:0},
 {id:'zh',label:'중국어',flag:'🇨🇳',readingIndex:2}
];
let pronunciationIndex=0;
try{
 const saved=localStorage.getItem(pronunciationKey);
 pronunciationIndex=Math.max(0,pronunciationLanguages.findIndex(language=>language.id===saved));
}catch{}
pronunciationButton.onclick=()=>{
 pronunciationIndex=(pronunciationIndex+1)%pronunciationLanguages.length;
 try{localStorage.setItem(pronunciationKey,pronunciationLanguages[pronunciationIndex].id);}catch{}
 show();
};
function appendPronunciation(element,name,readingIndex){
 const reading=bossPronunciations[name]?.[readingIndex];
 if(!reading)return;
 const span=document.createElement('span');
 span.className='pronunciation';
 span.textContent='('+reading+')';
 element.append(' ',span);
}
function nightBossText(ids){
 return [0,1].map(day=>{
  const bosses=new Set((ids||[]).map(id=>nightBosses[id]?.[day]));
  const name=bosses.size===1 && [...bosses][0];
  return (day+1)+'일차 밤 보스 · '+(name||'미확인');
 }).join('\n');
}
function renderBossLines(element,text,readingIndex){
 element.replaceChildren();
 for(const [index,line] of text.split('\n').entries()){
  if(index)element.append(document.createElement('br'));
  element.append(line);
  const [,name]=line.split(' · ',2);
  appendPronunciation(element,name,readingIndex);
 }
}
const sessionKey='bamti-photo-run-v1';
let session=null, audio=null, lastSecond=0;
const stages=[[270,'첫 번째 밤비 시작'],[450,'첫 번째 축소 완료'],[660,'두 번째 밤비 시작'],[840,'밤 보스 진입 예상']];
const alerts=[[240,'30초 뒤 첫 번째 밤비'],...stages,[630,'30초 뒤 두 번째 밤비']].sort((a,b)=>a[0]-b[0]);
function save(){
 try{if(session)localStorage.setItem(sessionKey,JSON.stringify(session));else localStorage.removeItem(sessionKey);}catch{}
}
function show(){
 $('home').hidden=!!session;$('run').hidden=!session;
 if(!session)return;
 const confirmed=session.ids?.length===1 && !session.uncertain;
 const language=pronunciationLanguages[pronunciationIndex];
 const nextLanguage=pronunciationLanguages[(pronunciationIndex+1)%pronunciationLanguages.length];
 const readingIndex=confirmed ? language.readingIndex : null;
 pronunciationButton.hidden=!confirmed;
 pronunciationButton.textContent=language.flag;
 pronunciationButton.setAttribute('aria-label','발음 언어 '+language.label+'. '+nextLanguage.label+'로 전환');
 renderBossLines($('nightBosses'),nightBossText(session.ids),readingIndex);
 renderBossLines($('castle'),session.castle,readingIndex);

 const evidence=$('evidence');
 const [terrain,lord,...details]=(session.observation||'').split(' · ');
 evidence.textContent=terrain;
 appendPronunciation(evidence,terrain,readingIndex);
 if(lord){
  evidence.append(' · '+lord);
  appendPronunciation(evidence,lord,readingIndex);
 }
 if(details.length)evidence.append(' · '+details.join(' · '));
 $('manual').hidden=$('retake').hidden=!session.uncertain;
 tick();
}
let popupTimeout;
function clearPopup(){
 clearTimeout(popupTimeout);
 $('message').textContent='';
}
function announce(text){
 clearPopup();
 $('message').textContent=text;
 popupTimeout=setTimeout(clearPopup,1000);
 if(audio?.state==='running')playNightBell(audio);
}
function tick(){
 if(!session)return;
 const day=session.day||1;
 const end=stages[stages.length-1][0];
 const elapsed=Math.floor((Date.now()-session.start)/1000);
 const stage=stages.find(([time])=>time>elapsed);
 const stopped=session.bossReached||!stage;
 $('lessTime').hidden=stopped;
 $('moreTime').hidden=stopped;
 const left=stopped?0:stage[0]-elapsed;
 $('next').textContent=day+'일차 · '+(stopped?(day===1?'보스 전투 · 일시 정지':'보스 전투 · 타이머 종료'):stage[1]+'까지');
 $('time').textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');
 $('day2').hidden=!(stopped && day===1);
 if(session.bossReached)return;
 if(stopped){
  session.bossReached=true;save();
  if(elapsed-end<3)announce(day+'일차 밤 보스 진입');
 }else{
  const cue=alerts.find(([sec])=>sec>lastSecond&&sec<=elapsed&&elapsed-sec<3);
  if(cue)announce(cue[1]);
 }
 lastSecond=elapsed;
}
function adjustRemaining(seconds){
 if(!session)return;
 tick();
 if(session.bossReached)return;
 session.start+=seconds*1000;
 save();
 tick();
}
$('lessTime').onclick=()=>adjustRemaining(-3);
$('moreTime').onclick=()=>adjustRemaining(3);
$('day2').onclick=()=>{
 if(!session||session.day===2||!session.bossReached)return;
 clearPopup();unlock();
 Object.assign(session,{day:2,start:Date.now(),bossReached:false});
 lastSecond=0;save();show();
};
function unlock(){
 try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});}catch{}
}
let database;
async function getData(){
 if(database)return database;
 const response=await fetch('./seeds.json');
 if(!response.ok)throw Error();
 database=await response.json();
 return database;
}
function matchTowers(pool,icons,coords){
 if(pool.length<2||!icons.lord||icons.slots.length<2)return pool;
 const found=coords.filter(p=>{
  const count=pool.filter(seed=>seed.slots[p.id]==='sorcerers').length;
  return count>0 && count<pool.length && icons.towerAt(p);
 });
 const matches=pool.filter(seed=>found.every(p=>seed.slots[p.id]==='sorcerers'));
 return matches.length && matches.length<pool.length ? matches : pool;
}
async function identify(img){
 const data=await getData();
 const photo=prepareMapPhoto(img);
 const alternatives=[];
 let source=framedPanel(photo,alternatives);
 if(source===photo && Math.abs(img.naturalWidth/img.naturalHeight-16/9)<.055){
  source=document.createElement('canvas');source.width=512;source.height=512;
  source.getContext('2d').drawImage(img,img.width*.568,img.height*.16,img.width*.386,img.height*.694,0,0,512,512);
 }
 // A registered Limveld panel can be identified by its visible church glyphs
 // even when the terrain classifier is inconclusive.
 let icons=scanMapIcons(source,data.coords.baseSlots);
 if(!icons.lord){
  for(const alternative of alternatives){
   const panel=alternative.make();
   if(!scanMapIcons(panel,[]).lord)continue;
   const retry=scanMapIcons(panel,data.coords.baseSlots);
   const records=data.seeds.filter(s=>s.map!=='Great Hollow' && s.lord===retry.lord);
   const slots=(retry.trio.length?retry.trio:retry.slots).filter(id=>records.some(s=>['church','church_spawn'].includes(s.slots[id])));
   if(slots.length<2||!data.seeds.some(s=>s.map!=='Great Hollow' && s.lord===retry.lord && slots.every(id=>['church','church_spawn'].includes(s.slots[id]))))continue;
   source=panel;icons=retry;break;
  }
 }
 if(icons.lord){
  const records=data.seeds.filter(s=>s.map!=='Great Hollow'&&s.lord===icons.lord);
  if(icons.trio.length && records.some(seed=>icons.trio.every(id=>['church','church_spawn'].includes(seed.slots[id])))){
   icons.slots=icons.trio;
  }
  icons.slots=icons.slots.filter(id=>records.some(s=>['church','church_spawn'].includes(s.slots[id])));
 }
 if(icons.lord && icons.slots.length>=2){
  const pool=data.seeds.filter(s=>s.map!=='Great Hollow'&&(!icons.lord||s.lord===icons.lord)&&icons.slots.every(id=>['church','church_spawn'].includes(s.slots[id])));
  if(pool.length && pool.every(s=>s.map===pool[0].map)){
   const map=pool[0].map;
   const matches=matchTowers(pool,icons,data.coords.baseSlots);
   return {towerMatched:matches!==pool,...summary(matches),map,ids:matches.map(s=>s.id),filter:{map,lord:icons.lord,slots:icons.slots}};
  }
 }
 let result=await BamTiRecognition.classifyMapScreenshot(source);
 if(source!==img && result.confidence<.34)result=await BamTiRecognition.classifyMapScreenshot(img);
 if(!result.best||result.confidence<.34||result.scores.length!==6)throw Error();
 const map=result.best.mapType;
 const terrainPool=data.seeds.filter(s=>s.map===map&&(!icons.lord||s.lord===icons.lord));
 if(!terrainPool.length)throw Error();
 const slots=map!=='Great Hollow'?icons.slots:[];
 const filtered=terrainPool.filter(s=>slots.every(id=>['church','church_spawn'].includes(s.slots[id])));
 const base=filtered.length?filtered:terrainPool;
 const matches=filtered.length && map!=='Great Hollow'?matchTowers(base,icons,data.coords.baseSlots):base;
 const resultSummary=summary(matches);
 if(!icons.lord && matches.length===1){
  resultSummary.uncertain=true;
  resultSummary.castle+='\n밤의 왕을 확인해 주세요.';
 }
 return {towerMatched:matches!==base,...resultSummary,map,ids:matches.map(s=>s.id),filter:{map,lord:icons.lord,slots:filtered.length?slots:[]}};
}
function summary(matches){
 if(!matches.length)return {castle:'일치하는 후보가 없습니다. 성배병 위치나 밤의 왕을 수정하세요.',uncertain:true};
 const lines=[matches.length===1?'사진 추정 시드 #'+matches[0].id:'사진 추정 후보 '+matches.length+'개'];
 if(matches.every(s=>!s.castle))lines.push('이 지형에는 성채 배정 기록이 없습니다.');
 else for(const [i,title] of ['수비대','지하','옥상'].entries()){
  const values=new Set(matches.map(s=>s.castle?.[i]));
  const value=matches[0].castle?.[i];
  lines.push(title+' · '+(value&&values.size===1?(names[value]||value):'미확인'));
 }
 return {castle:lines.join('\n'),uncertain:matches.length!==1};
}
for(const id of ['photo','camera']){
 $(id).onclick=unlock;
 $(id).onchange=registerPhoto;
}
async function registerPhoto(e){
 const file=e.target.files[0];if(!file)return;
 const start=Date.now(), url=URL.createObjectURL(file),img=new Image();
 $('camera').disabled=$('photo').disabled=true;$('error').textContent='사진 확인 중…';
 try{
  img.src=url;await img.decode();
  const active={start,castle:'시드 식별 중…',uncertain:false};session=active;lastSecond=0;save();show();
  let result;
  try{result=await identify(img);}catch{result={castle:'사진에서 시드를 확인하기 어렵습니다.',uncertain:true};}
  if(session===active){
   applyPhotoResult(active,result);
   show();
  }
 }catch{$('error').textContent='사진을 읽을 수 없습니다. 다시 촬영해 주세요.';}
 finally{if($('error').textContent==='사진 확인 중…')$('error').textContent='';URL.revokeObjectURL(url);$('camera').disabled=$('photo').disabled=false;$('camera').value=$('photo').value='';}
};
function applyPhotoResult(active,result){
 const {filter,towerMatched}=result;
 const observation=filter ? [
  terrainNames[filter.map],
  filter.lord?bossNames[parseInt(filter.lord)-1]:'밤의 왕 미확인',
  '성배병 '+filter.slots.length+'곳 인식'
 ].join(' · ')+(towerMatched?' · 마술사 탑 확인':'') : '';
 Object.assign(active,result,{observation});
 save();
}
const retakeCamera=$('retakeCamera');
const retakeStatus=$('retakeStatus');
const retakeButtons=[$('retake'),$('retakeFromMap')];
for(const button of retakeButtons){
 button.onclick=()=>{
  retakeStatus.textContent='';
  button.parentElement.after(retakeStatus);
  retakeCamera.click();
 };
}
retakeCamera.onchange=async()=>{
 const active=session;
 const file=retakeCamera.files[0];
 retakeCamera.value='';
 if(!active||!file)return;
 for(const button of retakeButtons)button.disabled=true;
 retakeStatus.textContent='새 지도 사진 확인 중…';
 const url=URL.createObjectURL(file);
 try{
  const img=new Image();
  img.src=url;
  await img.decode();
  const result=await identify(img);
  if(session!==active)return;
  applyPhotoResult(active,result);
  retakeStatus.textContent='';
  closeRefine();
 }catch{
  if(session===active)retakeStatus.textContent='새 지도 사진을 인식하지 못했습니다. 다시 찍어 주세요.';
 }finally{
  URL.revokeObjectURL(url);
  for(const button of retakeButtons)button.disabled=false;
 }
};
$('end').onclick=()=>{if(confirm('이번 출격을 종료할까요?')){session=null;$('refine').hidden=true;retakeStatus.textContent='';save();clearPopup();show();}};
const terrainNames={Normal:'일반',Crater:'화구',Mountaintop:'산령',Rotted:'부패의 숲',Noklateo:'노크라테오','Great Hollow':'대공동'};
const bossNames=['글라디우스','에델레','그노스터','마리스','리브라','풀고르','칼리고','나멜레스','안녕을 가져오는 자들','잔해의 왕'];
function closeRefine(){
 $('retake').parentElement.after(retakeStatus);
 $('refine').hidden=true;show();window.scrollTo(0,0);
}
$('back').onclick=closeRefine;
$('manual').onclick=async()=>{
 const active=session;
 try{await getData();}catch{$('castle').textContent='시드 데이터를 불러오지 못했습니다. 연결 후 다시 눌러 주세요.';return;}
 if(!active||active!==session)return;
 session.filter??={map:session.map||'Normal',lord:'',slots:[]};
 const f=session.filter;
 $('terrain').replaceChildren(...Object.entries(terrainNames).map(([id,n])=>new Option(n,id)));
 $('boss').replaceChildren(new Option('밤의 왕 미확인',''),...[...new Set(database.seeds.map(s=>s.lord))].sort((a,b)=>parseInt(a)-parseInt(b)).map(id=>new Option(bossNames[parseInt(id)-1],id)));
 $('terrain').value=f.map;$('boss').value=f.lord;
 $('refine').hidden=false;drawPoints();
 $('board').scrollIntoView({block:'nearest'});
};
function drawPoints(){
 const f=session.filter,board=$('board');
 board.replaceChildren();board.style.backgroundImage='url("'+BamTiRecognition.mapBackgrounds[f.map]+'")';
 for(const p of database.coords[f.map==='Great Hollow'?'greatHollowSlots':'baseSlots']){
  const b=document.createElement('button');
  b.textContent=p.id;b.style.left=p.x/10+'%';b.style.top=p.y/10+'%';
  b.setAttribute('aria-pressed',String(f.slots.includes(p.id)));
  b.onclick=()=>{f.slots=f.slots.includes(p.id)?f.slots.filter(id=>id!==p.id):[...f.slots,p.id];refine();};
  board.append(b);
 }
}
function refine(){
 const f=session.filter;
 const manual=database.seeds.filter(s=>s.map===f.map&&(!f.lord||s.lord===f.lord)&&f.slots.every(id=>['church','church_spawn'].includes(s.slots[id])));
 // User observations take priority over uncertain photo markers.
 const pool=(f.slots.length||f.lord||session.map!==f.map||!session.ids)?manual:manual.filter(s=>session.ids.includes(s.id));
 Object.assign(session,summary(pool),{ids:pool.map(seed=>seed.id)});save();show();
 if(pool.length===1)closeRefine();else drawPoints();
}
$('terrain').onchange=()=>{session.filter.map=$('terrain').value;session.filter.slots=[];refine();};
$('boss').onchange=()=>{session.filter.lord=$('boss').value;refine();};
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
