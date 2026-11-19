(async () => {
  'use strict';
  const el = id => document.getElementById(id);
  const maps = {Normal:'일반', Crater:'화구', Mountaintop:'산령', Rotted:'부패의 숲', Noklateo:'노크라테오', 'Great Hollow':'대공동'};
  const lords = ['글라디우스','에델레','그노스터','마리스','리브라','풀고르','칼리고','나멜레스','안녕을 가져오는 자들','잔해의 왕'];
  const landmarks = {church:'성배병',greatchurch:'대교회',fort:'요새',ruins:'폐허',forge:'대장장이 마을',mainencampment:'대형 야영지',marsh:'늪',EUF:'동부 구역',WUF:'서부 구역',sorcerers:'마술사탑',diff_sorcerers:'강화 마술사탑',township:'마을',ScaleBearingMerchant:'저울을 짊어진 상인',empty_spawn:'빈 착지점',church_spawn:'성배병 착지점'};
  const effects = {fire:'화염',magic:'마력',eletric:'벼락',holy:'신성',sleep:'수면',poison:'독',blight:'죽음',bleed:'출혈',frostbite:'동상',rot:'부패',madness:'발광'};
  const names = {trolls:'항아리 트롤',banished_knights:'땅 잃은 기사',crucible_knights:'도가니 기사',royal_revenant:'왕족의 망령',black_knife_assassin:'검은 칼날의 자객',leonine_misbegotten:'사자 혼종',ancient_hero_of_zamor:'자미엘의 옛 영웅',bell_bearing_hunter:'방울 사냥꾼',red_wolf:'붉은 늑대',grafted_scion:'접목의 귀공자',royal_carian_knight:'카리아의 왕가 기사',death_rite_bird:'죽음 의례의 새',ulcerated_tree_spirit:'문드러진 나무령',tree_sentinel:'트리 가드',erdtree_avatar:'황금 나무의 화신',ancestor_spirit:'선조령',black_blade_kindred:'흑검의 권속',magma_wyrm:'용암토룡',draconic_tree_sentinel:'용의 트리 가드'};
  const present = '*', empty = '-';
  function label(value) {
    if (value === present) return '시설 있음 (종류 미확인)';
    if (value === empty) return '빈 지점';
    if (landmarks[value]) return landmarks[value];
    const [base, type] = value.split('_');
    return (landmarks[base] || base) + ' · ' + (effects[type] || type);
  }
  const status = el('analysisStatus');
  let data;
  try {
    const response = await fetch('./seeds.json');
    if (!response.ok) throw new Error();
    data = await response.json();
  } catch {
    status.textContent = '시드 데이터를 불러오지 못했습니다. 연결 후 새로고침하세요.';
    el('castleLookup').textContent = '성채 조회 데이터가 없습니다.';
    return;
  }
  const obs = new Map();
  let found = [], revision = 0;
  const map = el('mapType'), lord = el('lord'), slot = el('slot'), landmark = el('landmark');
  const points = () => data.coords[map.value === 'Great Hollow' ? 'greatHollowSlots' : 'baseSlots'];
  const pool = () => data.seeds.filter(s => s.map === map.value && (!lord.value || s.lord === lord.value));
  const matches = () => pool().filter(s => Array.from(obs).every(([id,v]) =>
    v === present ? Boolean(s.slots[id]) : (s.slots[id] || '') === (v === empty ? '' : v)));
  const hint = '지도에서 위치를 고른 뒤 실제로 보이는 랜드마크를 선택하세요.';
  function showResults() {
    found = matches();
    el('matches').textContent = found.length ? '후보 '+found.length+'개' + (found.length <= 5 ? ' · '+found.map(s=>'#'+s.id).join(', ') : '') : '일치하는 시드 없음 · 관측값을 수정하세요.';
    el('useSeed').hidden = found.length !== 1;
    if (found.length === 1) el('useSeed').textContent = '#'+found[0].id+' 적용 · 성채 조회';
    el('observed').textContent = Array.from(obs, ([id,v])=>'지점 '+id+' '+label(v)).join(' / ');
    for (const b of el('slotMap').children) {
      b.classList.toggle('marked',obs.has(b.value));
      b.setAttribute('aria-pressed',String(slot.value === b.value));
    }
  }
  function selectPoint(id) {
    slot.value = id;
    const values = new Set(data.seeds.filter(s=>s.map === map.value).map(s=>s.slots[id]).filter(Boolean));
    landmark.replaceChildren(new Option('미관측',''), ...[present,empty,...values].map(v=>new Option(label(v),v)));
    landmark.value = obs.get(id) || '';
    showResults();
  }
  function showMap() {
    const board = el('slotMap');
    board.replaceChildren();
    board.style.backgroundImage = 'url("'+BamTiRecognition.mapBackgrounds[map.value]+'")';
    slot.replaceChildren();
    for (const p of points()) {
      const b = document.createElement('button');
      b.type = 'button'; b.value = p.id; b.textContent = p.id;
      b.setAttribute('aria-label','지점 '+p.id);
      b.style.left = p.x/10+'%'; b.style.top = p.y/10+'%';
      b.onclick = () => selectPoint(p.id);
      board.append(b); slot.add(new Option('지점 '+p.id,p.id));
    }
    selectPoint(points()[0].id);
  }
  function lookup() {
    const id = el('seed').value.trim();
    const s = data.seeds.find(s=>s.id === id.padStart(3,'0') && /^\d{1,4}$/.test(id));
    const output = el('castleLookup');
    if (!s) {
      output.textContent = id ? '등록되지 않은 시드 번호입니다.' : '시드 번호를 입력하거나 식별한 후보를 적용하세요.';
      return;
    }
    const heading = '#'+s.id+' · '+maps[s.map]+' · '+lords[Number(s.lord.split('_')[0])-1];
    output.textContent = heading+'\n'+(s.castle ? s.castle.map((v,i)=>['수비대','지하','옥상'][i]+' · '+(names[v] || v)).join('\n') : 'Seed Finder에 중앙 성채 배정 기록이 없습니다.');
  }
  for (const [v,name] of Object.entries(maps)) map.add(new Option(name,v));
  lord.add(new Option('미확인',''));
  for (const v of [...new Set(data.seeds.map(s=>s.lord))].sort((a,b)=>parseInt(a)-parseInt(b))) lord.add(new Option(lords[parseInt(v)-1],v));
  map.onchange = () => { revision++; obs.clear(); status.textContent = hint; showMap(); };
  lord.onchange = () => { revision++; status.textContent = hint; showResults(); };
  slot.onchange = () => selectPoint(slot.value);
  landmark.onchange = () => {
    revision++;
    if (landmark.value) obs.set(slot.value,landmark.value);
    else obs.delete(slot.value);
    showResults();
  };
  el('useSeed').onclick = () => {
    if (found.length !== 1) return;
    el('seed').value = found[0].id;
    el('seed').dispatchEvent(new Event('input'));
    el('castleLookup').scrollIntoView({block:'center'});
  };
  el('resetSearch').onclick = () => {
    map.value = 'Normal'; lord.value = ''; map.onchange();
  };
  document.addEventListener('bamti:crop', () => {
    revision++; obs.clear(); status.textContent = hint; showMap();
  });
  el('identify').onclick = async () => {
    const ticket = ++revision;
    const button = el('identify');
    button.disabled = true;
    status.textContent = '지도 지형과 지점을 분석하고 있습니다.';
    el('finder').scrollIntoView();
    try {
      const r = await BamTiRecognition.classifyMapScreenshot(el('cropCanvas'));
      if (ticket !== revision) return;
      if (!r.best || r.scores.length !== Object.keys(maps).length || r.confidence < 0.34) {
        status.textContent = '지형을 식별하기 어렵습니다. 지형과 랜드마크를 직접 선택하세요.';
        return;
      }
      map.value = r.best.mapType;
      obs.clear();
      const evidence = BamTiRecognition.analyzeScreenshot(r.canvas,points(),r.best);
      for (const p of evidence.points.filter(p=>p.score >= 0.78).slice(0,6)) {
        obs.set(p.id,present);
        if (!matches().length) obs.delete(p.id);
      }
      showMap();
      status.textContent = '사진 추정 · '+maps[map.value]+' · 시설 후보 '+obs.size+'곳. 표시된 지점과 실제 랜드마크를 대조하세요.';
    } catch {
      if (ticket === revision) status.textContent = '분석에 실패했습니다. 지도 영역을 조정하거나 지점을 직접 선택하세요.';
    } finally { button.disabled = false; }
  };
  el('identify').disabled = false;
  el('seed').addEventListener('input',lookup);
  status.textContent = hint;
  showMap(); lookup();
})();
