const T={
es:{
title:'🃏 Crea el número',
desc:'Usa todas las cartas una sola vez y combina sus valores hasta conseguir exactamente el número objetivo.',
back:'← Volver',light:'☀️ Claro',dark:'🌙 Oscuro',
level:'Nivel',solved:'Resueltos',streak:'Racha',xp:'XP al resolver',target:'Número objetivo',
history:'Operaciones',undo:'↶ Deshacer',reset:'↺ Reiniciar reto',new:'🎲 Nuevo reto',
ready:'¿Preparado?',startText:'Combina las cartas hasta dejar una sola. Debes usar todas. Cada reto está generado con una solución posible.',start:'▶️ Empezar',
note:'A=11, J=12, Q=13 y K=14. La división solo se permite cuando el resultado es entero. Cada 5 retos resueltos sube la dificultad.',
chooseCard:'Elige una carta',chooseOp:'Elige una operación',chooseSecond:'Elige la segunda carta',invalidDiv:'La división debe dar un número entero.',negative:'Ese orden daría un resultado negativo.',solvedMsg:'🎉 ¡Objetivo conseguido! +5 XP',notTarget:'Todavía no es el objetivo.',resetMsg:'Reto reiniciado.',newMsg:'Nuevo reto generado.',max:'Máximo',cards:'cartas'
},
en:{
title:'🃏 Make the number',
desc:'Use every card exactly once and combine their values to reach the target number.',
back:'← Back',light:'☀️ Light',dark:'🌙 Dark',
level:'Level',solved:'Solved',streak:'Streak',xp:'XP per solve',target:'Target number',
history:'Operations',undo:'↶ Undo',reset:'↺ Reset puzzle',new:'🎲 New puzzle',
ready:'Ready?',startText:'Combine the cards until one remains. You must use them all. Every puzzle is generated with a valid solution.',start:'▶️ Start',
note:'A=11, J=12, Q=13 and K=14. Division is allowed only when the result is an integer. Difficulty increases every 5 solved puzzles.',
chooseCard:'Choose a card',chooseOp:'Choose an operation',chooseSecond:'Choose the second card',invalidDiv:'Division must produce an integer.',negative:'That order would produce a negative result.',solvedMsg:'🎉 Target reached! +5 XP',notTarget:'That is not the target yet.',resetMsg:'Puzzle reset.',newMsg:'New puzzle generated.',max:'Maximum',cards:'cards'
},
hy:{
title:'🃏 Ստեղծիր թիվը',
desc:'Օգտագործիր բոլոր քարտերը միայն մեկ անգամ և միացրու դրանց արժեքները՝ նպատակային թիվը ստանալու համար։',
back:'← Հետ',light:'☀️ Բաց',dark:'🌙 Մութ',
level:'Մակարդակ',solved:'Լուծված',streak:'Շարք',xp:'XP լուծման համար',target:'Նպատակային թիվ',
history:'Գործողություններ',undo:'↶ Հետարկել',reset:'↺ Վերսկսել',new:'🎲 Նոր խնդիր',
ready:'Պատրա՞ստ ես',startText:'Միացրու քարտերը մինչև մնա մեկը։ Պետք է օգտագործես բոլորը։ Յուրաքանչյուր խնդիր ունի լուծում։',start:'▶️ Սկսել',
note:'A=11, J=12, Q=13 և K=14։ Բաժանումը թույլատրվում է միայն ամբողջ թվային արդյունքի դեպքում։ Ամեն 5 լուծված խնդրից հետո դժվարությունը բարձրանում է։',
chooseCard:'Ընտրիր քարտ',chooseOp:'Ընտրիր գործողություն',chooseSecond:'Ընտրիր երկրորդ քարտը',invalidDiv:'Բաժանումը պետք է ամբողջ թիվ տա։',negative:'Այդ հերթականությունը բացասական արդյունք կտա։',solvedMsg:'🎉 Նպատակային թիվը ստացվեց։ +5 XP',notTarget:'Սա դեռ նպատակային թիվը չէ։',resetMsg:'Խնդիրը վերսկսված է։',newMsg:'Նոր խնդիր ստեղծվեց։',max:'Առավելագույն',cards:'քարտ'
}
};

const $=id=>document.getElementById(id);
const GAME='crea-el-numero';
const RANKS={11:'A',12:'J',13:'Q',14:'K'};
const SUITS=['♠','♥','♦','♣'];

let level=1;
let totalSolved=0;
let streak=0;
let bestRunStreak=0;
let cards=[];
let initialCards=[];
let target=0;
let selectedId=null;
let selectedOp=null;
let history=[];
let snapshots=[];
let locked=true;
let nextId=1;
let started=false;

function lang(){
 const l=localStorage.getItem('idioma');
 return T[l]?l:'es';
}

function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function choice(a){return a[rand(0,a.length-1)]}
function shuffle(a){
 for(let i=a.length-1;i>0;i--){
   const j=rand(0,i);
   [a[i],a[j]]=[a[j],a[i]];
 }
 return a;
}

function label(value){return RANKS[value]||String(value)}

function config(){
 if(level<=2)return {count:3,ops:['+','-'],targetMax:70};
 if(level<=4)return {count:3,ops:['+','-','*'],targetMax:180};
 if(level<=6)return {count:4,ops:['+','-'],targetMax:160};
 if(level<=8)return {count:4,ops:['+','-','*'],targetMax:450};
 return {count:4,ops:['+','-','*','/'],targetMax:650};
}

function validApply(a,b,op){
 if(op==='+')return a+b;
 if(op==='-')return a>=b?a-b:null;
 if(op==='*')return a*b;
 if(op==='/')return b!==0&&a%b===0?a/b:null;
 return null;
}

function generatePuzzle(){
 const cfg=config();

 for(let guard=0;guard<500;guard++){
   const values=shuffle(Array.from({length:14},(_,i)=>i+1)).slice(0,cfg.count);
   let working=values.map(v=>({value:v,expr:label(v)}));
   let usedMultiply=false;
   let usedDivision=false;

   while(working.length>1){
     const ai=rand(0,working.length-1);
     let bi=rand(0,working.length-2);
     if(bi>=ai)bi++;
     const a=working[ai],b=working[bi];
     const ops=shuffle(cfg.ops.slice());
     let result=null,op=null,left=a,right=b;

     for(const candidate of ops){
       if(candidate==='-' && Math.random()<.5){left=b;right=a}
       else if(candidate==='/' && Math.random()<.5){left=b;right=a}
       else{left=a;right=b}

       result=validApply(left.value,right.value,candidate);
       if(result!==null&&result>=1&&result<=cfg.targetMax){
         op=candidate;
         break;
       }
     }

     if(result===null){working=[];break}
     usedMultiply ||= op==='*';
     usedDivision ||= op==='/';

     const expr='('+left.expr+' '+(op==='*'?'×':op==='/'?'÷':op)+' '+right.expr+')';
     const keep=working.filter((_,i)=>i!==ai&&i!==bi);
     keep.push({value:result,expr});
     working=keep;
   }

   if(working.length!==1)continue;
   const final=working[0].value;
   if(final<2||final>cfg.targetMax)continue;
   if(level>=3&&level<=4&&!usedMultiply)continue;
   if(level>=9&&cfg.ops.includes('/')&&!usedDivision&&Math.random()<.55)continue;
   if(values.includes(final))continue;

   target=final;
   initialCards=values.map((value,i)=>({
     id:nextId++,
     value,
     face:label(value),
     suit:SUITS[i%SUITS.length],
     result:false
   }));
   cards=initialCards.map(c=>({...c}));
   history=[];
   snapshots=[];
   selectedId=null;
   selectedOp=null;
   return true;
 }
 return false;
}

function snapshot(){
 snapshots.push({
   cards:cards.map(c=>({...c})),
   history:history.slice(),
   selectedId,
   selectedOp
 });
}

function restore(s){
 cards=s.cards.map(c=>({...c}));
 history=s.history.slice();
 selectedId=null;
 selectedOp=null;
 render();
}

function difficulty(){
 const t=T[lang()],cfg=config();
 return cfg.count+' '+t.cards+' · '+cfg.ops.map(o=>o==='*'?'×':o==='/'?'÷':o).join(' ');
}

function renderCards(){
 const wrap=$('cartas');
 wrap.innerHTML='';
 cards.forEach(card=>{
   const b=document.createElement('button');
   b.type='button';
   b.className='carta'+(card.suit==='♥'||card.suit==='♦'?' roja':'')+(card.result?' resultado':'')+(card.id===selectedId?' seleccionada':'');
   b.dataset.id=card.id;

   const top=document.createElement('div');
   top.className='esquina';
   top.innerHTML='<div class="rango"></div><div class="palo"></div>';
   top.querySelector('.rango').textContent=card.face;
   top.querySelector('.palo').textContent=card.suit;

   const center=document.createElement('div');
   center.className='centro';
   center.textContent=card.face;

   const real=document.createElement('div');
   real.className='valor-real';
   real.textContent=card.face===String(card.value)?'':('= '+card.value);

   const bottom=top.cloneNode(true);
   bottom.classList.add('abajo');

   b.append(top,center,real,bottom);
   b.addEventListener('click',()=>selectCard(card.id));
   wrap.appendChild(b);
 });
}

function render(){
 const t=T[lang()];
 $('nivel').textContent=level;
 $('resueltos').textContent=totalSolved;
 $('racha').textContent=streak;
 $('objetivo').textContent=target;
 $('dificultad').textContent=difficulty();
 $('progresoFill').style.width=((totalSolved%5)*20)+'%';

 document.querySelectorAll('.operador').forEach(b=>{
   const available=config().ops.includes(b.dataset.op);
   b.disabled=!available||selectedId===null||locked;
   b.classList.toggle('activo',b.dataset.op===selectedOp);
 });

 $('deshacer').disabled=!snapshots.length||locked;
 $('reiniciar').disabled=locked;
 $('nuevo').disabled=locked;

 if(selectedId===null)$('instruccion').textContent=t.chooseCard;
 else if(selectedOp===null)$('instruccion').textContent=t.chooseOp;
 else $('instruccion').textContent=t.chooseSecond;

 renderCards();

 const list=$('historial');
 list.innerHTML='';
 history.forEach(line=>{
   const li=document.createElement('li');
   li.textContent=line;
   list.appendChild(li);
 });
}

function selectCard(id){
 if(locked)return;
 const card=cards.find(c=>c.id===id);
 if(!card)return;

 if(selectedId===null){
   selectedId=id;
   selectedOp=null;
   render();
   return;
 }

 if(selectedOp===null){
   selectedId=id===selectedId?null:id;
   render();
   return;
 }

 if(id===selectedId){
   selectedId=null;
   selectedOp=null;
   render();
   return;
 }

 combine(selectedId,id,selectedOp);
}

function selectOp(op){
 if(locked||selectedId===null||!config().ops.includes(op))return;
 selectedOp=selectedOp===op?null:op;
 render();
}

function combine(aId,bId,op){
 const a=cards.find(c=>c.id===aId);
 const b=cards.find(c=>c.id===bId);
 if(!a||!b)return;
 const t=T[lang()];
 const result=validApply(a.value,b.value,op);

 if(result===null){
   $('mensaje').textContent=op==='/'?t.invalidDiv:t.negative;
   $('mensaje').className='mensaje bad';
   flash('bad');
   selectedOp=null;
   render();
   return;
 }

 snapshot();

 const symbol=op==='*'?'×':op==='/'?'÷':op;
 history.push(a.value+' '+symbol+' '+b.value+' = '+result);
 cards=cards.filter(c=>c.id!==aId&&c.id!==bId);
 cards.push({
   id:nextId++,
   value:result,
   face:String(result),
   suit:'♠',
   result:true
 });

 selectedId=null;
 selectedOp=null;
 $('mensaje').textContent='';
 $('mensaje').className='mensaje';
 render();

 if(cards.length===1)finishAttempt();
}

async function finishAttempt(){
 const t=T[lang()];
 if(cards[0].value===target){
   locked=true;
   totalSolved++;
   streak++;
   bestRunStreak=Math.max(bestRunStreak,streak);
   level=Math.min(10,1+Math.floor(totalSolved/5));
   $('mensaje').textContent=t.solvedMsg;
   $('mensaje').className='mensaje ok';
   flash('ok');
   await MiWeb.xpAction('correct');
   saveStats(true);
   render();
   setTimeout(newPuzzle,850);
 }else{
   streak=0;
   $('mensaje').textContent=t.notTarget+' ('+cards[0].value+' ≠ '+target+')';
   $('mensaje').className='mensaje bad';
   flash('bad');
   saveStats(false);
   render();
 }
}

function saveStats(solved){
 MiWeb.updateExtraStats(GAME,v=>({
   ...v,
   maxNivel:Math.max(v.maxNivel||1,level),
   resueltos:(v.resueltos||0)+(solved?1:0),
   mejorRacha:Math.max(v.mejorRacha||0,bestRunStreak),
   partidas:(v.partidas||0)+(solved?1:0)
 }));
}

function undo(){
 if(locked||!snapshots.length)return;
 const s=snapshots.pop();
 restore(s);
 $('mensaje').textContent='';
 $('mensaje').className='mensaje';
}

function resetPuzzle(){
 if(locked)return;
 cards=initialCards.map(c=>({...c}));
 history=[];
 snapshots=[];
 selectedId=null;
 selectedOp=null;
 $('mensaje').textContent=T[lang()].resetMsg;
 $('mensaje').className='mensaje info';
 render();
}

function newPuzzle(){
 generatePuzzle();
 locked=false;
 $('mensaje').textContent='';
 $('mensaje').className='mensaje';
 render();
}

function skipPuzzle(){
 if(locked)return;
 streak=0;
 generatePuzzle();
 $('mensaje').textContent=T[lang()].newMsg;
 $('mensaje').className='mensaje info';
 render();
}

function start(){
 started=true;
 $('overlay').classList.add('oculto');
 newPuzzle();
}

function flash(kind){
 const el=$('flash');
 el.className='flash';
 void el.offsetWidth;
 el.classList.add(kind);
}

function setTheme(){
 const claro=localStorage.getItem('tema')==='claro';
 document.body.classList.toggle('claro',claro);
 $('botonTema').textContent=T[lang()][claro?'dark':'light'];
}

function renderText(){
 const t=T[lang()],l=lang();
 document.documentElement.lang=l;
 document.title=t.title.replace(/^🃏 /,'')+' - MI WEB';
 MiWeb.applyLanguage();
 $('titulo').textContent=t.title;
 $('descripcion').textContent=t.desc;
 $('volver').textContent=t.back;
 $('txtNivel').textContent=t.level;
 $('txtResueltos').textContent=t.solved;
 $('txtRacha').textContent=t.streak;
 $('txtXp').textContent=t.xp;
 $('txtObjetivo').textContent=t.target;
 $('txtHistorial').textContent=t.history;
 $('deshacer').textContent=t.undo;
 $('reiniciar').textContent=t.reset;
 $('nuevo').textContent=t.new;
 $('nota').textContent=t.note;
 $('overlayTitulo').textContent=t.ready;
 $('overlayTexto').textContent=t.startText;
 $('empezar').textContent=t.start;
 $('botonIdioma').textContent=l==='en'?'🇬🇧 EN ▾':l==='hy'?'🇦🇲 HY ▾':'🇪🇸 ES ▾';
 setTheme();
 if(started)render();
 MiWeb.refreshRanking(GAME);
}

document.querySelectorAll('.operador').forEach(b=>b.addEventListener('click',()=>selectOp(b.dataset.op)));
$('deshacer').addEventListener('click',undo);
$('reiniciar').addEventListener('click',resetPuzzle);
$('nuevo').addEventListener('click',skipPuzzle);
$('empezar').addEventListener('click',start);

addEventListener('keydown',e=>{
 if(locked)return;
 if(e.key==='Backspace'){e.preventDefault();undo();return}
 const map={'+':'+','-':'-','*':'*','x':'*','X':'*','/':'/'};
 if(map[e.key]){e.preventDefault();selectOp(map[e.key])}
});

$('botonIdioma').onclick=()=>{
 $('menuIdiomas').style.display=$('menuIdiomas').style.display==='block'?'none':'block';
};
$('menuIdiomas').addEventListener('click',e=>{
 const b=e.target.closest('[data-lang]');
 if(!b)return;
 localStorage.setItem('idioma',b.dataset.lang);
 $('menuIdiomas').style.display='none';
 renderText();
});
$('botonTema').onclick=()=>{
 localStorage.setItem('tema',localStorage.getItem('tema')==='claro'?'oscuro':'claro');
 renderText();
};
document.addEventListener('click',e=>{
 if(!e.target.closest('.menu-idioma'))$('menuIdiomas').style.display='none';
});

MiWeb.mountRanking({
 game:GAME,
 columns:[
   {key:'maxNivel',label:{es:'Nivel máximo',en:'Highest level',hy:'Առավելագույն մակարդակ'}},
   {key:'resueltos',label:{es:'Resueltos',en:'Solved',hy:'Լուծված'}},
   {key:'mejorRacha',label:{es:'Mejor racha',en:'Best streak',hy:'Լավագույն շարք'}}
 ],
 compare:(a,b)=>(b.maxNivel||1)-(a.maxNivel||1)||(b.resueltos||0)-(a.resueltos||0)||(b.mejorRacha||0)-(a.mejorRacha||0)
});

renderText();