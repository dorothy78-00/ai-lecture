'use strict';
const stages=['기획','실습 자료','자동화','프로젝트 테스트'];
const data=window.LECTURE_PROMPTS;
const cards=document.querySelector('#cards');
let memory={};
try{memory=JSON.parse(localStorage.getItem('forest-ai-edits-v1')||'{}')||{};}catch{}
function persist(){try{localStorage.setItem('forest-ai-edits-v1',JSON.stringify(memory));return true;}catch{return false;}}
function toast(message){const t=document.querySelector('#toast');t.textContent=message;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2800);}
async function copyText(text,button,area){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}else{area.focus();area.select();if(!document.execCommand('copy'))throw Error('copy');}button.textContent='✓ 복사 완료';toast('복사했습니다. ChatGPT에 붙여넣어 주세요.');setTimeout(()=>button.textContent='프롬프트 복사',1800);}catch{area.focus();area.select();toast('자동 복사가 안 됩니다. 선택된 내용을 직접 복사해 주세요.');}}
function render(){
 const query=document.querySelector('#search').value.trim().toLowerCase();cards.replaceChildren();let count=0;
 stages.forEach((stage,index)=>{
  const selected=data.map((p,i)=>({...p,id:i})).filter(p=>p.stage===stage&&`${p.title} ${p.prompt} ${memory[p.id]||''} ${p.note}`.toLowerCase().includes(query));
  if(!selected.length)return;
  const section=document.createElement('section');section.id=`stage-${index}`;
  const title=document.createElement('h2');title.className='section-title';title.textContent=`0${index+1}  ${stage}`;const badge=document.createElement('span');badge.textContent=`${selected.length}개`;title.append(badge);section.append(title);
  selected.forEach(p=>{
   count++;const card=document.createElement('article');card.className='card';
   const source=document.createElement('div');source.className='source';source.textContent=`강의안 슬라이드 ${p.slide}`;
   const heading=document.createElement('h3');heading.textContent=p.title;
   const note=document.createElement('p');note.className='note';note.textContent=p.note;
   const area=document.createElement('textarea');area.value=typeof memory[p.id]==='string'?memory[p.id]:p.prompt;area.setAttribute('aria-label',p.title+' 프롬프트 수정');area.spellcheck=false;area.rows=Math.min(15,Math.max(3,area.value.split('\n').length+1));
   const actions=document.createElement('div');actions.className='actions';const reset=document.createElement('button');reset.className='reset';reset.textContent='원문으로 되돌리기';reset.type='button';
   const status=document.createElement('span');status.className='saved';status.textContent=area.value!==p.prompt?'수정한 프롬프트':'조건을 바꿔 보세요';
   area.addEventListener('input',()=>{memory[p.id]=area.value;status.textContent=persist()?'이 브라우저에 저장됨':'현재 화면에서 수정됨 (저장 불가)';});
   reset.addEventListener('click',()=>{area.value=p.prompt;delete memory[p.id];persist();status.textContent='원문으로 되돌렸습니다';});
   const copy=document.createElement('button');copy.className='copy';copy.type='button';copy.textContent='프롬프트 복사';copy.setAttribute('aria-label',p.title+' 복사');copy.addEventListener('click',()=>copyText(area.value,copy,area));
   actions.append(reset,status,copy);card.append(source,heading,note,area,actions);section.append(card);
  });cards.append(section);
 });document.querySelector('#count').textContent=`${count} / ${data.length}개`;document.querySelector('#empty').hidden=count!==0;
}
stages.forEach((s,i)=>{const a=document.createElement('a');a.href=`#stage-${i}`;a.textContent=`0${i+1} ${s}`;a.addEventListener('click',()=>{document.querySelector('#search').value='';render();document.querySelectorAll('nav a').forEach(x=>x.classList.toggle('active',x===a));});document.querySelector('#navigation').append(a);});
document.querySelector('#search').addEventListener('input',render);render();
