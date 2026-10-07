const T={
es:{
title:'🏎️ Carrera matemática',
desc:'Compite contra 4 bots. Resuelve operaciones del 1 al 10 antes que ellos y sé el primero en llegar a 10 aciertos.',
back:'← Volver',light:'☀️ Claro',dark:'🌙 Oscuro',
place:'Puesto',correct:'Aciertos',streak:'Racha',time:'Tiempo',
overlayTitle:'🏁 Carrera matemática',overlayText:'El primero en conseguir 20 respuestas correctas gana. Un fallo rompe tu racha, pero no te hace retroceder.',
start:'🏎️ Empezar carrera',again:'🔄 Otra carrera',
note:'Solo hay una operación. Los números usados están entre 1 y 10 y el resultado nunca supera 9. Premios: 1.º 30 XP · 2.º 20 · 3.º 15 · 4.º 10 · 5.º 5.',
ok:'✅ Correcto',bad:'❌ Incorrecto. Era',raceOver:'🏁 Carrera terminada',you:'TÚ',xp:'XP',bestStreak:'Mejor racha'
},
en:{
title:'🏎️ Math race',
desc:'Race against 4 bots. Solve operations from 1 to 10 faster than them and be the first to reach 20 correct answers.',
back:'← Back',light:'☀️ Light',dark:'🌙 Dark',
place:'Place',correct:'Correct',streak:'Streak',time:'Time',
overlayTitle:'🏁 Math race',overlayText:'The first to get 20 correct answers wins. A wrong answer breaks your streak but does not move you backwards.',
start:'🏎️ Start race',again:'🔄 Race again',
note:'There is only one operation. All operands are from 1 to 10 and the result never exceeds 9. Rewards: 1st 30 XP · 2nd 20 · 3rd 15 · 4th 10 · 5th 5.',
ok:'✅ Correct',bad:'❌ Wrong. It was',raceOver:'🏁 Race finished',you:'YOU',xp:'XP',bestStreak:'Best streak'
},
hy:{
title:'🏎️ Մաթեմատիկական մրցավազք',
desc:'Մրցիր 4 բոտերի դեմ։ Արագ լուծիր 1-ից 10 թվերով գործողությունները և առաջինը հասիր 20 ճիշտ պատասխանի։',
back:'← Հետ',light:'☀️ Բաց',dark:'🌙 Մութ',
place:'Տեղ',correct:'Ճիշտ',streak:'Շարք',time:'Ժամանակ',
overlayTitle:'🏁 Մաթեմատիկական մրցավազք',overlayText:'Հաղթում է նա, ով առաջինը կհավաքի 20 ճիշտ պատասխան։ Սխալը կոտրում է շարքը, բայց մեքենան հետ չի գնում։',
start:'🏎️ Սկսել մրցավազքը',again:'🔄 Նոր մրցավազք',
note:'Միայն մեկ գործողություն է։ Թվերը 1-ից 10 են, իսկ արդյունքը երբեք չի անցնում 9-ը։ Մրցանակներ՝ 1-ին 30 XP · 2-րդ 20 · 3-րդ 15 · 4-րդ 10 · 5-րդ 5։',
ok:'✅ Ճիշտ է',bad:'❌ Սխալ է։ Պատասխանն էր',raceOver:'🏁 Մրցավազքն ավարտվեց',you:'ԴՈՒ',xp:'XP',bestStreak:'Լավագույն շարք'
}
};

const $=id=>document.getElementById(id);
const GAME='carrera-matematica';
const FINISH=20;
const XP_BY_PLACE={1:30,2:20,3:15,4:10,5:5};
const COLORS=['#ef4444','#3b82f6','#22c55e','#f59e0b','#a855f7','#ec4899','#06b6d4','#84cc16','#f97316'];
const HUMAN_NAMES=['Lucas','Sofía','Daniel','Emma','Leo','Marta','Hugo','Nora','Mateo','Lucía','Álex','Carla','Bruno','Elena','Mario','Sara'];

let racers=[];
let player=null;
let question=null;
let racing=false;
let finishing=false;
let botTimers=[];
let clockTimer=null;
let startTime=0;
let raceSerial=0;
let bestStreakRun=0;

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
function ordinal(n){
 const l=lang();
 if(l==='en')return n+(n===1?'st':n===2?'nd':n===3?'rd':'th');
 if(l==='hy')return n+'-րդ';
 return n+'.º';
}

function botName(used){
 for(let guard=0;guard<50;guard++){
   const name=Math.random()<.5
     ? choice(HUMAN_NAMES)
     : 'user_'+String(rand(1000,9999));
   if(!used.has(name)&&name!==MiWeb.profile().name)return name;
 }
 return 'user_'+Date.now().toString().slice(-4);
}

function createRacers(){
 const colors=shuffle(COLORS.slice()).slice(0,5);
 const used=new Set([MiWeb.profile().name]);
 player={
   id:'player',name:MiWeb.profile().name,color:colors[0],progress:0,streak:0,
   bestStreak:0,isPlayer:true,lastAdvance:performance.now(),accuracy:1,speed:0
 };
 racers=[player];

 const botSpeeds=shuffle([
   800+Math.random()*300,
   800+Math.random()*300,
   1500+Math.random()*400,
   3000+Math.random()*800
 ]);

 for(let i=1;i<5;i++){
   const name=botName(used); used.add(name);
   racers.push({
     id:'bot'+i,name,color:colors[i],progress:0,streak:0,bestStreak:0,isPlayer:false,
     lastAdvance:performance.now()+i,
     accuracy:0.77+Math.random()*.17,
     speed:botSpeeds[i-1]
   });
 }
}

function buildLanes(){
 const wrap=$('carriles');
 wrap.innerHTML='';
 racers.forEach(r=>{
   const lane=document.createElement('div');
   lane.className='carril';
   lane.dataset.racer=r.id;
   lane.innerHTML='<div class="nombre"></div><div class="progreso-mini"></div><div class="car-wrap"><div class="car"><span class="rueda a"></span><span class="rueda b"></span></div></div>';
   const name=lane.querySelector('.nombre');
   name.textContent=r.name+(r.isPlayer?' · '+T[lang()].you:'');
   if(r.isPlayer)name.classList.add('tu');
   lane.querySelector('.car').style.setProperty('--car',r.color);
   wrap.appendChild(lane);
 });
 renderRace();
}

function generateQuestion(){
 const op=choice(['+','-','*','/']);
 let a,b,result;

 if(op==='+'){
   a=rand(1,8);
   b=rand(1,9-a);
   result=a+b;
 }else if(op==='-'){
   a=rand(1,10);
   b=rand(1,a);
   result=a-b;
 }else if(op==='*'){
   const pairs=[];
   for(let x=1;x<=10;x++)for(let y=1;y<=10;y++)if(x*y<=9)pairs.push([x,y]);
   [a,b]=choice(pairs);
   result=a*b;
 }else{
   const pairs=[];
   for(let x=1;x<=10;x++)for(let y=1;y<=10;y++)if(x%y===0&&x/y<=9)pairs.push([x,y]);
   [a,b]=choice(pairs);
   result=a/b;
 }
 return {a,b,op,result};
}

function opSymbol(op){return op==='*'?'×':op==='/'?'÷':op}

function nextQuestion(){
 if(!racing)return;
 question=generateQuestion();
 $('operacion').textContent=question.a+' '+opSymbol(question.op)+' '+question.b+' = ?';
 setAnswersEnabled(true);
}

function makeAnswerButtons(){
 const wrap=$('respuestas');
 wrap.innerHTML='';
 const order=[7,8,9,4,5,6,1,2,3,0];
 order.forEach(value=>{
   const b=document.createElement('button');
   b.type='button';
   b.className='respuesta'+(value===0?' cero':'');
   b.dataset.value=value;
   b.textContent=value;
   b.addEventListener('click',()=>answer(value));
   wrap.appendChild(b);
 });
}

function setAnswersEnabled(enabled){
 document.querySelectorAll('.respuesta').forEach(b=>b.disabled=!enabled);
}

function answer(value){
 if(!racing||!question)return;
 const expected=question.result;

 if(Number(value)===expected){
   player.progress++;
   player.streak++;
   player.bestStreak=Math.max(player.bestStreak,player.streak);
   bestStreakRun=Math.max(bestStreakRun,player.streak);
   player.lastAdvance=performance.now();
   $('mensaje').textContent=T[lang()].ok;
   $('mensaje').className='mensaje ok';
 }else{
   player.streak=0;
   $('mensaje').textContent=T[lang()].bad+' '+expected;
   $('mensaje').className='mensaje bad';
 }

 renderRace();
 if(player.progress>=FINISH){
   finishRace(player);
   return;
 }
 nextQuestion();
}

function botStep(bot,serial){
 if(!racing||serial!==raceSerial)return;

 if(Math.random()<bot.accuracy){
   bot.progress++;
   bot.streak++;
   bot.bestStreak=Math.max(bot.bestStreak,bot.streak);
   bot.lastAdvance=performance.now();
 }else{
   bot.streak=0;
 }

 renderRace();

 if(bot.progress>=FINISH){
   finishRace(bot);
   return;
 }

 const jitter=bot.speed*(.72+Math.random()*.65);
 const timer=setTimeout(()=>botStep(bot,serial),jitter);
 botTimers.push(timer);
}

function sortedRacers(){
 return racers.slice().sort((a,b)=>
   b.progress-a.progress ||
   b.streak-a.streak ||
   a.lastAdvance-b.lastAdvance ||
   a.name.localeCompare(b.name)
 );
}

function renderRace(){
 const order=sortedRacers();
 order.forEach((r,i)=>r.place=i+1);

 racers.forEach(r=>{
   const lane=document.querySelector('[data-racer="'+r.id+'"]');
   if(!lane)return;
   const wrap=lane.querySelector('.car-wrap');
   const pct=Math.min(1,r.progress/FINISH);
   wrap.style.left='calc(4px + '+(pct*82)+'%)';
   lane.querySelector('.progreso-mini').textContent=r.progress+'/'+FINISH+' · 🔥'+r.streak;
 });

 if(player){
   $('puestoActual').textContent=ordinal(player.place||1);
   $('aciertos').textContent=player.progress+'/'+FINISH;
   $('racha').textContent=player.streak;
   $('rachaInfo').textContent='🔥 '+T[lang()].streak+': '+player.streak;
 }
}

function clearRaceTimers(){
 botTimers.forEach(clearTimeout);
 botTimers=[];
 clearInterval(clockTimer);
 clockTimer=null;
}

async function finishRace(winner){
 if(!racing||finishing)return;
 finishing=true;
 racing=false;
 setAnswersEnabled(false);
 clearRaceTimers();

 // The winner is always first; the rest are ranked by their current race state.
 const rest=racers.filter(r=>r!==winner).sort((a,b)=>
   b.progress-a.progress ||
   b.streak-a.streak ||
   a.lastAdvance-b.lastAdvance
 );
 const standings=[winner,...rest];
 standings.forEach((r,i)=>r.place=i+1);

 const playerPlace=player.place;
 const xp=XP_BY_PLACE[playerPlace];
 const elapsed=(performance.now()-startTime)/1000;
 $('tiempo').textContent=elapsed.toFixed(1)+' s';
 renderRace();

 const award=await MiWeb.awardMathRaceXp(playerPlace);
 const awarded=Math.max(0,Number(award&&award.awarded)||0);

 saveStats(playerPlace);

 const t=T[lang()];
 $('overlay').classList.remove('oculto');
 $('overlayTitulo').textContent=t.raceOver+' · '+ordinal(playerPlace);
 $('overlayTexto').textContent='⭐ +'+awarded+' XP';

 const table=document.createElement('div');
 table.className='resultados';
 standings.forEach((r,i)=>{
   const row=document.createElement('div');
   row.className='resultado-fila'+(r.isPlayer?' tu':'');
   row.innerHTML='<div class="puesto"></div><strong></strong><span class="racha-final"></span><span class="xp-premio"></span>';
   row.querySelector('.puesto').textContent=ordinal(i+1);
   row.querySelector('strong').textContent=r.name+(r.isPlayer?' · '+t.you:'');
   row.querySelector('.racha-final').textContent='🔥 '+r.bestStreak;
   row.querySelector('.xp-premio').textContent=r.isPlayer?('+'+xp+' XP'):(r.progress+'/'+FINISH);
   table.appendChild(row);
 });

 const old=$('overlay').querySelector('.resultados');
 if(old)old.remove();
 $('overlay').insertBefore(table,$('empezar'));
 $('empezar').textContent=t.again;
 finishing=false;
}

function saveStats(place){
 MiWeb.updateExtraStats(GAME,v=>({
   ...v,
   mejorPuesto:Math.min(v.mejorPuesto||5,place),
   victorias:(v.victorias||0)+(place===1?1:0),
   mejorRacha:Math.max(v.mejorRacha||0,bestStreakRun),
   partidas:(v.partidas||0)+1
 }));
}

async function countdown(serial){
 const overlay=$('overlay');
 overlay.classList.remove('oculto');
 $('empezar').style.display='none';
 const old=overlay.querySelector('.resultados');
 if(old)old.remove();

 for(const text of ['3','2','1','🏁']){
   if(serial!==raceSerial)return;
   $('overlayTitulo').innerHTML='<span class="cuenta">'+text+'</span>';
   $('overlayTexto').textContent='';
   await new Promise(r=>setTimeout(r,text==='🏁'?450:650));
 }

 if(serial!==raceSerial)return;
 overlay.classList.add('oculto');
 $('empezar').style.display='';
 startTime=performance.now();
 racing=true;
 nextQuestion();

 clockTimer=setInterval(()=>{
   if(!racing)return;
   $('tiempo').textContent=((performance.now()-startTime)/1000).toFixed(1)+' s';
 },100);

 racers.filter(r=>!r.isPlayer).forEach((bot,i)=>{
   const delay=420+i*80+Math.random()*350;
   const timer=setTimeout(()=>botStep(bot,serial),delay);
   botTimers.push(timer);
 });
}

function startRace(){
 clearRaceTimers();
 raceSerial++;
 racing=false;
 finishing=false;
 bestStreakRun=0;
 question=null;
 $('mensaje').textContent='';
 $('mensaje').className='mensaje';
 $('tiempo').textContent='0.0 s';
 createRacers();
 buildLanes();
 setAnswersEnabled(false);
 countdown(raceSerial);
}

function setTheme(){
 const claro=localStorage.getItem('tema')==='claro';
 document.body.classList.toggle('claro',claro);
 $('botonTema').textContent=T[lang()][claro?'dark':'light'];
}

function renderText(){
 const t=T[lang()],l=lang();
 document.documentElement.lang=l;
 document.title=t.title.replace(/^🏎️ /,'')+' - MI WEB';
 MiWeb.applyLanguage();
 $('titulo').textContent=t.title;
 $('descripcion').textContent=t.desc;
 $('volver').textContent=t.back;
 $('txtPuesto').textContent=t.place;
 $('txtAciertos').textContent=t.correct;
 $('txtRacha').textContent=t.streak;
 $('txtTiempo').textContent=t.time;
 $('nota').textContent=t.note;
 $('botonIdioma').textContent=l==='en'?'🇬🇧 EN ▾':l==='hy'?'🇦🇲 HY ▾':'🇪🇸 ES ▾';

 if(!racing&&!startTime){
   $('overlayTitulo').textContent=t.overlayTitle;
   $('overlayTexto').textContent=t.overlayText;
   $('empezar').textContent=t.start;
 }

 setTheme();
 if(racers.length)buildLanes();
 MiWeb.refreshRanking(GAME);
}

makeAnswerButtons();
setAnswersEnabled(false);

$('empezar').addEventListener('click',startRace);

addEventListener('keydown',e=>{
 if(!racing||e.repeat)return;
 if(/^\d$/.test(e.key))answer(Number(e.key));
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
   {key:'victorias',label:{es:'Victorias',en:'Wins',hy:'Հաղթանակներ'}},
   {key:'mejorPuesto',label:{es:'Mejor puesto',en:'Best place',hy:'Լավագույն տեղ'}},
   {key:'mejorRacha',label:{es:'Mejor racha',en:'Best streak',hy:'Լավագույն շարք'}},
   {key:'partidas',label:{es:'Carreras',en:'Races',hy:'Մրցավազքներ'}}
 ],
 compare:(a,b)=>(b.victorias||0)-(a.victorias||0)||(a.mejorPuesto||5)-(b.mejorPuesto||5)||(b.mejorRacha||0)-(a.mejorRacha||0)
});

createRacers();
buildLanes();
renderText();