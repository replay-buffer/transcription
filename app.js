'use strict';
const $ = id => document.getElementById(id);
const KEY = 'paper-practice-v1';
let state = {current:0, entries:{}, custom:[]}, items=[], hidden=false;
try { const saved=JSON.parse(localStorage.getItem(KEY)); if(saved && typeof saved==='object') state={...state,...saved}; } catch {}
if(!state.entries || typeof state.entries!=='object') state.entries={};
if(!Array.isArray(state.custom)) state.custom=[];
state.custom=state.custom.filter(x=>x && typeof x.id==='string' && typeof x.text==='string');
const normalize=s=>s.normalize('NFKC').replace(/\s+/g,' ').trim();
function entry(){return state.entries[items[state.current].id] || {text:'',memo:''};}
function done(i){return normalize(state.entries[i.id]?.text || '')===normalize(i.text);}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));$('save-status').textContent='자동 저장됨';}catch{$('save-status').textContent='저장 공간을 사용할 수 없습니다. 노트를 내려받으세요.';}}
function updateNav(){
 $('completed').textContent=`${items.filter(done).length} / ${items.length}`;
 $('sentences').replaceChildren(...items.map((item,i)=>{const b=document.createElement('button');b.className=i===state.current?'active':'';if(i===state.current)b.setAttribute('aria-current','step');const n=document.createElement('span');n.className='num';n.textContent=done(item)?'✓':String(i+1).padStart(2,'0');const t=document.createElement('span');t.textContent=item.role;b.append(n,t);b.onclick=()=>select(i);return b;}));
}
function feedback(){
 const text=$('typing').value, target=items[state.current].text;
 const a=normalize(text),b=normalize(target);
 if(!a){$('accuracy').textContent='입력을 시작해 보세요';$('feedback').textContent='';return;}
 let matches=0;for(let i=0;i<a.length;i++)if(a[i]===b[i])matches++;
 $('accuracy').textContent=`일치도 ${Math.round(matches/Math.max(a.length,b.length)*100)}% · ${a.length} / ${b.length}자`;
 if(a===b){$('feedback').textContent='✓ 문장을 완성했습니다. 표현을 노트에 남겨보세요.';return;}
 let first=0;while(first<Math.min(a.length,b.length)&&a[first]===b[first])first++;
 $('feedback').textContent=first===a.length?'좋아요. 이어서 써보세요.':`첫 차이: ${first+1}번째 문자 · 원문 “${b.slice(first,first+28)||'(문장 끝)'}”`;
}
function select(i){state.current=Math.max(0,Math.min(i,items.length-1));const item=items[state.current];hidden=false;$('source').classList.remove('hidden');$('toggle').textContent='원문 가리기';$('toggle').setAttribute('aria-pressed','false');for(const key of ['role','note','phrase','meaning'])$(key).textContent=item[key]||'';$('source').textContent=item.text;$('position').textContent=`SENTENCE ${String(state.current+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;$('typing').value=entry().text||'';$('memo').value=entry().memo||'';$('previous').disabled=state.current===0;$('next').disabled=state.current===items.length-1;feedback();updateNav();save();}
for(const id of ['typing','memo'])$(id).addEventListener('input',()=>{state.entries[items[state.current].id]={text:$('typing').value,memo:$('memo').value};save();feedback();updateNav();});
$('previous').onclick=()=>select(state.current-1);$('next').onclick=()=>select(state.current+1);
$('toggle').onclick=()=>{hidden=!hidden;$('source').classList.toggle('hidden',hidden);$('toggle').textContent=hidden?'원문 보이기':'원문 가리기';$('toggle').setAttribute('aria-pressed',String(hidden));};
$('add').onclick=()=>$('add-dialog').showModal();$('cancel').onclick=()=>$('add-dialog').close();
$('add-form').onsubmit=e=>{e.preventDefault();const text=$('custom').value.trim();if(!text)return;const item={id:'custom-'+Date.now(),role:'개인 문장',text,note:'직접 추가한 문장입니다. 논문에서 어떤 역할을 하는지 생각해 보세요.',phrase:'나만의 표현 수집',meaning:'기억하고 싶은 표현과 응용 문장을 아래에 적어보세요.'};state.custom.push(item);items.push(item);$('custom').value='';$('add-dialog').close();select(items.length-1);};
$('export').onclick=()=>{const content=['# 논문 필사 노트','Dynamic Resource Management in Energy Constrained Heterogeneous Computing Systems Using Voltage Scaling','Kim et al. · IEEE TPDS · 2008',...items.map((i,n)=>`\n## ${n+1}. ${i.role}\n\n원문: ${i.text}\n\n필사: ${state.entries[i.id]?.text||''}\n\n노트: ${state.entries[i.id]?.memo||''}`)].join('\n');const url=URL.createObjectURL(new Blob([content],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='논문-필사-노트.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
fetch('assets/sentences.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{items=[...data,...state.custom];select(Number.isInteger(state.current)?state.current:0);}).catch(()=>{$('source').textContent='문장을 불러오지 못했습니다. 서버 연결을 확인한 뒤 새로고침해 주세요.';for(const id of ['typing','memo','add','next','previous','export'])$(id).disabled=true;});
