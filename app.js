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
 const section=items[state.current].section||'개인 문장';$('section-select').value=section;
 $('completed').textContent=`${items.filter(done).length} / ${items.length}`;
 $('sentences').replaceChildren(...items.map((item,i)=>{if((item.section||'개인 문장')!==section)return null;const b=document.createElement('button');b.className=i===state.current?'active':'';if(i===state.current)b.setAttribute('aria-current','step');const n=document.createElement('span');n.className='num';n.textContent=done(item)?'✓':String(i+1).padStart(2,'0');const t=document.createElement('span');t.textContent=item.role;b.append(n,t);b.onclick=()=>select(i);return b;}).filter(Boolean));
}
// Align the entered prefix to the original, so a missing character does not
// turn every following character red. Future, untyped text is not an error.
function align(a,b){
 const n=a.length,m=Math.min(b.length,n+100), rows=[Uint16Array.from({length:m+1},(_,j)=>j)];
 for(let i=1;i<=n;i++){const row=new Uint16Array(m+1);row[0]=i;const prev=rows[i-1];for(let j=1;j<=m;j++)row[j]=Math.min(prev[j]+1,row[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));rows.push(row);}
 let end=0;for(let j=1;j<=m;j++)if(rows[n][j]<rows[n][end] || (rows[n][j]===rows[n][end] && Math.abs(j-n)<Math.abs(end-n)))end=j;
 let i=n,j=end,ops=[];
 while(i||j){if(i&&j&&rows[i][j]===rows[i-1][j-1]+(a[i-1]===b[j-1]?0:1)){ops.push({type:a[i-1]===b[j-1]?'correct':'wrong',text:a[i-1],expected:b[j-1],index:j-1});i--;j--;}else if(i&&rows[i][j]===rows[i-1][j]+1){ops.push({type:'wrong',text:a[i-1],expected:'추가된 글자'});i--;}else{ops.push({type:'missing',text:b[j-1],expected:b[j-1],index:j-1});j--;}}
 return {ops:ops.reverse(),end};
}
function feedback(){
 const a=normalize($('typing').value), b=normalize(items[state.current].text),box=$('live-diff');box.replaceChildren();
 if(!a){$('accuracy').textContent='입력을 시작해 보세요';$('feedback').textContent='';return;}
 const result=align(a,b);let correct=0,errors=0;
 const frag=document.createDocumentFragment();
 for(const op of result.ops){const span=document.createElement('span');span.className='diff-'+op.type;span.textContent=op.text===' '&&op.type!=='correct'?'␣':op.text;span.title=op.type==='missing'?`빠진 글자: ${op.expected}`:op.type==='wrong'?`원문: ${op.expected}`:'';frag.append(span);if(op.type==='correct')correct++;else errors++;}
 box.append(frag);$('accuracy').textContent=`입력 정확도 ${Math.round(correct/Math.max(1,result.ops.length)*100)}% · ${Math.min(result.end,b.length)} / ${b.length}자`;
 $('feedback').textContent=a===b?'✓ 이 구간을 완성했습니다. 다음 구간을 이어서 연습하세요.':errors?`현재 입력에서 ${errors}글자를 확인해 주세요. 빨간 글자에 마우스를 올리면 원문을 볼 수 있습니다.`:'좋아요. 이어서 써보세요.';
}
function select(i){state.current=Math.max(0,Math.min(i,items.length-1));const item=items[state.current];$('previous-context').textContent=items[state.current-1]?.section===item.section ? items[state.current-1].text : '이 섹션의 첫 구간입니다.';$('following-context').textContent=items[state.current+1]?.section===item.section ? items[state.current+1].text : '이 섹션의 마지막 구간입니다.';hidden=false;$('source').classList.remove('hidden');$('toggle').textContent='원문 가리기';$('toggle').setAttribute('aria-pressed','false');for(const key of ['role','note','phrase','meaning'])$(key).textContent=item[key]||'';$('source').textContent=item.text;$('position').textContent=`PASSAGE ${String(state.current+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;$('typing').value=entry().text||'';$('memo').value=entry().memo||'';$('previous').disabled=state.current===0;$('next').disabled=state.current===items.length-1;feedback();updateNav();save();}
for(const id of ['typing','memo'])$(id).addEventListener('input',()=>{state.entries[items[state.current].id]={text:$('typing').value,memo:$('memo').value};save();feedback();updateNav();});
$('previous').onclick=()=>select(state.current-1);$('next').onclick=()=>select(state.current+1);
$('toggle').onclick=()=>{hidden=!hidden;$('source').classList.toggle('hidden',hidden);$('toggle').textContent=hidden?'원문 보이기':'원문 가리기';$('toggle').setAttribute('aria-pressed',String(hidden));};
$('add').onclick=()=>$('add-dialog').showModal();$('cancel').onclick=()=>$('add-dialog').close();
$('add-form').onsubmit=e=>{e.preventDefault();const text=$('custom').value.trim();if(!text)return;const item={id:'custom-'+Date.now(),role:'개인 문장',section:'개인 문장',text,note:'직접 추가한 문장입니다. 논문에서 어떤 역할을 하는지 생각해 보세요.',phrase:'나만의 표현 수집',meaning:'기억하고 싶은 표현과 응용 문장을 아래에 적어보세요.'};state.custom.push(item);items.push(item);populateSections();$('custom').value='';$('add-dialog').close();select(items.length-1);};
$('export').onclick=()=>{const content=['# 논문 필사 노트','Dynamic Resource Management in Energy Constrained Heterogeneous Computing Systems Using Voltage Scaling','Kim et al. · IEEE TPDS · 2008',...Object.entries(state.entries).filter(([id,e])=>id.startsWith('abstract-')&&(e.text||e.memo)).map(([id,e])=>`\n## 이전 버전 노트 (${id})\n필사: ${e.text||''}\n메모: ${e.memo||''}`),...items.map((i,n)=>`\n## ${n+1}. ${i.role}\n\n원문: ${i.text}\n\n필사: ${state.entries[i.id]?.text||''}\n\n노트: ${state.entries[i.id]?.memo||''}`)].join('\n');const url=URL.createObjectURL(new Blob([content],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='논문-필사-노트.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
function populateSections(){
 $('section-select').replaceChildren(...[...new Set(items.map(x=>x.section||'개인 문장'))].map(section=>{const option=document.createElement('option');option.value=section;option.textContent=section;return option;}));
}
$('section-select').onchange=()=>select(items.findIndex(x=>(x.section||'개인 문장')===$('section-select').value));
fetch('assets/full-paper.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
 const segmenter=new Intl.Segmenter('en',{granularity:'sentence'});
 const notes={'Abstract':'초록: 배경, 연구 문제, 방법과 평가가 어떻게 연결되는지 읽어보세요.','1 INTRODUCTION':'서론: 연구 배경에서 필요성과 기여로 이어지는 흐름을 살펴보세요.','3 RELATED WORK':'관련 연구: 선행 연구를 요약하고 본 연구와 차별화하는 표현을 찾아보세요.','7 CONCLUSIONS':'결론: 연구 결과를 요약하고 한계와 향후 연구로 연결하는 표현을 살펴보세요.'};
 for(const section of data){let groups=[],text='',count=0;for(const part of segmenter.segment(section.text)){text+=part.segment;count++;if(count>=3){groups.push(text.trim());text='';count=0;}}if(text.trim())groups.push(text.trim());
 groups.forEach((text,index)=>items.push({id:`full-${section.section}-${index}`,section:section.section,role:`${section.section} · ${index+1}`,text,note:notes[section.section]||'앞뒤 구간과 함께 읽으며 논리의 연결과 반복되는 표현을 살펴보세요. 수식·표는 원문 PDF와 함께 확인하세요.',phrase:'표현을 직접 수집해 보세요',meaning:'여러 문장에서 반복되는 단어, 연결어, 논문의 문형을 아래 노트에 적어보세요.'}));}
 items.push(...state.custom);populateSections();if(state.paperVersion!==2){state.current=0;state.paperVersion=2;}select(Number.isInteger(state.current)?state.current:0);
}).catch(()=>{$('source').textContent='본문을 불러오지 못했습니다. 서버 연결을 확인한 뒤 새로고침해 주세요.';for(const id of ['typing','memo','add','next','previous','export'])$(id).disabled=true;});
